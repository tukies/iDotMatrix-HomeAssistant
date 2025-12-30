"""Text platform for iDotMatrix."""
from __future__ import annotations

from homeassistant.components.text import TextEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .entity import IDotMatrixEntity
from .client.modules.text import Text

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the iDotMatrix text."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([
        IDotMatrixText(coordinator, entry),
    ])

class IDotMatrixText(IDotMatrixEntity, TextEntity):
    """Representation of the Text input."""

    _attr_icon = "mdi:form-textbox"
    _attr_name = "Display Text"
    _attr_native_value = None
    
    @property
    def unique_id(self) -> str:
        return f"{self._mac}_display_text"

    @property
    def native_value(self) -> str | None:
        """Return the value reported by the text entity."""
        # The device doesn't report back, so we return None or last trusted state
        return self._attr_native_value

    async def async_set_value(self, value: str) -> None:
        """Change the text value."""
        if value:
            # Default settings for quick text
            await Text().setMode(
                text=value,
                font_size=16,
                text_mode=1, # Marquee
                speed=95,
                text_color_mode=1,
                text_color=(255, 0, 0), # Red
                text_bg_mode=0,
                text_bg_color=(0, 0, 0)
            )
            self._attr_native_value = value
            self.async_write_ha_state()
