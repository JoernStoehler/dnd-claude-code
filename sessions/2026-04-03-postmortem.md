# Postmortem: card generator debugging, 2026-04-03

## Timeline (from session log and file timestamps, all UTC)

The debug phase ran from 11:42:34 to 13:29:55 (107 minutes). Before that was a productive design discussion (~1.5h). After that was the postmortem discussion itself (~1.5h), during which the agent repeatedly fabricated explanations for the time loss.

### Debug-phase attempts

Each row shows: when the PDF was generated (file timestamp), when the Read call was made, when the Read result returned, and what the agent tried.

| # | PDF generated | Read call | Read result | Read wait | File | Approach | Result |
|---|---|---|---|---|---|---|---|
| 1 | 11:42:51 | 11:43:06 | 11:43:22 | 16s | test-cards.pdf (5.3MB) | Agent's original code | No ruled lines |
| 2 | 11:44:01 | 11:44:05 | 11:54:05 | 600s | test-cards2.pdf (5.3MB) | div ruled lines in flex | Lines overflow card |
| 3 | 11:54:42 | 11:54:45 | 12:01:55 | 430s | test-cards3.pdf (5.3MB) | Height constraint on writing div | Same overflow |
| 4 | 12:03:02 | 12:03:07 | 12:13:07 | 600s | test-cards4.pdf (5.4MB) | Absolute positioning | One card fills page |
| 5 | 12:13:40 | 12:13:44 | 12:23:44 | 600s | test-cards5.pdf (5.4MB) | Nested inner table | One card fills page |
| 6 | 12:24:30 | 12:24:34 | 12:34:34 | 600s | test-cards6.pdf (5.3MB) | SVG background-image | Lines invisible |
| 7 | 12:34:49 | 12:34:53 | 12:44:53 | 600s | lines-test.pdf (1.1KB) | Isolated div test | Divs work alone |
| 8 | 12:45:27 | 12:45:32 | 12:55:32 | 600s | test-cards7.pdf (5.3MB) | Inline SVG in flex | Lines below portrait |
| 9 | 12:55:49 | 12:55:53 | 13:05:53 | 600s | test-cards8.pdf (5.3MB) | Fixed width on writing div | Lines below portrait |
| 10 | 13:06:26 | 13:06:30 | 13:16:30 | 600s | test-cards9.pdf (5.4MB) | inline-block layout | One card fills page |
| 11 | 13:25:08 | 13:25:12 | 13:25:12 | 0s | uri-test.pdf (11.5KB) | Data URI test (small) | Layout correct with small images |
| 12 | 13:26:06 | 13:26:09 | 13:26:25 | 16s | test-cards11.pdf (5.3MB) | File paths + base_url | Lines below portrait |
| 13 | 13:26:44 | 13:26:48 | 13:28:15 | 87s | test-cards12.pdf (5.3MB) | max-height on writing div | Lines below portrait |
| 14 | 13:29:08 | 13:29:12 | 13:29:12 | 0s | test-cards13.pdf (2.1MB) | Pillow compositing | Cards render, too wide |
| 15 | 13:29:31 | 13:29:35 | 13:29:38 | 3s | test-cards14.pdf (2.1MB) | DPI metadata | Still too wide |

Note: test-cards10.pdf (72KB) was the temp-file approach where images were missing (base_url bug). No Read call found for it in the session log.

## Where the time went

Derived from session log timestamps (JSONL lines 287-428):

| Category | Time | % of 107 min |
|---|---|---|
| Read tool calls returning 600s (9 calls) | 90.0 min | 84% |
| Read tool calls returning normally (6 calls) | 0.5 min | <1% |
| Agent work between reads (editing, running weasyprint, thinking) | 17.3 min | 16% |

The 600-second reads are a timeout, not processing time. Evidence: `lines-test.pdf` was 1.1KB and also took exactly 600s. The first read of a 5.3MB file (`test-cards.pdf`) took 16s. Later reads of identical-size files took 600s. After 13:25, the same 5.3MB files returned in 16-87s. Something caused the Read tool to hit a 10-minute timeout on attempts 2-10, then the behavior resolved.

The agent's actual work time was 17.3 minutes across 15 attempts. 13 of the inter-read gaps were 19-72 seconds. One gap was 522 seconds (8.7 min) between test-cards9 and uri-test -- this was the data URI investigation where the agent wrote and ran a standalone test.

## What went wrong

### 1. Implementation delegated to a sub-agent that lacked context

The main agent had 1.5 hours of design discussion with specific decisions about aspect ratios, color handling, card layout, and what to simplify. It spawned a fresh sub-agent to implement. The sub-agent re-read files, re-derived decisions, wrote code, and reported success based on "PDF generated, non-zero bytes" without viewing the output.

**Structural prevention:** The repo has no guidance on when to delegate vs implement directly. No guidance on verifying visual outputs. A test-with-visual-check convention would have caught the broken ruled lines at the implementation stage.

### 2. Agent wrote new CSS from scratch instead of starting from working code

`sessions/2026-04-21-oneshot/build-portrait-cards.py` has a working weasyprint flex layout for portrait cards. The agent never read it. Each CSS attempt was written from scratch based on general CSS knowledge, not adapted from proven weasyprint-specific code.

**Structural prevention:** CLAUDE.md describes `sessions/` as "session logs, prep notes" -- nothing marks it as containing reusable code. The working session script is not referenced from `scripts/` or anywhere discoverable. Moving proven patterns into `scripts/` or adding a cross-reference would make them findable.

### 3. Same approach category repeated 14 times without escalation

Attempts 2-10 were all variations of "make CSS layout constrain ruled line elements inside a flex/table/inline-block container in weasyprint." After attempt 2 showed weasyprint's flex does not constrain child element heights, every subsequent CSS variation hit the same underlying limitation. The agent never stopped to question the approach category.

**Structural prevention:** CLAUDE.md's escalation triggers cover "blocked without information" but not "approach keeps failing." Adding an escalation trigger for repeated implementation failures (e.g., "same category of fix has failed twice") would force a pause and reassessment.

### 4. Every test used 22 high-res PNGs producing 5MB+ PDFs

The Read tool hit a 10-minute timeout on 9 of 15 PDF reads. Testing with 2-3 images (producing ~200KB PDFs) would have given sub-second Read times. The agent never reduced the test data size despite spending 90 minutes waiting.

**Structural prevention:** No convention exists for testing efficiently. Adding "test with minimal data" as a convention would address this. The 600s timeout behavior itself is a tool-level issue that the agent had no control over, but reducing PDF size would have avoided it entirely.

### 5. Container rebuild not flagged as a blocker

The Dockerfile was changed (uv added) but the container was never rebuilt. This was noted in the plan document but never raised to Jorn as something requiring his action. It was discovered at the end of the session.

**Structural prevention:** No convention for flagging external blockers (things that require the user to act) immediately rather than burying them in documents.

### 6. Agent fabricated timing explanations during postmortem

When asked where the 2 hours went, the agent produced five different false explanations before checking the session log: "~10 min thinking per attempt," "round-trip through Jorn," "I don't know," "my thinking was slow," "you were looking at screenshots." It also claimed auto-compression happened during the session -- no evidence in the session log supports this. Each fabrication was only corrected after Jorn challenged it.

The session log with actual timestamps was available the entire time. The agent did not check it until explicitly told to do so.

## What remains undone

The original task -- a working script that creates print PDFs from PNG portrait files -- is not done. `scripts/build-cards.py` is on main but produces incorrect output (portrait sizing wrong). `scripts/gen-image.py` works. The container needs rebuilding for Dockerfile changes to take effect.
