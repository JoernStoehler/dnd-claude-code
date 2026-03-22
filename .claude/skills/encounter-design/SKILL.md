---
name: encounter-design
description: Design process and output format for TTRPG encounters (combat, puzzles, social challenges). Covers pre-design context gathering, encounter type workflows with required inputs and outputs, balance guidelines, and escalation triggers. Assumes provided party level is correct. Does not verify party composition or SotS mechanical correctness — verify stat blocks against sots-rules skill and resources/sots/.
---

# Encounter Design

Methodology for designing balanced and engaging encounters for SotS sessions.

## Before Designing

1. Read `CLAUDE.md` for campaign tone and guidelines
2. Check existing encounters in `encounters/` for format consistency
3. Review recent session logs if relevant to understand current party/situation

## Encounter Types

### Combat Encounters

Required inputs:
- Party level and size
- Desired difficulty (easy/medium/hard/deadly)
- Thematic constraints (undead, bandits, etc.)
- Environment (dungeon, forest, urban, etc.)

Output includes:
- Monster selection with CR justification
- Tactical notes (how enemies fight)
- Terrain features and hazards
- Loot appropriate to challenge

### Puzzles

Required inputs:
- Theme or context
- Difficulty (simple/moderate/complex)
- What solving it achieves

Output includes:
- Puzzle description (what players see)
- Solution
- Hints (3 levels: subtle, moderate, obvious)
- Failure consequences
- Alternative solutions to accept

### Social Challenges

Required inputs:
- Key NPC(s) involved
- What players want
- What NPC wants
- Stakes

Output includes:
- NPC motivations and secrets
- Skill check framework (not just "roll persuasion")
- Possible outcomes (success, partial, failure)
- Roleplaying hooks

## Balance Guidelines

Encounters should:
- Allow creative solutions
- Have consequences proportional to campaign tone
- Include opportunities for character moments
- Be resolvable in ~30-45 minutes table time

Adapt specifics (lethality, humor, drama) based on campaign CLAUDE.md guidance.

## Output Location

Write encounters to `encounters/[type]-[name].md`

## Escalation Triggers

Stop and ask when:
- Party composition unknown
- Encounter might be campaign-altering
- Unsure about mechanical balance
- Theme conflicts with established tone
