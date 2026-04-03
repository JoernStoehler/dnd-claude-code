# Handoff: Card generator simplification

**Date:** 2026-04-03
**Status:** Scripts exist and run. End-to-end tested once. Output not reviewed by Jörn. Code not reviewed by a fresh agent.

## What exists

Two Python scripts replacing the deleted `packages/card-generator/` (Node.js):

**`scripts/build-cards.py`** (168 lines): Takes PNG file paths, composites each into a card image (portrait left + ruled writing lines right) via Pillow, then arranges cards in an HTML table and renders to A4 PDF via weasyprint. Greyscale by default, `--color` flag for color. Card height adapts to first image's aspect ratio.

Run: `uv run scripts/build-cards.py sessions/2026-04-21-oneshot/style-test/charcoal.png sessions/2026-04-21-oneshot/style-test/comic-g3.0.png -o /tmp/test.pdf`

**`scripts/gen-image.py`** (110 lines): Calls fal.ai with a text prompt, saves result as PNG with full API response embedded as a tEXt chunk (`fal_response` key). Requires `FAL_KEY` env var.

Run: `uv run scripts/gen-image.py --prompt "test" --image /tmp/test.png`

Both run via `uv run` (uv installed manually; Dockerfile also updated but container not rebuilt).

**End-to-end test (2026-04-03):** Generated a portrait with gen-image.py (3:4, ink wash style), fed it to build-cards.py, got a 153KB single-page PDF. The PDF showed: greyscale bust portrait on left (~48% of card width), ruled lines on right, 4 rows × 2 columns on A4, dashed cut borders, white background. One card filled, seven blank.

## What's not done

- **Jörn has not seen the output.** The PDF was shown in conversation but Jörn did not comment on whether the layout meets his needs.
- **Code not reviewed by fresh eyes.** The 2026-04-03 agent had severe reliability issues (fabricated claims, thrashed 2h on CSS, see `sessions/2026-04-03-postmortem.md`). The code was rewritten near the end of the session and may have issues the agent can't see.
- **Container rebuild.** Dockerfile changed (uv added, pip weasyprint removed). Jörn must run `.devcontainer/host-devcontainer-rebuild.sh`. uv works now because it was installed manually, but the image is stale.
- **1:1 aspect ratio untested.** Only tested with 3:4 (portrait) images. Design says 1:1 (square) should also work — "1:1 → 52mm tall cards, 5 rows/page" per `--help` — but not verified.

## Design decisions

From the 2026-04-03 discussion between Jörn and the agent. Jörn's words are quoted verbatim.

| Decision | Source |
|---|---|
| Landscape half-card: portrait left, writing right, 2 cols on A4 | Agent proposed, Jörn accepted: "Ok, that convinces me." |
| White background, no textures | Jörn: "white background is easiest to write on." |
| Greyscale default, color opt-in | Jörn: "maybe the card can be b&w and the portrait gets color (for npcs where color is worth it?)" — simplified to `--color` flag |
| No name/text on cards | Jörn: "players can 'see' what a person looks like without any spoilers, and they have to keep track of information themselves." |
| Face/bust, not full body | Jörn: "the genai seems especially bad with body proportions -.- so maybe face portraits is better?" |
| 1:1 or 3:4 Flux native aspects, no crop | Jörn: "i am leaning towards using uncropped 1:1 or 4:3 since that's what flux family models were trained on" |
| Card height adapts to image aspect | Agent proposed, Jörn did not explicitly confirm |
| PNG files directly, no JSON | Jörn: "Do we actually need json files? Iiuc we just use pngs?" |
| Embed fal.ai response in PNG, no sidecars | Jörn: "Make sure to embed the API call instead of any weird custom thing. KISS." |
| No GM mode | Jörn: "Why do we need a GM mode?" / "The GM tracks image metadata in .MD files" |
| gen-image.py is general-purpose | Jörn named it, insisted it "does not presume to be about portraits" |
| uv run with inline deps | Jörn pushed for this, rejected deferral |
| --help is the docs | Jörn: "explicit, fail early and loud, useful --help that provides uptodate info" |
| Real fal.ai model IDs | Jörn self-corrected from `flux[schnell]`: "KISS says to not map model ids" |

## Technical notes

- Pillow compositing was chosen because weasyprint's CSS flex doesn't reliably constrain child element heights (14 CSS approaches tried and failed). Ruled lines are drawn with `ImageDraw.line()`.
- HTML is trivial: `table-layout: fixed`, one `<img>` per `<td>`, dashed borders for cut lines. Card images saved to a temp dir with DPI metadata.
- `sessions/2026-04-21-oneshot/build-portrait-cards.py` is the original working weasyprint script this was derived from.
- Test with 2-3 images. The Read tool took 10 minutes per 5MB PDF during this session (see postmortem for details).
