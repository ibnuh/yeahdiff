#!/usr/bin/env python3
"""Generate YeahDiff favicons - "YD" logo with diff-inspired green/red split."""

from PIL import Image, ImageDraw, ImageFont
import struct
import io
import os

STATIC = os.path.join(os.path.dirname(__file__), '..', 'static')

# Colors
BG_COLOR = (79, 70, 229)       # Indigo-600 (#4f46e5)
RED = (239, 68, 68)             # Vibrant red for removals
GREEN = (34, 197, 94)           # Vibrant green for additions
WHITE = (255, 255, 255)


def render_logo(size: int) -> Image.Image:
    """Render the YD logo at the given size."""
    # Work at 4x for anti-aliasing, then downscale
    scale = 4
    s = size * scale
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Create the rounded rectangle shape as a mask
    margin = int(s * 0.04)
    radius = int(s * 0.18)

    # Draw the base rounded rect with blue
    draw.rounded_rectangle(
        [margin, margin, s - margin, s - margin],
        radius=radius,
        fill=BG_COLOR
    )

    # Create a separate layer for the diff stripe, then composite with mask
    stripe_layer = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    stripe_draw = ImageDraw.Draw(stripe_layer)

    stripe_w = int(s * 0.07)
    mid_y = s // 2

    # Red top half
    stripe_draw.rectangle(
        [margin, margin, margin + stripe_w, mid_y],
        fill=(*RED, 255)
    )
    # Green bottom half
    stripe_draw.rectangle(
        [margin, mid_y, margin + stripe_w, s - margin],
        fill=(*GREEN, 255)
    )

    # Create mask from the rounded rectangle shape
    mask = Image.new('L', (s, s), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(
        [margin, margin, s - margin, s - margin],
        radius=radius,
        fill=255
    )

    # Apply mask to stripe layer so it clips to rounded rect
    stripe_layer.putalpha(Image.fromarray(
        __import__('numpy').minimum(
            __import__('numpy').array(stripe_layer.getchannel('A')),
            __import__('numpy').array(mask)
        )
    ))

    # Composite stripe onto main image and get new draw context
    img = Image.alpha_composite(img, stripe_layer)
    draw = ImageDraw.Draw(img)

    # Try to use a good system font for "YD"
    font_size = int(s * 0.52)
    font = None
    font_paths = [
        '/System/Library/Fonts/SFCompact-Bold.otf',
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/SFNSDisplay-Bold.otf',
        '/Library/Fonts/SF-Pro-Display-Bold.otf',
        '/System/Library/Fonts/SFNS.ttf',
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                break
            except Exception:
                continue

    if font is None:
        font = ImageFont.load_default()

    text = "YD"

    # Center the text (shifted right slightly to account for diff stripe)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    text_x = int(s * 0.12) + (int(s * 0.85) - tw) // 2
    text_y = (s - th) // 2 - bbox[1]

    # Draw text with slight shadow for depth
    shadow_offset = max(1, int(s * 0.008))
    draw.text(
        (text_x + shadow_offset, text_y + shadow_offset),
        text, fill=(0, 0, 0, 60), font=font
    )

    # Main text - white
    draw.text((text_x, text_y), text, fill=WHITE, font=font)

    # Downscale with high-quality resampling
    return img.resize((size, size), Image.LANCZOS)


def create_ico(images: list[Image.Image], path: str):
    """Create a .ico file from multiple PIL Images."""
    # Use Pillow's built-in ICO save
    images[0].save(
        path,
        format='ICO',
        sizes=[(img.width, img.height) for img in images]
    )


def main():
    os.makedirs(STATIC, exist_ok=True)

    sizes = {
        'favicon-16x16.png': 16,
        'favicon-32x32.png': 32,
        'favicon.png': 32,
        'apple-touch-icon.png': 180,
        'android-chrome-192x192.png': 192,
        'android-chrome-512x512.png': 512,
    }

    images = {}
    for filename, size in sizes.items():
        img = render_logo(size)
        path = os.path.join(STATIC, filename)
        img.save(path, 'PNG', optimize=True)
        images[filename] = img
        print(f"  {filename} ({size}x{size})")

    # Create .ico with 16, 32, and 48px versions
    ico_images = [render_logo(s) for s in [16, 32, 48]]
    ico_path = os.path.join(STATIC, 'favicon.ico')
    create_ico(ico_images, ico_path)
    print(f"  favicon.ico (16, 32, 48)")

    print("Done!")


if __name__ == '__main__':
    main()
