# OpenAI Character Portrait Style

Reference images:

- `output/imagegen/2026-04-23-openai-guard-reference.png`
- `output/imagegen/2026-04-25-openai-smuggler-test.png`

Both files were copied into the repo from built-in OpenAI image generation outputs under `/home/vscode/.codex/generated_images/` on 2026-04-25.

## Observed Visual Traits

These notes describe visible traits in current accepted examples. They are not proof that any trait, phrase, or prompt line caused the output quality.

- Full-body single character, centered, standing.
- Clean white or nearly white background with no scenery.
- Small wet cobblestone patch under the boots; no full street scene.
- Realistic painterly digital rendering, not line art, anime, comic art, or flat illustration.
- Gritty urban sword-and-sorcery costuming: worn coats, dark practical layers, leather belts, pouches, tarnished brass, damp boots.
- Grounded human intrigue: wary expressions, tired faces, lived-in clothing, practical weapons or documents.
- Soft neutral studio lighting with enough contrast to reveal texture.
- Muted palette: soot black, dark navy, weathered brown leather, tarnished brass, off-white linen.

## Prompt Constraints

- Keep the whole body visible, including boots and the cobblestone patch.
- Leave generous white margin around the figure.
- Put props in hands or on the belt only when they identify the role.
- Use one clear pose. Avoid action scenes.
- Avoid background architecture, canals, crowds, monsters, spell effects, banners, text, logos, and watermarks.

## Character Brief Fields

Use these fields when turning an NPC into a prompt:

- Name or slug.
- Role in Eversink.
- Age range and build.
- Face and expression.
- Clothing layers and condition.
- One or two role-signaling props.
- Weapon only if the character would openly carry it.
- Mood at the table: suspicious, exhausted, calculating, defiant, official, desperate.

## Review Checklist

- Full body visible.
- Face has a usable expression.
- Hands are not badly distorted at card size.
- Clothing matches grounded Eversink, not high fantasy.
- Background remains white or nearly white.
- Cobblestone patch does not become a full scene.
- No text, logo, watermark, extra character, or visible modern item.
- Sidecar JSON records the exact submitted prompt.
