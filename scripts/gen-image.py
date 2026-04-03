#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "fal-client>=1.8.0",
#     "Pillow>=12.0",
# ]
# ///
"""Generate an image via fal.ai and save it with metadata.

Calls the fal.ai API with the given prompt, downloads the result,
and saves it as a PNG with the full API response embedded as metadata.
"""
import argparse
import io
import json
import os
import sys
from pathlib import Path
from urllib.request import urlopen


FORMAT_MAP = {
    "1:1": "square",
    "4:3": "landscape_4_3",
    "3:4": "portrait_4_3",
    "16:9": "landscape_16_9",
    "9:16": "portrait_16_9",
}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate an image via fal.ai from a text prompt.",
        epilog="""\
examples:
  %(prog)s --prompt "A weathered stone bridge over dark water" --image bridge.png
  %(prog)s --prompt "Portrait of a scarred warrior" --format 4:3 --image warrior.png
  %(prog)s --prompt "City skyline at dusk" --model fal-ai/flux/dev --image city.png

models:
  fal-ai/flux/schnell      fast, ~$0.003/image (default)
  fal-ai/flux/dev          higher quality, ~$0.025/image
  fal-ai/flux-pro/v1.1     best quality, ~$0.05/image

formats:
  1:1   square (default)
  3:4   portrait (tall)
  4:3   landscape (wide)
  9:16  tall portrait
  16:9  wide landscape
""",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--prompt", required=True, help="Text prompt for image generation")
    parser.add_argument("--format", default="1:1", choices=FORMAT_MAP.keys(),
                        help="Aspect ratio (default: 1:1)")
    parser.add_argument("--model", default="fal-ai/flux/schnell",
                        help="fal.ai model ID (default: fal-ai/flux/schnell)")
    parser.add_argument("--image", required=True, help="Output image path")
    return parser.parse_args()


def main():
    args = parse_args()

    if not os.environ.get("FAL_KEY"):
        print(
            "Error: FAL_KEY environment variable is not set.\n"
            "Get an API key from https://fal.ai/dashboard/keys and set it:\n"
            "  export FAL_KEY='your-key-here'",
            file=sys.stderr,
        )
        sys.exit(1)

    image_size = FORMAT_MAP[args.format]

    print(f"  model: {args.model}")
    print(f"  size: {image_size} ({args.format})")
    print(f"  prompt: {args.prompt[:80]}{'...' if len(args.prompt) > 80 else ''}")

    import fal_client

    result = fal_client.subscribe(
        args.model,
        arguments={
            "prompt": args.prompt,
            "image_size": image_size,
            "num_images": 1,
        },
    )

    img_url = result["images"][0]["url"]
    img_data = urlopen(img_url).read()

    # Save with metadata
    from PIL import Image
    from PIL.PngImagePlugin import PngInfo

    img = Image.open(io.BytesIO(img_data))
    metadata = PngInfo()
    metadata.add_text("fal_response", json.dumps(result))
    img.save(args.image, format="PNG", pnginfo=metadata)

    print(f"  saved: {args.image} ({Path(args.image).stat().st_size} bytes)")


if __name__ == "__main__":
    main()
