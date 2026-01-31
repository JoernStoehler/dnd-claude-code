# Project Status

## Current Status

**Phase:** Initial Setup
**Last Updated:** 2026-01-24

Repository structure and meta-tooling established. Card generator prototype complete.

## Backlog

### High Priority

- [x] Create first campaign directory with full structure
- [x] Write initial campaign concept/pitch
- [x] Establish template files (session log, NPC, location, encounter)

### Medium Priority

- [ ] Build `session-prep` skill (workflow for preparing sessions)
- [ ] Build `post-session` skill (workflow for after-session tasks)
- [ ] Download SRD markdown files to `references/` for agent access
- [x] Test AI image generation workflow → using Flux via fal.ai
- [x] Create NPC card template for physical handouts → `packages/card-generator/`

### Low Priority / Future

- [ ] Scripts for bulk operations (e.g., index generation)
- [ ] Integration with external tools (calendars, VTT exports)
- [ ] Style guide for consistent prose voice (if needed)

## Completed Work

### 2026-01-23: Repository Setup

- Created directory structure (`scripts/`, `packages/`, `campaigns/`, `.claude/`)
- Wrote `CLAUDE.md` with comprehensive agent onboarding
- Wrote `README.md` for human visitors
- Established core conventions:
  - Precision and explicitness in documentation
  - Information state tracking (nailed-down vs mutable)
  - Repository hygiene practices
- Documented agent capabilities and limitations
- Created `PROJECT.md` (this file) for tracking

### 2026-01-23: Skills and Agents Foundation

- Created meta-skills:
  - `/create-skill` - how to create new skills (with official docs links)
  - `/create-agent` - how to create new agents (with official docs links)
- Created starter agents:
  - `lore-checker` - verify consistency across campaign materials
  - `create-npc` - generate NPCs with personality, motivation, stats
- Documented when to use skills vs template files vs agents
- Refined approach: templates for standard formats, skills for workflows, agents for context-heavy tasks

### 2026-01-24: Card Generator Package

- Created `packages/card-generator/` for player-facing cards (NPCs, locations, items)
- Scripts: `generate-portrait.js` (Flux via fal.ai), `render-card-sharp.js` (no browser deps)
- 5 layout styles: dark, parchment, minimal, compact, framed
- Cards are player-facing only (appearance, demeanor, context - no secrets)
- Flux standard sizes for portraits (portrait_4_3 = 768x1024 recommended)
- Example cards in `campaigns/example/cards/`
- Added env var setup to root README.md

### 2026-01-31: Card Generator Layout Improvements

- Replaced character-count heuristics with actual text measurement (opentype.js)
- Added 40px print-safe margins on all sides
- Fixed title sizing to never overlap header icons
- Fixed footer/icon vertical alignment
- Extracted layout constants (W, H, B, HEADER_CONTENT_H, etc.)
- Current default: `18-tex-corner-icons` (texture background, rounded portrait, footer icons)
- VARIANTS.md now shows current settings vs alternatives

#### Tech Debt (future cleanup)
- [ ] Factory pattern for 30+ repetitive variant definitions
- [ ] Break up 210-line `textureOverlaySvg()` into smaller functions
- [ ] Extract remaining magic numbers (padding values: 20, 24, 44, etc.)
- [ ] Align line heights (36 vs 32 between functions)
- [ ] Clean up or deprecate legacy gradient variants (00-08)

### 2026-01-24: Fun Heroes Campaign - Full Development Session

**Campaign Foundation:**
- Created `campaigns/fun-heroes/` - first real campaign for one-shot meetups
- Campaign focus: chaotic comedy with heart, "Fun Heroes" philosophy
- World concept: "The Middling Realms" - a world that's basically fine

**Locations (Greendale Reach sandbox):**
- Millhaven (market town hub) - Adventurer's Guild, Grinding Gear tavern
- Brackenvale (village between forest and mountains)
- Greendale Reach region overview with ASCII map
- Weathervane Manor (wizard's estate, 20-year mystery, Wandering Door)

**Weathervane Manor Deep Design:**
- Erasmus Weathervane vanished 20 years ago (mystery unsolved)
- Multiple owners since, each left marks (Lady Ashworth's portraits, etc.)
- The Wandering Door (speak room name → connects to that room)
- The Locked Room (unopened since Erasmus vanished)
- Hooks work in any order, ownership always in flux

**One-Shot Hooks (6 developed):**
- Missing Tax Collector, Wrongly Accused (standalone)
- Sentient Cargo (most detailed - full route with NPCs)
- Estate Sale, Inheritance (hot-potato), Heist (Weathervane arc)

**Sentient Cargo (flagship hook):**
- Five bickering items: Bastion (cowardly shield), Clarity (catty mirror), Tomes (pedantic book), Pip (cheerful lantern), Meridian (anxious compass)
- Full route Millhaven→Brackenvale with encounters per segment
- NPCs along route: Sir Aldric (paladin), Sister Merrith (pilgrim), Borras (merchant), Haverstons (farm family)
- Potential buyers for offloading items mid-journey

**Core NPCs:**
- Marta Greaves (innkeeper), Clerk Fenwick (guild), Elder Cornelius Marsh
- Route NPCs with item-specific reactions

**Progress Tracking:**
- Created `PROGRESS.md` with conservative % estimates
- Tracks: locations, hooks, NPCs, items, maps, manor design, document format quality
- Overall: ~45% ready (accounting for missing maps and format polish)

### 2026-01-23: D&D Resources and GM Reference Materials

- Created `resources/` directory with curated external resources:
  - `tools-and-generators.md` - Index of online tools (VTTs, map makers, NPC generators, etc.)
  - `gm-checklists.md` - Session Zero, session prep, post-session, and campaign health checklists
  - `game-enhancement-ideas.md` - Brainstormed ideas for props, AI art, audio, battlemaps
  - `ambience-and-audio.md` - Curated audio sources and implementation guidance
- Created D&D 5e rules skill (`.claude/skills/dnd-5e-rules/`):
  - Documents SRD sources (5.1 and 5.2) with links to markdown repositories
  - Guidance on when to look up rules vs trust training data
  - Philosophy for "right enough" rules in content creation
- Researched and documented:
  - Paper miniatures (Printable Heroes, MonsterForge)
  - NPC/item cards and handout tools
  - Virtual tabletop comparison (Roll20 vs Foundry vs Owlbear Rodeo)
  - AI image generation approaches for portraits
  - Safety tools (X-Card, Lines & Veils)

## Notes

### Design Decisions

**Why session logs are canonical:** Once information is revealed to players, it cannot be changed without breaking trust. Session logs track what's "nailed down" so agents don't accidentally contradict established facts.

**Why explicit over implicit:** Agents start each session with no project knowledge beyond what's in files. Implicit information gets lost. If a character trait matters, state it directly.

**Why aggressive deletion:** Outdated documentation causes agent mistakes. Better to have less documentation that's accurate than more documentation that misleads.

**Skills vs Templates vs Agents:**
- **Skills**: Procedural knowledge, workflows that evolve, progressive disclosure needed
- **Templates**: Standard formats in known locations, agents find by filename
- **Agents**: Tasks requiring multi-file context gathering and judgment calls

### Open Questions

- How detailed should session logs be?
- Physical vs digital play setup? (Affects which enhancements to pursue)
- Should we download SRD locally or just link to online sources?

### Resolved Questions

- **Campaign system:** D&D 5e (rules-light approach, focus on improvisation over mechanical precision)
- **AI image generation:** Flux via fal.ai (good quality, API access, standard sizes)
