# Character Portrait Workflow Tests

Use this file only when revisiting or simplifying the portrait workflow. It records observed test results, not proof that a prompt phrase or workflow step caused an image property.

## 2026-04-25 Bisection

Method: fresh `codex exec` sessions generated one portrait per workflow variant, saved PNG and JSON sidecars under `output/imagegen/`, then the top-level session visually reviewed the outputs.

Outputs:

- `output/imagegen/2026-04-25-bisect-baseline.png`
- `output/imagegen/2026-04-25-bisect-no-visual-ref.png`
- `output/imagegen/2026-04-25-bisect-no-style-notes.png`
- `output/imagegen/2026-04-25-bisect-minimal.png`

Results:

- Full workflow baseline: accepted; best role control and provenance capture.
- Written style notes and shared prompt structure without visual reference inspection: accepted and in-family; main drift was a larger cobblestone floor patch.
- Visual reference inspection without written style notes: accepted but overfit the guard reference; the new portrait read more like an armed city officer than the requested intrigue role.
- Minimal compact prompt without notes or references: accepted at broad style level; weaker card discipline, larger floor patch, and more weapon-forward than requested.

Current workflow decision:

- Keep `$imagegen`, written notes, example-prompt structure, inspection of the two OpenAI reference PNGs named in `SKILL.md`, output review, and sidecar in the default skill.
- If Jörn wants a faster routine path, the first candidate to remove is mandatory inspection of those two OpenAI reference PNGs, not the written notes or example-prompt structure.
- For bisection trials, record omitted workflow steps in the sidecar only if Jörn asks for that extra test metadata.
