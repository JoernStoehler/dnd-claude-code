---
name: session-preparation
description: Workflow for preparing materials before a TTRPG session. Covers the 6-step process from reviewing recent session logs through writing the prep checklist, including content inventory (NPCs, locations, encounters), gap identification, and the prep file output format. Does not create the materials itself — it identifies what exists and what is missing, then fills gaps. Does not guarantee completeness — review output before the session.
---

# Session Preparation

Workflow for preparing materials for an upcoming session.

## Required Inputs

- Session goal or theme (what should happen?)
- Which NPCs might appear
- Any specific encounters needed

## Workflow

1. **Review context**: Read last 2-3 session logs to understand current state
2. **Check progress**: Read PROGRESS.md for planned plot points
3. **Inventory existing content**:
   - NPCs: Do they have sheets? Voice notes?
   - Locations: Described? Maps?
   - Encounters: Balanced? Prepared?
4. **Identify gaps**: What exists vs what needs creation
5. **Create/update content**: Fill gaps with new materials
6. **Write prep checklist**: Output to `sessions/YYYY-MM-DD-prep.md`

## Output Format

Create a prep file with:

```markdown
# Session Prep: [Date]

## Session Goal
[What should happen this session]

## Ready Materials
- [x] NPC: [name] - sheet complete
- [x] Location: [name] - described
- [x] Encounter: [name] - balanced

## Gaps to Fill
- [ ] NPC: [name] needs voice notes
- [ ] Map: [location] needs drawing

## Notes for GM
[Any warnings, reminders, or suggestions]
```

## Escalation Triggers

Stop and ask the human when:
- Session goal is unclear
- Major plot decision needed
- Content contradicts established canon
- Unsure about tone or balance
