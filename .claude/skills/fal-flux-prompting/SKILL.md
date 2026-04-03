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

## Models & Pricing

All per-megapixel prices round up to nearest MP. 1024×768 = 1 MP.

| Model | Endpoint | Price | Notes |
|-------|----------|-------|-------|
| FLUX.1 [schnell] | `fal-ai/flux/schnell` | $0.003/MP | Designed for 1-4 inference steps |
| FLUX.1 [dev] | `fal-ai/flux/dev` | $0.025/MP | 12B parameter flow transformer |
| FLUX.1 LoRA | `fal-ai/flux-lora` | $0.035/MP | Dev + custom LoRA weights |
| FLUX 1.1 [pro] | `fal-ai/flux-pro/v1.1` | $0.055/MP | Has prompt enhancement option |
| FLUX.2 [pro] | `fal-ai/flux-2-pro` | $0.03 first MP + $0.015/extra MP | Text-to-image only |
| FLUX.2 [flex] | `fal-ai/flux-2-flex` | $0.05/MP (input + output) | Text-to-image + image editing |
| Kontext [pro] | `fal-ai/flux-pro/kontext` | $0.04/image (flat) | Reference-image editing |
| Kontext LoRA | `fal-ai/flux-kontext-lora` | $0.035/MP | Kontext + custom LoRA weights |

## API Schemas by Model

### FLUX.1 [dev] — `fal-ai/flux/dev`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | yes | — | Image description |
| `image_size` | enum or {width,height} | no | `landscape_4_3` | Size preset or custom dimensions |
| `num_inference_steps` | integer (1-50) | no | 28 | More = higher quality, slower |
| `guidance_scale` | float (1-20) | no | 3.5 | Prompt adherence strength |
| `seed` | integer | no | random | For reproducible results |
| `num_images` | integer (1-4) | no | 1 | Batch count |
| `output_format` | `jpeg` \| `png` | no | `jpeg` | Output format |
| `enable_safety_checker` | boolean | no | true | Safety filter |
| `acceleration` | `none` \| `regular` \| `high` | no | `none` | Speed boost |
| `sync_mode` | boolean | no | false | Return image as data URI |

### FLUX.1 [schnell] — `fal-ai/flux/schnell`

Same schema as dev, except:
- `num_inference_steps` default: **4** (designed for 1-4 steps)

### FLUX 1.1 [pro] — `fal-ai/flux-pro/v1.1`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | yes | — | Image description |
| `image_size` | enum or {width,height} | no | `landscape_4_3` | Size preset or custom dimensions |
| `seed` | integer | no | random | For reproducible results |
| `num_images` | integer | no | 1 | Batch count |
| `output_format` | `jpeg` \| `png` | no | `jpeg` | Output format |
| `safety_tolerance` | 1-6 | no | 2 | 1=most strict, 6=most permissive |
| `enhance_prompt` | boolean | no | false | Auto-enhance prompt |
| `sync_mode` | boolean | no | false | Return image as data URI |

No `num_inference_steps` or `guidance_scale` — model controls these internally.

### FLUX.2 [pro] — `fal-ai/flux-2-pro`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | yes | — | Image description |
| `image_size` | enum or {width,height} | no | `landscape_4_3` | Size preset or custom (max 14142px) |
| `seed` | integer | no | random | For reproducible results |
| `output_format` | `jpeg` \| `png` | no | `jpeg` | Output format |
| `safety_tolerance` | 1-5 | no | 2 | 1=most strict, 5=most permissive |
| `enable_safety_checker` | boolean | no | true | Safety filter |
| `sync_mode` | boolean | no | false | Return image as data URI |

No `num_inference_steps`, `guidance_scale`, or `num_images`.

### FLUX.2 [flex] — `fal-ai/flux-2-flex`

**Text-to-image** endpoint: `fal-ai/flux-2-flex`
**Image editing** endpoint: `fal-ai/flux-2-flex/edit`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | yes | — | Image description |
| `image_size` | enum or {width,height} | no | `landscape_4_3` | Size preset or custom |
| `num_inference_steps` | integer (2-50) | no | 28 | Quality/speed tradeoff |
| `guidance_scale` | float (1.5-10) | no | 3.5 | Prompt adherence |
| `seed` | integer | no | random | For reproducible results |
| `output_format` | `jpeg` \| `png` | no | `jpeg` | Output format |
| `safety_tolerance` | 1-5 | no | 2 | 1=most strict, 5=most permissive |
| `enable_safety_checker` | boolean | no | true | Safety filter |
| `sync_mode` | boolean | no | false | Return image as data URI |

Edit endpoint adds: `image_urls` (string array, required) — input images to edit.

### Kontext [pro] — `fal-ai/flux-pro/kontext`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | yes | — | Edit instruction or image description |
| `image_url` | string | yes | — | Reference/source image URL |
| `guidance_scale` | float | no | 3.5 | Prompt adherence |
| `num_images` | integer | no | 1 | Batch count |
| `output_format` | `jpeg` \| `png` | no | `jpeg` | Output format |
| `safety_tolerance` | 1-6 | no | 2 | 1=most strict, 6=most permissive |
| `enhance_prompt` | boolean | no | false | Auto-enhance prompt |
| `aspect_ratio` | enum | no | — | `21:9, 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, 9:16, 9:21` |
| `seed` | integer | no | random | For reproducible results |
| `sync_mode` | boolean | no | false | Return image as data URI |

Uses `aspect_ratio` instead of `image_size`. Uses `image_url` (singular) not `image_urls`.

### FLUX.1 LoRA — `fal-ai/flux-lora`

Same schema as dev, plus:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `loras` | array of LoraWeight | no | [] | LoRA adaptations to apply |

**LoraWeight object:** `{"path": "url-or-path", "scale": 1.0}` (scale range 0-4)

### Kontext LoRA — `fal-ai/flux-kontext-lora`

Same schema as Kontext, plus:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `loras` | array of LoraWeight | no | [] | LoRA adaptations to apply |
| `num_inference_steps` | integer (10-50) | no | 30 | Quality/speed tradeoff |
| `acceleration` | `none` \| `regular` \| `high` | no | `none` | Speed boost |
| `resolution_mode` | enum | no | `match_input` | `auto`, `match_input`, or aspect ratios |

Uses `resolution_mode` instead of `aspect_ratio`. Default output format is `png`.

## Response Schema (all models)

```json
{
  "images": [{"url": "https://...", "width": 1024, "height": 768, "content_type": "image/jpeg"}],
  "seed": 12345,
  "prompt": "the prompt used",
  "has_nsfw_concepts": [false],
  "timings": {}
}
```

## Standard Size Presets

| Preset | Dimensions |
|--------|------------|
| `square` | 1024×1024 |
| `square_hd` | 1024×1024 |
| `portrait_4_3` | 768×1024 |
| `portrait_16_9` | 576×1024 |
| `landscape_4_3` | 1024×768 |
| `landscape_16_9` | 1024×576 |

## Prompting Reference

Distilled from the guides listed at the bottom. When in doubt, consult the originals.

### Prompt Structure

Flux weighs earlier tokens more heavily. Structure prompts as: **Subject → Action → Style → Context** [BFL, fal.ai]

- ✅ "Luxury leather handbag, displayed on marble surface, soft directional lighting, warm amber tones"
- ❌ "Create an image with soft lighting and warm tones featuring a leather handbag"

### Prompt Length

- schnell token limit: 256 tokens. dev/pro: 512 tokens. [fal.ai how-to]
- Sweet spot: **40-50 words** for most use cases [fal.ai how-to]
- Under 10 words triggers internal expansion from training data [fal.ai how-to]
- Over 200 words gets internally summarized, potentially dropping details [fal.ai how-to]

### Natural Language, Not Keywords

Flux uses T5/Mistral text encoders. It wants sentences, not tag lists. [fal.ai how-to]

- ✅ "A woman in a red silk dress standing barefoot on a sandy beach at sunset, warm golden light behind her, shallow depth of field"
- ❌ "woman, red dress, beach, sunset, bokeh, 8k, masterpiece"

Weight syntax like `(emphasis)++` or `(word:1.5)` has **no effect** — the model ignores it. [fal.ai how-to]

### No Negative Prompts

Flux is guidance-distilled and does not support negative prompts. Describe what you want, not what to avoid. [BFL, fal.ai how-to]

- ✅ "sharp focus, crisp detail, accurate hands, natural proportions"
- ❌ "blurry, low quality, bad hands, deformed"

### Camera & Lens References for Photorealism

Naming specific camera systems shapes output character. [BFL, fal.ai how-to]

- "Shot on Canon EOS R5, 85mm lens at f/2.8" → shallow DOF, specific skin tones
- "Shot on iPhone 16" → casual, candid smartphone aesthetic
- "Hasselblad X2D, medium format, natural light" → editorial quality, fine tonal gradations
- "Shot on Kodak Portra 400" → natural grain, organic colors

Lens focal lengths: 14-24mm wide/dramatic, 35-50mm natural, 70-85mm portrait, 100mm+ telephoto compression. [fal.ai prompt guide]

Depth of field: f/1.4-f/2.8 shallow blur, f/4-f/5.6 moderate, f/8-f/16 deep/sharp. [fal.ai prompt guide]

### Lighting

Describe how light interacts with the scene, not just the condition name. [fal.ai how-to]

- ✅ "warm golden sunset light streaming through the window, casting long shadows across the hardwood floor"
- ❌ "golden hour lighting"

### HEX Color Codes

Associate hex codes with specific objects. [BFL]

- "apple in color #0047AB"
- "walls in hex #C4725A, sofa hex #1B6B6F"
- Gradients: "vase is a gradient, starting with color #02eb3c and finishing with color #edfa3c"

Vague references like "use #FF0000 somewhere" produce inconsistent results. [BFL]

### Text Rendering

Flux renders text well with clear specifications. [BFL, fal.ai how-to]

- Use quotation marks: "A chalkboard sign that says 'TODAY'S SPECIAL: LAVENDER LATTE'"
- Specify font properties: "Bold serif font in dark green, centered on a cream-colored banner"
- Case sensitivity: ALL CAPS in prompt → ALL CAPS output [fal.ai how-to]
- 2-5 words renders most reliably; full sentences have higher error rates [fal.ai how-to]
- Clean backgrounds improve legibility [fal.ai how-to]

### JSON Structured Prompts (FLUX.2)

For complex multi-subject scenes, Flux 2 accepts JSON: [BFL, fal.ai how-to]

```json
{
  "scene": "A dimly lit jazz club in 1960s New York",
  "subjects": [
    {
      "type": "musician",
      "description": "man in a charcoal suit, salt-and-pepper beard",
      "pose": "playing an upright bass with closed eyes",
      "position": "foreground left"
    }
  ],
  "style": "Cinematic film photography",
  "color_palette": ["#2C1810", "#D4A574", "#8B4513"],
  "lighting": "Single warm spotlight from above, smoke catching the light",
  "mood": "Intimate and contemplative",
  "composition": "rule of thirds",
  "camera": {"angle": "slightly low angle", "lens": "50mm"}
}
```

Use JSON for multi-subject precision. Natural language works equally well for single-subject images. [BFL]

### Painterly / Non-Photographic Styles

- Flux has a photographic bias — painterly styles may require effort [sandner.art]
- Lower inference steps (8-10 instead of 20-30) can help with painterly results [sandner.art]
- Flux does not closely copy specific artist styles [sandner.art]
- Describe techniques directly: "Oil painting with soft diffused lighting, subtle chiaroscuro, rich color palette with thin translucent layers, controlled brushwork" [sandner.art]

### Resolution Limits

- Minimum: 64×64. Maximum: 4 MP (e.g. 2048×2048). [BFL]
- Dimensions must be multiples of 16. [BFL]

### Composition

Flux understands compositional terms: rule of thirds, golden spiral, triangular arrangement, diagonal energy. [fal.ai prompt guide]

## Prompting Guide Sources

- **Official BFL prompting guide (Flux 2):** https://docs.bfl.ml/guides/prompting_guide_flux2
- **fal.ai Flux 2 prompt guide:** https://fal.ai/learn/devs/flux-2-prompt-guide
- **fal.ai how to use Flux:** https://fal.ai/learn/tools/how-to-use-flux
- **Art styles in Flux (tested gallery):** https://sandner.art/prompting-art-and-design-styles-in-flux-in-forge-and-comfyui/
- **Flux style test gallery:** https://enragedantelope.github.io/Styles-FluxDev/
