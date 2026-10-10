# Skill variants (Expertise > Skills)

Last researched: 2026-10-10 (game state: Year 8 Season 3, after the Y8S3.1 title update)

Each skill variant has its own Expertise / proficiency entry. There are **43 variants in 12 skill families**.

## Sources

- Fandom wiki, *Skills/Tom Clancy's The Division 2* (via MediaWiki API `action=parse`), lists every variant and how it is unlocked.
- Fandom wiki, *Intelligence Annex: Expertise* (Ubisoft's article): Expertise covers "Skill Variants (Explosive Sticky Bomb, Incinerator Turret, Defender Drone, etc)".
- Fandom wiki, *Year 8, Season 3.1 Title Update*: no new skills. Fixes mention Achilles Pulse, Banshee Pulse, Burn Sticky Bomb, Riot Foam, Artificer Hive.
- div2hub/game-data `skills/skills.csv`: 43 rows, `name,skill`. Same variants and same family order as the companion's Expertise screen.
- themantisreturns/division2-companion:
  - `src/features/expertise/expertiseData.js` has per-family totals copied from the in-game Expertise screen: Sticky Bomb 3, Trap 3, Decoy 1, Pulse 5, Turret 4, Hive 5, Chem Launcher 4, Firefly 3, Seeker Mine 4, Drone 5, Ballistic Shield 4, Smart Cover 2. They sum to 43.
  - `src/features/expertise/expertiseScreenshotSnapshot.js` is a transcription from 2026-08-14.
  - `public/catalog/sources/manual.json` lists variant names.
- Web search (allthings.how): the **Echoes of Central Park** expansion, due 3 Nov 2026, reportedly adds 6 new skill variants. They have not been released yet.

## Skills and variants

The families are listed in the order the Expertise screen uses (per the companion transcription).

| Skill family | Variants | Count | Added / unlock |
|---|---|---|---|
| Sticky Bomb | Explosive Sticky Bomb, Burn Sticky Bomb, EMP Sticky Bomb | 3 | Warlords of New York (Rogue Agent / Season 1 Prime Target) |
| Trap | Shock Trap, Repair Trap, Shrapnel Trap | 3 | WONY / Season 2 / Season 3 Prime Targets |
| Decoy | Decoy | 1 | WONY (Theo Parnell). The wiki calls it "Holographic Distraction Decoy" |
| Pulse | Scanner Pulse, Remote Pulse, Jammer Pulse, Banshee Pulse, Achilles Pulse | 5 | Banshee: Gunner specialization. Achilles: Season 4 (Faye Lau) |
| Turret | Assault Turret, Incinerator Turret, Sniper Turret, Artillery Turret | 4 | Artillery: Demolitionist specialization |
| Hive | Restorer Hive, Stinger Hive, Reviver Hive, Booster Hive, Artificer Hive | 5 | Artificer: Technician specialization |
| Chem Launcher | Reinforcer Chem Launcher, Firestarter Chem Launcher, Riot Foam Chem Launcher, Oxidizer Chem Launcher | 4 | Base game |
| Firefly | Blinder Firefly, Burster Firefly, Demolisher Firefly | 3 | Base game |
| Seeker Mine | Explosive Seeker Mine, Airburst Seeker Mine, Cluster Seeker Mine, Mender Seeker Mine | 4 | Mender: Survivalist specialization |
| Drone | Striker Drone, Defender Drone, Bombardier Drone, Fixer Drone, Tactician Drone | 5 | Tactician: Sharpshooter specialization |
| Ballistic Shield | Bulwark Shield, Crusader Shield, Deflector Shield, Striker Shield | 4 | Striker: Firewall specialization |
| Smart Cover | Fortified Smart Cover, Precision Smart Cover | 2 | Battle for Brooklyn (Bridge Blockade) |
| **Total** | | **43** | |

## Naming

- In-game, a variant's name is the variant word followed by the family name: "Assault Turret", "Explosive Sticky Bomb", "Restorer Hive". Ubisoft's Expertise article uses this form.
- The Expertise screen groups variants under their family. The companion transcription writes them as "Turret — Assault", but that is its own label, not on-screen text.
- Shield variants: div2hub uses "Bulwark Shield" / "Striker Shield", and the in-game skill names drop "Ballistic". The wiki uses "Bulwark Ballistic Shield". The family name is "Ballistic Shield".

## Unverified / notes

- **Expected ~40 vs 43.** The ~40 figure was worked out by subtracting the other categories from the user's 472 Proficient total. Three independent sources give 43:
  - the wiki's variant list,
  - div2hub's skills.csv,
  - the companion's in-game per-family totals.

  The subtraction is probably off because a component total is slightly wrong. The companion's weapon totals sum to 274, not 267, and its snapshot shows a Proficient total of 486. Count the Skills tab on screen to settle it.
- **Smart Cover variant names.** The wiki and div2hub say Fortified / Precision. The companion's `manual.json` says "Reclaimer" / "Smart Cover", which looks wrong. The count of 2 matches.
- The companion's `manual.json` also says "Flame" for the turret and "Firewall Striker" for the shield. The wiki and div2hub say Incinerator Turret and Striker Shield.
- **Decoy.** The variant is shown here as "Decoy", as in div2hub and the companion. The wiki's long name is "Holographic Distraction Decoy". Not checked against the Expertise screen.
- **Not real skills.** No "Spotter Pulse" or "Bolo Sticky Bomb" exists in any source.
- **Upcoming variants.** Echoes of Central Park (3 Nov 2026) reportedly adds 6 skill variants, possibly including a corrosive trap and a gas bomber. Only one source mentions this. Re-check after release.
- Not checked: the community gear spreadsheet. div2hub and the wiki agreed exactly, so it was not needed.

```json
[
  {"name": "Explosive Sticky Bomb", "skill": "Sticky Bomb"},
  {"name": "Burn Sticky Bomb", "skill": "Sticky Bomb"},
  {"name": "EMP Sticky Bomb", "skill": "Sticky Bomb"},
  {"name": "Shock Trap", "skill": "Trap"},
  {"name": "Repair Trap", "skill": "Trap"},
  {"name": "Shrapnel Trap", "skill": "Trap"},
  {"name": "Decoy", "skill": "Decoy"},
  {"name": "Scanner Pulse", "skill": "Pulse"},
  {"name": "Remote Pulse", "skill": "Pulse"},
  {"name": "Jammer Pulse", "skill": "Pulse"},
  {"name": "Banshee Pulse", "skill": "Pulse"},
  {"name": "Achilles Pulse", "skill": "Pulse"},
  {"name": "Assault Turret", "skill": "Turret"},
  {"name": "Incinerator Turret", "skill": "Turret"},
  {"name": "Sniper Turret", "skill": "Turret"},
  {"name": "Artillery Turret", "skill": "Turret"},
  {"name": "Restorer Hive", "skill": "Hive"},
  {"name": "Stinger Hive", "skill": "Hive"},
  {"name": "Reviver Hive", "skill": "Hive"},
  {"name": "Booster Hive", "skill": "Hive"},
  {"name": "Artificer Hive", "skill": "Hive"},
  {"name": "Reinforcer Chem Launcher", "skill": "Chem Launcher"},
  {"name": "Firestarter Chem Launcher", "skill": "Chem Launcher"},
  {"name": "Riot Foam Chem Launcher", "skill": "Chem Launcher"},
  {"name": "Oxidizer Chem Launcher", "skill": "Chem Launcher"},
  {"name": "Blinder Firefly", "skill": "Firefly"},
  {"name": "Burster Firefly", "skill": "Firefly"},
  {"name": "Demolisher Firefly", "skill": "Firefly"},
  {"name": "Explosive Seeker Mine", "skill": "Seeker Mine"},
  {"name": "Airburst Seeker Mine", "skill": "Seeker Mine"},
  {"name": "Cluster Seeker Mine", "skill": "Seeker Mine"},
  {"name": "Mender Seeker Mine", "skill": "Seeker Mine"},
  {"name": "Striker Drone", "skill": "Drone"},
  {"name": "Defender Drone", "skill": "Drone"},
  {"name": "Bombardier Drone", "skill": "Drone"},
  {"name": "Fixer Drone", "skill": "Drone"},
  {"name": "Tactician Drone", "skill": "Drone"},
  {"name": "Bulwark Shield", "skill": "Ballistic Shield"},
  {"name": "Crusader Shield", "skill": "Ballistic Shield"},
  {"name": "Deflector Shield", "skill": "Ballistic Shield"},
  {"name": "Striker Shield", "skill": "Ballistic Shield"},
  {"name": "Fortified Smart Cover", "skill": "Smart Cover"},
  {"name": "Precision Smart Cover", "skill": "Smart Cover"}
]
```
