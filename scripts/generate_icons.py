#!/usr/bin/env python3
"""Generate PWA icons for Paris 2026 application using standard library only."""

import zlib
import struct
from pathlib import Path

def create_png(width, height, color_bg=(28, 25, 23), color_fg=(217, 119, 6)):
    """Create a clean PNG icon with Paris Eiffel / Tower motif using pure python."""
    # Build raw RGBA pixels
    raw_data = bytearray()
    center_x, center_y = width // 2, height // 2
    radius = int(width * 0.44)

    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            dx = x - center_x
            dy = y - center_y
            dist_sq = dx * dx + dy * dy

            # Outer rounded squircle background
            if abs(dx) < width * 0.44 and abs(dy) < height * 0.44:
                # Inside card
                # Draw stylized Eiffel tower silhouette in amber
                # Triangle apex at top, base at bottom
                rel_y = (y - height * 0.2) / (height * 0.6) # 0 to 1
                if 0 <= rel_y <= 1.0:
                    half_w = (rel_y * 0.4 + 0.05) * width * 0.5
                    if abs(dx) <= half_w:
                        # Eiffel golden color
                        raw_data.extend([color_fg[0], color_fg[1], color_fg[2], 255])
                    else:
                        raw_data.extend([color_bg[0], color_bg[1], color_bg[2], 255])
                else:
                    raw_data.extend([color_bg[0], color_bg[1], color_bg[2], 255])
            else:
                # Background
                raw_data.extend([color_bg[0], color_bg[1], color_bg[2], 255])

    # Compress IDAT
    compressed = zlib.compress(bytes(raw_data), 9)

    # Construct PNG chunks
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png_bytes = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
    return png_bytes

public_dir = Path("public")
public_dir.mkdir(exist_ok=True)

# 192x192
with open(public_dir / "pwa-192x192.png", "wb") as f:
    f.write(create_png(192, 192))

# 512x512
with open(public_dir / "pwa-512x512.png", "wb") as f:
    f.write(create_png(512, 512))

# Maskable 512x512
with open(public_dir / "pwa-maskable-512x512.png", "wb") as f:
    f.write(create_png(512, 512))

# Apple touch icon 180x180
with open(public_dir / "apple-touch-icon.png", "wb") as f:
    f.write(create_png(180, 180))

# SVG Icon
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#1c1917"/>
  <path d="M256 90 L242 160 L200 370 L170 410 L220 410 L234 330 L278 330 L292 410 L342 410 L312 370 L270 160 Z" fill="#d97706"/>
  <rect x="238" y="240" width="36" height="12" fill="#faf8f5" rx="3"/>
  <rect x="228" y="320" width="56" height="14" fill="#faf8f5" rx="3"/>
  <circle cx="256" cy="80" r="10" fill="#f59e0b"/>
</svg>'''
with open(public_dir / "icon.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

print("PWA Icons generated successfully in public/")
