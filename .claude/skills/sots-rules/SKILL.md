---
description: "Swords of the Serpentine (GUMSHOE) rules reference for the Dragons! Dragons! campaign. Covers core mechanics, high fantasy variant, stat block templates, and clue design. Load when creating NPCs, adversaries, encounters, or scenes that need SotS mechanics."
---

# Swords of the Serpentine Rules Reference

This skill provides guidance on SotS/GUMSHOE mechanics for campaign content creation. This campaign uses the **high fantasy variant** rules.

## Quick Reference

### Core Mechanic: GUMSHOE

- **Investigative abilities** auto-succeed. Having 1+ ranks = expert. No roll to find clues. Spending pool points gets bonus benefits (extra info, NPC favors, etc.), not the clue itself.
- **General abilities** use d6 + optional pool spend vs target number (usually 4). Pools deplete during an adventure and refresh between adventures.
- One die: d6. That's it.

### The Two Tracks

| Track | Attack Ability | Defense Pool | What Defeat Means |
|-------|---------------|-------------|-------------------|
| Physical | Warfare | Health | Injured → unconscious → dead |
| Social | Sway | Morale | Shaken → panicking → broken |

Both tracks work mechanically the same way. Social combat is a first-class system, not a bolted-on subsystem.

### High Fantasy Variant Changes

These modifications are **active for this campaign** (from the official high fantasy guide):

- **Arcana** replaces Thaumaturgy — wizards access all spheres without Corruption risk, but less potent
- **Divinity** is a new investigative ability — clerics get miracles powered by deity spheres, costs Health/Morale instead of Corruption
- **Sorcery (General) is removed** — use Warfare (Health damage) and Sway (Morale damage) described through Arcana/Divinity spheres
- **Danger Sense** renamed from Felonious Intent
- **Spirit Sight** gains sphere-per-rank: Arcane, Dimensions, Divine, Spirits
- **Bind Wounds** auto-heals self; 8+ talent = "Quick, Drink This!" (heal one person/round free)
- **Unconsciousness tests eliminated** when HP/Morale drops below 0
- **Refresh tokens** increased: 1/Mook, 2/Hero for named foes, 3 for major antagonists, 4 for memorable villains
- **Three Best Things in Life** allows rerolling one die (not +1)
- **Professions** mapped to fantasy archetypes: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Thief, Wizard

### Starting Characters (High Fantasy Fledgling Tier)

- 8 Investigative ability ranks
- 25 General ability ranks
- 15 points split between Health and Morale
- 2 Allegiance ranks (faction connections)
- 1 Enemy rank (GM spends these against you)

### Allegiances and Enemies

Allegiances are investigative abilities tied to factions. They provide:
- Clues about faction activities
- Pool spends for faction favors
- Cross-cutting knowledge within faction domain

Enemies work in reverse — the GM spends Enemy pool points to complicate the adventure.

GMs should define 8-12 factions for the campaign.

### Sorcery and Corruption (Base System)

For NPCs and adversaries who use raw sorcery (not the high fantasy Arcana/Divinity):

- **Corruption** (Investigative): Measures magical potential. Higher = more powerful reality-altering effects. Refreshes only at adventure end.
- **Spheres**: Thematic constraints on magic (e.g., Rats and Smoke). All effects must be described through chosen spheres.
- **Corruption cost**: Powerful effects pollute surroundings (environmental) or the caster's body (personal, physical changes).
- **Witchery**: Magic without Corruption — limited to Alchemy, Poison, Disease, Mesmerism spheres.

### Clue Design (Three Clue Rule)

For every conclusion the PCs need to reach, include at least three clues:
- Each clue should be findable via a different investigative ability
- At least one clue should be "immediately apparent" (no action required)
- Clues point to nodes in the conspyramid

### Social Combat Detail

- **Sway** attacks target Morale Threshold
- After hitting, spend Investigative ability points for bonus Morale damage (e.g., Taunt makes them furious)
- **Maneuvers** let you manipulate without full combat — target rolls d6 to resist, can spend own Morale to boost resistance
- **Teamwork** lets players assign Sway damage to allies' attacks

## When to Verify Against Source

**Always verify against `resources/sots/`:**
- Exact ability descriptions and sphere effects
- Adversary stat block format
- Wealth and lifestyle mechanics
- Advanced sorcery rules
- Specific high fantasy variant details

**Usually fine from this skill + training data:**
- General GUMSHOE flow (investigate → act on clues)
- Combat basics (Warfare/Sway vs Health/Morale)
- Allegiance mechanics (broad strokes)
- Clue design principles

## SotS Stat Block Templates

### NPC (Quick)

```
**Name** — Role/Profession
Faction: [allegiance]
Investigative ability offered as contact: [ability]
Personality: [2-3 adjectives]
Goal: [1 sentence]
```

### Adversary

```
**Name** — Threat Level (Mook / Named / Major / Memorable)
Health [X], Morale [X]
Threshold: Health [X], Morale [X]
Warfare [X] (damage dice), Sway [X] (damage dice)
Alertness Modifier: +/- [X]
Special Abilities: [list]
Investigative ability to learn about it: [ability]
Refresh tokens: [per threat level]
```

### Scene

```
## Scene: [Name]
Location: [where]
NPCs present: [who]
Core clues (must be found):
  1. [clue] — via [investigative ability] — points to [node]
  2. [clue] — via [investigative ability] — points to [node]
  3. [clue] — via [investigative ability] — points to [node]
Bonus clues (spend for extra info):
  - [clue] — spend [ability] point — reveals [info]
Potential combat: [if applicable, adversary stats]
Potential social conflict: [if applicable, NPC Morale/goals]
```

## Reference Files

All in `resources/sots/`:
- `rules-high-fantasy-guide.md` — The variant rules we use
- `rules-gumshoe-srd.txt` — Base GUMSHOE mechanical skeleton
- `rules-gumshoe-101.txt` — Player/GM onboarding
- `article-*.md` — Blog articles by the game's authors
- `INDEX.md` — Full index
