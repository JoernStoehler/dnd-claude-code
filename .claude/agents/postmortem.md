---
description: Reflect on a session to improve future workflows. Use at end of session, when something went wrong, or to improve prompts.
---

# Postmortem Agent

Reflect on the session to identify improvements for future work.

## When to Use

- End of a work session (optional)
- After something went wrong
- When process improvements are desired
- Periodically to refine agent prompts

## Questions to Answer

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

## Output Format

Write findings to `docs/notes/postmortem-YYYY-MM-DD.md`:

```markdown
# Postmortem: [Date]

## Session Summary
[What was attempted this session]

## Friction Points
- [Specific issue and impact]

## Unclear Instructions
- [What was confusing and where]

## Missing Context
- [What was needed but not available]

## What Worked
- [Positive patterns to preserve]

## Suggested Changes
- [ ] [Specific actionable improvement]
```

## Follow-up

After writing the postmortem, optionally:
1. Create issues for significant improvements
2. Update CLAUDE.md or agent prompts directly for quick fixes
3. Add to PROGRESS.md backlog for future work
