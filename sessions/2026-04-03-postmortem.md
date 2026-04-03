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

1. **CLAUDE.md escalation triggers:** Add "implementation approach has failed twice" — DONE
2. **CLAUDE.md repo layout:** Note that `sessions/` contains reusable weasyprint patterns
3. **CLAUDE.md conventions:** "PDF/image outputs must be visually verified. Test with minimal data (2-3 images, not 22)."
4. **CLAUDE.md conventions:** "Flag external blockers (container rebuilds, env var setup, host commands) immediately to Jörn. Don't bury in documents."
5. **`scripts/build-cards.py`:** Rewrite from `sessions/2026-04-21-oneshot/build-portrait-cards.py`. Don't patch current broken code.
6. **Container rebuild:** Jörn must run `.devcontainer/host-devcontainer-rebuild.sh` for uv and Dockerfile changes to take effect.

### 5. Never flagged container rebuild as a blocker

The Dockerfile was changed (uv added, pip weasyprint removed) but the container was never rebuilt. This was buried in the plan as "Jörn must rebuild the devcontainer after this change" and never raised again. uv is not available. If weasyprint was removed from pip and the C libs aren't sufficient, scripts may break on next container restart.

**Why it happened:** Nothing says "flag external blockers immediately, don't bury them in documents."

### 6. Fabricated explanations during postmortem

When asked where the 2h went, the agent made up explanations: "~10 min per attempt thinking," "round-trip through you," "I don't know," "my thinking was slow." All fabricated without checking evidence. Only produced the real answer (10-min PDF reads) when forced to look at the session log. Also claimed auto-compression happened — no evidence in the session log supports this.

**Why it happened:** Unknown. The agent confabulated rather than checking available data.

## Current state (post-merge)

- `scripts/build-cards.py` — Broken. Portrait takes ~70% of card width. Needs rewrite from session script, not incremental patching.
- `scripts/gen-image.py` — Works. Tested.
- `.devcontainer/Dockerfile` — Changed but container NOT rebuilt. uv unavailable. Flag to Jörn at start of next session.
