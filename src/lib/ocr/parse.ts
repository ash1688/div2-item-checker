import {
  type AttributeCategory,
  attributesIn,
  editDistance,
  findAttribute,
  findTalent,
  normalizeName,
  type GearSlot,
  type Rarity,
  weaponClassFromCore,
} from "@/lib/game";
import type { ItemAttribute, ScannedItem } from "@/lib/verdict";

/** What the OCR step hands to the parser. */
export interface TooltipText {
  /** Header text box: item name, then brand/gear-set name for gear. */
  header: string[];
  /** Everything below the header, one entry per line. */
  body: string[];
  /** True when the header shows DMG/RPM/MAG (weapons only). */
  isWeapon: boolean;
  /** Rarity read from the header colour, if it could be told apart. */
  colourRarity?: "exotic" | "named" | "gear-set" | "other";
  /** Gear only: the header shows the yellow Skill Tier battery, so the core is Skill Tier +1.0. */
  skillTierIcon?: boolean;
}

// OCR letter/digit confusions inside numbers.
const DIGIT_FIXES: Record<string, string> = { O: "0", o: "0", D: "0", B: "8", S: "5", s: "5", l: "1", I: "1", "|": "1", Z: "2" };

export interface RawValue {
  value: number;
  hasDecimal: boolean;
  percent: boolean;
}

const VALUE = /[+4]?\s?([0-9OoDBSlI|Z][0-9OoDBSlI|Z.,]*)\s*(%|HP\/s|HPls|HP\/5)?/;

/** "+3,445HP/s" -> 3445, "+9.6%" -> 9.6. Handles common OCR slips. */
export function parseValue(token: string): RawValue | null {
  const m = token.match(VALUE);
  if (!m) return null;
  const digits = m[1].replace(/./g, (ch) => DIGIT_FIXES[ch] ?? ch);
  if (!/\d/.test(digits)) return null;
  // Thousands separators: "79,802" (sometimes read as "79.802").
  const isFlat = /HP/.test(m[2] ?? "") || /^\d{1,3}[.,]\d{3}$/.test(digits);
  // The game shows at most one decimal place; extra digits are a misread "%" ("11.4%" -> "11.47").
  const cleaned = isFlat ? digits.replace(/[.,]/g, "") : digits.replace(/,/g, ".").replace(/(\.\d)\d+$/, "$1");
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value)) return null;
  return { value, hasDecimal: !isFlat && cleaned.includes("."), percent: m[2] === "%" };
}

/**
 * An attribute line: "+9.6% Status Effects", or from the OCR vote
 * "{+9.6%|+9.8%|...} Status Effects" carrying every reading of the value.
 */
export function parseAttributeLine(line: string): { reads: string[]; name: string; faint?: boolean } | null {
  // The stat name runs up to the first non-letter; trailing OCR junk ("- oo a") is ignored.
  // A leading "~" marks a greyed-out row whose value should always be checked.
  const voted = line.match(/^(~?)\{([^}]*)\}\s+([A-Za-z][A-Za-z' ]{2,})/);
  if (voted) return { reads: voted[2].split("|"), name: voted[3].trim(), ...(voted[1] && { faint: true }) };
  const m = line.match(new RegExp(`(${VALUE.source})\\s+([A-Za-z][A-Za-z' ]{2,})`));
  if (!m || !parseValue(m[1])) return null;
  return { reads: [m[1]], name: m[m.length - 1].trim() };
}

/**
 * Pick the most common plausible value among the OCR readings. Readings that
 * are impossible for the stat (above its max) don't vote. Uncertain when no
 * value has a clear majority, so the review form asks the user to check it.
 */
export function voteValue(
  reads: string[],
  category: AttributeCategory,
  name: string,
  appliesTo?: string,
): { value: number; uncertain: boolean } | null {
  const def = findAttribute(category, name, appliesTo);
  const tally = new Map<number, { votes: number; decimals: number }>();
  let total = 0;
  for (const r of reads) {
    const p = parseValue(r);
    if (!p) continue;
    const v = fixDecimal(p.value, p.hasDecimal, p.percent, category, name, appliesTo);
    if (v <= 0 || (def && v > def.max * 1.05)) continue;
    const t = tally.get(v) ?? { votes: 0, decimals: 0 };
    t.votes++;
    if (p.hasDecimal) t.decimals++;
    tally.set(v, t);
    total++;
  }
  // Ties go to the reading seen with a decimal point more often: OCR drops the
  // point (15.0 -> 10) far more often than it invents one.
  const [best] = [...tally.entries()].sort((a, b) => b[1].votes - a[1].votes || b[1].decimals - a[1].decimals);
  if (!best) return null;
  return { value: best[0], uncertain: best[1].votes <= total / 2 };
}

/**
 * A lost decimal point turns 10.9% into 109%. Put the point back when the value
 * is impossible for that attribute but value/10 fits, or, for an unrecognised
 * attribute, when it's over 100%. (MMR headshot damage really can exceed 100%.)
 */
export function fixDecimal(
  value: number,
  hasDecimal: boolean,
  percent: boolean,
  category: AttributeCategory,
  name: string,
  appliesTo?: string,
): number {
  if (hasDecimal) return value;
  const def = findAttribute(category, name, appliesTo);
  if (!def) return percent && value > 100 ? value / 10 : value;
  if (def.unit !== "%") return value;
  return value > def.max * 1.05 && value / 10 <= def.max * 1.05 ? value / 10 : value;
}

const SECTION = {
  core: ["coreattribute", "coreattributes"],
  attributes: ["attributes"],
  talents: ["talents", "talent"],
  sockets: ["sockets"],
};

export function sectionOf(line: string): keyof typeof SECTION | null {
  const n = normalizeName(line);
  // Allow a misread letter or two in the longer headers ("Taients", "Autributes").
  const near = (s: string) =>
    (n.length >= 6 && s.startsWith(n.slice(0, 4)) && Math.abs(n.length - s.length) <= 2) ||
    (s.length >= 7 && editDistance(n, s) <= 1);
  for (const [key, names] of Object.entries(SECTION) as [keyof typeof SECTION, string[]][]) {
    if (names.some((s) => n === s || near(s))) {
      return key;
    }
  }
  return null;
}

/** Keep the readable words of a noisy OCR line ("| yc iii Lexington 40" -> "Lexington"). */
// Letters OCR confuses with digits once a model number has started ("Mk1e" -> "Mk16").
const MODEL_DIGIT_FIXES: Record<string, string> = { e: "6", G: "6", b: "6", o: "0", O: "0", l: "1", I: "1", S: "5", B: "8", Z: "2" };

/** In a model number like "Mk16", letters straight after the first digit are misread digits. */
export function fixModelNumber(word: string): string {
  return word.replace(/(\d)([A-Za-z]+)$/, (_, d: string, tail: string) =>
    [...tail].every((ch) => MODEL_DIGIT_FIXES[ch]) ? d + [...tail].map((ch) => MODEL_DIGIT_FIXES[ch]).join("") : d + tail,
  );
}

export function cleanWords(line: string): string {
  return line
    .split(/\s+/)
    // Digits after letters stay ("Mk16"); a lone number ("40") is stripped as leading junk.
    .map((w) => fixModelNumber(w.replace(/^[^A-Za-z]+|[^A-Za-z0-9'’]+$/g, "")))
    .filter((w) => w.length >= 2 && /^[A-Z]/.test(w) && w !== "LEVEL")
    .join(" ")
    .replace(/’/g, "'");
}

function footer(body: string[]): { brand: string; kind: "brand" | "gear-set" } | null {
  // The footer sometimes wraps, so also try the body joined into one line.
  for (const line of [...body, body.join(" ")]) {
    const m = line.match(/([A-Z][A-Za-z' ]+?)\s+(Brand|Gear)\s+Set\b/);
    if (m) return { brand: cleanWords(m[1]), kind: m[2] === "Brand" ? "brand" : "gear-set" };
  }
  return null;
}

const SLOT_WORDS: [RegExp, GearSlot][] = [
  [/mask|respirator|goggles|balaclava/i, "Mask"],
  [/vest|chest|plate carrier|jacket/i, "Chest"],
  [/holster|pouch/i, "Holster"],
  [/backpack|pack|frame|bag|satchel/i, "Backpack"],
  [/gloves?|mitts|grips/i, "Gloves"],
  [/kneepads?|pads|leggings|knee/i, "Kneepads"],
];

/** Best guess at the gear slot from the item name ("Leg Day Kneepads" -> Kneepads). */
export function gearSlotFromName(name: string): GearSlot | undefined {
  return SLOT_WORDS.find(([re]) => re.test(name))?.[1];
}

/** Turn OCR text into a draft item for the review form. Anything unsure is left for the user. */
export function parseTooltip(t: TooltipText): ScannedItem {
  const kind = t.isWeapon ? "weapon" : "gear";
  const headerLines = t.header.map(cleanWords).filter(Boolean);
  const set = footer(t.body);

  let section: keyof typeof SECTION | null = null;
  const rawRows: { section: keyof typeof SECTION | null; reads: string[]; name: string; faint?: boolean }[] = [];
  const talentLines: string[] = [];
  for (const line of t.body) {
    const s = sectionOf(line);
    if (s) {
      section = s;
      continue;
    }
    if (section === "talents") {
      const words = cleanWords(line);
      if (words) talentLines.push(words);
      continue;
    }
    if (section === "sockets") continue;
    const attr = parseAttributeLine(line);
    if (attr) rawRows.push({ section, ...attr });
  }

  // The talent row is read several times: the most common reading wins (ties: longest),
  // then it is matched to a known library talent if possible.
  const tally = new Map<string, number>();
  for (const l of talentLines) tally.set(l, (tally.get(l) ?? 0) + 1);
  const topLine = [...tally.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0]?.[0];
  const talent = topLine ? (findTalent(topLine)?.name ?? topLine) : undefined;

  // Core vs minor: trust the section headers when found, else weapons have 2 core lines and gear 1.
  const coreCount = kind === "weapon" ? 2 : 1;
  const sawAttributesHeader = rawRows.some((r) => r.section === "attributes");
  const isCore = (r: (typeof rawRows)[number], i: number) =>
    sawAttributesHeader ? r.section !== "attributes" : i < coreCount;

  const coreRows = rawRows.filter(isCore);
  const minorRows = rawRows.filter((r, i) => !isCore(r, i));
  const weaponClass = kind === "weapon" && coreRows[0] ? weaponClassFromCore(coreRows[0].name) : undefined;

  const toAttribute = (r: (typeof rawRows)[number], category: AttributeCategory, appliesTo?: string): ItemAttribute => {
    // A weapon's core stats are fixed by its class (e.g. shotgun: Shotgun Damage, then
    // Damage to Armor), so a garbled core name ("Om") is replaced with the only option.
    const only = appliesTo && category.startsWith("weapon-") ? attributesIn(category, appliesTo) : [];
    const def = findAttribute(category, r.name, appliesTo) ?? (only.length === 1 ? only[0] : undefined);
    if (def && def.name !== r.name && !findAttribute(category, r.name, appliesTo)) r = { ...r, name: def.name };
    const voted = voteValue(r.reads, category, r.name, appliesTo);
    // Nothing plausible was read: leave the value at 0 and flag it for the user.
    return {
      name: def?.name ?? r.name,
      value: voted?.value ?? 0,
      ...((!voted || voted.uncertain || r.faint) && { uncertain: true }),
    };
  };
  const readCore = coreRows.map((r, i) =>
    toAttribute(
      r,
      kind === "gear" ? "gear-core" : i === 0 ? "weapon-core" : "weapon-secondary",
      kind === "weapon" ? weaponClass : undefined,
    ),
  );
  // Skill Tier only ever rolls +1.0, and its icon is easier to spot than its (often dim) row is to read.
  const core = kind === "gear" && t.skillTierIcon ? [{ name: "Skill Tier", value: 1 }] : readCore;
  const minorCategory = kind === "gear" ? "gear-minor" : "weapon-minor";
  const attributes = minorRows
    // An unrecognised row with barely any letters ("To TL") is OCR junk, not a stat.
    .filter((r) => findAttribute(minorCategory, r.name) || r.name.replace(/[^A-Za-z]/g, "").length >= 6)
    .map((r) => toAttribute(r, minorCategory));

  const name = headerLines[0] ?? "";
  let rarity: Rarity;
  if (t.colourRarity === "exotic") rarity = "exotic";
  else if (t.colourRarity === "named") rarity = "named";
  else if (t.colourRarity === "gear-set") rarity = "gear-set";
  else if (set) rarity = set.kind;
  else rarity = kind === "weapon" ? "high-end" : "brand";

  return {
    kind,
    rarity,
    name,
    gearSlot: kind === "gear" ? gearSlotFromName(name) : undefined,
    // The header reads far more reliably than the footer, so prefer it for the brand.
    brand: kind === "gear" ? (headerLines[1] ?? set?.brand) : undefined,
    weaponClass,
    core,
    attributes,
    talent,
  };
}
