"""Button platform for iDotMatrix."""
from __future__ import annotations

from homeassistant.util import dt as dt_util
from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .entity import IDotMatrixEntity
from .client.modules.common import Common
from .client.modules.fullscreenColor import FullscreenColor

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the iDotMatrix buttons."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([
        IDotMatrixSyncTime(coordinator, entry),
        IDotMatrixClear(coordinator, entry),
        IDotMatrixDisconnect(coordinator, entry),
        IDotMatrixReconnect(coordinator, entry),
    ])

class IDotMatrixSyncTime(IDotMatrixEntity, ButtonEntity):
    """Button to sync time."""

    _attr_icon = "mdi:clock-check"
    _attr_name = "Sync Time"

    @property
    def unique_id(self) -> str:
        return f"{self._mac}_sync_time"

    async def async_press(self) -> None:
        """Handle the button press."""
        now = dt_util.now()
        await self.coordinator._device_call(Common(self.coordinator.connection_manager).setTime,
            year=now.year,
            month=now.month,
            day=now.day,
            hour=now.hour,
            minute=now.minute,
            second=now.second
        )

class IDotMatrixClear(IDotMatrixEntity, ButtonEntity):
    """Button to clear screen."""

    _attr_icon = "mdi:eraser"
    _attr_name = "Clear Screen"

    @property
    def unique_id(self) -> str:
        return f"{self._mac}_clear_screen"

    async def async_press(self) -> None:
        """Handle the button press."""
        # Set black screen
        await self.coordinator.async_show_color([0, 0, 0])


class IDotMatrixDisconnect(IDotMatrixEntity, ButtonEntity):
    """Release the BLE connection until explicitly resumed."""
    _attr_name = "Disconnect"
    _attr_icon = "mdi:bluetooth-off"

    @property
    def unique_id(self):
        return f"{self._mac}_disconnect"

    async def async_press(self):
        await self.coordinator.async_disconnect_device()


class IDotMatrixReconnect(IDotMatrixEntity, ButtonEntity):
    """Resume integration control after disconnecting."""
    _attr_name = "Reconnect"
    _attr_icon = "mdi:bluetooth-connect"

    @property
    def unique_id(self):
        return f"{self._mac}_reconnect"

    async def async_press(self):
        await self.coordinator.async_reconnect_device()
