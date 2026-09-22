"""Build the compressed element backgrounds and their LQIP placeholders.

Sources (masters, kept in the repo):
    design/handoffs/claude-design-v2/landing-page/project/assets/nature-*.jpg
Outputs:
    landing-page/assets/images/<name>.webp   (primary, q=78)
    landing-page/assets/images/<name>.jpg    (fallback, progressive, q=74)
    landing-page/assets/placeholder/<element>-lqip.jpg  (32 px wide blur-up)

Run from anywhere:  py landing-page/scripts/build-images.py
Requires Pillow (py -m pip install pillow).
"""

from pathlib import Path

from PIL import Image, ImageOps

REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = REPO_ROOT / "design" / "handoffs" / "claude-design-v2" / "landing-page" / "project" / "assets"
IMAGES_DIR = REPO_ROOT / "landing-page" / "assets" / "images"
LQIP_DIR = REPO_ROOT / "landing-page" / "assets" / "placeholder"

MAX_EDGE = 1600
WEBP_QUALITY = 78
JPEG_QUALITY = 74
LQIP_WIDTH = 32
LQIP_QUALITY = 40

# output name -> (source file, lqip element name)
JOBS = {
    "metal-mountains": ("nature-metal.jpg", "metal"),
    "wood-forest": ("nature-wood.jpg", "wood"),
    "water-ocean": ("nature-water.jpg", "water"),
}


def kb(path: Path) -> str:
    return f"{path.stat().st_size / 1024:.0f} KB"


def build(name: str, source: str, element: str) -> None:
    src = SRC_DIR / source
    if not src.exists():
        raise SystemExit(f"missing master image: {src}")

    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        width, height = im.size

        webp = IMAGES_DIR / f"{name}.webp"
        im.save(webp, "WEBP", quality=WEBP_QUALITY, method=6)

        jpg = IMAGES_DIR / f"{name}.jpg"
        im.save(jpg, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)

        lqip = LQIP_DIR / f"{element}-lqip.jpg"
        small = im.copy()
        small.thumbnail((LQIP_WIDTH, LQIP_WIDTH * 2), Image.LANCZOS)
        small.save(lqip, "JPEG", quality=LQIP_QUALITY, optimize=True)

    print(f"{name}: {width}x{height}  webp {kb(webp)}  jpg {kb(jpg)}  lqip {kb(lqip)}")


def main() -> None:
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    LQIP_DIR.mkdir(parents=True, exist_ok=True)
    for name, (source, element) in JOBS.items():
        build(name, source, element)


if __name__ == "__main__":
    main()
