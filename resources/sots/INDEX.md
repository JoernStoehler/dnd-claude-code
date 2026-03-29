# SotS Resources Index

Everything in `resources/sots/`. Agents: read this file first to find what you need.

## Rulebook

`rulebook.md` — Full rulebook transcription (18K lines, 406 pages). Gitignored; auto-decrypted from `rulebook.md.enc` on session start if `SOTS_KEY` is set. Page markers use `<!-- page NNN -->` format — grep for `page 080` to find page 80.

`swords-of-the-serpentine.pdf` — Source PDF (gitignored).

```bash
# Decrypt (runs automatically via session-start hook):
openssl enc -aes-256-cbc -d -salt -pbkdf2 -in rulebook.md.enc -out rulebook.md -pass "pass:$SOTS_KEY"

# Re-encrypt after editing:
openssl enc -aes-256-cbc -salt -pbkdf2 -in rulebook.md -out rulebook.md.enc -pass "pass:$SOTS_KEY"
```

### Book Structure

| Chapter | Pages | Content |
|---|---|---|
| Front matter & TOC | 001–021 | Title, contents, credits |
| Ch 1: The Basics | 022–026 | System overview, setting intro |
| Ch 2: Your Hero | 027–071 | Character creation, professions, abilities, allegiances |
| Ch 3: Rules | 072–120 | Core mechanics, tests, combat, chases, social combat |
| Ch 4: Sorcery & Corruption | 121–160 | Magic system, spheres, corruption, divinity, arcana |
| Ch 5: Wealth & Lifestyle | 161–166 | Economy, repute, treasure |
| Ch 6: Gear | 167–196 | Mundane and sorcerous items, poisons, alchemy |
| Ch 7: Adversaries | 197–242 | Building adversaries, stat blocks, monstrosities |
| Ch 8: Running the Game | 243–270 | GM advice, clues, mysteries, scenario design |
| Ch 9: The City of Eversink | 271–354 | Setting gazetteer (Eversink-specific) |
| Ch 10: The World | 355–390 | World beyond Eversink |
| Ch 11: Adventures | 391–405 | Sample adventure |

### Key Sections by Topic

**Core Mechanics**
- Tests & Difficulty — p080
- Difficulty Number Table — p080
- Full Contests — p083
- Chases — p084
- Refreshing General Ability Points — p087

**Combat**
- Combat overview — p088
- Damage and Defeat — p090
- Morale attacks (social combat in combat) — p095

**Character Creation**
- Professions (Sentinel, Sorcerer, Thief, Warrior) — p032
- Investigative Abilities list — p037
- Profession Investigative Abilities — p042
- Allegiances — p053
- General Abilities list — p056
- General Ability Descriptions — p057

**Sorcery & Corruption**
- Sorcery Quick Reference — p132
- Sorcerous Spheres list — p134
- How Corruption Works — p148
- Divinity (high fantasy) — p155
- Arcana (high fantasy) — p158

**Investigative Abilities (the GUMSHOE core)**
- How clues work — p073
- Core Leads — p074
- Allegiance Ranks — p077

**Adversaries & Monsters**
- Building Adversaries — p197
- Adversary Special Abilities list — p201
- Sample Human Adversaries — p208
- Monstrosities — p228

**GM Advice**
- Running the Game overview — p243
- Giving out Clues — p253
- Adventure Construction — p258

**Gear & Equipment**
- Mundane Gear — p167
- Sorcerous Items — p180
- Poisons — p121
- Traps — p122

**Wealth & Economy**
- Wealth and Lifestyle — p161
- Assigning Treasure — p166

**Eversink Setting** (mostly not relevant for Dragons! Dragons! campaign)
- City overview — p271
- Districts — p281–p320
- Government — p325
- The World beyond Eversink — p355

### Rulebook Notes

- Cross-references in the text say "p. XX" (literally) — unresolved links from the PDF.
- Page numbers are the PDF's page numbers, not physical book pages.
- Sidebars use `[sidebar: Type]` / `[/sidebar]` markers.
- Tables are in markdown format where conversion was possible.

## Rules Documents

- `rules-high-fantasy-guide.md` — High fantasy variant rules (**the variant we use**)
- `rules-how-to-read-the-rules.md` — Reading order guide for the SotS book
- `rules-gumshoe-srd.txt` — GUMSHOE SRD (OGL)
- `rules-gumshoe-101.txt` — Player/GM onboarding doc

## Articles (Pelgrane & Alexandrian blog posts)

All `article-*` files are blog posts by the game's authors, saved locally.

**Rules & Mechanics**
- `article-sorcery-and-corruption.md` — Sorcery/Corruption mechanics deep dive
- `article-social-combat.md` — Social combat (Morale, Sway, Maneuvers)
- `article-allegiances-and-politics.md` — Allegiances, Enemies, faction politics
- `article-one-hero-play.md` — Solo play rules adjustments

**GM Advice & Scenario Design**
- `article-giving-out-clues.md` — Clue delivery techniques in GUMSHOE
- `article-three-clue-rule.md` — The Three Clue Rule (Alexandrian)
- `article-dont-prep-plots.md` — Don't Prep Plots, Prep Situations (Alexandrian)
- `article-dont-prep-plots-timelines.md` — Don't Prep Plots: timelines
- `article-dont-prep-plots-tools.md` — Don't Prep Plots: tools
- `article-conspyramid.md` — The Conspyramid campaign structure (Alexandrian)
- `article-node-based-scenario-design.md` — Node-Based Scenario Design series index
- `article-node-based-part-2.md` — Node-Based Scenario Design, part 2
- `article-node-based-part-3.md` — Node-Based Scenario Design, part 3
- `article-node-based-part-4.md` — Node-Based Scenario Design, part 4
- `article-node-based-part-5.md` — Node-Based Scenario Design, part 5

**Adventures & Plot Hooks**
- `article-adventure-dripping-throne.md` — Ghost merchant mystery (1–2 sessions)
- `article-adventure-sin-drinker.md` — Vigilante penanggalan hunt (1–2 sessions)
- `article-plot-hooks-factions-1.md` — 6 faction NPC plot hooks
- `article-plot-hooks-factions-2.md` — 6 more faction NPC plot hooks

**Characters & Creatures**
- `article-pregens-1.md` — Pre-generated characters, set 1
- `article-pregens-2.md` — Pre-generated characters, set 2
- `article-arakene-non-human-heroes.md` — Arakene spider-race playtest rules
- `article-bestiary-ghouls.md` — Ghoul stat blocks

**Setting**
- `article-eversink-introduction.md` — Eversink setting overview
- `article-small-town-setting.md` — Non-Eversink setting: Joining (forest town)
- `article-bookhounds-of-eversink.md` — Book-hunting campaign frameworks

## Other

- `community-resources.md` — Community content index (cheat sheets, actual plays, VTT modules, etc.)

## Online Tools (by Matthew Breen)

All at https://monstar.co.nz/matt/sotstools/

- **Hero Generator**: https://monstar.co.nz/matt/sotsgen/
- **Adversary Builder**: https://monstar.co.nz/matt/sotsgen/adversary
- **Triskadane Deck**: https://monstar.co.nz/matt/sotsgen/triskadane
- **Name Generators**: https://monstar.co.nz/matt/sotsgen/guilds
- **Plot Hook Generator**: https://monstar.co.nz/matt/sotsgen/hooks

## Not Yet Acquired

- [ ] **Night's Black Agents** (Pelgrane, paid) — full Conspyramid chapter
