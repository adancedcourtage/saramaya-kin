"""
Builds the hero / dawn 3D scene assets from the two source paintings.

For each image in assets-src/scene/ it writes to public/scene/:
  <name>.webp        colour image, 1600 px wide
  <name>-depth.png   greyscale depth map (white = near, black = far)

Depth comes from Depth Anything V2 Small (ONNX) when the model is present at
~/.cache/saramaya-models/depth-anything-v2-small/model.onnx
(https://huggingface.co/onnx-community/depth-anything-v2-small, onnx/model.onnx).
Without it, the depth map is approximated:
  - ground plane: the lower the pixel, the nearer it is
  - sky: bright, low-saturation pixels in the upper part are pushed far away
  - subjects: the people and products found by rembg (isnet) are pulled forward
Run: python3 scripts/make-scene.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "scene"
OUT = ROOT / "public" / "scene"
OUT.mkdir(parents=True, exist_ok=True)

MODEL = Path.home() / ".cache" / "saramaya-models" / "depth-anything-v2-small" / "model.onnx"
session = new_session("isnet-general-use")
depth_model = None
if MODEL.exists():
    import onnxruntime as ort

    depth_model = ort.InferenceSession(str(MODEL), providers=["CoreMLExecutionProvider", "CPUExecutionProvider"])


def model_depth(img, w, h):
    """Relative depth from Depth Anything V2, normalised to 0 (far) .. 1 (near)."""
    iw, ih = 1036, 14 * round(1036 * img.height / img.width / 14)
    x = np.asarray(img.resize((iw, ih), Image.BICUBIC), dtype=np.float32) / 255.0
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    d = depth_model.run(None, {"pixel_values": x})[0][0]
    lo, hi = np.percentile(d, [2, 98])
    d = np.clip((d - lo) / (hi - lo), 0, 1)
    out = Image.fromarray((d * 255).astype(np.uint8), "L").resize((w, h), Image.BICUBIC)
    # widen near objects slightly so their edges do not drag the background along
    return out.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


for path in sorted(SRC.glob("*.png")):
    img = Image.open(path).convert("RGB")
    img.resize((1600, round(1600 * img.height / img.width)), Image.LANCZOS).save(OUT / f"{path.stem}.webp", quality=82, method=6)

    w, h = 768, round(768 * img.height / img.width)
    small = img.resize((w, h), Image.LANCZOS)
    rgb = np.asarray(small, dtype=np.float32) / 255.0
    y = np.linspace(0, 1, h)[:, None] * np.ones((1, w))

    if depth_model is not None:
        model_depth(img, w, h).save(OUT / f"{path.stem}-depth.png", optimize=True)
        print(path.stem, img.size, "->", (w, h), "(Depth Anything V2)")
        continue

    ground = 0.15 + 0.65 * smoothstep(0.3, 1.0, y)

    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1e-4)
    sky = (mx > 0.62) * (sat < 0.35) * (1 - smoothstep(0.25, 0.5, y))
    sky = np.asarray(Image.fromarray((sky * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(8)), dtype=np.float32) / 255

    mask = remove(img, session=session, only_mask=True).resize((w, h), Image.LANCZOS)
    mask = mask.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))
    subject = np.asarray(mask, dtype=np.float32) / 255

    depth = ground * (1 - sky * 0.9)
    depth = np.maximum(depth, subject * (0.7 + 0.3 * y))
    out = Image.fromarray((np.clip(depth, 0, 1) * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(3))
    out.save(OUT / f"{path.stem}-depth.png", optimize=True)
    print(path.stem, img.size, "->", (w, h))
