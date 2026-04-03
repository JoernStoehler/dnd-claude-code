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
BASE_API_PARAMS = {
    "image_size": "portrait_4_3",
    "num_images": 1,
    "num_inference_steps": 4,
}

# Layer 0: quality prompt (goes first, anchors every generation)
LAYER0 = "Professional quality detailed illustration with crisp sharp lines, publication ready artwork, high resolution."

# Layer 2: composition + subject (natural language, under 50 words for schnell 256-token limit)
SUBJECT = "A stout middle-aged woman with a scarred face and braided grey hair wearing leather armor, holding a lantern. Full body visible from head to boots, standing on rocky ground, plain white background."

# Layer 1: style variations
# Testing 4 styles × 2 guidance values = 8 images
STYLES = [
    ("penink", "Pen and ink illustration with fine hatching and detailed linework, sword and sorcery fantasy art."),
    ("ligneclaire", "Ligne claire style with clean precise outlines and minimal flat shading, high contrast black on white."),
    ("inkwash", "Ink wash drawing with bold confident brushstrokes, dramatic contrast, black ink on white."),
    ("comic", "Black and white comic book art with strong outlines and dynamic shading, professional sequential art."),
]

GUIDANCE_VALUES = [3.0, 5.0]

# --- END EDIT ---

API_URL = f"https://fal.run/{MODEL}"

def generate(name, prompt, guidance_scale):
    payload = {**BASE_API_PARAMS, "prompt": prompt, "guidance_scale": guidance_scale}
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
        for g in GUIDANCE_VALUES:
            name = f"{style_name}-g{g}"
            full_prompt = f"{LAYER0} {SUBJECT} {style_prompt}"
            tasks.append((name, full_prompt, g))

    print(f"Generating {len(tasks)} images on {MODEL}...")
    results = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(generate, name, prompt, g): name for name, prompt, g in tasks}
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
