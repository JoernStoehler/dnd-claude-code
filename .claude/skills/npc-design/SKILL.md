---
name: npc-design
description: Design process and output format for TTRPG NPCs. Covers the full workflow from gathering campaign context through writing the NPC file, including design considerations (personality, motivation, appearance, voice, connections, secrets) and the standard NPC file template. Does not cover lore consistency checking — use lore-checker separately. Does not cover mechanical stat blocks beyond placeholder fields.
---

# NPC Design

Methodology for creating complete, usable NPCs that fit a campaign context.

## Process

1. **Gather context**:
   - Read the campaign's CLAUDE.md for setting/tone
   - Check existing NPCs for format consistency
   - If a location is specified, read the location file
   - Search for any mentioned factions, relationships, or constraints

2. **Design the NPC** considering:
   - Role in the world (occupation, social position)
   - Personality (2-3 distinct traits, avoid clichés)
   - Motivation (what do they want? what do they fear?)
   - Appearance (memorable but not cartoonish)
   - Voice (how do they speak? verbal tics? vocabulary?)
   - Connections (who do they know? who are they loyal to?)
   - Secrets (what are they hiding? what don't they know?)

3. **Write the NPC file** in the campaign's characters directory

## Output Format

Write to `characters/npcs/<name-slug>.md`:

```markdown
# [Full Name]

**Role**: [occupation/position]
**Location**: [where they're usually found]
**Faction**: [if applicable]

## Appearance

[2-3 sentences of physical description, focus on memorable details]

## Personality

[2-3 key traits with brief explanations]

## Motivation

**Wants**: [primary goal]
**Fears**: [primary fear]
**Secret**: [something hidden]

## Background

[1-2 paragraphs of relevant history]

## Roleplaying Notes

**Voice**: [how they speak]
**Mannerisms**: [physical habits, verbal tics]
**Attitude toward PCs**: [initial disposition]

## Connections

- [Relationship to other NPCs/factions]

## Game Information

**Stats**: [if using a system, note level/CR/key abilities]
**Combat**: [if relevant: tactics, resources]

## GM Notes

[Things only the GM should know - hidden motivations, future plot hooks]
```

## Design Guidelines

- Make NPCs feel like people, not quest dispensers
- Give them desires unrelated to the PCs
- Contradictions make characters interesting (brave but afraid of water)
- Physical descriptions should be actable (what would a player notice?)
- Avoid fantasy name generators; names should fit the setting's culture
