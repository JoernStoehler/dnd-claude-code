#!/usr/bin/env python3
"""Generate style test images and build a PDF for visual comparison.

Edit STYLES, LAYER2, LAYER3, MODEL below, then run:
    python3 generate-style-test.py

Outputs: style-test/<name>.png, style-test.json, portrait-cards.pdf
"""
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.request import urlopen, Request

FAL_KEY = os.environ["FAL_KEY"]

# --- EDIT THESE ---

MODEL = "fal-ai/flux/schnell"
API_PARAMS = {
    "image_size": "portrait_4_3",
    "num_images": 1,
    "num_inference_steps": 4,
    "guidance_scale": 3.5,
}
IMAGES_PER_STYLE = 1  # set to 2+ to assess within-style variation

LAYER3 = "a stout middle-aged woman with a scarred face, braided grey hair, leather armor, holding a lantern, accurate human proportions"
LAYER2 = "full body head to feet, standing on ground, white background, centered in frame with margin around figure"

STYLES = [
    ("moebius-hc", "in the style of Moebius, clean ink linework, minimal shading, precise detail, high contrast"),
    ("ligneclaire", "ligne claire ink drawing, clean precise outlines, minimal shading, high contrast"),
    ("inkwash", "ink wash drawing, bold brushstrokes, dramatic contrast, fluid black ink on white"),
    ("woodcut", "black and white woodcut print, bold lines, high contrast, medieval illustration"),
    ("penink", "pen and ink illustration, fine hatching, detailed linework, sword and sorcery fantasy art"),
    ("charcoal", "charcoal drawing, dramatic shading, bold strokes, high contrast, expressive"),
    ("comic", "black and white comic book art, strong outlines, dynamic pose, professional illustration"),
    ("etching", "detailed etching, fine crosshatching, classical illustration, high contrast black and white"),
]

# --- END EDIT ---

API_URL = f"https://fal.run/{MODEL}"

def generate(name, prompt):
    payload = {**API_PARAMS, "prompt": prompt}
    req = Request(API_URL, data=json.dumps(payload).encode(), headers={
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json",
    })
    resp = json.loads(urlopen(req).read())
    img_url = resp["images"][0]["url"]
    img_data = urlopen(img_url).read()
    out_path = Path("style-test") / f"{name}.png"
    out_path.write_bytes(img_data)
    print(f"  {name}.png")
    return str(out_path)

def main():
    Path("style-test").mkdir(exist_ok=True)
    tasks = []
    for style_name, style_prompt in STYLES:
        full_prompt = f"{LAYER3}, {LAYER2}, {style_prompt}"
        if IMAGES_PER_STYLE == 1:
            tasks.append((style_name, full_prompt))
        else:
            for i in range(1, IMAGES_PER_STYLE + 1):
                tasks.append((f"{style_name}-{i}", full_prompt))

    print(f"Generating {len(tasks)} images on {MODEL}...")
    results = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(generate, name, prompt): name for name, prompt in tasks}
        for future in as_completed(futures):
            name = futures[future]
            try:
                path = future.result()
                results.append({"file": path, "name": name})
            except Exception as e:
                print(f"  FAILED {name}: {e}", file=sys.stderr)

    results.sort(key=lambda x: x["file"])
    Path("style-test.json").write_text(json.dumps(results, indent=2))
    print(f"\n{len(results)} images saved. Building PDF...")
    subprocess.run([sys.executable, "build-portrait-cards.py", "style-test.json"], check=True)
    print("Done. Open portrait-cards.pdf to review.")

if __name__ == "__main__":
    main()
