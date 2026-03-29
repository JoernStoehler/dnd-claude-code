# CLAUDE.md

Campaign bible for **Dragons! Dragons!**, a fantasy TTRPG campaign using **Swords of the Serpentine** (SotS, GUMSHOE system) with the **high fantasy variant** rules. Agents act as co-GMs for planning, writing, and organization outside of game sessions.

## Campaign Premise

A mountain hub town struggles to maintain independence between a human/multicultural kingdom and a forest elf kingdom of magical fairy/monster races. Deep inside the mountain, an elder dragon lies imprisoned, indirectly affecting events above. The mountain also hides the ruins of a legendary dwarven kingdom. Dragons — fake, real, and legendary — are everywhere.

**System:** Swords of the Serpentine (SotS) with high fantasy variant rules

## Repository Layout

```
CLAUDE.md              # You are here
TASKS.md               # Task tracking with escalation markers

lore/                  # World-building (factions, locations, history, dragons)
characters/            # NPCs and PCs
sessions/              # Session logs, prep notes
encounters/            # Combat, puzzles, social challenges
assets/                # Images, maps, handouts
resources/sots/        # SotS rules references and design articles
packages/card-generator/  # Print card generation tool
scripts/               # Reusable scripts
```

## Rule System

SotS is a GUMSHOE game. Key differences from D&D:

- **Investigative abilities auto-succeed.** Right ability + right place = get the clue. No roll.
- **General abilities use d6 + pool spend.** Target 4. Players choose how many points to spend.
- **Health and Morale are parallel tracks.** Physical (Warfare) and social (Sway) combat.
- **Allegiances and Enemies** are mechanical faction relationships.
- **Corruption/Arcana/Divinity** replace spell slots, constrained by Spheres.

Rules reference: `resources/sots/` (see `INDEX.md`)

## Core Conventions

### Information States

Track "nailed down" (revealed to players) vs "mutable" (can still change). Once spoken at the table, it's canon. Unrevealed lore can be revised freely. Check `sessions/` to determine what's canon.

### Source of Truth

When content conflicts: session logs > character sheets > lore documents > unrevealed plans.

### Decision Authority

|  | Cheap to verify | Expensive to verify |
|---|---|---|
| **Easy rollback** | Act freely | Act, then Jörn verifies |
| **Hard rollback** | Discuss first | Discuss first |

Never without Jörn: changes to `.claude/` procedural files, destructive operations.

### Escalation Triggers

Stop and ask when: canon conflict, player agency affected, tone uncertainty, SotS rules edge cases, scope creep, blocked without information. A brief interruption beats a dead end.

### Writing Conventions

- Use precise, clear language. Write out implications — don't require deduction.
- "Present interesting information in a boring manner" — state facts plainly.
- Example: Don't hint that a character is selfish; write "Motivation: selfish egoist"

### File Naming

- Dates: `YYYY-MM-DD`, slugs: `lowercase-with-dashes`
- Be descriptive: `the-crimson-merchant.md` not `npc-042.md`

## Session Workflow

**scope → plan → implement → review**

1. **Scope** — Jörn describes the goal. Ask clarifying questions.
2. **Plan** — Propose approach. Jörn approves or adjusts.
3. **Implement** — Execute. Update TASKS.md as you complete items.
4. **Review** — Before presenting to Jörn.

| Action | Default |
|--------|---------|
| Content that affects canon | Discuss first |
| Formatting, cleanup, file organization | Act, mention after |
| New files, encounters, NPCs | Discuss scope, then act |
| Editing existing content | Act if minor, discuss if substantive |
| CLAUDE.md or .claude/ changes | Discuss first |
| TASKS.md updates | Act |