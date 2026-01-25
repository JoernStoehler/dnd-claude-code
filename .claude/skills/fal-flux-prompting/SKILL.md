# fal.ai Flux Image Generation

How to generate high-quality images using fal.ai's Flux model.

## API Basics

```bash
curl -X POST "https://fal.run/fal-ai/flux/dev" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "...", "image_size": "portrait_4_3", "num_images": 1}'
```

## Standard Size Presets

Use standard presets for best quality (model trained on these ratios):

| Preset | Dimensions | Use Case |
|--------|------------|----------|
| `square` | 1024×1024 | Versatile, safe default |
| `square_hd` | 1024×1024 | High quality square |
| `portrait_4_3` | 768×1024 | Character portraits |
| `portrait_16_9` | 576×1024 | Tall/narrow scenes |
| `landscape_4_3` | 1024×768 | Locations, wide scenes |
| `landscape_16_9` | 1024×576 | Panoramic views |

**Avoid custom dimensions** - the model performs best on standard aspect ratios.

## Prompting Best Practices

### Structure: Subject First

Flux weighs earlier information more heavily. Put the most important element first.

**Weak:** "Create an image with dramatic lighting featuring an elven warrior"
**Strong:** "Elven warrior in ornate silver armor, dramatic side lighting, forest background"

### Layered Approach

1. **Subject** (most important): "A dwarf blacksmith with braided red beard"
2. **Setting**: "...in a stone forge with glowing coals"
3. **Lighting/Perspective**: "...warm firelight, low angle view"
4. **Style**: "...oil painting style, fantasy illustration"

### For Card Portraits

Use framing keywords to control composition and avoid cropping issues:

- "head and shoulders portrait" - upper body focus
- "bust portrait" - chest up
- "centered composition" - subject in middle
- "facing forward" or "three-quarter view" - orientation

**Example NPC prompt:**
```
head and shoulders portrait of a gnome inventor with brass goggles,
wild white hair, soot-stained face, warm workshop lighting,
oil painting style, fantasy illustration, centered composition
```

### Style Consistency

For a cohesive card set, use consistent style tags. **Avoid vague descriptors** like "fantasy illustration" or "oil painting" - Flux flattens these to generic output.

**Recommended styles** (actually produce distinct results):
- `ink drawing with watercolor wash, pen and ink linework` - Best for whimsical/fun campaigns
- `watercolor painting, soft edges, flowing colors` - Softer, more painterly
- `renaissance portrait, chiaroscuro lighting, dark background` - Serious/dramatic campaigns

**Avoid** (collapse to same generic output):
- "oil painting style"
- "fantasy illustration"
- "in the style of classic D&D art"
- "storybook illustration"

### Avoid

- Contradictory descriptors ("bright sunny day with moody shadows")
- Negative prompts (Flux doesn't support them well - describe what you want instead)
- Vague terms ("nice", "cool", "interesting")

## API Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `prompt` | required | Image description |
| `image_size` | `landscape_4_3` | Size preset or `{width, height}` |
| `num_inference_steps` | 28 | More steps = higher quality, slower |
| `guidance_scale` | 3.5 | How closely to follow prompt (1-20) |
| `seed` | random | For reproducible results |
| `num_images` | 1 | Batch generation |

## Cost

Roughly $0.01-0.02 per image depending on size and steps.

## References

- [Flux 2 Prompt Guide](https://fal.ai/learn/devs/flux-2-prompt-guide) - Official fal.ai guide
- [FLUX.1 dev API](https://fal.ai/models/fal-ai/flux/dev/api) - API reference
- [Best FLUX.1 Prompts 2025](https://skywork.ai/blog/flux1-prompts-tested-templates-tips-2025/) - Tested templates
