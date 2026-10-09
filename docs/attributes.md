# The Division 2 – Attribute Max Rolls (reference for the item checker)

**Last researched:** 2026-10-09
**Game state targeted:** Year 8 Season 3 "Red Horizon" (released 2026-08-27), TU30.

## Sources

| # | Source | What it was used for | Notes |
|---|--------|----------------------|-------|
| S1 | **Division 2 Gear Spreadsheet** (Division 2 Discord #build-advice; Azurmen, Bend3n, Gingerbeard_x, Maplestruck, Saint Landwalker) – tab "Attribute Info": https://docs.google.com/spreadsheets/d/1nrPBmOrtpkEW1j5fbcRT7L-AXgsGOqMqxXoVtopsiGM/edit#gid=412070318 | **Main source of every max value**, including Prototype maxes, plus weapon-class fixed second cores (tab "Weapons", gid=0) and weapon mods (tab "Weapon Mods") | Changelog: "Y8S3 Updating.... WIP – Brandset, Gearset, P. Con done", 8/27/26, TU30. Attribute table itself has no per-row date. |
| S2 | Fandom wiki, *Gear/Tom Clancy's The Division 2* (via MediaWiki API, last edited 2026-06-08) | Gear core list, gear-mod attribute list, Prototype Gear rules (1.5× max, min = normal max), Augments | |
| S3 | Fandom wiki, item pages (Pointman, Deathgrips, Eagle's Grasp, etc.) | Armor core shown as **170,000**; named "perfect" attributes exceed normal max | |
| S4 | Fandom wiki, *Red Horizon* (season page, edited 2026-10-06; copies Ubisoft patch notes) | Current season changes (Brand Set bonus rework, Prototype drops in DZ, Expertise active in Blackout DZ) | No attribute-max changes mentioned. |
| S5 | Fandom wiki, *Title Update 15* and *Intelligence Annex: Expertise* (Ubisoft text) | Expertise / Proficiency / Grade definitions, effect per Grade | |
| S6 | Fandom wiki, *Year 7 Content* | Expertise hard cap 30 (added Y7S2 "The Pact") | |
| S7 | Fandom wiki, *Recalibration/Tom Clancy's The Division 2* | Recalibration basics (one slot per item, same family, donor destroyed) | Page last edited 2023; partly pre-library text. |
| S8 | itemlevel.net "The Division 2 Expertise Guide 2026" – https://itemlevel.net/the-division-2-expertise-guide-2026/ | Proficiency 10 = Proficient, cap 30, weapons up to +30% | Secondary source. |
| S9 | carrylord.com "Expertise 2.0 … Level 30 (2026)" – https://carrylord.com/the-division-2/fastest-way-to-reach-level-30-in-2026/ | 20 Proficient items per Expertise level, duplicate donation counts, Apr-2026 cost reduction | Secondary/commercial source – treat numbers as unverified. |
| S10 | grindout.com "Best Division 2 Gear Sets & Brand Sets in 2026" – https://grindout.com/division-2/guides/gear-sets-and-brand-sets | Gear set = 1 minor attribute, brand item = 2 minors; 12-attribute minor pool | |
| S11 | Steam discussion "prototype gear can NOT be optimized or recalibrated" – https://steamcommunity.com/app/2221490/discussions/0/798965318966873585/ (title/search snippet only) | Prototype items locked for optimize/recal | Not opened in full (rate-limited). |

Reddit (r/thedivision) and Ubisoft's own site could not be fetched directly (blocked / JS-only); Ubisoft patch-note content was read through the Fandom copies (S4, S5).

---

## 0. How to read values / OCR display formats

In the inventory tooltip (PC, English) each attribute line is an icon (red = offensive, blue = defensive, yellow = skill/utility) followed by **value then name**, one decimal place for percentages and thousands separators for flat values:

| Kind | Typical tooltip text | Other places you will see it |
|---|---|---|
| Percent attribute | `6.0% Critical Hit Chance` | `+6.0% Critical Hit Chance` (wiki, compare panels, some UI); `Critical Hit Chance 6.0%` / `Critical Hit Chance +6.0%` (Recalibration Library list, stat sheet) |
| Flat attribute | `18,935 Health`, `4,925 Armor Regen` | `+18,935 Health`; Armor Regen sometimes shown as `4,925/s` or "Armor Regeneration" |
| Gear armor core | `170,000 Armor` | `+170,000 Armor` |
| Skill Tier core | `1 Skill Tier` | `+1 Skill Tier` |
| Weapon core 1 | `15.0% Assault Rifle Damage` (name = weapon class + "Damage") | |
| Weapon core 2 | `21.0% Health Damage` (AR), `111.0% Headshot Damage` (MMR) | |

OCR parser recommendations:
- Accept both orders (`<value> <name>` and `<name> <value>`), optional leading `+`, optional `%`, optional decimal, `,` thousands separator (and `.`/space separators on non-English locales).
- Max-roll ("god roll") text is shown in **orange** in-game for maxed values; colour can be an extra signal but don't rely on it.
- Normalise aliases: `Armor Regen` = `Armor Regeneration`; `Repair Skills` = `Skill Repair`; `Damage to Armor` = `Armor Damage`; `Health Damage` = `Damage to Health`; `Damage to Targets Out of Cover` = `DMG to target out of cover` (sheet) = `DTTOC`; `Magazine Size` = `Mag Size` (not "Ammo Capacity").
- God-roll threshold used by the tool: `value >= 0.95 * max`.
- **Exact tooltip strings marked with (?) below were not confirmed from a screenshot** – capture one real tooltip per attribute to lock the names.

---

## 1. Gear core attributes

Every gear piece (Mask, Body Armor/Chest, Holster, Backpack, Gloves, Kneepads) has exactly **one** core (exceptions: Core Strength gear-set backpack and exotic Harrier Pride / Memento / NinjaBike Messenger Bag backpacks have three cores – S2).

| In-game name | Colour | Max (High-End / Gear Set / Named) | Prototype max | Unit | Display |
|---|---|---|---|---|---|
| Weapon Damage | Red | **15.0%** | 22.5% | % | `15.0% Weapon Damage` |
| Armor | Blue | **170,000** | 255,001 (sheet value; 1.5× = 255,000) | flat | `170,000 Armor` |
| Skill Tier | Yellow | **1** | 1.5 (sheet; odd – tier is integer, unverified) | tier | `1 Skill Tier` |

Conflict: some older guides / player memory quote the armor core as **170,370**. Both S1 and multiple current Fandom item pages (S3) say **170,000**. Use 170,000 but let the tool accept anything up to ~170,400 as 100% until confirmed with an in-game screenshot.

Expertise Grade does not change these displayed attribute values (it adds to the item's *base* armor/damage – see §5).

## 2. Gear minor (secondary) attributes

Complete current pool (12 attributes, 4 per colour – S1, S10). Same max on every gear slot.

| In-game name | Colour | Max per roll | Prototype max | Unit | Display example |
|---|---|---|---|---|---|
| Critical Hit Chance | Red | **6.0%** | 9.0% | % | `6.0% Critical Hit Chance` |
| Critical Hit Damage | Red | **12.0%** | – (not listed; 1.5× would be 18.0%) | % | `12.0% Critical Hit Damage` |
| Headshot Damage | Red | **10.0%** | 15.0% | % | `10.0% Headshot Damage` |
| Weapon Handling | Red | **8.0%** | – (1.5× = 12.0%, unverified) | % | `8.0% Weapon Handling` |
| Armor Regen (?) | Blue | **4,925** (per second) | – (1.5× = 7,387.5, unverified) | flat/s | `4,925 Armor Regen` |
| Hazard Protection | Blue | **10.0%** | 15.0% | % | `10.0% Hazard Protection` |
| Health | Blue | **18,935** | – (1.5× = 28,402.5, unverified) | flat | `18,935 Health` |
| Explosive Resistance | Blue | **10.0%** | 15.0% | % | `10.0% Explosive Resistance` |
| Skill Damage | Yellow | **10.0%** | 15.0% | % | `10.0% Skill Damage` |
| Skill Haste | Yellow | **12.0%** | – (1.5× = 18.0%, unverified) | % | `12.0% Skill Haste` |
| Repair Skills | Yellow | **20.0%** | 30.0% | % | `20.0% Repair Skills` |
| Status Effects | Yellow | **10.0%** | – (1.5× = 15.0%, unverified) | % | `10.0% Status Effects` |

Prototype notes (S2): Prototype Gear (requires Expertise 30 to upgrade into; also drops in Escalations and, since Red Horizon, as contaminated DZ loot) has **max = 1.5 × normal max** and **min = normal max**. The sheet leaves the Prototype column blank for several attributes – the 1.5× values above are derived, not sourced. Prototype items also carry an *Augment* (Amalgam, Anomaly, Atomize, Echo, Entropy, Paradox, Quantum, Synesthesia, Trapper) that is levelled separately – not an attribute roll.

### Attribute slot layout by item type

| Item type | Core | Minor attributes | Gear-mod slot | Talent |
|---|---|---|---|---|
| High-End brand item | 1 | **2** | Mask, Chest, Backpack only | Chest & Backpack only (recalibratable) |
| Gear Set item | 1 (set's fixed colour) | **1** | Mask, Chest, Backpack only | Chest & Backpack carry fixed set talents (not recalibratable) |
| Named brand item | 1 | 2, one may be a **"perfect" attribute** (orange, *above* normal max, e.g. Eagle's Grasp `+15% Weapon Handling`, Deathgrips `10.0% Armor on Kill`) – or a perfect talent instead | as brand | perfect talent if chest/backpack named |
| Improvised item (crafted) | 1 | 2 | **any slot** gets a mod slot | – |
| Exotic gear | fixed per exotic | fixed per exotic | varies | unique |
| Prototype | as base item, values ×1.5 range | as base item | as base | as base + Augment |

So: **yes, gear sets have only one minor attribute slot**; brand pieces have two. Named "perfect" attributes and exotic attributes should be excluded from %-of-max calculations (or compared against their own per-item max).

## 2b. Gear mods (Mask / Chest / Backpack slot)

Protocol / skill-power mods from launch were removed in Warlords of New York (TU8); current pool per S1/S2:

| In-game name | Colour | Max | Unit | Notes |
|---|---|---|---|---|
| Critical Hit Chance | Red | **6.0%** | % | |
| Critical Hit Damage | Red | **12.0%** | % | |
| Headshot Damage | Red | **10.0%** | % | |
| Protection from Elites | Blue | **13.0%** | % | |
| Armor on Kill | Blue | **18,935** | flat (per S1) | Conflict/unverified: S1 lists flat 18,935; brand bonuses and Deathgrips show Armor on Kill as **%**. Confirm mod format in-game. |
| Incoming Repairs | Blue | **20.0%** | % | |
| Bleed Resistance | Blue | **10.0%** | % | S1 groups all status resistances at 10% |
| Blind/Deaf Resistance | Blue | **10.0%** | % | |
| Burn Resistance | Blue | **10.0%** | % | |
| Disorient Resistance | Blue | **10.0%** | % | |
| Disrupt Resistance | Blue | **10.0%** | % | |
| Ensnare Resistance | Blue | **10.0%** | % | |
| Shock Resistance | Blue | **10.0%** | % | |
| Pulse Resistance | Blue | **10.0%** | % | |
| Skill Haste | Yellow | **12.0%** | % | |
| Skill Duration | Yellow | **10.0%** | % | |
| Repair Skills | Yellow | **20.0%** | % | |

Gear mods are **not** stored in the Recalibration Library (they are separate inventory items you swap freely).

---

## 3. Weapon attributes

Each High-End / Named weapon: **Core 1** (weapon-class damage) + **Core 2** (fixed by class, absent on Pistols) + **1 Attribute** (third, from the pool below) + talent. Cores are locked to the class – they can only be *optimized*, not recalibrated.

### 3a. Core 1 – weapon-class damage

| Class | In-game name | Max | Prototype max |
|---|---|---|---|
| Assault Rifle | Assault Rifle Damage | **15.0%** | 22.5% |
| Light Machine Gun | LMG Damage | **15.0%** | 22.5% |
| Submachine Gun | SMG Damage | **15.0%** | 22.5% |
| Shotgun | Shotgun Damage | **15.0%** | 22.5% |
| Rifle | Rifle Damage | **15.0%** | 22.5% |
| Marksman Rifle | Marksman Rifle Damage | **15.0%** | 22.5% |
| Pistol | Pistol Damage | **15.0%** | 22.5% |

(S1 lists this as "All weapons: Weapon damage 15% / 22.5%"; tooltip names are class-specific.)

### 3b. Core 2 – fixed per class

| Class | In-game name | Max | Prototype max |
|---|---|---|---|
| Assault Rifle | Health Damage | **21.0%** | 31.5% |
| LMG | Damage to Targets Out of Cover | **12.0%** | 17.0% (sheet; 1.5× would be 18.0% – conflict) |
| SMG | Critical Hit Chance | **21.0%** | 31.5% |
| Shotgun | Damage to Armor | **12.0%** | 17.0% (sheet; 1.5× = 18.0% – conflict) |
| Rifle | Critical Hit Damage | **17.0%** | – (1.5× = 25.5%, unverified) |
| Marksman Rifle | Headshot Damage | **111.0%** | – (1.5× = 166.5%, unverified) |
| Pistol | *none* | – | – |

Confirmed: **Pistols have no second core** (S1 "Pistol: NA"). Note MMR core-2 headshot damage replaces the innate HSD that other classes carry (sheet column "Innate HSD").

### 3c. Weapon attribute (third slot) – shared pool

| In-game name | Max | Prototype max | Notes |
|---|---|---|---|
| Critical Hit Chance | **9.5%** | 14.5% | |
| Critical Hit Damage | **10.0%** | – | |
| Headshot Damage | **10.0%** | 15.0% | |
| Damage to Armor | **6.0%** | 9.0% | |
| Health Damage | **9.5%** | – | S1: "actually 10% in calc" (display 9.5%) |
| Damage to Targets Out of Cover | **10.0%** | 15.0% | |
| Reload Speed | **12.0%** | – | |
| Stability | **12.0%** | – | |
| Accuracy | **12.0%** | – | |
| Optimal Range | **24.0%** | – | |
| Magazine Size | **12.5%** | – | |
| Rate of Fire | **5.0%** | – | |
| Swap Speed | **15.0%** | – | |

S1 gives a single max per attribute – **no per-class differences** are listed for the third attribute. Whether a class can roll the same stat as its core 2 (e.g. SMG with CHC as third attribute) was **not verified**. "Ammo Capacity" is not a weapon attribute (it exists only as an SHD Watch / brand bonus); the weapon attribute is "Magazine Size".

## 4. Weapon mods (brief)

Since TU22 weapon mods are fixed-value blueprints (no random roll), so they do not need god-roll checks. Typical values (S1 "Weapon Mods"): `+5% Critical Hit Chance` (muzzle brakes / C79), `+10% Critical Hit Damage`, `+10%`–`+45% Headshot Damage` (optics), `+30% Accuracy`/`+30% Stability`, `+20% Reload Speed`, `+5% Rate of Fire`, `+15`/`+20 Rounds` (often with `-10% Reload Speed`), `+50%`/`+70% Optimal Range`. Some have penalties (e.g. VX1 `-10% Reload Speed`, Low Reflex `-25% Optimal Range`).

---

## 5. Recalibration, Recalibration Library, Optimization, Expertise/Proficiency

### Recalibration
- Done at the Recalibration Station (White House / Haven). **Only one slot per item** can be recalibrated; once chosen, that same slot can be re-recalibrated indefinitely, but no other slot (S7).
- Replacement must be the **same family/colour** (offensive↔offensive, defensive↔defensive, skill↔skill) and the same item category (gear slot ↔ same gear slot for talents; weapon class ↔ same weapon class for weapon talents).
- Recalibratable: gear minor attributes, gear core (brand High-End pieces – changing core colour; gear-set cores are fixed by set – community-reported, verify), chest/backpack talents on brand items, weapon third attribute, weapon talent.
- **Not** recalibratable: weapon cores (optimize only), gear-set chest/backpack talents, a Named item's **perfect** talent/attribute (other slots on the named item are fine), **Exotics** (no recalibration), **Prototype** items (locked: no optimization or recalibration after conversion – S11).

### Recalibration Library (since Warlords of New York / TU8)
- Extracting an attribute/talent from a donor item **destroys the donor** and stores it in the account library.
- For attributes, the library keeps **one value per attribute – the highest you've ever extracted**; extracting a lower value never overwrites it. Gear core attributes and gear minor attributes are stored (shared across gear slots); weapon third attributes are stored; **talents are stored as unlocked (no value)**.
- Stored entries can be applied an unlimited number of times (each application costs credits + materials). Library entries are capped at the normal max (Prototype/perfect values cannot be banked).
- Weapon cores, named perfect talents/attributes, exotic stats and gear mods cannot be extracted.
- Practical rule for the tool: an item "beats your library" for attribute X if `itemValue(X) > library[X]`; once `library[X] == max`, only the item's *other* stats matter.

### Optimization (separate from recalibration)
Spends Optimization Materials to raise an attribute/core towards its max (same maxes as above). One attribute at a time; exotics can be optimized; prototypes cannot (S11).

### Expertise / Proficiency (what "level 10 proficient" actually means)
Introduced TU15 (May 2022), capped at **Expertise Level 30** since Y7S2 "The Pact" (S5, S6). Terms:

| Term | Scope | Meaning |
|---|---|---|
| **Proficiency Rank** | per *item type* (account-wide) – a weapon model, a brand, a gear set, a named item, an exotic, a skill variant, a specialization weapon | 0 → **10**. Rank 10 = **Proficient**. All Brand/Gear Set pieces share one proficiency (e.g. all Gila Guard). |
| **Proficient** | item type | Reached Rank 10. Only now can individual items of that type be upgraded (Graded). |
| **Expertise Level** | account | Rises as you become Proficient in more item types (S9: 20 Proficient types per level → 600 for level 30; unverified). Cap 30. Ranks keep rising after 30 but stop adding Expertise. |
| **Grade** | individual item | Number of upgrades on that specific item, max = your Expertise Level (so max Grade 30). Costs materials (Field Recon Data, SHD Calibration, exotic components…; reduced Apr-2026 per S9). |

How Proficiency points are earned (S5):
1. **Kill XP while the item is equipped** (equipping multiple pieces of a brand/set speeds it up).
2. **Donating matching items** – e.g. junk duplicates of that weapon / brand / set (S9: ~20 copies for full proficiency, 10 during events – unverified). This is the "feeding items" mechanic: the donated item is consumed.
3. **Donating materials** (printer filament etc.).
Item quality and type set how many points a rank needs.

What a Grade gives (S5): **Weapons +1% base damage per Grade** (→ +30% at Grade 30); **Gear +1% base armor per Grade** (additive with base armor, S1); **Skills +1% base damage/healing/status duration**. Grades do **not** change the rolled attributes, so the tool's god-roll/library comparisons are independent of Expertise. Expertise bonuses are disabled in normalized modes (most PvP, raids) but active in the new Blackout DZ (S4).

So "level 10 proficient" = the item *type* is at Proficiency Rank 10; it is the gate to upgrading, not the end state – a fully upgraded item is **Grade 30** (with Expertise Level 30). Prototype conversion additionally requires Expertise 30.

---

## 6. Unverified / conflicting items (summary)

1. Armor core: **170,000** (S1, S3) vs. 170,370 (older lore/memory). Using 170,000.
2. Prototype maxes for LMG/Shotgun core 2 shown as 17.0% (sheet) vs. 18.0% expected from the 1.5× rule (S2). Several Prototype maxes are blank in S1; derived 1.5× values flagged `derived` in JSON.
3. Prototype Skill Tier 1.5 and Armor 255,001 are odd sheet values.
4. Gear-mod Armor on Kill: flat 18,935 (S1) vs. percentage format elsewhere.
5. Exact tooltip wording of "Armor Regen" vs "Armor Regeneration", and whether "Damage to Armor"/"Health Damage" read exactly so on weapon tooltips (sheet and wiki use both forms).
6. Whether a weapon's third attribute can duplicate its core 2; whether per-class third-attribute maxes differ (S1 lists none).
7. Expertise-level thresholds (20 proficient per level) and duplicate-donation counts come from a secondary source only.
8. Gear-set core recalibration restriction is community-reported, not from patch notes.
9. S1 marks its Y8S3 update as "WIP"; Red Horizon notes (S4) did not announce any attribute-max changes.

---

## 7. JSON for DB seeding

`max` = normal (non-Prototype) max. `prototypeMax` = sourced value from S1, or `null`; `prototypeMaxDerived` = 1.5× where S1 is blank. `aliases` = alternative strings to match in OCR.

```json
[
  {"name":"Weapon Damage","category":"gear-core","color":"red","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":15.0,"unit":"%","prototypeMax":22.5,"aliases":[],"notes":"Gear core. Display '15.0% Weapon Damage'."},
  {"name":"Armor","category":"gear-core","color":"blue","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":170000,"unit":"flat","prototypeMax":255001,"aliases":[],"notes":"Gear core. Some sources say 170,370 - unverified; accept up to ~170,400."},
  {"name":"Skill Tier","category":"gear-core","color":"yellow","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":1,"unit":"flat","prototypeMax":1.5,"aliases":[],"notes":"Gear core. Prototype value 1.5 per sheet, unverified."},

  {"name":"Critical Hit Chance","category":"gear-minor","color":"red","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":6.0,"unit":"%","prototypeMax":9.0,"aliases":["Crit Hit Chance","CHC"],"notes":""},
  {"name":"Critical Hit Damage","category":"gear-minor","color":"red","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":12.0,"unit":"%","prototypeMax":null,"prototypeMaxDerived":18.0,"aliases":["Crit Hit Damage","CHD"],"notes":""},
  {"name":"Headshot Damage","category":"gear-minor","color":"red","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":10.0,"unit":"%","prototypeMax":15.0,"aliases":["HSD"],"notes":""},
  {"name":"Weapon Handling","category":"gear-minor","color":"red","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":8.0,"unit":"%","prototypeMax":null,"prototypeMaxDerived":12.0,"aliases":[],"notes":"Named Eagle's Grasp has perfect 15%."},
  {"name":"Armor Regen","category":"gear-minor","color":"blue","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":4925,"unit":"flat","prototypeMax":null,"prototypeMaxDerived":7387.5,"aliases":["Armor Regeneration","Armour Regen"],"notes":"Per second. Exact tooltip wording unverified."},
  {"name":"Hazard Protection","category":"gear-minor","color":"blue","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":10.0,"unit":"%","prototypeMax":15.0,"aliases":[],"notes":""},
  {"name":"Health","category":"gear-minor","color":"blue","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":18935,"unit":"flat","prototypeMax":null,"prototypeMaxDerived":28402.5,"aliases":[],"notes":""},
  {"name":"Explosive Resistance","category":"gear-minor","color":"blue","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":10.0,"unit":"%","prototypeMax":15.0,"aliases":[],"notes":""},
  {"name":"Skill Damage","category":"gear-minor","color":"yellow","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":10.0,"unit":"%","prototypeMax":15.0,"aliases":[],"notes":""},
  {"name":"Skill Haste","category":"gear-minor","color":"yellow","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":12.0,"unit":"%","prototypeMax":null,"prototypeMaxDerived":18.0,"aliases":[],"notes":""},
  {"name":"Repair Skills","category":"gear-minor","color":"yellow","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":20.0,"unit":"%","prototypeMax":30.0,"aliases":["Skill Repair"],"notes":""},
  {"name":"Status Effects","category":"gear-minor","color":"yellow","appliesTo":["Mask","Chest","Holster","Backpack","Gloves","Kneepads"],"max":10.0,"unit":"%","prototypeMax":null,"prototypeMaxDerived":15.0,"aliases":[],"notes":""},

  {"name":"Critical Hit Chance","category":"gear-mod","color":"red","appliesTo":["Mask","Chest","Backpack"],"max":6.0,"unit":"%","aliases":["Crit Hit Chance"],"notes":"Mod slots only on Mask/Chest/Backpack (any slot if Improvised)."},
  {"name":"Critical Hit Damage","category":"gear-mod","color":"red","appliesTo":["Mask","Chest","Backpack"],"max":12.0,"unit":"%","aliases":["Crit Hit Damage"],"notes":""},
  {"name":"Headshot Damage","category":"gear-mod","color":"red","appliesTo":["Mask","Chest","Backpack"],"max":10.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Protection from Elites","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":13.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Armor on Kill","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":18935,"unit":"flat","aliases":["Armour on Kill"],"notes":"UNVERIFIED unit: sheet says flat 18,935; elsewhere Armor on Kill is a %."},
  {"name":"Incoming Repairs","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":20.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Bleed Resistance","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":10.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Blind/Deaf Resistance","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":10.0,"unit":"%","aliases":["Blind Deaf Resistance"],"notes":""},
  {"name":"Burn Resistance","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":10.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Disorient Resistance","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":10.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Disrupt Resistance","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":10.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Ensnare Resistance","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":10.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Shock Resistance","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":10.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Pulse Resistance","category":"gear-mod","color":"blue","appliesTo":["Mask","Chest","Backpack"],"max":10.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Skill Haste","category":"gear-mod","color":"yellow","appliesTo":["Mask","Chest","Backpack"],"max":12.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Skill Duration","category":"gear-mod","color":"yellow","appliesTo":["Mask","Chest","Backpack"],"max":10.0,"unit":"%","aliases":[],"notes":""},
  {"name":"Repair Skills","category":"gear-mod","color":"yellow","appliesTo":["Mask","Chest","Backpack"],"max":20.0,"unit":"%","aliases":["Skill Repair"],"notes":""},

  {"name":"Assault Rifle Damage","category":"weapon-core","appliesTo":["Assault Rifle"],"max":15.0,"unit":"%","prototypeMax":22.5,"aliases":[],"notes":"Core 1. Optimize only."},
  {"name":"LMG Damage","category":"weapon-core","appliesTo":["LMG"],"max":15.0,"unit":"%","prototypeMax":22.5,"aliases":["Light Machine Gun Damage"],"notes":"Core 1."},
  {"name":"SMG Damage","category":"weapon-core","appliesTo":["SMG"],"max":15.0,"unit":"%","prototypeMax":22.5,"aliases":["Submachine Gun Damage"],"notes":"Core 1."},
  {"name":"Shotgun Damage","category":"weapon-core","appliesTo":["Shotgun"],"max":15.0,"unit":"%","prototypeMax":22.5,"aliases":[],"notes":"Core 1."},
  {"name":"Rifle Damage","category":"weapon-core","appliesTo":["Rifle"],"max":15.0,"unit":"%","prototypeMax":22.5,"aliases":[],"notes":"Core 1."},
  {"name":"Marksman Rifle Damage","category":"weapon-core","appliesTo":["Marksman Rifle"],"max":15.0,"unit":"%","prototypeMax":22.5,"aliases":["MMR Damage"],"notes":"Core 1."},
  {"name":"Pistol Damage","category":"weapon-core","appliesTo":["Pistol"],"max":15.0,"unit":"%","prototypeMax":22.5,"aliases":[],"notes":"Core 1. Pistols have no core 2."},

  {"name":"Health Damage","category":"weapon-secondary","appliesTo":["Assault Rifle"],"max":21.0,"unit":"%","prototypeMax":31.5,"aliases":["Damage to Health"],"notes":"Core 2, fixed."},
  {"name":"Damage to Targets Out of Cover","category":"weapon-secondary","appliesTo":["LMG"],"max":12.0,"unit":"%","prototypeMax":17.0,"aliases":["Damage to Target Out of Cover","DMG to target out of cover"],"notes":"Core 2, fixed. Prototype 17.0 per sheet vs 18.0 by 1.5x rule."},
  {"name":"Critical Hit Chance","category":"weapon-secondary","appliesTo":["SMG"],"max":21.0,"unit":"%","prototypeMax":31.5,"aliases":["Crit Hit Chance"],"notes":"Core 2, fixed."},
  {"name":"Damage to Armor","category":"weapon-secondary","appliesTo":["Shotgun"],"max":12.0,"unit":"%","prototypeMax":17.0,"aliases":["Armor Damage"],"notes":"Core 2, fixed. Prototype 17.0 per sheet vs 18.0 by 1.5x rule."},
  {"name":"Critical Hit Damage","category":"weapon-secondary","appliesTo":["Rifle"],"max":17.0,"unit":"%","prototypeMax":null,"prototypeMaxDerived":25.5,"aliases":["Crit Hit Damage"],"notes":"Core 2, fixed."},
  {"name":"Headshot Damage","category":"weapon-secondary","appliesTo":["Marksman Rifle"],"max":111.0,"unit":"%","prototypeMax":null,"prototypeMaxDerived":166.5,"aliases":[],"notes":"Core 2, fixed."},

  {"name":"Critical Hit Chance","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":9.5,"unit":"%","prototypeMax":14.5,"aliases":["Crit Hit Chance"],"notes":""},
  {"name":"Critical Hit Damage","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":10.0,"unit":"%","prototypeMax":null,"aliases":["Crit Hit Damage"],"notes":""},
  {"name":"Headshot Damage","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":10.0,"unit":"%","prototypeMax":15.0,"aliases":[],"notes":""},
  {"name":"Damage to Armor","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":6.0,"unit":"%","prototypeMax":9.0,"aliases":["Armor Damage"],"notes":""},
  {"name":"Health Damage","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":9.5,"unit":"%","prototypeMax":null,"aliases":["Damage to Health"],"notes":"Sheet: actually 10% in calc."},
  {"name":"Damage to Targets Out of Cover","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":10.0,"unit":"%","prototypeMax":15.0,"aliases":["Damage to Target Out of Cover"],"notes":""},
  {"name":"Reload Speed","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":12.0,"unit":"%","prototypeMax":null,"aliases":[],"notes":""},
  {"name":"Stability","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":12.0,"unit":"%","prototypeMax":null,"aliases":[],"notes":""},
  {"name":"Accuracy","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":12.0,"unit":"%","prototypeMax":null,"aliases":[],"notes":""},
  {"name":"Optimal Range","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":24.0,"unit":"%","prototypeMax":null,"aliases":[],"notes":""},
  {"name":"Magazine Size","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":12.5,"unit":"%","prototypeMax":null,"aliases":["Mag Size"],"notes":""},
  {"name":"Rate of Fire","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":5.0,"unit":"%","prototypeMax":null,"aliases":["RPM"],"notes":""},
  {"name":"Swap Speed","category":"weapon-minor","appliesTo":["Assault Rifle","LMG","SMG","Shotgun","Rifle","Marksman Rifle","Pistol"],"max":15.0,"unit":"%","prototypeMax":null,"aliases":["Weapon Swap Speed"],"notes":""}
]
```
