# SotS Community Resources

Compiled 2026-03-22 via web search. See `tools-and-references.md` for locally-saved articles and tools index.

---

## Quick Reference & Cheat Sheets

### SotS-Specific

| Resource | URL | Description | Free? | Relevance |
|----------|-----|-------------|-------|-----------|
| How to Read the Rules (Quick-Start Guide) | https://pelgranepress.com/2021/12/06/how-to-read-the-rules-a-quick-start-guide-for-swords-of-the-serpentine/ | Kevin Kulp's chapter-by-chapter reading order guide for the SotS rulebook. Short roadmap, not a standalone reference. | Free | High |
| SotS Book Appendices (Quick Reference) | (In the rulebook, final ~9 pages) | Seven pages of quick reference tables covering Investigative Abilities, General Abilities, Health, Morale, Difficulty Numbers, Damage Calculation, Spending Corruption. The appendices alone give you the mechanical skeleton. | Requires book | High |
| Google Sheets Character Keeper | https://docs.google.com/spreadsheets/d/1Z-UJbCFExXa_zUqKxmbQYb5pu_Nf1zYGAIZIcaJfXdw/ | Customizable interactive character sheet with all ability descriptions (updated March 2025 by Kevin Kulp). | Free | High |

### GUMSHOE System (Applicable to SotS)

| Resource | URL | Description | Free? | Relevance |
|----------|-----|-------------|-------|-----------|
| GUMSHOE Cheat Sheets (Ulf Andersson) | https://pelgranepress.com/2012/03/15/gumshoe-cheat-sheets/ | Refresh cheat sheets for all GUMSHOE games. Covers ability refresh rules. PDF download. | Free | Medium |
| How to Play GUMSHOE (Kevin Kulp) | https://pelgranepress.com/2013/04/26/how-to-play-gumshoe-a-handy-cheat-sheet-for-new-players/ | Player-facing cheat sheet explaining core GUMSHOE mechanics: d6 + spend vs. target 4, investigative auto-success, pool management. Derived from TimeWatch intro. | Free | High |
| Trail of Cthulhu System Cheat Sheet (Alexandrian) | https://thealexandrian.net/wordpress/35587/roleplaying-games/trail-of-cthulhu-cheat-sheet | Detailed GUMSHOE reference for Trail of Cthulhu. Not SotS-specific but the core GUMSHOE mechanics are shared. | Free | Low |
| GUMSHOE SRD (OGL) | https://ogc.rpglibrary.org/images/b/b3/GUMSHOE_SRD_OGL.pdf | Full GUMSHOE system reference document. Mechanical skeleton without setting. | Free | Medium |

---

## Actual Play & Session Reports

| Resource | URL | Description | Free? | Relevance |
|----------|-----|-------------|-------|-----------|
| Thoughts After Ten Sessions (Aardvarchaeology) | https://aardvarchaeology.wordpress.com/2022/02/21/thoughts-after-ten-sessions-of-swords-of-the-serpentine/ | Blog post reflecting on 10 sessions of SotS. Key takeaways: improvised campaign worked well using setting material; combat rules went largely unused; character-driven arcs emerged from Allegiances/Enemies; prep time was low. Recommends Lazy Dungeon Master approach. Honest about playing "very free-form." | Free | High |
| Actual Play Podcast with Kevin Kulp | https://morrus.podbean.com/e/special-episode-actual-play-of-swords-of-the-serpentine-with-kevin-kulp/ | Morrus' Unofficial Tabletop RPG Talk. Kevin Kulp GMs a demo session. Rules intro ends and adventure starts at 25:20. Best resource for hearing the designer run the game. | Free | High |
| EN World Podcast: SotS Actual Play | https://www.enworld.org/threads/podcast-special-episode-swords-of-the-serpentine-actual-play-with-kevin-kulp.666744/ | Same actual play session, EN World thread with discussion. | Free | Medium |
| "Swords of the Bosphorous" Session Report | https://its-them.me.uk/salienthurcheon/1386-2/ | First impressions from a con game using SotS rules in a Byzantine 1450 setting (Martin Cookson's "Swords of the Bosphorous"). Shows system flexibility for non-Eversink settings. | Free | Medium |
| RPG Pub Discussion Thread | https://www.rpgpub.com/threads/swords-of-the-serpentine.4972/ | Forum thread with player/GM experiences and discussion of the game. | Free | Low |
| Let's Read! SotS (RPGGeek) | https://rpggeek.com/thread/2926766/lets-read-swords-of-the-serpentine/ | Multi-page chapter-by-chapter readthrough. At least 8 pages of posts. Useful for understanding how the book is structured without reading it cover-to-cover. | Free | Medium |

---

## VTT & Digital Tools

| Resource | URL | Description | Free? | Relevance |
|----------|-----|-------------|-------|-----------|
| Foundry VTT: GUMSHOE System | https://pelgranepress.com/2023/06/02/official-gumshoe-system-on-foundryvtt/ | Official GUMSHOE system for Foundry VTT, community-built and now officially partnered with Pelgrane Press. Renamed from "INVESTIGATOR" to "GUMSHOE." Includes full ability compendiums. Supports SotS along with other GUMSHOE games. Requires Foundry VTT license. | System free (Foundry paid) | High |
| Roll20: SotS Character Sheet | https://app.roll20.net/forum/post/9068509/swords-of-the-serpentine-now-supported-on-roll20 | Community-created character sheet for Roll20. Source code at https://github.com/Roll20/roll20-character-sheets/tree/master/SotS | Free | Medium |
| StartPlaying.games: SotS Games | https://startplaying.games/game/swords-of-the-serpentine | Platform for finding paid GMs running SotS online. Not a tool, but useful for seeing how others structure sessions. | Paid (per session) | Low |

### Matt Breen's SotS Tools (monstar.co.nz)

All free, all at https://monstar.co.nz/matt/sotstools/ (already indexed in `tools-and-references.md`).

- **Hero Generator** — Build/randomize characters, export to PDF
- **Adversary Builder** — Stat block generator for foes
- **Triskadane Deck** — Populate the secret ruling council
- **Name Generators** — People, guilds, societies
- **Plot Hook Generator** — Faction-weighted adventure seeds
- **The Due Monete** — Eversink cultural art form tool

#### Adversary Builder Data Structure

The adversary builder tracks these fields (useful if we want to replicate or integrate):

**Defense:** Health Threshold (0-10), Shield (boolean), Armor (0-10), Health per Hero (1-60), Morale Threshold (nil/0-10), Grit (0-10), Morale per Hero (nil/1-60)

**Offense - Warfare:** Suppress (boolean), Attack Modifier (-1 to +10), Fixed Damage (N/A or 1-10), Restrain/Daze Maneuvers (boolean), Damage Modifier (-2 to +10)

**Offense - Sorcery:** Suppress (boolean), Attack Modifier (-1 to +10), Fixed Damage (N/A or 1-10), Damage Modifier (-2 to +10)

**Offense - Sway:** Suppress (boolean), Attack Modifier (-1 to +10), Static Damage (N/A or 1-10), Persuade Maneuver (boolean), Damage Modifier (-2 to +10), Malus (0-60)

**Special Abilities:** Eight slots, each with cost (No Cost, Cost 1-8, or "Cost varies")

**Misc:** Alertness Modifier (-3 to +5), Stealth Modifier (-3 to +5), Refresh Tokens (0, 1, 3, 5, 7, 10)

**Metadata:** Name, Adjectives, Description, Variants

#### Hero Generator Data Structure

The hero generator was partially opaque to scraping. Observable fields:
- Investigative Points, General Points, Health/Morale Points, Minimum Health/Morale, Ally Points, Enemy Points
- Party size selector: 2, 3, 4, 5+ heroes
- Actions: Build, Generate Party, PDF export

The underlying JavaScript data (ability lists, stat ranges, calculation formulas) was not exposed in the page HTML. Replicating the hero generator would require reverse-engineering the JS or building from the rulebook's character creation chapter.

---

## Reviews (Mechanical Insight)

| Resource | URL | Key Insight | Free? | Relevance |
|----------|-----|-------------|-------|-----------|
| Gnome Stew Review | https://gnomestew.com/swords-of-the-serpentine-review/ | Covers investigative auto-clues, Health/Morale dual tracks, Preparedness mechanic, social+physical combat integration. Notes safety tool coverage is weak. Moderate mechanical depth. | Free | High |
| EN World Review | https://www.enworld.org/threads/a-review-of-swords-of-the-serpentine.689697/ | Highlights "What is best in life?" character drive, simultaneous social+physical combat, sorcery corruption (internal=mutations, external=authority attention). Suggests experienced GMs can drop the loose class restrictions. | Free | High |
| Seed of Worlds Review | https://seedofworlds.blogspot.com/2023/06/review-swords-of-serpentine.html | Covers investigative spend-for-damage mechanic, mook/heavy-hitter adversary design, intro adventure "A Corpse Astray." Recommends starting with appendices. | Free | High |
| RPGnet Review | https://www.rpg.net/reviews/archive/19/19089.phtml | Detailed review on RPGnet. | Free | Medium |
| Split/Party Analysis (Multi-part) | https://splitparty.substack.com/p/swords-of-the-serpentine-part-1 | Critical design analysis. Part 1 covers Allegiances-as-positioning, city-as-information-system, corruption/authority feedback loop. More analytical than practical. Multi-part series. | Free | Medium |
| Zoar Game Geek Review | https://zoargamegeek.com/gumshoes-swords-of-the-serpentine/ | General overview review. | Free | Low |
| Teletype Review | https://teletype.in/@lockedroomgaming/sword-of-the-serpentine-review | Review from a locked room gaming perspective. | Free | Low |
| 21st Century Philosopher Review | https://morganhua.blogspot.com/2020/05/swords-of-serpentine-review.html | Early review (2020, pre-release/playtest era). | Free | Low |

---

## Published Adventures & Scenarios

| Resource | URL | Description | Free? | Relevance |
|----------|-----|-------------|-------|-----------|
| Losing Face (Free RPG Day 2023) | https://www.drivethrurpg.com/en/product/408716/Swords-of-the-Serpentine (linked from product page) | 37-page scenario by Kevin Kulp. Includes quick-start rules and pre-generated characters. Core adventure is ~14 pages. Investigate a stolen face before an assassination. Originally free for Free RPG Day 2023, now pay-what-you-want on DriveThruRPG. | PWYW | High |
| A Corpse Astray (in core book) | (In the rulebook) | Introductory adventure included in the SotS book. Serves as system tutorial and combat demonstration. | Requires book | High |
| Pillars Built on Sand | https://pelgranepress.com/product-category/gumshoe/swords-of-the-serpentine/ | Linked scenarios by Gareth Ryder-Hanrahan. Quarantined ship with a fatal secret, avatar of war on a predatory hunt. | Paid | Medium |
| Wings of Deceit | https://pelgranepress.com/2025/08/26/wings-of-deceit/ | Intrigue-heavy mystery scenario set in Eversink. Blackmail, missing investigators, concealed secrets. Published on Pelgrane blog. | Free | High |

---

## Pelgrane Blog Articles (GM Advice by Kevin Kulp)

These are free articles on the Pelgrane Press blog. Some are already saved locally (see `tools-and-references.md`).

| Article | URL | Topic |
|---------|-----|-------|
| GUMSHOE 101 | https://pelgranepress.com/category/products/swords-of-the-serpentine/ (linked) | System overview for new players/GMs |
| Giving Out Clues in GUMSHOE | (Pelgrane blog) | Core GM technique for the investigative engine |
| Social Combat in SotS | (Pelgrane blog) | Morale, Sway, social combat mechanics |
| The Cost of Corruption | (Pelgrane blog) | Sorcery system deep dive |
| Strange Bedfellows: Political Manipulation | (Pelgrane blog) | Allegiances, Enemies, faction politics |
| One-Hero Play | (Pelgrane blog) | Two-player adventure guidance |
| A Small-Town Setting | https://pelgranepress.com/2021/01/12/a-small-town-setting-for-swords-of-the-serpentine/ | Adapting SotS beyond Eversink |
| SotS as High Fantasy | https://pelgranepress.com/2025/06/28/swords-of-the-serpentine-as-high-fantasy/ | Non-human heroes, classic magic, divine miracles |
| Building Foes from Scratch | https://pelgranepress.com/2025/12/22/building-foes-from-scratch-in-swords-of-the-serpentine/ | Adversary design guidance |
| Sanctums of Eversink | https://pelgranepress.com/2025/04/30/sanctums-of-eversink/ | Optional rules for group bases with shared abilities |
| Playtesting Non-Human Heroes (series) | https://pelgranepress.com/2025/03/03/playtesting-high-elves-non-human-heroes-in-swords-of-the-serpentine/ | Multi-part series on non-human ancestries (at least 13 parts) |
| Four Heroes (Pre-gens) | https://pelgranepress.com/2020/06/15/four-heroes-your-swords-of-the-serpentine-source-for-pre-made-heroes/ | Pre-made Sentinel, Sorcerer, Thief, Warrior |
| Four Heroes #2 | https://pelgranepress.com/2020/07/07/four-heroes-2-swords-of-the-serpentine-pre-made-heroes/ | Second set of pre-generated characters |
| Exploring Bookhounds of Eversink | (Pelgrane blog) | Five ways to set up a Bookhounds-style SotS game |

---

## Character Sheets (Downloadable)

| Format | URL | Notes |
|--------|-----|-------|
| Color PDF | https://pelgranepress.com/srv/htdocs/wp-content/uploads/2022/12/Swords_of_the_Serpentine_character_sheet.pdf | Standard with background art |
| Black & White PDF | https://pelgranepress.com/srv/htdocs/wp-content/uploads/2022/12/Swords_of_the_Serpentine_character_sheet_BW.pdf | Printer-friendly |
| No Background PDF | https://pelgranepress.com/srv/htdocs/wp-content/uploads/2022/12/Swords_of_the_Serpentine_character_sheet_no-background.pdf | Minimalist |
| A4 / US Letter (Jonathan Fish) | https://pelgranepress.com/nas/content/live/pelgranepress/wp-content/uploads/2020/09/ | Regional sizing |
| Polish A4 B&W (Blaze Sanecki) | https://pelgranepress.com/nas/content/live/pelgranepress/wp-content/uploads/2023/11/Swords_of_the_Serpentine_character_sheet_BW_PL.pdf | Polish translation |
| Google Sheets (Kevin Kulp) | https://docs.google.com/spreadsheets/d/1Z-UJbCFExXa_zUqKxmbQYb5pu_Nf1zYGAIZIcaJfXdw/ | Interactive, with ability descriptions |

All free.

---

## Community Discussion

| Platform | URL | Notes |
|----------|-----|-------|
| RPGnet Forums (tag) | https://forum.rpg.net/index.php?tags/swords-of-the-serpentine/ | Most active SotS discussion forum. GM Q&A, play reports, rules questions. |
| RPGGeek / BoardGameGeek | https://boardgamegeek.com/rpg/63336/swords-of-the-serpentine | Game entry with Q&A threads, reviews, session reports. |
| EN World Thread | https://www.enworld.org/threads/swords-of-the-serpentine-what-are-people-doing-with-it.693618/ | "What are people doing with it?" discussion thread. |
| RPG Pub | https://www.rpgpub.com/threads/swords-of-the-serpentine-rpg.8445/ | General discussion thread. |

No dedicated SotS Discord server or subreddit was found. The Pelgrane Press community and RPGnet forums appear to be the primary discussion venues.

---

## Recommendations for Campaign Setup

**Start here (highest value for a new GM):**
1. The actual play podcast with Kevin Kulp -- hear the designer run the game
2. "How to Play GUMSHOE" cheat sheet -- core mechanics in 2 minutes
3. Losing Face (PWYW) -- quickstart rules + intro scenario + pregens
4. Google Sheets character keeper -- interactive character creation
5. Gnome Stew and EN World reviews -- understand how the system plays before reading the book
6. Matt Breen's tools (monstar.co.nz) -- hero gen, adversary builder, name generators

**Then explore:**
7. Ten Sessions blog post -- real table experience and what to expect
8. Foundry VTT GUMSHOE system -- if playing online
9. Kevin Kulp's blog articles on Pelgrane -- deep dives into specific subsystems
10. Wings of Deceit (free scenario) and Pillars Built on Sand (paid) -- additional adventures
