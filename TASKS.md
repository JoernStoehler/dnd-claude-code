# TASKS

Task list for campaign development.

## How to use this file

- **Format:** Each task has an escalation marker and a short description. Group under section headers.
- **Maintenance:** Update immediately when completing or discovering tasks. Context not written here is context lost.
- **Status dates:** Include a date when updating status (e.g. "Done (2026-03-28)").
- **Completed tasks:** Move to the `## Done` section with a one-line summary.
- **Escalation:** :red_circle: Jörn decides · :yellow_circle: Agent does, Jörn reviews · :green_circle: Agent autonomous

**Last updated:** 2026-03-30

## Current

### Tuesday one-shot (2026-03-31, 19:00-22:00)

All materials in `sessions/2026-03-31-oneshot/`.

**Done:**
- [x] GM scenario document — node map, toolkits, stat blocks, clues, timeline
- [x] 5 character templates (Warrior, Thief, Sentinel, Sorcerer, Sellsword)
- [x] Player rules reference (front+back A4)
- [x] Sorcery cheat sheet
- [x] 4 pregen fallback characters (Warrior, Thief, Sellsword, Sorcerer)
- [x] Source citations on rules-facing documents
- [x] Verification: rules accuracy (3 agents), adventure design, player clarity, completeness vs Ch.3 TOC

**Still TODO before Tuesday:**
- :green_circle: Jörn reads through all materials, flags anything that feels off
- :yellow_circle: Format for print — currently markdown; need A4-friendly layout (BW, possible color accents). Options: pandoc to PDF, manual formatting, or just print the markdown. Discuss approach.
- :yellow_circle: Scenario document currently has no citations — only the player-facing docs do. Add citations to stat blocks if Jörn wants the same verification standard on GM materials.
- :green_circle: Bring supplies: d6 dice (many — players won't have their own), pencils, scrap paper, tokens/coins for Refresh bowl
- :red_circle: Decide: read the sample adventure "Corpse Astray" (Ch. 11, p. 391-405) before Tuesday? It's the only published full adventure — might give you a feel for pacing and clue delivery that reading rules alone doesn't. ~15 pages.
- :red_circle: Decide: skim the Eversink setting chapters (Ch. 9, key sections) for flavor you can improvise at the table? The scenario uses Eversink names and locations. You don't need deep knowledge, but having a mental image of "canal city, sinking, bells, statues everywhere, goddess of commerce" helps narration.
- :red_circle: Decide: practice run? Walk through Scene 0 + START + one node mentally, playing both sides. Test whether the clue tables are usable at the table or need to be reformatted as a quicker-reference format (e.g. index cards per scene).
- :yellow_circle: Possible: generate NPC portraits or a simple map of Harbor Approach using card-generator / fal.ai. Nice to have, not needed.

### Campaign setup

- :red_circle: Define campaign tone and philosophy (need Jörn input)
- :red_circle: Design faction details (human kingdom, elf kingdom, hub town politics)
- :red_circle: Design mountain dungeon layer concept
- :red_circle: Design elder dragon BBEG
- :yellow_circle: Define SotS stat block templates (NPC, adversary, scene) as structured markdown
- :yellow_circle: Specialize card generator with SotS template fields

## Deferred

- Player onboarding materials (need players first)
- Session prep workflows — need content first
- Mid-session generation workflows — need indexed rulebook (now available)
- Post-session processing workflows — need sessions first
- Between-session world evolution — need sessions first
- Playtest/simulation workflows — need content first

## Done

- :white_check_mark: Downloaded GUMSHOE SRD, GUMSHOE 101, High Fantasy Guide, reading order guide
- :white_check_mark: Downloaded 25 blog articles (Pelgrane + Alexandrian)
- :white_check_mark: Catalogued online tools (hero generator, adversary builder, name generators)
- :white_check_mark: Removed fun-heroes and example campaigns (preserved in git history)
- :white_check_mark: Restructured repo as single-campaign layout
- :white_check_mark: Transcribed SotS PDF → encrypted rulebook.md (18,526 lines, 406 pages)
- :white_check_mark: Built auto-decrypt pipeline (session-start hook)
- :white_check_mark: Reorganized resources/sots/ — flat structure, type-prefixed filenames, single INDEX.md
- :white_check_mark: Deleted legacy meta-* skills, unused campaign skills/agents
- :white_check_mark: Removed conspyramid (overkill for this campaign) (2026-03-29)
- :white_check_mark: Repo audit: removed dead code (file-index.py, ccweb.md, docs/), fixed card-generator deps, fixed session-start.sh gh install path (2026-03-29)
- :white_check_mark: One-shot materials: scenario, templates, rules refs, pregens, citations, verification (2026-03-30)
