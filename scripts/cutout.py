"""Turn white-background product photos into transparent cut-outs (WebP with alpha).

Background = pixels connected to the image border whose colour is close to the
border's colour. Those become transparent; their darkness is kept as a soft grey
shadow so garments still sit naturally on any backdrop.

usage: python3 cutout.py <in_dir> <out_dir> [max_side]
"""
import sys, os, glob
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def cutout(path, out_path, max_side=None):
    im = Image.open(path).convert('RGB')
    if max_side and max(im.size) > max_side:
        s = max_side / max(im.size)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))

    # candidate background = close to the backdrop colour (incl. soft shadows)
    # threshold: 40 also catches the light anti-aliased rim, but would eat into
    # near-white fabric — so light, unsaturated garments (judged by the image centre) get 18
    ch, cw = h // 2, w // 2
    centre = a[ch - h // 6: ch + h // 6, cw - w // 8: cw + w // 8].reshape(-1, 3)
    centre_lum = float(np.median(centre @ np.array([0.299, 0.587, 0.114], dtype=np.float32)))
    med = np.median(centre, axis=0)
    chroma = float(med.max() - med.min())  # near-white fabric is light AND unsaturated (yellow isn't)
    T = 18 if centre_lum > 200 and chroma < 40 else 40
    cand = (dist < T).astype(np.uint8) * 255
    def fill(src):
        m = src.copy()  # own buffer: floodfill can't write to an array-backed image
        for sx, sy in seeds:
            if m.getpixel((sx, sy)) == 255:
                ImageDraw.floodfill(m, (sx, sy), 128)
        return np.asarray(m) == 128

    seeds = [(x, 0) for x in range(0, w, 6)] + [(x, h - 1) for x in range(0, w, 6)] + \
            [(0, y) for y in range(0, h, 6)] + [(w - 1, y) for y in range(0, h, 6)]
    cand_img = Image.fromarray(cand, 'L')
    fine = fill(cand_img)                                   # exact edges, but can leak through thin gaps
    coarse = fill(cand_img.filter(ImageFilter.MinFilter(7)))  # can't pass gaps narrower than ~7px
    reach = np.asarray(Image.fromarray((coarse * 255).astype(np.uint8), 'L').filter(ImageFilter.MaxFilter(15))) > 0
    region = fine & reach  # backdrop = fine fill, minus anything only reachable through a thin gap

    lum = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    bg_lum = float(bg @ np.array([0.299, 0.587, 0.114]))
    shadow = np.clip((bg_lum - lum) / max(bg_lum, 1) * 1.8, 0, 0.55)  # keep soft shadows

    alpha = np.where(region, shadow, 1.0)
    rgb = a.copy()
    rgb[region] = [32, 30, 28]  # shadow tone
    # feather the cut edge slightly
    # defringe: pull the edge in by ~1px to drop the white halo, then feather
    alpha_img = Image.fromarray((alpha * 255).astype(np.uint8), 'L').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    out = Image.fromarray(rgb.astype(np.uint8), 'RGB')
    out.putalpha(alpha_img)
    # trim to the garment (ignore the faint shadow) so its top edge = the shoulders;
    # keep a little room below for the shadow
    solid = np.argwhere(alpha > 0.7)
    if solid.size:
        (y0, x0), (y1, x1) = solid.min(0), solid.max(0)
        px = round((x1 - x0) * 0.015)
        out = out.crop((max(0, x0 - px), max(0, y0 - 1), min(w, x1 + px + 1), min(h, y1 + round((y1 - y0) * 0.04) + 1)))
    out.save(out_path, 'WEBP', quality=86, method=6)
    return region.mean(), T

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    max_side = int(sys.argv[3]) if len(sys.argv) > 3 else None
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, '*.jpg')) + glob.glob(os.path.join(src, '*.png'))):
        pid = os.path.splitext(os.path.basename(f))[0]
        bgshare, T = cutout(f, os.path.join(dst, pid + '.webp'), max_side)
        print(f'{pid:4s} background {bgshare:.0%}  threshold {T}')
