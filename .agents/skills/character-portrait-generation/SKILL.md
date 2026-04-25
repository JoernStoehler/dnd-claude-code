---
name: character-portrait-generation
description: Generate Swords of the Serpentine campaign character portraits in the locked OpenAI painterly full-body style. Use with $imagegen when asked to make, iterate, save, review, or document Eversink NPC portraits, portrait-card art, pregenerated-character portraits, or other campaign character art that should match the current OpenAI image style.
---

# Character Portrait Generation

Create Eversink character portraits with the built-in `image_gen` tool, then save the accepted image and sidecar metadata in the repo.

## Procedure

1. Load `$imagegen`; use the built-in image tool, not Flux/fal, unless Jörn asks for a provider comparison or legacy rerun.
2. Inspect the two accepted PNGs named in `## Example Prompts` with `view_image`.
3. Build the character brief from Jörn's prompt or current campaign files. Verify any campaign facts against current repo sources before using them.
4. Write one structured prompt from the brief, those two OpenAI reference PNGs, `## Image Style`, and `## Example Prompts`.
5. Generate one image with the built-in `image_gen` tool for each requested portrait or iteration.
6. Locate the generated PNG under `${CODEX_HOME:-$HOME/.codex}/generated_images/`.
7. Copy the accepted PNG into `output/imagegen/` or the requested session folder. Leave the original generated file in place.
8. Inspect the copied PNG. Check crop, face, hands, props, background, and style match.
9. Write a JSON sidecar next to the copied PNG with the same basename and `.json`.
10. Report the copied image path, sidecar path, prompt, and visible defects.

Before removing workflow steps or the shared prompt structure from `## Example Prompts`, read `references/workflow-tests.md` and run a fresh bisection test.

## Image Style

- Full-body single character, centered, standing.
- Clean white background with no tint, gradient, texture, or scenery.
- Small simple ground patch under the feet; no full street scene.
- Realistic painterly digital rendering, not line art, anime, comic art, or flat illustration.
- Gritty urban sword-and-sorcery costuming: worn coats, dark practical layers, leather belts, pouches, tarnished brass, weathered practical footwear when visible.
- Grounded human intrigue: wary expressions, tired faces, lived-in clothing, practical weapons or documents.
- Soft neutral studio lighting with enough contrast to reveal texture.
- Muted palette: soot black, dark navy, weathered brown leather, tarnished brass, off-white linen.

Review for full body, usable face, hands acceptable at card size, grounded Eversink clothing, clean white background, unobtrusive footing, no text, no logo, no watermark, no extra character, and no modern item.

## Example Prompts

Use the shared structure from these accepted examples. Vary character-specific subject details, props, clothing, accent colors, and posture. Preserve the shared style, composition, lighting, palette, and constraint lines unless a bisection test shows a line can be removed.

`output/imagegen/2026-04-25-openai-smuggler-test.png`

```text
Use case: stylized-concept
Asset type: Swords of the Serpentine campaign character portrait, full-body NPC art for a portrait card
Primary request: Create a second character portrait in the same style as the provided existing built-in generated portrait: realistic painterly sword-and-sorcery character art on a clean white background.
Subject: A sharp-eyed Eversink canal smuggler woman in her late thirties, lean and wary, wearing a dark weathered oilskin coat over practical layered clothing, brass buttons, leather belt with pouches, short curved knife at her hip, damp boots, one hand resting near the knife, the other holding a folded shipping writ.
Style/medium: highly detailed realistic digital painting, gritty urban sword-and-sorcery, natural skin texture, worn fabric and leather, painterly but anatomically grounded, matching the reference image's isolated full-body RPG character concept style.
Composition/framing: full-body standing figure centered, generous white margin, no crop, small patch of wet Eversink cobblestones under the boots, no background scene.
Lighting/mood: soft neutral studio lighting, grounded and tense, human intrigue rather than high fantasy.
Color palette: dark navy, soot black, worn brown leather, tarnished brass, muted linen.
Constraints: clean white background, no text, no watermark, no logo, no extra characters, no fantasy armor, no glowing magic effects.
```

`output/imagegen/2026-04-25-tithe-court-clerk.png`

```text
Use case: stylized-concept
Asset type: Swords of the Serpentine campaign character portrait, full-body NPC art for a portrait card
Primary request: Create a character portrait in the same style as the established OpenAI campaign portraits: realistic painterly sword-and-sorcery character art on a clean white background.
Input images: Reference image 1 is the accepted Eversink guard portrait style; Reference image 2 is the accepted Eversink smuggler portrait style. Match their isolated full-body RPG character concept format, gritty materials, damp clothing, white background, and small wet cobblestone base.
Subject: Middle-aged Eversink tithe-court clerk and quiet blackmail broker, slight build, narrow tired face, sharp nose, thinning dark hair tied back, calculating sideward glance. He wears a rain-darkened long charcoal clerk's coat over a muted linen shirt, soot-black waistcoat, worn brown leather belt with small pouches, tarnished brass buttons, ink-stained cuffs, and damp practical boots. He holds a folded wax-sealed ledger packet in one hand and a small brass stylus in the other; no weapon visible. Pose is still and guarded, one shoulder slightly hunched as if protecting the documents.
Style/medium: highly detailed realistic digital painting, gritty urban sword-and-sorcery, natural skin texture, worn fabric and leather, painterly but anatomically grounded, matching the isolated full-body RPG character concept style of the reference images.
Composition/framing: full-body standing figure centered, generous white margin, no crop, whole body visible including boots, small patch of wet Eversink cobblestones under the boots, no background scene.
Lighting/mood: soft neutral studio lighting, grounded and tense, human intrigue rather than high fantasy.
Color palette: dark navy, soot black, worn brown leather, tarnished brass, muted linen, with a restrained dull burgundy wax-seal accent.
Constraints: clean white background, no text, no watermark, no logo, no extra characters, no fantasy armor, no glowing magic effects, no background architecture, no canals, no crowds, no monsters, no banners, no modern items.
```

## Sidecar Metadata

Use `{path/to/image}.json`.

```json
{
  "created_at": "YYYY-MM-DDTHH:MM:SSZ",
  "source_generated_path": "/home/vscode/.codex/generated_images/.../ig_....png",
  "prompt": "...",
  "reference_images": [
    "output/imagegen/2026-04-23-openai-guard-reference.png",
    "output/imagegen/2026-04-25-openai-smuggler-test.png"
  ]
}
```
