"""Text platform for iDotMatrix."""
from __future__ import annotations

import os
import tempfile
import textwrap

from PIL import Image, ImageDraw, ImageFont

from homeassistant.components.text import TextEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .entity import IDotMatrixEntity
from .client.modules.image import Image as IDMImage
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
        return self._attr_native_value

    async def async_set_value(self, value: str) -> None:
        """Change the text value."""
        if value:
            settings = self.coordinator.text_settings
            
            if settings.get("multiline", False):
                await self._set_multiline_text(value, settings)
            else:
                await Text().setMode(
                    text=value,
                    font_size=16, 
                    font_path=settings.get("font"),
                    text_mode=settings.get("animation_mode", 1),
                    speed=settings.get("speed", 80),
                    text_color_mode=settings.get("color_mode", 1),
                    text_color=tuple(settings.get("color", (255, 0, 0))),
                    text_bg_mode=0,
                    text_bg_color=(0, 0, 0),
                    spacing=settings.get("spacing", 1),
                    proportional=settings.get("proportional", True)
                )
            self._attr_native_value = value
            self.async_write_ha_state()

    async def _set_multiline_text(self, text: str, settings: dict) -> None:
        """Generate an image from text and upload it."""
        screen_size = int(settings.get("screen_size", 32))
        font_name = settings.get("font")
        color = tuple(settings.get("color", (255, 0, 0)))
        spacing = int(settings.get("spacing", 1))
        
        # Resolve font path
        base_path = os.path.dirname(os.path.abspath(__file__))
        fonts_dir = os.path.join(base_path, "fonts")
        font_path = os.path.join(fonts_dir, "Rain-DRM3.otf")
        
        if font_name:
            if not os.path.isabs(font_name):
                 potential = os.path.join(fonts_dir, font_name)
                 if os.path.exists(potential):
                     font_path = potential
            elif os.path.exists(font_name):
                font_path = font_name
                
        # Determine font size based on screen size
        if screen_size == 16:
             font_size = 8
        elif screen_size == 64:
             font_size = 16 # Or maybe larger? 20? Let's try 16 for better density
        else:
             font_size = 10 # Default for 32x32

        try:
            font = ImageFont.truetype(font_path, font_size)
        except:
            font = ImageFont.load_default()

        # Pixel-based Word Wrapping
        words = text.split(' ')
        lines = []
        current_line = []
        
        def get_word_width(word):
            if not word: return 0
            # Width is sum of chars + spacing
            w = 0
            for char in word:
                bbox = font.getbbox(char)
                w += (bbox[2] - bbox[0]) + spacing
            return w - spacing # Remove last spacing

        # Space width
        space_bbox = font.getbbox(" ")
        space_width = (space_bbox[2] - space_bbox[0]) + spacing

        current_line_width = 0
        
        for word in words:
            word_width = get_word_width(word)
            
            # Check if word fits
            if current_line_width + word_width <= screen_size:
                current_line.append(word)
                current_line_width += word_width + space_width
            else:
                # Flush current line
                if current_line:
                    lines.append(current_line)
                
                # Check if word is longer than screen (force split?)
                # For now, just put on new line even if it clips
                current_line = [word]
                current_line_width = word_width + space_width
        
        if current_line:
            lines.append(current_line)

        # Draw lines
        image = Image.new("RGB", (screen_size, screen_size), (0, 0, 0))
        draw = ImageDraw.Draw(image)
        
        y = 0
        # Calculate line height
        ascent, descent = font.getmetrics()
        line_height = ascent + descent + 1 # +1 padding
        
        for line_words in lines:
            if y >= screen_size: break
            x = 0
            for i, word in enumerate(line_words):
                # Draw word char by char
                for char in word:
                    if x >= screen_size: break
                    draw.text((x, y), char, font=font, fill=color)
                    bbox = font.getbbox(char)
                    x += (bbox[2] - bbox[0]) + spacing
                
                # Draw space after word (except last word)
                if i < len(line_words) - 1:
                     x += space_width
            y += line_height
            
        # Save to temp file and upload
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            image.save(tmp.name)
            tmp_path = tmp.name
            
        try:
            # Set mode to DIY (1)
            await IDMImage().setMode(1)
            # Upload processed
            await IDMImage().uploadProcessed(tmp_path, pixel_size=screen_size)
            # Ensure mode is persisted? Some devices revert if not refreshed.
            # But normally setMode(1) should stick until setMode(0) or other command.
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
