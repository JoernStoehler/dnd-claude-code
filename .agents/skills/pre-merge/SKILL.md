---
name: pre-merge
description: Top-level merge-readiness workflow before asking Jörn about integration to main; use after repo edits, generated campaign materials, script changes, or harness changes are drafted.
---

# Pre-Merge Workflow

Run the phases that match the branch surface before telling Jörn work is ready.
If a phase has no files in scope, record that fact in the report.

## Phase 1: Static Checks

Run these from the repo root:

```bash
git diff --check
bash -n scripts/*.sh .devcontainer/*.sh sessions/*/*.sh
python3 -m py_compile scripts/*.py sessions/*/*.py
```

If a glob has no matches, rerun the command on the concrete files in scope.

For changed skills, validate each changed skill directory:

```bash
uv run --with pyyaml python /home/vscode/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/<skill-name>
```

If that system path is absent, use the same script under the active user's
`~/.codex/skills/.system/skill-creator/scripts/quick_validate.py`.

## Phase 2: Functional Smoke

Run the smallest smoke checks that match the diff:

```bash
uv run scripts/build-cards.py --help
uv run scripts/gen-image.py --help
bash scripts/decrypt-rulebook.sh
```

For changed session handout HTML, scripts, or PDFs, run the session-local build
script when inputs and external downloads are available:

```bash
bash sessions/<date-slug>/build-pdfs.sh
```

For FAL image generation, do not spend API credits unless the task explicitly
requires it or Jörn has approved generation. `--help` is enough for CLI wiring.

## Phase 3: Review

Use the `reviewer` subagent plus `$review` when available. Otherwise run the
same checklist locally.

Default review surfaces:

| Surface | Scope | Check |
|---------|-------|-------|
| Python | Changed `.py` files | `$python-conventions`, `review/references/python.md` |
| Claims | Changed markdown, HTML, handouts, prompts | `review/references/claims.md` |
| Figures/cards/PDFs | Changed image/PDF generation or generated visual assets | `review/references/figures.md` |
| Harness | `AGENTS.md`, `.agents/**`, `.codex/**`, `.devcontainer/**` | `$harness-engineering` actionability and stale-path checks |

Cross-check reviewer findings before reporting them. Read the cited file and
confirm the evidence matches the finding.

## Phase 4: Sanity Check

- Re-read the original task prompt and verify the work answers it.
- Check `TASKS.md` for affected task status, blockers, or resume points.
- Check for stale Claude-era paths or commands:

```bash
rg -n 'CLAUDE|Claude|\.claude|sync-claude|CLAUDE_PROJECT_DIR|EnterWorktree' .
```

Historical references in `feedback/` may remain. Live instructions, README,
devcontainer files, and task entries should point at Codex/AGENTS surfaces.

## Phase 5: Report

Report:

1. What changed.
2. Which checks passed or could not run.
3. Verified review findings.
4. `TASKS.md` updates or "no changes needed".
5. Anything Jörn must decide or verify personally.

If work is incomplete, write `handoffs/<name>.md` before stopping.
