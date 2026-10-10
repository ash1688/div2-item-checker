# Div2 Item Checker – Design Decisions

## Goal
Upload screenshots of Division 2 items (taken on PS5, synced to phone via the PlayStation App) and get a verdict per item: **Keep**, **Library**, **Expertise** or **Deconstruct**.

## Platform
- TypeScript web app with a database, hosted on the user's VPS, mobile-first UI.
- Login required (public VPS).

## Screenshot reading
- Done in code, no AI (`src/lib/ocr/`): `sharp` image work → `tesseract.js` OCR → parser with fuzzy matching against the game data.
- Only full-screen 16:9 console captures are read automatically (the item card sits at a fixed spot). Anything else (e.g. phone photos of the TV) gets an empty review form to fill in by hand.
- Pipeline:
  1. Crop the card; read the header (name, brand) in greyscale.
  2. Body: colour mask keeps white text and saturated orange values; mostly-orange rows are a highlighted row (dark text). Long horizontal runs (stat bars) are blanked.
  3. Text rows are found by horizontal ink bands and each is read as one line (tesseract's own layout analysis splits values from names).
  4. Each value box is re-read 16 ways (2 scales × 4 orange tests × 2 page modes, digits-only). The parser votes: impossible values (above the stat's max) don't count, a lost decimal point is put back (value ÷ 10 when it's impossible for the stat, or over 100% for an unknown stat), ties go to readings that kept the decimal point.
  5. No clear majority → the value is flagged and highlighted in the review form; the verdict is marked provisional.
  6. Talent row (dim grey) is re-read with local contrast at 3 offsets; the most common reading wins. On the Tinkering screen the selected talent row is highlighted (dark text on orange) and is read without inverting.
  7. Rarity from header colour (red exotic, teal gear set, yellow name text = named) and the "Brand Set"/"Gear Set" footer.
  8. Rows the colour mask reads nothing from (greyed-out exotic stats on the Tinkering screen) are found with a local-contrast mask (brighter than the surroundings) and read from an upscaled greyscale crop. Their values are always flagged.
  9. Values without a clear, complete majority (non-zero, read with its decimal point at least once) get 16 more readings from local-contrast masks and the brightest colour channel as greyscale. Pale orange values at small sizes need these.
  10. Gear core: the yellow Skill Tier battery icon in the header means Skill Tier +1.0 (the only value it rolls), so that row isn't read at all.
- Accuracy on the 7 PS5 sample captures (each also tested after a JPEG re-save): all names, brands, rarities and talents right; 15/16 values right, and the one misread is flagged.
- Tinkering-screen captures (SOCOM Mk16, Vile, Fafnir; full 4K, each also re-saved): all names, rarities and non-exotic talents right; every value right or flagged. SOCOM and Vile have nothing flagged. On the Fafnir the greyed-out exotic core values are always flagged and Damage to Armor can't be read (the user types it in). Exotic talents aren't in the talent list, so they come through as read ("Toxic Delivery Rp"); the verdict ignores them.
- Name and stat clean-up: misread digits in model numbers are restored ("Mk1e" -> "Mk16"); a garbled weapon core name is replaced with the only stat that slot can hold for the class; unrecognised minor rows under 6 letters are dropped as junk.
- Uploads that are already upright JPEG/PNG are stored byte-for-byte: re-encoding shifts pixels enough to hurt OCR.
- Fallback if OCR proves unreliable: Anthropic API or an MCP (decide with the user first).

### Tooltip layout (from samples)
- Header: item name, brand/gear-set name (2nd line), core stat + value. Header colour: red = exotic, gold = named/high-end (named has yellow name text), orange = brand, teal = gear set. Header icons: ✓ equipped, bin = marked junk, ★ favourite.
- Section anchors: "Core Attribute(s)", "Attributes", "Talents", "Sockets", footer "<Name> Gear Set (n/4)" / "<Name> Brand Set (n/3)".
- Value comes before the name: `+15.0% Shotgun Damage`, `+79,802 Armor`, `+3,445HP/s Armor Regen`, `+1.0 Skill Tier`.
- In-game wording: "DMG to target out of cover", "Health Damage", "Damage to Armor", "Armor Regen".
- Stat bar fill is **not** value ÷ max (checked on the PS5 captures: 6.6/15 and 8.3/12 draw near-identical bars). It probably shows the roll within an unknown min–max range, so it isn't used. The highlighted (orange) row hides its bar.
- Phone photos need deskew/perspective fix, tint and moiré cleanup; not supported for automatic reading.

## User profile (editable forms)
- **Recalibration library:** current max value per attribute and talent.
- **Exotics owned:** which exotics the user already has one of.
- **Expertise:** Proficiency Rank (0–10) per item *type* (weapon model, brand, gear set, named, exotic). Rank 10 = Proficient = maxed. Also the account-wide Expertise Level (cap 30).

## Verdict order (first match wins)
1. **Keep:** god roll (every attribute at ≥95% of its max roll) **or** talent is S or A tier (see `talents.md`) **and that talent isn't already unlocked in the user's library**.
2. **Library:** any attribute value beats the user's current library max, or the talent isn't unlocked yet.
3. **Expertise:** the item's type isn't at Proficiency Rank 10 yet, so donate it for proficiency.
4. **Deconstruct:** none of the above.

### Exotics
- Skip the library check (exotics can't be extracted).
- Keep one copy of each exotic. The profile tracks which exotics the user owns; a duplicate goes on to Expertise, then Deconstruct.

### Sample check (phone photos, 2026-10-09)
User agreed: Lexington (named AR, 100/100/100) = Keep, Vile (exotic mask, 96/96) = Keep, Fafnir (exotic) = Keep. The other 7 should land on Library or Expertise depending on profile, else Deconstruct.

## Game data
- Talents and tiers: `docs/talents.md` (JSON block at the end seeds the DB).
- Attribute max rolls: `docs/attributes.md` (JSON block seeds the DB, with OCR aliases).
- Item names: `docs/items.md` (874 entries: weapons by class and rarity, brands, gear sets, every brand/gear-set piece by slot, named and exotic gear). The OCR'd header name is matched against it (`src/lib/items.ts`, OCR lookalikes like o/0, l/1, e/6 folded together), which corrects the name and supplies weapon class, gear slot, rarity and brand. The review form suggests these names too.
- Prototype items are out of scope (user decision, 2026-10-09): only normal max values are used. If a scanned item is detected as Prototype, flag it as unsupported rather than scoring it.
- Named "perfect" attributes exceed normal max: leave them out of god-roll maths.
- Item Grade (Expertise upgrades) doesn't change rolled attributes, so comparisons ignore it.

## Pending
- Nothing outstanding for OCR. Sample captures live in `samples/ps5/` (git-ignored); the test suite reads all 10.
