---
name: incident
description: Record an agent behavior incident to feedback/ for the next context engineering pass. Use when Jörn flags something the agent did wrong mid-session.
---

Jörn flagged an incident — something the agent just did that needs to be recorded for the next context engineering pass over the repo.

## Steps

1. **Identify the incident.** If the user's message describes it, use that. If the referent is unclear from the current conversation, ask him. Do not guess when multiple incidents are plausible.

2. **Write the entry.** Append to the matching file in `feedback/` (one of: `rules.md`, `skills.md`, `agents.md`, `output-style.md` — pick by category). Use this format:

   ```
   ### YYYY-MM-DD — Short description

   What happened: the specific sequence of events.
   What should have happened: the correct behavior.

   **Pattern:** Abstract the error class. Name the pattern if it matches a prior entry.
   ```

   Check whether a prior entry in the same file describes the same error class. If so, reference it ("Same error class as YYYY-MM-DD 'title'").

3. **Avoid memory pollution.** Record repo-specific incidents in `feedback/`. Only propose a broader memory if the lesson would help most sessions across projects, not just this repo or this workflow.

4. **Done.** Don't narrate what you saved — Jörn can check the diff. Continue with whatever work was in progress before the incident.
