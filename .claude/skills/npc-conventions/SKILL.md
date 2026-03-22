---
name: npc-conventions
description: Conventions for writing NPC profiles. Covers the standard template and the high-performance variant for ensemble/companion NPCs. Does not cover NPC creation workflow (see npc-design skill) or mechanical stat blocks (see dnd-5e-rules).
---

# NPC Conventions

## Standard template

Use for NPCs with a defined role and limited screen time. Template at `campaigns/fun-heroes/characters/npcs/_template.md`.

```
## At a Glance
- **Appearance:** [physical, clothing, distinguishing features]
- **Demeanor:** [how they come across]
- **Voice/Speech:** [accent, vocabulary, cadence]

## Motivation
- **Want:** [what they're trying to achieve]
- **Fear:** [what they're trying to avoid]
- **Blind Spot:** [what they don't see about themselves]

## Personality
- **On the surface:** [first impression]
- **Underneath:** [what emerges over time]
- **Quirk:** [memorable behavior or habit]

## Relationships
[Who they know, how they feel about them]

## What They Know
[Information they can share with players]

## What They Want From Players
[What they'll ask for or try to get]

## Stats (If Needed)
[Only if combat is plausible]
```

## High-performance variant

Use for NPCs the GM will perform extensively: ensemble casts, companions, recurring antagonists, bards/performers. Add to the standard template:

```
## Performance Guide
- **Useful:** [what the GM should show — mechanical or narrative benefits]
- **Annoying:** [what the GM should play — the comedic or dramatic edge]
- **Voice:** [specific vocal quality + vocabulary patterns]
- **Sample Lines:**
  - "[Line showing their core personality]"
  - "[Line showing them under pressure]"
  - "[Line showing their relationship to another NPC]"
```

The Useful/Annoying split helps the GM balance: every NPC should be both useful enough to keep around and distinctive enough to remember.

## Ensemble conventions

When 3+ NPCs interact with each other:
- Create a relationship matrix table (Ally / Rival / Wildcard columns)
- Document running conflicts between NPCs
- Item/NPC reactions to shared situations should reference established personality traits

## Naming

- File: `lowercase-with-dashes.md` (e.g., `the-crimson-merchant.md`)
- Location: `campaigns/<name>/characters/npcs/`
- Be descriptive: names or titles, not codes
