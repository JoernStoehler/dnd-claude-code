---
name: post-mortem
description: End-of-session reflection workflow. Run at Jörn's request or after a session with significant friction, mistakes, or wasted time. Produces actionable findings — not just observations.
user-invocable: true
---

Reflect on the current session. This runs in main context (not as a subagent) because it needs access to the session's conversation history.

## Shared core — answer for every session

Be concrete and specific. Vague feedback is not useful.

### 1. Friction
What slowed you down?

Bad: "The codebase was confusing"
Good: "Couldn't find which session has the working weasyprint patterns — sessions/ is described as 'session logs' not 'reusable code'"

### 2. Unclear Instructions
What was confusing in CLAUDE.md, skills, or agent prompts?

### 3. Missing Context
What information wasn't provided but was needed?

### 4. Jörn's Time
Where did Jörn spend time this session? What work did Jörn do, and was it used afterward? Purpose: detect work Jörn does that agents could also do, or that needn't be done at all.

### 5. What Worked Well
What should be preserved or expanded?

### 6. Suggested Changes
Specific, actionable improvements.

Bad: "Make things clearer"
Good: "Add a note in the repo layout that sessions/ contains reusable weasyprint patterns"

## Process checks — report only items that apply

1. **Fabrications slipped through?** — Did fabricated claims or unverified facts reach Jörn?
2. **Iterated in front of user?** — Did I run multiple fix/review cycles in conversation instead of delegating to subagents or fixing silently?
3. **Assumed Jörn read something?** — Did I act as if Jörn saw a question or information that he may not have read?
4. **Delegated with context loss?** — Did I delegate implementation to a subagent that lacked design context from the conversation?
5. **Repeated failed approach?** — Did I try the same category of fix more than twice without changing strategy?
6. **Buried a blocker?** — Did I note an external dependency (container rebuild, env var, host command) in a document instead of flagging it to Jörn immediately?

## Where to check for timing data

The session log at `~/.claude/projects/-workspaces-dnd-claude-code/<session-id>.jsonl` has timestamps for every tool call. Use it to verify where time went — don't guess.

## Output

Persist actionable findings:

- **Behavioral lesson or friction** → append to matching file in `feedback/` (create if needed)
- **New convention or workflow change** → discuss with Jörn, then update CLAUDE.md or relevant skill
- **Nothing actionable** → don't persist

Write the postmortem to `sessions/<date>-postmortem.md`. Commit it.
