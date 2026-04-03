# CLAUDE.md

Campaign bible for a sword & sorcery TTRPG campaign using **Swords of the Serpentine** (SotS, GUMSHOE system) with **base rules** (not the high fantasy variant). Agents act as co-GMs for planning, writing, and organization outside of game sessions.

## Campaign Premise

**Setting:** Eversink (the default SotS city) as-is. Urban-focused — excursions outside the city are deliberate, only when both the travel and the destination matter. The undercity serves when "somewhere outside normal civilization" is needed.

**Genre:** Sword & sorcery. The plot escalates slowly. Most intrigue is human and Eversink in origin; deeper layers reveal how the wider world, the supernatural, and ideas move the human layer and are moved by humans. The heroes are unusually competent, in an unusually unique situation, and nobody else will do their work. There is no external compass for what's important, helpful, or morally good — the heroes figure that out themselves. Corruption is a cost worth paying sometimes.

**Tone:** The Church and the secret council focus on their own ventures and the struggle for bottlenecked resources (money, military power, blackmail material, reputation). Wide cracks exist between where the elite has built their structures, and many collect in those cracks what falls through.

**Play style:** Players combine clues, work through cleanup to reach other clues, and chain plans. Everything is connected. No plan survives contact with reality, but having no plan is worse.

**System:** Swords of the Serpentine (SotS) with base rules (four core professions, corruption-based sorcery). High fantasy variant elements are not currently in use.

## Repository Layout

```
CLAUDE.md              # You are here
TASKS.md               # Task tracking with escalation markers

sessions/              # Session logs, prep notes
library/sots/        # SotS rules references and design articles
scripts/               # Card generation (build-cards.py) and image tools (gen-image.py)
```

## Rule System

SotS is a GUMSHOE game. Key differences from D&D:

- **Investigative abilities auto-succeed.** Right ability + right place = get the clue. No roll.
- **General abilities use d6 + pool spend.** Target 4. Players choose how many points to spend.
- **Health and Morale are parallel tracks.** Physical (Warfare) and social (Sway) combat.
- **Allegiances and Enemies** are mechanical faction relationships.
- **Corruption** is the cost of sorcery, constrained by Spheres.

Rules reference: `library/sots/` (see `INDEX.md`)

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