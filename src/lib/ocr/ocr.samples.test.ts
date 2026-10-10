import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, describe, expect, it } from "vitest";
import type { ScannedItem } from "@/lib/verdict";
import { readItemScreenshot } from "./ocr";

// Real PS5 captures live in samples/ (git-ignored), so this suite only runs locally.
const DIR = join(process.cwd(), "samples", "ps5");

type Expected = Pick<ScannedItem, "kind" | "rarity" | "name" | "core" | "attributes"> &
  Partial<Pick<ScannedItem, "brand" | "weaponClass" | "talent">>;

const expected: Record<string, Expected> = {
  "1000027284.jpg": {
    kind: "weapon", rarity: "named", name: "Lexington", weaponClass: "Assault Rifle",
    core: [{ name: "Assault Rifle Damage", value: 15 }, { name: "Health Damage", value: 21 }],
    attributes: [{ name: "Damage to Targets Out of Cover", value: 10 }],
    talent: "Eyeless",
  },
  "1000027287.jpg": {
    kind: "gear", rarity: "gear-set", name: "Loadout Frame", brand: "Ongoing Directive",
    core: [{ name: "Weapon Damage", value: 11.4 }],
    attributes: [{ name: "Status Effects", value: 10 }],
    talent: "Trauma Specialist",
  },
  "1000027289.jpg": {
    kind: "gear", rarity: "gear-set", name: "Training Mask", brand: "Core Strength",
    core: [{ name: "Armor", value: 79802 }],
    attributes: [{ name: "Status Effects", value: 6.9 }],
  },
  "1000027290.jpg": {
    kind: "gear", rarity: "gear-set", name: "Mirror Gloves", brand: "Negotiator's Dilemma",
    core: [{ name: "Weapon Damage", value: 8.8 }],
    attributes: [{ name: "Headshot Damage", value: 5.9 }],
  },
  "1000027291.jpg": {
    kind: "gear", rarity: "brand", name: "Uncontested Holster", brand: "Unit Alloys",
    core: [{ name: "Weapon Damage", value: 10.9 }],
    attributes: [{ name: "Armor Regen", value: 3445 }, { name: "Skill Haste", value: 9.3 }],
  },
  "1000027292.jpg": {
    kind: "gear", rarity: "gear-set", name: "Leg Day Kneepads", brand: "Core Strength",
    core: [{ name: "Weapon Damage", value: 6.6 }],
    attributes: [{ name: "Critical Hit Damage", value: 8.3 }],
  },
  "1000027293.jpg": {
    kind: "gear", rarity: "gear-set", name: "Leg Day Kneepads", brand: "Core Strength",
    core: [{ name: "Weapon Damage", value: 8 }],
    attributes: [{ name: "Hazard Protection", value: 8.6 }],
  },
  // Tinkering screen: highlighted talent row, recalibration panel on the right.
  // These three are 2000x1125 re-encodes (sent via chat), not the original PS5 files.
  // The game font's small "k" reads as "K".
  "socom-mk16.jpg": {
    kind: "weapon", rarity: "high-end", name: "SOCOM Mk16", weaponClass: "Assault Rifle",
    core: [{ name: "Assault Rifle Damage", value: 8.7 }, { name: "Health Damage", value: 11 }],
    attributes: [{ name: "Critical Hit Damage", value: 6 }],
    talent: "Ranger",
  },
  "vile.jpg": {
    kind: "gear", rarity: "exotic", name: "Vile",
    core: [{ name: "Skill Tier", value: 1 }],
    attributes: [{ name: "Status Effects", value: 9.6 }, { name: "Hazard Protection", value: 9.6 }],
  },
  // Exotic core rows are greyed out (they can't be recalibrated), so their values are always flagged.
  "fafnir.jpg": {
    kind: "weapon", rarity: "exotic", name: "Fafnir", weaponClass: "Shotgun",
    core: [{ name: "Shotgun Damage", value: 15 }, { name: "Damage to Armor", value: 11 }],
    attributes: [{ name: "Rate of Fire", value: 4 }],
  },
};

// OCR_ONLY=<part of a file name> runs just the matching captures.
const present = Object.keys(expected).filter((f) => !process.env.OCR_ONLY || f.includes(process.env.OCR_ONLY)).filter((f) => existsSync(join(DIR, f)));
const debug: string[] = [];

describe.skipIf(present.length === 0)("OCR on PS5 captures", () => {
  afterAll(() => {
    if (process.env.OCR_DEBUG) console.log(debug.join("\n"));
  });

  // Each capture is also tried after a JPEG re-save, so OCR isn't tuned to one exact set of pixels.
  const cases = present.flatMap((file) => [
    { file, label: "original", load: async () => readFileSync(join(DIR, file)) },
    { file, label: "re-saved", load: () => sharp(readFileSync(join(DIR, file))).jpeg({ quality: 90 }).toBuffer() },
  ]);
  for (const { file, label, load } of cases) {
    it(`reads ${file} (${expected[file].name}, ${label})`, async () => {
      const { item, text } = await readItemScreenshot(await load());
      debug.push(`== ${file}`, JSON.stringify(text, null, 1), JSON.stringify(item));
      const want = expected[file];
      // A value must be right, or flagged as uncertain so the user is asked to check it.
      // What must never happen is a wrong value presented as certain.
      const check = (got: ScannedItem["core"], exp: ScannedItem["core"]) =>
        got.map((a, i) => ({ name: a.name, value: a.uncertain && a.value !== exp[i]?.value ? exp[i]?.value : a.value }));
      expect({
        // Names are matched case-insensitively downstream, and the small "k" can read as "K".
        kind: item.kind, rarity: item.rarity, name: item.name.toLowerCase(), brand: item.brand,
        weaponClass: item.weaponClass, core: check(item.core, want.core),
        attributes: check(item.attributes, want.attributes),
        // Exotic talents aren't in the talent list (the verdict ignores them), so they're read as-is.
        talent: want.rarity === "exotic" ? undefined : item.talent,
      }).toEqual({
        brand: undefined, weaponClass: undefined, talent: undefined, ...want, name: want.name.toLowerCase(),
      });
    });
  }
});
