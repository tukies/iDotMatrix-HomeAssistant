"""DataUpdateCoordinator for iDotMatrix."""
from __future__ import annotations

import logging
import asyncio
import re
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, Event, callback
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.helpers.event import async_track_state_change_event

from .const import DOMAIN, CONF_DISPLAY_MODE, DISPLAY_MODE_DESIGN, DISPLAY_MODE_TEXT
from .client.connectionManager import ConnectionManager
from .client.modules.text import Text
from .client.modules.image import Image as IDMImage
from .client.modules.clock import Clock


from homeassistant.helpers import template
from homeassistant.util import dt as dt_util

import os
import tempfile
import io
from PIL import Image, ImageDraw, ImageFont

from homeassistant.helpers.storage import Store
from homeassistant.helpers.aiohttp_client import async_get_clientsession

MDI_META_URL = "https://raw.githubusercontent.com/Templarian/MaterialDesign/master/meta.json"
MDI_FONT_URL = "https://raw.githubusercontent.com/Templarian/MaterialDesign-Webfont/master/fonts/materialdesignicons-webfont.ttf"


_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY_PREFIX = "idotmatrix_settings_"

# Regex to extract entity IDs from Jinja templates
ENTITY_REGEX = re.compile(r"states\(['\"]([a-z_]+\.[a-z0-9_]+)['\"]\)")


class IDotMatrixCoordinator(DataUpdateCoordinator):
    """Class to manage fetching iDotMatrix data."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=60),
        )
        self.entry = entry
        self._store = Store(hass, STORAGE_VERSION, f"{STORAGE_KEY_PREFIX}{entry.entry_id}")
        self._entity_unsubs: list = []  # Entity state change unsubscribe callbacks
        self.display_mode = entry.options.get(CONF_DISPLAY_MODE, DISPLAY_MODE_DESIGN)
        self._svg_error_logged = False
        self._icon_cache: dict[tuple[str, int], Image.Image | None] = {}
        self._mdi_meta: dict[str, str] | None = None
        self._mdi_font_bytes: bytes | None = None
        self._mdi_fonts: dict[int, ImageFont.FreeTypeFont] = {}
        self._mdi_lock = asyncio.Lock()
        self._mdi_error_logged = False
        self._mdi_unknown_icons: set[str] = set()
        
        # Shared settings for Text entity
        self.text_settings = {
            "current_text": "",   # The actual text content
            "font": "Rain-DRM3.otf",
            "animation_mode": 1,  # Marquee
            "speed": 80,
            "color_mode": 1,      # Single Color
            "color": [255, 0, 0], # Red default
            "spacing": 1,         # Horizontal Spacing (pixels)
            "spacing_y": 1,       # Vertical Spacing (pixels)
            "proportional": True, # Use proportional font rendering
            "blur": 5,            # Text Blur/Antialiasing (0=Sharp, 5=Smooth)
            "font_size": 10,      # Font Size (pixels)
            "multiline": False,   # Wrap text as image
            "screen_size": 32,    # 32x32 or 16x16
            "brightness": 128,    # 0-255 (mapped to 5-100)
            "clock_style": 0,     # Default style index
            "clock_date": True,   # Show date
            "clock_format": "24h",# 12h or 24h
            "fun_text_delay": 0.4,# Fun Text delay in seconds
            "autosize": False,    # Auto-scale font to fit screen
            "mode": "basic",      # basic | advanced
            "layers": [],         # List of layers for advanced mode
        }
        
    async def async_set_face_config(self, face_config: dict) -> None:
        """Update face configuration from service and set up entity tracking."""
        if not face_config:
            return

        layers = face_config.get("layers", [])
        self.text_settings["mode"] = "advanced"
        self.text_settings["layers"] = layers

        self._apply_face_tracking(face_config)
        
        # Trigger initial update
        await self.async_update_device()

    def _clear_face_tracking(self) -> None:
        """Cancel any entity listeners for face updates."""
        for unsub in self._entity_unsubs:
            unsub()
        self._entity_unsubs = []

    def _apply_face_tracking(self, face_config: dict) -> None:
        """Register entity listeners for advanced face updates."""
        self._clear_face_tracking()

        if self.display_mode != DISPLAY_MODE_DESIGN:
            return

        layers = face_config.get("layers", [])
        if not layers:
            return

        # Extract entity IDs from layers
        entities_to_track = set()
        for layer in layers:
            # Direct entity reference
            if entity := layer.get("entity"):
                entities_to_track.add(entity)

            # Entity IDs in templates (e.g., {{ states('sensor.temp') }})
            if content := layer.get("content"):
                matches = ENTITY_REGEX.findall(content)
                entities_to_track.update(matches)
            if tpl := layer.get("template"):
                matches = ENTITY_REGEX.findall(tpl)
                entities_to_track.update(matches)
            if icon_tpl := layer.get("icon_template"):
                matches = ENTITY_REGEX.findall(icon_tpl)
                entities_to_track.update(matches)

        # Add explicit trigger entity if specified (for time-based or other updates)
        if trigger := face_config.get("trigger_entity"):
            if isinstance(trigger, str) and trigger.strip():
                entities_to_track.add(trigger.strip())
            elif isinstance(trigger, list):
                for t in trigger:
                    if t and t.strip():
                        entities_to_track.add(t.strip())

        # Set up state change listeners
        if entities_to_track:
            _LOGGER.info(f"[iDotMatrix] Tracking entities for auto-update: {entities_to_track}")
            unsub = async_track_state_change_event(
                self.hass,
                list(entities_to_track),
                self._on_entity_state_change
            )
            self._entity_unsubs.append(unsub)

    async def async_set_display_mode(self, mode: str) -> None:
        """Update display mode and refresh entity tracking."""
        self.display_mode = mode
        if mode == DISPLAY_MODE_DESIGN:
            self._apply_face_tracking({"layers": self.text_settings.get("layers", [])})
        else:
            self._clear_face_tracking()

    @callback
    def _on_entity_state_change(self, event: Event) -> None:
        """Handle entity state change by re-rendering face."""
        entity_id = event.data.get("entity_id")
        _LOGGER.debug(f"[iDotMatrix] Entity {entity_id} changed, re-rendering face")
        # Schedule async update
        self.hass.async_create_task(self.async_update_device())


    async def _render_face(self, layers: list, screen_size: int) -> Image.Image:
        """Render the advanced display face."""
        # Create base canvas
        canvas = Image.new("RGB", (screen_size, screen_size), (0, 0, 0))
        draw = ImageDraw.Draw(canvas)
        
        # Load Fonts Cache (simple dict for now)
        # We can reuse the font loading logic or abstract it
        
        for layer in layers:
            # check conditions
            if (cond_tpl := layer.get("condition_template")):
                try:
                    tpl = template.Template(cond_tpl, self.hass)
                    if not tpl.async_render(parse_result=False):
                        continue
                except Exception as e:
                    _LOGGER.warning(f"Error evaluating condition '{cond_tpl}': {e}")
                    continue

            l_type = layer.get("type", "text")
            x = layer.get("x", 0)
            y = layer.get("y", 0)
            
            if l_type == "text":
                content = ""
                icon_ref = layer.get("icon")
                icon_size = int(layer.get("icon_size", 16))
                icon_template = layer.get("icon_template")
                
                # Priority: content (already resolved) > entity > template
                if layer.get("content"):
                    # Content already resolved by frontend
                    content = layer.get("content", "")
                elif entity_id := layer.get("entity"):
                    # Get state from entity
                    if state := self.hass.states.get(entity_id):
                        content = state.state
                    else:
                        content = "N/A"
                elif layer.get("is_template", False) or layer.get("template"):
                    # Render Jinja template
                    tpl_str = layer.get("template") or ""
                    try:
                        tpl = template.Template(tpl_str, self.hass)
                        content = tpl.async_render(parse_result=False)
                    except Exception as e:
                        content = "ERR"
                        _LOGGER.warning(f"Error evaluating text template: {e}")

                if not icon_ref and icon_template:
                    try:
                        tpl = template.Template(icon_template, self.hass)
                        icon_ref = tpl.async_render(parse_result=False)
                    except Exception as e:
                        _LOGGER.warning(f"Error evaluating icon template: {e}")
                
                # Render icon if present
                if icon_ref:
                    icon_img = await self._load_icon(icon_ref, icon_size)
                    if icon_img:
                        r, g, b, a = icon_img.split()
                        color = tuple(layer.get("color", [255, 255, 255]))
                        colored_icon = Image.new("RGB", icon_img.size, color)
                        canvas.paste(colored_icon, (x, y), mask=a)

                # Skip empty content
                if not content:
                    continue
                
                # Render Text using LAYER settings only (not global text_settings)
                color = tuple(layer.get("color", [255, 255, 255]))
                font_name = layer.get("font", "Rain-DRM3.otf")
                font_size = int(layer.get("font_size", 10))
                spacing_x = int(layer.get("spacing_x", 1))
                spacing_y = int(layer.get("spacing_y", 1))
                blur = int(layer.get("blur", 5))
                
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
                        
                try:
                    font = ImageFont.truetype(font_path, font_size)
                except:
                    font = ImageFont.load_default()
                
                # Create separate RGBA layer for text to apply blur/sharpness
                text_layer = Image.new("RGBA", (screen_size, screen_size), (0, 0, 0, 0))
                text_draw = ImageDraw.Draw(text_layer)
                
                # Character-by-character rendering with custom spacing
                current_x = x
                for char in str(content):
                    text_draw.text((current_x, y), char, font=font, fill=(255, 255, 255, 255))
                    # Get character width
                    try:
                        bbox = font.getbbox(char)
                        char_width = bbox[2] - bbox[0] if bbox else font.getlength(char)
                    except:
                        char_width = font_size // 2
                    current_x += int(char_width) + spacing_x
                
                # Apply blur/sharpness effect (0=Sharp, 5=Normal, 10=Blur)
                if blur < 5:
                    # Apply sharpening via contrast enhancement on alpha channel
                    r, g, b, a = text_layer.split()
                    gain = 1.0 + ((5 - blur) * 2.0)
                    def apply_contrast(p):
                        v = (p - 128) * gain + 128
                        return max(0, min(255, int(v)))
                    a = a.point(apply_contrast)
                    text_layer.putalpha(a)
                elif blur > 5:
                    # Apply blur effect
                    from PIL import ImageFilter
                    blur_amount = (blur - 5) * 0.5  # 0.5 to 2.5 radius
                    text_layer = text_layer.filter(ImageFilter.GaussianBlur(radius=blur_amount))
                
                # Composite text onto canvas with color
                r, g, b, a = text_layer.split()
                colored_text = Image.new("RGB", (screen_size, screen_size), color)
                canvas.paste(colored_text, mask=a)

            elif l_type == "image":
                 image_path = layer.get("image_path")
                 if not image_path: continue
                 
                 img = None
                 
                 # Handle Media Source
                 if image_path.startswith("media-source://"):
                     try:
                         from homeassistant.components import media_source
                         # Resolve media source URL
                         resolved = await media_source.async_resolve_media(self.hass, image_path, None)
                         media_url = resolved.url
                         
                         # If it's a relative URL, prepend internal URL or handle locally
                         # resolved.url is typically /media/...
                         # We can fetch it via HTTP from localhost
                         
                         # However, if it maps to a file, maybe we can access directly? 
                         # But abstracting via HTTP is safer for all media sources.
                         
                         # Use internal HTTP client to fetch
                         from homeassistant.helpers.aiohttp_client import async_get_clientsession
                         session = async_get_clientsession(self.hass)
                         
                         # Construct full URL if needed, but usually aiohttp handles relative to host if configured?
                         # No, we need absolute URL or use loopback. 
                         # Actually, HA's aiohttp client is for external. 
                         # For internal, we might need to assume localhost.
                         # Better: use hass.http?
                         
                         # Let's try to fetch relative URL using the server's port?
                         # simpler: "http://127.0.0.1:8123" + media_url
                         
                         url = f"http://127.0.0.1:{self.hass.http.server_port}{media_url}"
                         async with session.get(url) as resp:
                             if resp.status == 200:
                                 data = await resp.read()
                                 import io
                                 img = Image.open(io.BytesIO(data))
                             else:
                                 _LOGGER.error(f"Failed to fetch media: {resp.status}")
                                 continue
                     except Exception as e:
                         _LOGGER.error(f"Error resolving media source {image_path}: {e}")
                         continue

                 else:
                     # Legacy/Local path handling
                     # Resolve path (Check 'www' or absolute)
                     if not os.path.isabs(image_path):
                         # Default to config/www/idotmatrix/
                         base_www = self.hass.config.path("www", "idotmatrix")
                         potential = os.path.join(base_www, image_path)
                         if os.path.exists(potential):
                             image_path = potential
                         else:
                             # Try locally in integration (bundled icons?)
                             local = os.path.join(os.path.dirname(__file__), "images", image_path)
                             if os.path.exists(local):
                                 image_path = local
                                 
                     if os.path.exists(image_path):
                         try:
                            img = Image.open(image_path)
                         except Exception as e:
                             _LOGGER.error(f"Failed to load image file {image_path}: {e}")
                             continue
                
                 if img:
                     try:
                         img = img.convert("RGBA")
                         # Resize if size provided
                         w = layer.get("width")
                         h = layer.get("height")
                         if w and h:
                             img = img.resize((int(w), int(h)))
                         
                         canvas.paste(img, (x, y), img)
                     except Exception as e:
                         _LOGGER.error(f"Failed to process image layer: {e}")

        return canvas

    async def _load_icon(self, icon_ref: str, size: int) -> Image.Image | None:
        """Fetch and rasterize an icon reference."""
        if not icon_ref:
            return None

        icon_ref = icon_ref.strip()
        if not icon_ref:
            return None

        cache_key = (icon_ref, size)
        if cache_key in self._icon_cache:
            cached = self._icon_cache[cache_key]
            return cached.copy() if cached else None

        url = None
        if icon_ref.startswith("mdi:"):
            icon_name = icon_ref.split(":", 1)[1]
            icon_img = await self._render_mdi_icon(icon_name, size)
            if icon_img:
                self._icon_cache[cache_key] = icon_img
                return icon_img.copy()

        if ":" in icon_ref and not icon_ref.startswith(("http://", "https://")):
            from urllib.parse import quote

            icon_id = quote(icon_ref, safe=":/-")
            url = f"https://api.iconify.design/{icon_id}.svg"
        elif icon_ref.startswith("/"):
            url = f"http://127.0.0.1:{self.hass.http.server_port}{icon_ref}"
        elif icon_ref.startswith("http://") or icon_ref.startswith("https://"):
            url = icon_ref

        if not url:
            _LOGGER.warning("Unsupported icon reference: %s", icon_ref)
            return None

        try:
            session = async_get_clientsession(self.hass)
            ssl = False if url.startswith("https://api.iconify.design/") else None
            async with session.get(url, ssl=ssl) as resp:
                if resp.status != 200:
                    _LOGGER.warning("Failed to fetch icon %s (status %s)", icon_ref, resp.status)
                    self._icon_cache[cache_key] = None
                    return None
                content_type = resp.headers.get("Content-Type", "")
                data = await resp.read()

            if "svg" in content_type or data.lstrip().startswith(b"<svg") or data.lstrip().startswith(b"<?xml"):
                png_bytes = await self.hass.async_add_executor_job(
                    self._svg_to_png,
                    data,
                    size,
                )
                if not png_bytes:
                    if not self._svg_error_logged:
                        _LOGGER.warning(
                            "SVG icon rendering unavailable; install cairo to enable SVG icons."
                        )
                        self._svg_error_logged = True
                    self._icon_cache[cache_key] = None
                    return None
                icon_img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
            else:
                icon_img = Image.open(io.BytesIO(data)).convert("RGBA")
                if icon_img.size != (size, size):
                    icon_img = icon_img.resize((size, size))
            self._icon_cache[cache_key] = icon_img
            return icon_img.copy()
        except Exception as exc:
            _LOGGER.warning("Failed to render icon %s: %s", icon_ref, exc)
            self._icon_cache[cache_key] = None
            return None

    @staticmethod
    def _svg_to_png(svg_data: bytes, size: int) -> bytes | None:
        """Convert SVG bytes to PNG bytes."""
        try:
            import cairosvg
            return cairosvg.svg2png(
                bytestring=svg_data,
                output_width=size,
                output_height=size,
            )
        except Exception:
            return None

    async def _render_mdi_icon(self, icon_name: str, size: int) -> Image.Image | None:
        """Render an MDI icon using the bundled font."""
        await self._ensure_mdi_assets()

        if not self._mdi_meta or not self._mdi_font_bytes:
            return None

        codepoint = self._mdi_meta.get(icon_name)
        if not codepoint:
            if icon_name not in self._mdi_unknown_icons:
                _LOGGER.warning("Unknown MDI icon: %s", icon_name)
                self._mdi_unknown_icons.add(icon_name)
            return None

        font = self._mdi_fonts.get(size)
        if not font:
            font = ImageFont.truetype(io.BytesIO(self._mdi_font_bytes), size)
            self._mdi_fonts[size] = font

        icon_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(icon_img)
        char = chr(int(codepoint, 16))

        bbox = draw.textbbox((0, 0), char, font=font)
        x = (size - (bbox[2] - bbox[0])) // 2 - bbox[0]
        y = (size - (bbox[3] - bbox[1])) // 2 - bbox[1]
        draw.text((x, y), char, font=font, fill=(255, 255, 255, 255))
        return icon_img

    async def _ensure_mdi_assets(self) -> None:
        """Load MDI meta and font bytes."""
        if self._mdi_meta and self._mdi_font_bytes:
            return

        async with self._mdi_lock:
            if self._mdi_meta and self._mdi_font_bytes:
                return

            session = async_get_clientsession(self.hass)
            try:
                async with session.get(MDI_META_URL, ssl=False) as resp:
                    if resp.status != 200:
                        if not self._mdi_error_logged:
                            _LOGGER.warning("Failed to fetch MDI metadata (status %s)", resp.status)
                            self._mdi_error_logged = True
                        return
                    meta_data = await resp.json(content_type=None)

                async with session.get(MDI_FONT_URL, ssl=False) as resp:
                    if resp.status != 200:
                        if not self._mdi_error_logged:
                            _LOGGER.warning("Failed to fetch MDI font (status %s)", resp.status)
                            self._mdi_error_logged = True
                        return
                    font_bytes = await resp.read()
            except Exception as exc:
                if not self._mdi_error_logged:
                    _LOGGER.warning("Failed to load MDI assets: %s", exc)
                    self._mdi_error_logged = True
                return

            if isinstance(meta_data, list):
                self._mdi_meta = {
                    item["name"]: item["codepoint"]
                    for item in meta_data
                    if isinstance(item, dict) and "name" in item and "codepoint" in item
                }
            else:
                self._mdi_meta = None

            self._mdi_font_bytes = font_bytes

    async def async_load_settings(self) -> None:
        """Load settings from storage."""
        if (data := await self._store.async_load()):
            _LOGGER.debug(f"Loaded persist settings: {data}")
            self.text_settings.update(data)

    async def async_save_settings(self) -> None:
        """Save settings to storage."""
        await self._store.async_save(self.text_settings)

    async def _async_update_data(self):
        """Fetch data from the device."""
        return {"connected": True}

    async def async_update_device(self) -> None:
        """Send current configuration to the device."""
        text = self.text_settings.get("current_text", "")
        settings = self.text_settings

        if self.display_mode == DISPLAY_MODE_DESIGN and settings.get("mode") == "advanced":
             # Advanced Rendering
             screen_size = int(settings.get("screen_size", 32))
             image = await self._render_face(settings.get("layers", []), screen_size)
             
             # Save image in executor to avoid blocking
             with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                tmp_path = tmp.name
             
             await self.hass.async_add_executor_job(image.save, tmp_path)
             
             try:
                await IDMImage().setMode(1)
                await IDMImage().uploadProcessed(tmp_path, pixel_size=screen_size)
             finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
             
        elif text:
            # Render Text (Basic Mode)
            if settings.get("multiline", False):
                await self._set_multiline_text(text, settings)
            else:
                # Standard Scroller
                await Text().setMode(
                    text=text,
                    font_size=int(settings.get("font_size", 10)), 
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
        else:
            # Render Clock (Default fallback)
            # Use self.text_settings for clock config
            # Retrieve color and format
            c = settings.get("color", [255, 0, 0])
            h24 = settings.get("clock_format", "24h") == "24h"
            
            style = settings.get("clock_style", 0)
            show_date = settings.get("clock_date", True)
            
                
            await Clock().setMode(
                style=style,
                visibleDate=show_date,
                hour24=h24,
                r=c[0],
                g=c[1],
                b=c[2]
            )
            
        # Notify listeners to update UI states
        self.async_set_updated_data(self.data)
        
        # Save persistence
        await self.async_save_settings()

    async def _set_multiline_text(self, text: str, settings: dict) -> None:
        """Generate an image from text and upload it."""
        screen_size = int(settings.get("screen_size", 32))
        font_name = settings.get("font")
        color = tuple(settings.get("color", (255, 0, 0)))
        spacing = int(settings.get("spacing", 1))
        spacing_y = int(settings.get("spacing_y", 1))
        blur = int(settings.get("blur", 5))
        
        # Resolve font path
        # Note: __file__ here is coordinator.py, so we need to adjust path logic
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
                
        # Determine font size and max scanning range if autosize is on
        initial_font_size = int(settings.get("font_size", 10))
        target_font_size = initial_font_size
        
        if settings.get("autosize", False):
            # Start from user's size or 32, whichever is reasonable, and shrink until fit
            # Or always start large? Let's start from current size and shrink, 
            # OR start from 32 (max) to find biggest possible fit? "Perfectly" usually means "Maximize".
            # Let's try to Maximize: Start at 32 (or screen_size) down to 6.
            start_size = screen_size
            end_size = 6
        else:
            # Single pass
            start_size = initial_font_size
            end_size = initial_font_size

        font_path_to_use = font_path

        # Iterative resizing loop
        for s in range(start_size, end_size - 1, -1):
            target_font_size = s
            try:
                if font_path_to_use.lower().endswith(".bdf"):
                     font = ImageFont.load(font_path_to_use)
                     # BDF fonts are fixed size, autosize won't work well unless we pick different files.
                     # For now, skip autosize on BDF or just use it as is.
                else:
                     font = ImageFont.truetype(font_path_to_use, s)
            except:
                font = ImageFont.load_default()

            # Pixel-based Word Wrapping (Simulated for check)
            words = text.split(' ')
            lines = []
            current_line = []
            
            def get_word_width(word):
                if not word: return 0
                w = 0
                for i, char in enumerate(word):
                    bbox = font.getbbox(char)
                    char_w = (bbox[2] - bbox[0]) if bbox else font.getlength(char)
                    w += char_w + spacing
                return w - spacing
            
            # Recalculate space width for this font size
            try:
                space_bbox = font.getbbox(" ")
                space_w = (space_bbox[2] - space_bbox[0]) if space_bbox else font.getlength(" ")
            except:
                space_w = 4
            space_width = space_w + spacing
            if space_width < 1: space_width = 1
            
            current_line_width = 0
            
            for word in words:
                word_width = get_word_width(word)
                if current_line_width + word_width <= screen_size:
                    current_line.append(word)
                    current_line_width += word_width + space_width
                else:
                    if current_line:
                        lines.append(current_line)
                        current_line = []
                        current_line_width = 0
                    current_line.append(word)
                    current_line_width = word_width + space_width
            if current_line:
                lines.append(current_line)
            
            # Check Height
            ascent, descent = font.getmetrics()
            line_height = ascent + descent + spacing_y
            total_height = len(lines) * line_height
            
            # If autosize is OFF, we accept the first pass (initial_font_size)
            if not settings.get("autosize", False):
                break
                
            # If autosize is ON, check if it fits
            if total_height <= screen_size and all(get_word_width(w) <= screen_size for w in words):
                 # Fits!
                 break
        
        # Draw lines using chosen target_font_size
        text_layer = Image.new("RGBA", (screen_size, screen_size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(text_layer)
        
        y = (screen_size - total_height) // 2 if settings.get("autosize", False) else 0 # Center vertically if autosizing
        if y < 0: y = 0
        
        for line_words in lines:
            if y >= screen_size: break
            # Center Horizontally?
            # Standard wrapper is left aligned. Perfect fit usually implies Center/Center.
            # Let's calculate line width for centering
            line_w = 0
            for i, w in enumerate(line_words):
                 line_w += get_word_width(w)
                 if i < len(line_words) - 1: line_w += space_width
            
            x = (screen_size - line_w) // 2 if settings.get("autosize", False) else 0
            if x < 0: x = 0
            
            for i, word in enumerate(line_words):
                for char in word:
                    if x >= screen_size: break
                    draw.text((x, y), char, font=font, fill=(255, 255, 255, 255))
                    bbox = font.getbbox(char)
                    char_w = (bbox[2] - bbox[0]) if bbox else font.getlength(char)
                    x += char_w + spacing
                if i < len(line_words) - 1:
                     x += space_width
            y += line_height
            
        if blur < 5:
             r, g, b, a = text_layer.split()
             gain = 1.0 + ((5 - blur) * 2.0) 
             def apply_contrast(p):
                 v = (p - 128) * gain + 128
                 return max(0, min(255, int(v)))
             a = a.point(apply_contrast)
             text_layer.putalpha(a)
             
        final_image = Image.new("RGB", (screen_size, screen_size), (0, 0, 0))
        r, g, b, a = text_layer.split()
        colored_text = Image.new("RGB", (screen_size, screen_size), color)
        final_image.paste(colored_text, mask=a)
        
        image = final_image
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            image.save(tmp.name)
            tmp_path = tmp.name
        try:
            await IDMImage().setMode(1)
            await IDMImage().uploadProcessed(tmp_path, pixel_size=screen_size)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
