from ..connectionManager import ConnectionManager
import logging
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple, Optional, Union
import zlib


class Text:
    """Manages text processing and packet creation for iDotMatrix devices. With help from https://github.com/8none1/idotmatrix/ :)"""

    logging = logging.getLogger(__name__)
    # must be 16x32 or 8x16
    image_width = 16
    image_height = 32
    # must be x05 for 16x32 or x02 for 8x16
    separator = b"\x05\xff\xff\xff"

    def __init__(self, connection_manager: ConnectionManager) -> None:
        self.conn = connection_manager

    async def setMode(
        self,
        text: str,
        font_size: int = 16,
        font_path: Optional[str] = None,
        text_mode: int = 1,
        speed: int = 95,
        text_color_mode: int = 1,
        text_color: Tuple[int, int, int] = (255, 0, 0),
        text_bg_mode: int = 0,
        text_bg_color: Tuple[int, int, int] = (0, 255, 0),
        compact_mode: bool = False,
        spacing: int = 0,
        proportional: bool = True,
    ) -> Union[bool, bytearray]:
        
        # Determine layout based on mode
        if compact_mode:
            image_width = 8
            image_height = 16
            separator = b"\x02\xff\xff\xff"
        else:
            image_width = 16
            image_height = 32
            separator = b"\x05\xff\xff\xff"

        try:
            if self.conn and self.conn.hass:
                text_bitmaps = await self.conn.hass.async_add_executor_job(
                    self._StringToBitmaps,
                    text,
                    font_path,
                    font_size,
                    image_width,
                    image_height,
                    separator,
                    spacing,
                    proportional,
                )
            else:
                text_bitmaps = self._StringToBitmaps(
                    text=text,
                    font_size=font_size,
                    font_path=font_path,
                    image_width=image_width,
                    image_height=image_height,
                    separator=separator,
                    spacing=spacing,
                    proportional=proportional,
                )

            data = self._buildStringPacket(
                text_mode=text_mode,
                speed=speed,
                text_color_mode=text_color_mode,
                text_color=text_color,
                text_bg_mode=text_bg_mode,
                text_bg_color=text_bg_color,
                text_bitmaps=text_bitmaps,
                separator=separator
            )
            if self.conn:
                await self.conn.connect()
                await self.conn.send(data=data)
            return data
        except Exception as error:
            self.logging.error(f"could send the text to the device: {error}")
            return False

    def _buildStringPacket(
        self,
        text_bitmaps: bytearray,
        text_mode: int = 1,
        speed: int = 95,
        text_color_mode: int = 1,
        text_color: Tuple[int, int, int] = (255, 0, 0),
        text_bg_mode: int = 0,
        text_bg_color: Tuple[int, int, int] = (0, 255, 0),
        separator: bytes = b"\x05\xff\xff\xff"
    ) -> bytearray:
        """Constructs a packet with the settings and bitmaps for iDotMatrix devices."""
        num_chars = text_bitmaps.count(separator)

        text_metadata = bytearray(
            [
                0,
                0,  # Placeholder for num_chars, to be set below
                0,
                1,  # Static values
                text_mode,
                speed,
                text_color_mode,
                *text_color,
                text_bg_mode,
                *text_bg_color,
            ]
        )
        text_metadata[:2] = num_chars.to_bytes(2, byteorder="little")

        packet = text_metadata + text_bitmaps

        header = bytearray(
            [
                0,
                0,  # total_len placeholder
                3,
                0,
                0,  # Static header values
                0,
                0,
                0,
                0,  # Placeholder for packet length
                0,
                0,
                0,
                0,  # Placeholder for CRC
                0,
                0,
                12,  # Static footer values
            ]
        )
        total_len = len(packet) + len(header)
        header[:2] = total_len.to_bytes(2, byteorder="little")
        header[5:9] = len(packet).to_bytes(4, byteorder="little")
        header[9:13] = zlib.crc32(packet).to_bytes(4, byteorder="little")

        return header + packet

    def _StringToBitmaps(
        self, text: str, font_path: Optional[str] = None, font_size: Optional[int] = 20,
        image_width: int = 16, image_height: int = 32, separator: bytes = b"\x05\xff\xff\xff",
        spacing: int = 0, proportional: bool = True
    ) -> bytearray:
        """Converts text to bitmap images suitable for iDotMatrix devices."""
        import os
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        fonts_dir = os.path.join(base_path, "fonts")
        
        if not font_path:
            # using open source font from https://www.fontspace.com/rain-font-f22577
            font_path = os.path.join(fonts_dir, "Rain-DRM3.otf")
        elif not os.path.isabs(font_path) and not os.path.exists(font_path):
            # Check if it's in the fonts dir
            potential_path = os.path.join(fonts_dir, font_path)
            if os.path.exists(potential_path):
                font_path = potential_path
        if font_path and not os.path.exists(font_path):
            self.logging.warning(
                "Font path %s not found, falling back to Rain-DRM3.otf",
                font_path,
            )
            font_path = os.path.join(fonts_dir, "Rain-DRM3.otf")
        
        if font_path:
            try:
                font = ImageFont.truetype(font_path, font_size)
            except Exception as exc:
                self.logging.warning(
                    "Failed to load font %s, falling back to default: %s",
                    font_path,
                    exc,
                )
                try:
                    font = ImageFont.truetype(
                        os.path.join(fonts_dir, "Rain-DRM3.otf"), font_size
                    )
                except Exception:
                    font = ImageFont.load_default()
        else:
            font = ImageFont.load_default()
        byte_stream = bytearray()
        
        if not proportional:
            # Legacy Fixed Width Logic
            for char in text:
                image = Image.new("1", (image_width, image_height), 0)
                draw = ImageDraw.Draw(image)
                
                _, _, text_width, text_height = draw.textbbox((0, 0), text=char, font=font)
                text_x = (image_width - text_width) // 2
                text_y = (image_height - text_height) // 2
                draw.text((text_x, text_y), char, fill=1, font=font)
                
                bitmap = bytearray()
                for y in range(image_height):
                    for x in range(image_width):
                        if x % 8 == 0:
                            byte = 0
                        pixel = image.getpixel((x, y))
                        byte |= (pixel & 1) << (x % 8)
                        if x % 8 == 7 or x == image_width - 1:
                            bitmap.append(byte)
                byte_stream.extend(separator + bitmap)
            return byte_stream
            
        else:
            # Proportional Logic (Slicing)
            # 1. Measure total width with spacing
            total_width = 0
            # To handle spacing correctly, we draw tightly then add spacing?
            # Or use draw.text callback?
            # For simplicity, we draw the whole string at once to let PIL handle basic kerning,
            # then we add extra spacing if requested by iterating chars?
            # User wants "0 to no space", which implies they might want TIGHTER than PIL defaults?
            # But PIL is standard. Let's assume proportional=True means "Natural".
            # And `spacing` adds EXTRA pixels.
            
            # Draw char by char to allow custom spacing
            char_images = []
            max_h = image_height
            
            for char in text:
                 # get size
                 # Use dummy draw
                 dummy = Image.new("1", (1, 1), 0)
                 d = ImageDraw.Draw(dummy)
                 bbox = d.textbbox((0, 0), text=char, font=font)
                 w = bbox[2] - bbox[0]
                 # h = bbox[3] - bbox[1] # ignore height, use max
                 char_images.append((char, w))
                 
            total_width = sum([w + spacing for char, w in char_images])
            # Ensure width is at least one block?
            if total_width < image_width:
                total_width = image_width
                
            # Create big canvas
            canvas = Image.new("1", (total_width, image_height), 0)
            draw = ImageDraw.Draw(canvas)
            
            current_x = 0
            for char, w in char_images:
                # Vertically center?
                bbox = draw.textbbox((0, 0), text=char, font=font)
                h = bbox[3] - bbox[1]
                y = (image_height - h) // 2
                # Correct Y using font metrics if possible for baseline consistency, but centering per char is safer for pixel fonts
                # Actually, standard draw.text usually handles baseline.
                # If we center each char vertically independently, it might look jumpy.
                # Better to use a constant Y for the whole line.
                draw.text((current_x, y), char, fill=1, font=font)
                current_x += w + spacing
                
            # Slice into chunks of image_width (16)
            for i in range(0, total_width, image_width):
                # crop(box) -> (left, upper, right, lower)
                chunk = canvas.crop((i, 0, i + image_width, image_height))
                
                # If last chunk is narrow, pad it?
                if chunk.size[0] < image_width:
                    tmp = Image.new("1", (image_width, image_height), 0)
                    tmp.paste(chunk, (0, 0))
                    chunk = tmp
                    
                # Convert to bitmap
                bitmap = bytearray()
                for y in range(image_height):
                    for x in range(image_width):
                        if x % 8 == 0:
                            byte = 0
                        pixel = chunk.getpixel((x, y))
                        byte |= (pixel & 1) << (x % 8)
                        if x % 8 == 7 or x == image_width - 1:
                            bitmap.append(byte)
                byte_stream.extend(separator + bitmap)
                
            return byte_stream
