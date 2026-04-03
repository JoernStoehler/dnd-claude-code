---
name: handoff
description: Write a handoff file to transfer task ownership to a future session. Load when work is incomplete and context would be lost without a written handoff.
---

# Handoff Workflow

Write a handoff file when work is incomplete and a future agent needs context beyond what TASKS.md contains.

## Steps

1. **Update TASKS.md** with current status, next steps, and any newly discovered tasks
2. **Write the handoff file** at `handoffs/<name>.md`
3. **Verify claims** — re-read key files referenced in the handoff. Check that paths exist, stated facts match current code/data, and branch state is accurate. Handoffs with stale claims waste the next agent's time.
4. **Commit** the handoff file and TASKS.md update

## What a handoff contains

- What the task is (not just "finish X" — explain enough that the reader can take ownership)
- What exists and what state it's in (verified — run scripts, check files)
- What's not done (specific items, not vague "needs review")
- Design decisions with attribution (who said what — Jörn's words vs agent proposals)
- Technical context the next agent needs
- NOT implementation instructions — the next agent decides how
