---
name: post-mortem
description: Run a session post-mortem to capture process failures and improvement opportunities. Use at end of session, when something went wrong, or to improve prompts.
user-invocable: true
---

Reflect on the current session. This runs in main context (not as a subagent) because it needs access to the session's conversation history.

## Shared core — answer for every session

Be concrete and specific. Vague feedback is not useful.

### 1. Friction
What slowed you down?

Bad: "The codebase was confusing"
Good: "Couldn't find NPC files - they're split between characters/npcs/ and some are inline in session logs"

### 2. Unclear Instructions
What was confusing in CLAUDE.md, skills, or agent prompts?

Bad: "The prompt was unclear"
Good: "The NPC template doesn't specify whether to include combat stats for non-combat NPCs"

### 3. Missing Context
What information wasn't provided but was needed?

Bad: "Didn't have enough context"
Good: "Needed to know which session hooks have been played vs are still available"

### 4. What Worked Well
What should be preserved or expanded?

### 5. Suggested Changes
Specific, actionable improvements.

Bad: "Make things clearer"
Good: "Add a 'last played' field to session hook files"

## Process checks — report only items that apply

6. **Agent splitting needed?** — Did any multi-responsibility agent fail to cover all its checks? Recommend splitting if so.
7. **Fabrications slipped through?** — Did fabricated claims or convention violations reach Jörn that subagent review should have caught?
8. **Iterated in front of user?** — Did I run multiple fix/review cycles in conversation instead of using subagents offline?
9. **False attribution?** — Did I attribute something to Jörn or a source that didn't actually say it?
10. **Assumed Jörn read something?** — Did I act as if Jörn saw a question or information that he may not have read?

## Generalize from issues

For each friction point or mistake identified above: abstract the error class and check whether the same class of error exists elsewhere in the repo. This step is part of the postmortem, not deferred — once findings are written, the generalization may never happen.

## Output

Write findings to `docs/notes/postmortem-YYYY-MM-DD.md`.

Follow-up actions:
- Update CLAUDE.md or agent prompts directly for quick fixes
- Add TODO comments in relevant files for localized issues
- Add to TASKS.md for issues needing more context
- Update PROGRESS.md if session changed campaign readiness
- Check that any lore/NPC/encounter decisions made in conversation are written to campaign files
