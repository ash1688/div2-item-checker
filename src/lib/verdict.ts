import {
  type AttributeCategory,
  type AttributeDef,
  type GearSlot,
  type Rarity,
  type TalentDef,
  type WeaponClass,
  findAttribute,
  findTalent,
  libraryKey,
  libraryScope,
  normalizeName,
} from "@/lib/game";

export const GOD_ROLL_THRESHOLD = 0.95;
export const MAX_PROFICIENCY_RANK = 10;
/** Rolls this far above max are named-item "perfect" values, not normal rolls. */
const PERFECT_TOLERANCE = 1.02;

export interface ItemAttribute {
  name: string;
  value: number;
}

export interface ScannedItem {
  kind: "weapon" | "gear";
  rarity: Rarity;
  /** Item name as shown in the header, e.g. "SOCOM Mk16" or "Training Mask". */
  name: string;
  /** Brand or gear-set name for gear (second header line). */
  brand?: string;
  weaponClass?: WeaponClass;
  gearSlot?: GearSlot;
  /** Weapon: [class damage, class secondary]. Gear: [core]. */
  core: ItemAttribute[];
  attributes: ItemAttribute[];
  talent?: string;
  prototype?: boolean;
}

export interface Profile {
  /** libraryKey(scope, name) -> best value extracted so far. */
  libraryAttributes: Record<string, number>;
  /** Talent names unlocked in the library. */
  libraryTalents: string[];
  /** Proficiency type (weapon model, brand, gear set, named, exotic) -> rank 0-10. */
  proficiency: Record<string, number>;
  /** Exotic names the user already has a copy of. */
  exoticsOwned: string[];
}

export type Action = "keep" | "library" | "expertise" | "deconstruct" | "unsupported";

export interface Roll {
  name: string;
  value: number;
  max: number | null;
  /** value / max, or null when the attribute couldn't be identified. */
  pct: number | null;
  perfect: boolean;
}

export interface LibraryGain {
  kind: "attribute" | "talent";
  name: string;
  value?: number;
  current?: number;
}

export interface Verdict {
  action: Action;
  reasons: string[];
  /** Things worth knowing that didn't decide the verdict. */
  notes: string[];
  rolls: Roll[];
  libraryGains: LibraryGain[];
  proficiencyType: string;
  warnings: string[];
}

interface ResolvedAttribute extends Roll {
  def?: AttributeDef;
}

function resolve(item: ScannedItem): ResolvedAttribute[] {
  const lookups: { attr: ItemAttribute; category: AttributeCategory; appliesTo?: string }[] =
    item.kind === "weapon"
      ? [
          ...item.core.map((attr, i) => ({
            attr,
            category: (i === 0 ? "weapon-core" : "weapon-secondary") as AttributeCategory,
            appliesTo: item.weaponClass,
          })),
          ...item.attributes.map((attr) => ({ attr, category: "weapon-minor" as AttributeCategory })),
        ]
      : [
          ...item.core.map((attr) => ({ attr, category: "gear-core" as AttributeCategory })),
          ...item.attributes.map((attr) => ({ attr, category: "gear-minor" as AttributeCategory })),
        ];

  return lookups.map(({ attr, category, appliesTo }) => {
    const def = findAttribute(category, attr.name, appliesTo);
    const pct = def ? attr.value / def.max : null;
    return {
      name: def?.name ?? attr.name,
      value: attr.value,
      max: def?.max ?? null,
      pct,
      perfect: pct !== null && pct > PERFECT_TOLERANCE,
      def,
    };
  });
}

/** The proficiency bucket this item feeds: brand/set for gear, model for weapons. */
export function proficiencyType(item: ScannedItem): string {
  if (item.kind === "gear" && (item.rarity === "brand" || item.rarity === "gear-set") && item.brand) {
    return item.brand;
  }
  return item.name;
}

function lookupRank(profile: Profile, type: string): number | undefined {
  const target = normalizeName(type);
  for (const [name, rank] of Object.entries(profile.proficiency)) {
    if (normalizeName(name) === target) return rank;
  }
  return undefined;
}

function hasTalent(profile: Profile, talent: TalentDef): boolean {
  return profile.libraryTalents.some((t) => normalizeName(t) === normalizeName(talent.name));
}

function ownsExotic(profile: Profile, name: string): boolean {
  return profile.exoticsOwned.some((e) => normalizeName(e) === normalizeName(name));
}

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString("en-GB") : n.toFixed(1);
}

function pctText(r: Roll): string {
  return r.pct === null ? "?" : `${Math.round(r.pct * 100)}%`;
}

/**
 * Decide what to do with an item. First match wins:
 * Keep (first exotic copy / god roll / S-A talent not yet unlocked)
 * -> Library -> Expertise -> Deconstruct.
 */
export function judge(item: ScannedItem, profile: Profile): Verdict {
  const resolved = resolve(item);
  const rolls: Roll[] = resolved.map(({ def: _def, ...r }) => r);
  const warnings: string[] = [];
  const notes: string[] = [];
  const type = proficiencyType(item);
  const base = { rolls, proficiencyType: type, warnings, notes };

  for (const r of resolved) {
    if (!r.def) warnings.push(`Couldn't identify attribute "${r.name}"; check the spelling.`);
  }

  if (item.prototype) {
    return {
      ...base,
      action: "unsupported",
      reasons: ["Prototype items aren't supported."],
      libraryGains: [],
    };
  }

  const isExotic = item.rarity === "exotic";
  // Named and exotic talents are fixed ("perfect"/unique) and can't be extracted.
  const talentDef =
    item.talent && !isExotic && item.rarity !== "named" ? findTalent(item.talent) : undefined;
  if (item.talent && !isExotic && item.rarity !== "named" && !talentDef) {
    notes.push(`"${item.talent}" isn't a talent the library can store (e.g. a gear-set talent).`);
  }

  // Library gains (exotics can't be extracted, so they skip this entirely).
  const libraryGains: LibraryGain[] = [];
  if (!isExotic) {
    for (const r of resolved) {
      const scope = r.def && libraryScope(r.def.category);
      if (!r.def || !scope || r.perfect) continue;
      const current = profile.libraryAttributes[libraryKey(scope, r.def.name)] ?? 0;
      if (r.value > current) {
        libraryGains.push({ kind: "attribute", name: r.def.name, value: r.value, current });
      }
    }
    if (talentDef && !hasTalent(profile, talentDef)) {
      libraryGains.push({ kind: "talent", name: talentDef.name });
    }
  }

  const scored = resolved.filter((r) => r.pct !== null && !r.perfect);
  const allIdentified = resolved.every((r) => r.def);
  const godRoll =
    allIdentified && scored.length > 0 && scored.every((r) => r.pct! >= GOD_ROLL_THRESHOLD);
  const rollSummary = scored.map((r) => `${r.name} ${pctText(r)}`).join(", ");

  const rank = lookupRank(profile, type);
  const needsProficiency = rank === undefined || rank < MAX_PROFICIENCY_RANK;
  const expertiseReason =
    rank === undefined
      ? `${type} isn't in your proficiency list, so it's assumed below rank ${MAX_PROFICIENCY_RANK}.`
      : `${type} is proficiency rank ${rank}/${MAX_PROFICIENCY_RANK}.`;

  if (isExotic) {
    if (!ownsExotic(profile, item.name)) {
      return {
        ...base,
        action: "keep",
        reasons: [`First copy of the exotic ${item.name}: keep one in stock.`],
        libraryGains: [],
      };
    }
    if (godRoll) notes.push(`This copy is a god roll (${rollSummary}); swap it with yours if it's better.`);
    if (needsProficiency) {
      return {
        ...base,
        action: "expertise",
        reasons: [`You already own ${item.name}.`, expertiseReason],
        libraryGains: [],
      };
    }
    return {
      ...base,
      action: "deconstruct",
      reasons: [`You already own ${item.name} and it's proficiency rank ${MAX_PROFICIENCY_RANK}.`],
      libraryGains: [],
    };
  }

  if (godRoll) {
    return {
      ...base,
      action: "keep",
      reasons: [`God roll: every attribute is at least ${GOD_ROLL_THRESHOLD * 100}% of max (${rollSummary}).`],
      libraryGains,
    };
  }

  if (talentDef && (talentDef.tier === "S" || talentDef.tier === "A") && !hasTalent(profile, talentDef)) {
    return {
      ...base,
      action: "keep",
      reasons: [`${talentDef.tier}-tier talent ${talentDef.name}, which you haven't unlocked yet.`],
      libraryGains,
    };
  }

  if (libraryGains.length > 0) {
    return {
      ...base,
      action: "library",
      reasons: libraryGains.map((g) =>
        g.kind === "talent"
          ? `Unlocks talent ${g.name}.`
          : `${g.name} ${fmt(g.value!)} beats your library's ${fmt(g.current!)}.`,
      ),
      libraryGains,
    };
  }

  if (needsProficiency) {
    return { ...base, action: "expertise", reasons: [expertiseReason], libraryGains };
  }

  return {
    ...base,
    action: "deconstruct",
    reasons: ["No god roll, nothing new for your library, and its proficiency is maxed."],
    libraryGains,
  };
}
