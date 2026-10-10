import attributesJson from "@/data/attributes.json";
import talentsJson from "@/data/talents.json";

export const WEAPON_CLASSES = [
  "Assault Rifle",
  "LMG",
  "SMG",
  "Shotgun",
  "Rifle",
  "Marksman Rifle",
  "Pistol",
] as const;
export type WeaponClass = (typeof WEAPON_CLASSES)[number];

export const GEAR_SLOTS = ["Mask", "Chest", "Holster", "Backpack", "Gloves", "Kneepads"] as const;
export type GearSlot = (typeof GEAR_SLOTS)[number];

export const RARITIES = ["exotic", "named", "high-end", "brand", "gear-set"] as const;
export type Rarity = (typeof RARITIES)[number];

export type AttributeCategory =
  | "gear-core"
  | "gear-minor"
  | "gear-mod"
  | "weapon-core"
  | "weapon-secondary"
  | "weapon-minor";

export interface AttributeDef {
  name: string;
  category: AttributeCategory;
  color: "red" | "blue" | "yellow" | null;
  appliesTo: string[];
  max: number;
  unit: "%" | "flat";
  aliases: string[];
}

export type Tier = "S" | "A" | "B" | "C" | "D";

export interface TalentDef {
  name: string;
  slot: "weapon" | "chest" | "backpack";
  restriction: string;
  tier: Tier;
}

export const ATTRIBUTES = attributesJson as AttributeDef[];
export const TALENTS = talentsJson as TalentDef[];

/** Lowercase, unify common in-game abbreviations/spellings, strip everything but letters. */
export function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\bdmg\b/g, "damage")
    .replace(/armour/g, "armor")
    .replace(/\btargets\b/g, "target")
    .replace(/\bcrit\b/g, "critical")
    .replace(/[^a-z]/g, "");
}

function namesOf(def: { name: string; aliases?: string[] }): string[] {
  return [def.name, ...(def.aliases ?? [])].map(normalizeName);
}

/** Levenshtein distance, used to tolerate OCR typos. */
export function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/**
 * Best fuzzy match of `raw` against candidates. Allows roughly one typo per
 * five letters, which covers typical OCR slips ("Crit1cal Hit Chanse").
 */
export function bestMatch<T extends { name: string; aliases?: string[] }>(
  raw: string,
  candidates: readonly T[],
): T | undefined {
  const target = normalizeName(raw);
  if (!target) return undefined;
  let best: T | undefined;
  let bestScore = Infinity;
  for (const c of candidates) {
    for (const n of namesOf(c)) {
      const d = editDistance(target, n);
      if (d < bestScore) {
        bestScore = d;
        best = c;
      }
    }
  }
  return best && bestScore <= Math.max(1, Math.floor(target.length / 5)) ? best : undefined;
}

export function attributesIn(category: AttributeCategory, appliesTo?: string): AttributeDef[] {
  return ATTRIBUTES.filter(
    (a) => a.category === category && (!appliesTo || a.appliesTo.includes(appliesTo)),
  );
}

export function findAttribute(
  category: AttributeCategory,
  raw: string,
  appliesTo?: string,
): AttributeDef | undefined {
  return bestMatch(raw, attributesIn(category, appliesTo));
}

export function findTalent(raw: string): TalentDef | undefined {
  return bestMatch(raw, TALENTS);
}

/** "Assault Rifle Damage" -> "Assault Rifle". */
export function weaponClassFromCore(coreName: string): WeaponClass | undefined {
  const def = findAttribute("weapon-core", coreName);
  return def?.appliesTo[0] as WeaponClass | undefined;
}

