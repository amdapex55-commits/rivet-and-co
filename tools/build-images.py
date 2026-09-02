#!/usr/bin/env python3
"""Normalise the Rivet Jr photography for the web.

The source PNGs carry baked-in pure-white margins of varying size, so dropped
straight into a fixed card frame they show as bands. For each shot we:
  1. trim the pure-white border,
  2. sample the photo's own cream backdrop from the remaining border ring,
  3. centre it on a 2:3 canvas of that same cream (so padding is invisible),
  4. export an 800x1200 JPEG.

Result: every product image is exactly 2:3, band-free and consistent.
"""
import os, sys
from collections import Counter
from PIL import Image

SRC = os.path.expanduser('~/Desktop/Rivet-Jr-Product-Detail-Pack')
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'img', 'products')
TARGET = (800, 1200)          # 2:3
INSET = 0.985                 # a hair of breathing room
WHITE = 248                   # anything at/above this on every channel is margin

PRODUCTS = [
    ('01-Ice-Scrape-Skinny-Jean', 'ice-scrape-skinny-jean'),
    ('02-Shadow-Denim-Jogger', 'shadow-denim-jogger'),
    ('03-Classic-Indigo-Slim-Jean', 'classic-indigo-slim-jean'),
    ('04-Slate-Acid-Skinny-Jean', 'slate-acid-skinny-jean'),
    ('05-Cloud-Wash-Slim-Jean', 'cloud-wash-slim-jean'),
    ('06-Black-Fade-Slim-Jean', 'black-fade-slim-jean'),
    ('07-Storm-Rip-Skinny-Jean', 'storm-rip-skinny-jean'),
    ('08-Charcoal-Utility-Straight-Pant', 'charcoal-utility-straight-pant'),
    ('09-Deep-Acid-Straight-Jean', 'deep-acid-straight-jean'),
]
SHOTS = ['01-waist-front', '02-rip-fabric-detail', '03-back-waist']


def trim_white(im):
    """Crop away the pure-white border, leaving the cream backdrop intact."""
    px = im.convert('RGB').load()
    w, h = im.size

    def row_blank(y):
        return all(px[x, y][0] >= WHITE and px[x, y][1] >= WHITE and px[x, y][2] >= WHITE
                   for x in range(0, w, 3))

    def col_blank(x):
        return all(px[x, y][0] >= WHITE and px[x, y][1] >= WHITE and px[x, y][2] >= WHITE
                   for y in range(0, h, 3))

    top = 0
    while top < h - 1 and row_blank(top):
        top += 1
    bottom = h - 1
    while bottom > top and row_blank(bottom):
        bottom -= 1
    left = 0
    while left < w - 1 and col_blank(left):
        left += 1
    right = w - 1
    while right > left and col_blank(right):
        right -= 1
    return im.crop((left, top, right + 1, bottom + 1))


def backdrop(im):
    """The paper the garment is lying on.

    Sampling a full border ring picks up the garment on tight crops, which gave
    grey pads under the dark washes. The corners of a flat-lay are backdrop far
    more reliably, and the backdrop is always the lighter of the two, so we take
    the corner patches and keep only the light pixels.
    """
    rgb = im.convert('RGB')
    w, h = rgb.size
    cw, ch = max(2, w // 8), max(2, h // 8)
    patches = [
        rgb.crop((0, 0, cw, ch)),
        rgb.crop((w - cw, 0, w, ch)),
        rgb.crop((0, h - ch, cw, h)),
        rgb.crop((w - cw, h - ch, w, h)),
    ]
    px = []
    for pt in patches:
        d = pt.resize((16, 16)).tobytes()
        px += [tuple(d[i:i + 3]) for i in range(0, len(d), 3)]
    light = [c for c in px if min(c) > 150]
    if len(light) < len(px) * 0.15:
        # very tight crop: fall back to the lightest decile of the whole frame
        d = rgb.resize((40, 60)).tobytes()
        allpx = sorted((tuple(d[i:i + 3]) for i in range(0, len(d), 3)), key=lambda c: sum(c))
        light = allpx[int(len(allpx) * 0.9):] or allpx[-10:]
    light.sort(key=lambda c: sum(c))
    return light[len(light) // 2]


def normalise(path, dest):
    im = Image.open(path)
    im = trim_white(im)
    bg = backdrop(im)
    tw, th = TARGET
    scale = min(tw * INSET / im.width, th * INSET / im.height)
    new = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    canvas = Image.new('RGB', TARGET, bg)
    canvas.paste(new, ((tw - new.width) // 2, (th - new.height) // 2))
    canvas.save(dest, 'JPEG', quality=82, optimize=True, progressive=True)
    return im.size, os.path.getsize(dest)


def main():
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for folder, slug in PRODUCTS:
        for i, shot in enumerate(SHOTS, start=1):
            src = os.path.join(SRC, folder, '%s-%s.png' % (slug, shot))
            if not os.path.exists(src):
                print('MISSING', src); continue
            dest = os.path.join(OUT, '%s-%d.jpg' % (slug, i))
            trimmed, size = normalise(src, dest)
            total += size
            if i == 1:
                print('%-34s trimmed to %sx%s  %skb' % (slug, trimmed[0], trimmed[1], size // 1024))
    print('total %.1f MB' % (total / 1048576.0))


if __name__ == '__main__':
    main()
