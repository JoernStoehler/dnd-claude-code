# Postmortem: card generator rewrite, 2026-04-03

## What happened

Replaced `packages/card-generator/` (Node.js) with `scripts/build-cards.py` + `scripts/gen-image.py` (Python). `gen-image.py` works. `build-cards.py` layout was broken for 14 attempts across 1h47m before finally working.

## Where the time went

Session log (`1feb1695-...jsonl`) shows each PDF Read call took exactly 10 minutes to process a 5.3MB PDF. 8 such reads = 80 minutes of the 107-minute debugging phase. The remaining ~27 minutes was actual work across 14 attempts (~2 min each).

The fix was trivial: test with 2 images (238KB PDF, instant Read) instead of 22 (5.3MB PDF, 10-min Read). Nobody noticed because nobody looked at the session log until the end.

## Decision points

### 1. Delegated implementation to sub-agent

After 1h+ design discussion with Jörn, spawned a sub-agent to implement. The agent had none of the conversational context. It wrote code, checked "PDF file exists and is non-zero bytes," reported success. Ruled lines were broken from the start.

**Why it happened:** Nothing says "implement yourself when you have design context" or "visually verify PDF/image output."

### 2. Wrote new CSS instead of starting from working code

`sessions/2026-04-21-oneshot/build-portrait-cards.py` has a proven weasyprint flex layout. It was never read. New CSS was written from scratch for each attempt.

**Why it happened:** `sessions/` is described as "session logs, prep notes" in CLAUDE.md. Nothing marks it as containing reusable code. Nothing in `scripts/build-cards.py` references the session script it was based on.

### 3. 14 attempts at CSS without changing approach

Weasyprint's flex implementation doesn't constrain child element heights — adding ruled line divs inside a flex child causes overflow/wrapping. Every CSS attempt was a variation of "make flex work for this." The working approach (Pillow compositing + simple HTML table) was attempt 13.

**Why it happened:** No escalation trigger for "approach keeps failing." No weasyprint limitations documented.

### 4. 5.3MB PDFs used for every test

22 high-res PNGs produced 5.3MB PDFs. Read tool took 10 minutes per PDF. Nobody thought to use 2 images instead.

**Why it happened:** No guidance on testing visual output efficiently.

## Structural fixes needed

1. **CLAUDE.md escalation triggers:** Add "implementation approach has failed twice"
2. **CLAUDE.md repo layout:** Note that `sessions/` contains reusable weasyprint patterns
3. **CLAUDE.md conventions:** "PDF/image outputs must be visually verified. Test with minimal data (2-3 images, not 22)."
4. **`scripts/build-cards.py` header:** Reference `sessions/2026-04-21-oneshot/build-portrait-cards.py` as the proven pattern
5. **`build-cards.py` portrait width:** Currently slightly too wide — Pillow resize uses card height instead of portrait height

## Current state (post-merge)

- `scripts/build-cards.py` — Works (Pillow compositing + `table-layout: fixed`). Portrait width slightly off. Needs one fix.
- `scripts/gen-image.py` — Works. Tested.
- `.devcontainer/Dockerfile` — uv added, weasyprint C libs explicit. Needs container rebuild.
