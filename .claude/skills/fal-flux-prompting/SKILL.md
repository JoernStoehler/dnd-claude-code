---
name: fal-flux-prompting
description: Generate images using fal.ai Flux. Use when asked to create images, portraits, maps, or visual assets for the campaign.
---

# fal.ai Flux Image Generation

## API Basics

```bash
curl -X POST "https://fal.run/{MODEL}" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "...", "image_size": "portrait_4_3", "num_images": 1}'
```

## Available Models

Check current offerings: https://fal.ai/models?q=flux

Pricing is per-megapixel, varies by model. Check each model's API page for current pricing.

## Prompting Guides

Read these before writing prompts. Do NOT rely on summaries — the guides contain tested examples and model-specific advice.

- **Official BFL prompting guide (Flux 2):** https://docs.bfl.ml/guides/prompting_guide_flux2
- **fal.ai Flux 2 prompt guide:** https://fal.ai/learn/devs/flux-2-prompt-guide
- **fal.ai how to use Flux:** https://fal.ai/learn/tools/how-to-use-flux
- **Tested prompt templates & tips:** https://skywork.ai/blog/flux1-prompts-tested-templates-tips-2025/
- **Art styles in Flux (tested gallery):** https://sandner.art/prompting-art-and-design-styles-in-flux-in-forge-and-comfyui/
- **Flux style test gallery:** https://enragedantelope.github.io/Styles-FluxDev/

## Standard Size Presets

| Preset | Dimensions |
|--------|------------|
| `square` | 1024x1024 |
| `square_hd` | 1024x1024 |
| `portrait_4_3` | 768x1024 |
| `portrait_16_9` | 576x1024 |
| `landscape_4_3` | 1024x768 |
| `landscape_16_9` | 1024x576 |

## API Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `prompt` | required | Image description |
| `image_size` | `landscape_4_3` | Size preset or `{width, height}` |
| `num_inference_steps` | 28 | More steps = higher quality, slower |
| `guidance_scale` | 3.5 | How closely to follow prompt |
| `seed` | random | For reproducible results |
| `num_images` | 1 | Batch generation |

Note: defaults above are for `flux/dev`. Other models may have different defaults and parameter behavior. Check the specific model's API page.
