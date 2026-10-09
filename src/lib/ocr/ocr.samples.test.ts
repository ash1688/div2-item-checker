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
};

const present = Object.keys(expected).filter((f) => existsSync(join(DIR, f)));
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
        kind: item.kind, rarity: item.rarity, name: item.name, brand: item.brand,
        weaponClass: item.weaponClass, core: check(item.core, want.core),
        attributes: check(item.attributes, want.attributes), talent: item.talent,
      }).toEqual({
        brand: undefined, weaponClass: undefined, talent: undefined, ...want,
      });
    });
  }
});
