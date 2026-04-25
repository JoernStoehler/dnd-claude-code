---
name: character-portrait-generation
description: Generate Swords of the Serpentine campaign character portraits in the locked OpenAI painterly full-body style. Use with $imagegen when asked to make, iterate, save, review, or document Eversink NPC portraits, portrait-card art, pregenerated-character portraits, or other campaign character art that should match the current OpenAI image style.
---

# Character Portrait Generation

Create Eversink character portraits with the built-in `image_gen` tool, then save the accepted image and sidecar metadata in the repo.

This skill is not standalone. The first action after loading `$character-portrait-generation` is to load `$imagegen` and follow its built-in tool mode. Do not use the old Flux/fal workflow unless Jörn asks for a provider comparison or legacy rerun.

## Operating Model

- Treat the reference PNGs as required visual inputs, not illustrative examples.
- Treat written style notes as observations from accepted examples, not proven causes.
- Preserve provenance outside the PNG because built-in OpenAI image files do not expose submitted prompt, revised prompt, usage, or request id. If the local Codex session log exposes an `image_generation_call` id or `revised_prompt`, record those in the sidecar.
- Change the workflow only after Jörn approves a test plan.

## Procedure

1. Load `$imagegen`.
2. Read `references/openai-character-style.md`.
3. Inspect both reference PNGs named in that file with `view_image`.
4. Build the character brief from Jörn's prompt or current campaign files. Verify any campaign facts against current repo sources before using them.
5. Write one structured prompt from the brief, the reference images, and the observed style notes.
6. Generate one image with the built-in `image_gen` tool for each requested portrait or iteration.
7. Locate the generated PNG under `${CODEX_HOME:-$HOME/.codex}/generated_images/`.
8. Copy the accepted PNG into `output/imagegen/` or the requested session folder. Leave the original generated file in place.
9. Inspect the copied PNG. Check crop, face, hands, props, background, and style match.
10. Write a JSON sidecar next to the copied PNG with the same basename and `.json`.
11. If the Codex session log contains an `image_generation_call`, copy its `id` and `revised_prompt` into the sidecar.
12. Report the copied image path, sidecar path, submitted prompt or recovered revised prompt, and visible defects.

## Prompt Template

```text
Use case: stylized-concept
Asset type: Swords of the Serpentine campaign character portrait, full-body NPC art for a portrait card
Primary request: Create a character portrait in the same style as the established OpenAI campaign portraits: realistic painterly sword-and-sorcery character art on a clean white background.
Subject: <age, build, face, role, clothing, gear, props, pose>
Style/medium: highly detailed realistic digital painting, gritty urban sword-and-sorcery, natural skin texture, worn fabric and leather, painterly but anatomically grounded, matching the isolated full-body RPG character concept style of the reference images.
Composition/framing: full-body standing figure centered, generous white margin, no crop, small patch of wet Eversink cobblestones under the boots, no background scene.
Lighting/mood: soft neutral studio lighting, grounded and tense, human intrigue rather than high fantasy.
Color palette: dark navy, soot black, worn brown leather, tarnished brass, muted linen, plus <character-specific accent if needed>.
Constraints: clean white background, no text, no watermark, no logo, no extra characters, no fantasy armor, no glowing magic effects.
```

## Sidecar Metadata

Fill unknown built-in-tool fields with `null`, not guesses.

```json
{
  "tool": "codex_builtin_image_gen",
  "created_at": "YYYY-MM-DDTHH:MM:SSZ",
  "source_generated_path": "/home/vscode/.codex/generated_images/.../ig_....png",
  "saved_image_path": "output/imagegen/YYYY-MM-DD-slug.png",
  "reference_images": [
    "output/imagegen/2026-04-23-openai-guard-reference.png",
    "output/imagegen/2026-04-25-openai-smuggler-test.png"
  ],
  "image_generation_call_id": null,
  "submitted_prompt": "...",
  "revised_prompt": null,
  "api_request_id": null,
  "visible_review": {
    "accepted": true,
    "notes": "..."
  }
}
```

## Metadata Check

Run this when provenance matters or when documenting a new reference image:

```bash
perl -e 'binmode STDIN; read(STDIN,my $sig,8); die "not png\n" unless $sig eq "\x89PNG\r\n\x1a\n"; while (read(STDIN,my $lenbuf,4)==4){ my $len=unpack("N",$lenbuf); read(STDIN,my $type,4); print "$type $len\n"; seek(STDIN,$len+4,1); last if $type eq "IEND"; }' < output/imagegen/example.png
strings -a -n 4 output/imagegen/example.png | rg -n 'c2pa|jumb|created|softwareAgent|OpenAI|prompt|revised|usage|request'
```

Expected result for built-in OpenAI PNGs: C2PA/JUMBF provenance such as `OpenAI Media Service API` and `gpt-image`. Do not expect the submitted prompt, revised prompt, usage, or request id to be embedded.

If generation happened in a persisted Codex session, the session JSONL may include an `image_generation_call` item with an `id`, `status`, `revised_prompt`, and base64 `result`. Use that session item for the sidecar when available; do not paste the base64 result into the sidecar.

## Jörn Gates

Ask Jörn before:

- Removing or weakening any procedure step.
- Switching away from built-in `$imagegen`.
- Replacing the reference images.
- Adding generated art to a session artifact that players will see.

For workflow simplification, propose a bisection test: group the suspected removable steps, have a fresh agent test the largest independent group first, then split only if the output fails. Keep the original step until Jörn accepts the tested change.
