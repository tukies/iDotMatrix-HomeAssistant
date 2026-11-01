import asyncio
from bleak import BleakClient, BleakScanner, AdvertisementData
from bleak.exc import BleakError, BleakCharacteristicNotFoundError
from .const import UUID_READ_DATA, UUID_WRITE_DATA, BLUETOOTH_DEVICE_NAME
import logging
from time import monotonic
from typing import List, Optional


class MissingWriteCharacteristicError(BleakError):
    """The connected device has not exposed the iDotMatrix write endpoint."""


class SingletonMeta(type):
    logging = logging.getLogger(__name__)
    _instances: dict = {}

    def __call__(cls, *args, **kwargs) -> "SingletonMeta":
        if cls not in cls._instances:
            try:
                instance = super().__call__(*args, **kwargs)
                cls._instances[cls] = instance
            except:
                # return None if wrong (or no arguments are given)
                cls._instances[cls] = None
        return cls._instances[cls]


class ConnectionManager:
    logging = logging.getLogger(__name__)

    def __init__(self) -> None:
        self.address: Optional[str] = None
        self.client: Optional[BleakClient] = None
        self.hass = None
        self._debug_versions: str | None = None
        self._write_sequence = 0

    def set_hass(self, hass):
        """Set Home Assistant instance for proxy support."""
        self.hass = hass

    async def _debug_environment(self):
        """Cache package metadata off the event loop for debug captures."""
        if not self.logging.isEnabledFor(logging.DEBUG):
            return

        def versions():
            from importlib.metadata import PackageNotFoundError, version
            result = []
            for package in ("homeassistant", "bleak", "bleak-retry-connector", "habluetooth", "bleak-esphome"):
                try:
                    result.append(f"{package}={version(package)}")
                except PackageNotFoundError:
                    result.append(f"{package}=not-installed")
            return ", ".join(result)

        try:
            if self._debug_versions is None:
                self._debug_versions = await asyncio.to_thread(versions)
            self.logging.debug("BLE environment: %s", self._debug_versions)
        except Exception:
            self.logging.debug("Could not collect BLE dependency versions", exc_info=True)

    def _debug_device(self, device):
        """Record selected device/advertisement routing without raw BLE data."""
        if not self.logging.isEnabledFor(logging.DEBUG):
            return
        try:
            details = getattr(device, "details", {})
            if not isinstance(details, dict):
                details = {}
            source, rssi = None, None
            if self.hass:
                from homeassistant.components import bluetooth
                lookup = getattr(bluetooth, "async_last_service_info", None)
                info = lookup(self.hass, self.address, connectable=True) if lookup else None
                if info:
                    source, rssi = info.source, info.rssi
            self.logging.debug(
                "BLE device address=%s name=%s selected_source=%s bluez_path=%s "
                "last_advertisement_source=%s rssi=%s",
                device.address, device.name, details.get("source"), details.get("path"), source, rssi,
            )
        except Exception:
            self.logging.debug("BLE device routing details unavailable for %s", self.address, exc_info=True)

    def _debug_client(self, phase, client=None, *, include_services=False):
        """Keep optional backend diagnostics from affecting connectivity."""
        if not self.logging.isEnabledFor(logging.DEBUG):
            return
        client = client if client is not None else self.client
        if client is None:
            self.logging.debug("BLE %s address=%s client=none", phase, self.address)
            return
        values = {}
        for attr in ("is_connected", "backend_id", "mtu_size"):
            try:
                values[attr] = getattr(client, attr, "unavailable")
            except Exception:
                values[attr] = "unavailable"
        self.logging.debug(
            "BLE %s address=%s client=%s.%s connected=%s backend=%s mtu=%s",
            phase, self.address, type(client).__module__, type(client).__name__,
            values["is_connected"], values["backend_id"], values["mtu_size"],
        )
        if not include_services:
            return
        try:
            services = client.services
            self.logging.debug(
                "BLE GATT address=%s services=%d characteristics=%d write_uuid=%s found=%s",
                self.address, len(services.services), len(services.characteristics),
                UUID_WRITE_DATA, services.get_characteristic(UUID_WRITE_DATA) is not None,
            )
            for service in services:
                self.logging.debug("BLE service address=%s uuid=%s handle=%s", self.address, service.uuid, service.handle)
                for char in service.characteristics:
                    self.logging.debug(
                        "BLE characteristic address=%s service=%s uuid=%s handle=%s properties=%s",
                        self.address, service.uuid, char.uuid, char.handle, char.properties,
                    )
        except Exception:
            self.logging.debug("BLE GATT details unavailable for %s", self.address, exc_info=True)

    def _on_disconnected(self, client):
        """Log asynchronous link loss as well as requested disconnects."""
        self._debug_client("disconnect callback", client)

    @staticmethod
    async def scan() -> List[tuple[str, str]]:
        # This basic scan might not find proxy devices if not integrated with HA scanning
        # But we primarily rely on HA config flow now.
        logging.info("scanning for iDotMatrix bluetooth devices...")
        devices = await BleakScanner.discover(return_adv=True)
        filtered_devices: List[tuple[str, str]] = []
        for key, (device, adv) in devices.items():
            if (
                isinstance(adv, AdvertisementData)
                and adv.local_name
                and str(adv.local_name).startswith(BLUETOOTH_DEVICE_NAME)
            ):
                logging.info(f"found device {key} with name {adv.local_name}")
                filtered_devices.append((device.address, adv.local_name))
        return filtered_devices

    async def connectByAddress(self, address: str) -> None:
        self.address = address
        await self.connect()

    async def connectBySearch(self) -> None:
        devices = await self.scan()
        if devices:
            # connect to first device
            self.address = devices[0]
            await self.connect()
        else:
            self.logging.error("no target devices found.")

    async def connect(self, *, use_services_cache: bool = True) -> None:
        """Connect and validate GATT services, rediscovering once if needed."""
        if not self.address:
            raise ConnectionError("iDotMatrix device address is not set")

        from bleak_retry_connector import BleakClientWithServiceCache, establish_connection

        await self._debug_environment()
        started = monotonic()
        attempts = 2 if use_services_cache else 1
        for attempt in range(attempts):
            cache_enabled = use_services_cache and attempt == 0
            self.logging.debug(
                "BLE connect address=%s attempt=%d/%d service_cache=%s reuse_connected=%s",
                self.address, attempt + 1, attempts, cache_enabled,
                bool(self.client and self.client.is_connected),
            )
            try:
                if not (self.client and self.client.is_connected):
                    device = None
                    if self.hass:
                        from homeassistant.components import bluetooth

                        # Wait for local/proxy advertisements, including after
                        # clearing a stale service cache.
                        for i in range(15):
                            device = bluetooth.async_ble_device_from_address(
                                self.hass, self.address, connectable=True
                            )
                            if device:
                                self.logging.debug("BLE advertisement available address=%s poll=%d/15", self.address, i + 1)
                                break
                            if i == 0:
                                self.logging.debug("BLE waiting for connectable advertisement address=%s", self.address)
                            if i < 14:
                                await asyncio.sleep(1.0)

                    if not device:
                        raise ConnectionError(
                            f"Device {self.address} unavailable in Home Assistant Bluetooth mesh. "
                            "Ensure it is powered and within range of an adapter or proxy."
                        )
                    self.logging.info("Connecting to %s (%s)", device.name, device.address)
                    self._debug_device(device)
                    self.client = await establish_connection(
                        BleakClientWithServiceCache, device, self.address,
                        max_attempts=3,
                        use_services_cache=cache_enabled,
                        disconnected_callback=self._on_disconnected,
                    )
                    self._debug_client("connection established", include_services=True)

                # is_connected alone does not prove the device is writable.
                self._write_characteristic()
            except MissingWriteCharacteristicError as err:
                self.logging.debug("BLE service validation failed address=%s attempt=%d", self.address, attempt + 1, exc_info=True)
                if attempt + 1 == attempts:
                    self.logging.error("iDotMatrix GATT discovery failed: %s", err)
                    await self._discard_client()
                    raise
                self.logging.warning(
                    "%s; clearing the GATT cache and retrying discovery once", err,
                )
                await self._discard_client(clear_cache=True)
            except Exception as err:
                self.logging.debug("BLE connect failed address=%s attempt=%d elapsed=%.3fs", self.address, attempt + 1, monotonic() - started, exc_info=True)
                self.logging.error("Failed to connect to %s: %s", self.address, err)
                await self._discard_client()
                raise
            else:
                self.logging.info("Connected to %s with iDotMatrix write characteristic", self.address)
                self.logging.debug("BLE connection ready address=%s attempt=%d elapsed=%.3fs", self.address, attempt + 1, monotonic() - started)
                return

    def _write_characteristic(self):
        """Resolve the required endpoint and explain incomplete discovery."""
        if not (self.client and self.client.is_connected):
            raise ConnectionError("iDotMatrix is not connected")
        try:
            services = self.client.services
        except BleakError as err:
            raise MissingWriteCharacteristicError(
                f"GATT services are unresolved for {self.address}; "
                f"required write characteristic {UUID_WRITE_DATA}: {err}"
            ) from err
        characteristic = services.get_characteristic(UUID_WRITE_DATA)
        if characteristic is None:
            service_uuids = ", ".join(service.uuid for service in services) or "none"
            char_uuids = ", ".join(char.uuid for char in services.characteristics.values()) or "none"
            raise MissingWriteCharacteristicError(
                f"Device {self.address} is missing required iDotMatrix write characteristic "
                f"{UUID_WRITE_DATA}. Discovered services: {service_uuids}; "
                f"characteristics: {char_uuids}. If fresh discovery still fails, check "
                "the device address, model/firmware compatibility and Bluetooth adapter/proxy."
            )
        return characteristic

    async def disconnect(self) -> None:
        self._debug_client("disconnect requested")
        if self.client and self.client.is_connected:
            await self.client.disconnect()
            self.logging.info(f"disconnected from {self.address}")
        self.client = None
        self.logging.debug("BLE disconnect complete address=%s", self.address)

    # Match the Android app's BLE write size (MTU 517 - ATT overhead = 509)
    BLE_WRITE_SIZE = 509

    # Default to acknowledged writes: through an ESPHome BLE proxy,
    # unacknowledged Write Commands are silently dropped under buffer
    # pressure (observed as e.g. Clock.setMode losing a style change and
    # the panel staying on the previous face).
    async def send(self, data, response=True):
        self._write_sequence += 1
        write_id = self._write_sequence
        if self.client and self.client.is_connected:
            progress = {"writes": 0}
            try:
                return await self._write_chunks(data, response, progress, write_id=write_id)
            except Exception as err:
                self.logging.debug(
                    "BLE write failed address=%s write_id=%d bytes=%d response=%s completed_chunks=%d",
                    self.address, write_id, len(data), response, progress["writes"], exc_info=True,
                )
                self._debug_client("write failure", include_services=True)
                # Retry once, but ONLY if nothing went out yet: resending
                # after a partial write would duplicate bytes and corrupt
                # the file the device is assembling. This covers the
                # reconnect race where a write is attempted before service
                # discovery resolves ("Characteristic ... was not found")
                # and stale connections discovered on the first write.
                if progress["writes"]:
                    self.logging.debug("BLE write not retried address=%s write_id=%d: partial transfer", self.address, write_id)
                    raise
                self.logging.warning(
                    "BLE write failed before any data was sent (%s); "
                    "reconnecting and retrying once", err,
                )
                await self._force_reconnect(clear_cache=isinstance(
                    err, (MissingWriteCharacteristicError, BleakCharacteristicNotFoundError)
                ))
                if not (self.client and self.client.is_connected):
                    raise
                return await self._write_chunks(data, response, {"writes": 0}, write_id=write_id, attempt=2)

        self.logging.debug("BLE write rejected address=%s write_id=%d: not connected", self.address, write_id)
        raise ConnectionError("iDotMatrix is not connected")

    async def _write_chunks(self, data, response, progress, *, write_id=0, attempt=1):
        # Cap chunk size to real BLE MTU regardless of proxy-reported size.
        # ESPHome BLE proxies report a large WiFi-based MTU, but the actual
        # BLE radio to the device uses ~509-byte packets at ~25ms intervals.
        characteristic = self._write_characteristic()
        reported = characteristic.max_write_without_response_size
        chunk_size = min(reported, self.BLE_WRITE_SIZE)
        chunk_count = (len(data) + chunk_size - 1) // chunk_size
        started = monotonic()
        self.logging.debug(
            "BLE write start address=%s write_id=%d attempt=%d bytes=%d response=%s "
            "characteristic=%s handle=%s reported_write_size=%d chunk_size=%d chunks=%d",
            self.address, write_id, attempt, len(data), response, characteristic.uuid,
            characteristic.handle, reported, chunk_size, chunk_count,
        )
        for i in range(0, len(data), chunk_size):
            try:
                await self.client.write_gatt_char(UUID_WRITE_DATA, data[i:i+chunk_size], response=response)
            except (Exception, asyncio.CancelledError):
                self.logging.debug(
                    "BLE chunk failed address=%s write_id=%d attempt=%d chunk=%d/%d "
                    "offset=%d size=%d completed_chunks=%d elapsed=%.3fs",
                    self.address, write_id, attempt, progress["writes"] + 1, chunk_count,
                    i, min(chunk_size, len(data) - i), progress["writes"], monotonic() - started,
                    exc_info=True,
                )
                raise
            progress["writes"] += 1
            # Pace writes to match the BLE connection interval (~25ms).
            # The Android app's BLE stack provides this pacing via L2CAP
            # flow control; through an ESPHome proxy we must add it manually
            # to prevent flooding the proxy's BLE transmit buffer.
            await asyncio.sleep(0.025)

        self.logging.debug(
            "BLE write complete address=%s write_id=%d attempt=%d bytes=%d chunks=%d elapsed=%.3fs",
            self.address, write_id, attempt, len(data), progress["writes"], monotonic() - started,
        )
        return True

    async def _discard_client(self, *, clear_cache: bool = False):
        """Release a failed client, invalidating backend/proxy services if needed."""
        client, self.client = self.client, None
        if client is None:
            return
        self._debug_client("discarding failed client", client)
        self.logging.debug("BLE recovery address=%s clear_cache=%s", self.address, clear_cache)
        try:
            if clear_cache:
                try:
                    cleared = await client.clear_cache()
                    self.logging.debug("BLE cache clear address=%s success=%s", self.address, cleared)
                    if not cleared:
                        self.logging.warning("GATT cache could not be cleared for %s", self.address)
                except Exception as err:
                    self.logging.debug("BLE cache clear failed address=%s", self.address, exc_info=True)
                    self.logging.warning("Could not clear GATT cache for %s: %s", self.address, err)
        finally:
            # Cache invalidation can fail or be cancelled; still release the link.
            try:
                await client.disconnect()
                self.logging.debug("BLE failed client released address=%s", self.address)
            except Exception as err:
                self.logging.debug("Failed client disconnect for %s: %s", self.address, err)

    async def _force_reconnect(self, *, clear_cache: bool = False):
        """Retry a failed write using fresh discovery, never a cached table."""
        self.logging.debug("BLE reconnect requested address=%s clear_cache=%s service_cache=False", self.address, clear_cache)
        await self._discard_client(clear_cache=clear_cache)
        await self.connect(use_services_cache=False)

    async def read(self) -> bytes:
        if self.client and self.client.is_connected:
            self.logging.debug("BLE read address=%s characteristic=%s", self.address, UUID_READ_DATA)
            data = await self.client.read_gatt_char(UUID_READ_DATA)
            self.logging.debug("BLE read complete address=%s bytes=%d", self.address, len(data))
            self.logging.info("data received")
            return data
