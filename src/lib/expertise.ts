import type { GearSlot, Rarity, WeaponClass } from "@/lib/game";
import skillsJson from "@/data/skills.json";
import { ITEMS } from "@/lib/items";
import { keptKey, type Profile } from "@/lib/verdict";

export const MAX_RANK = 10;
export const MAX_EXPERTISE_LEVEL = 30;

/** One thing that has its own proficiency rank: a weapon model, named/exotic item, brand, gear set... */
export interface ExpertiseType {
  name: string;
  /** Sub-heading on the category page: "High-end", "Named", "Exotic"... */
  group: string;
}

/** A list of types with ranks, e.g. Rifles or Skills. Weapon classes and gear slots sit under a top card. */
export interface ExpertiseCategory {
  id: string;
  title: string;
  /** The top-level card this list sits under, when it isn't one itself. */
  parent?: "weapons" | "named-exotics";
  types: ExpertiseType[];
}

/** The four cards on the Expertise overview. */
export interface ExpertiseCard {
  id: string;
  title: string;
  /** The lists it contains: several tiles (weapons, named & exotics) or a single list (skills, brands). */
  categories: ExpertiseCategory[];
}

const RARITY_LABEL: Partial<Record<Rarity, string>> = { "high-end": "High-end", named: "Named", exotic: "Exotic" };
const RARITY_ORDER = ["High-end", "Named", "Exotic"];

const byName = (a: ExpertiseType, b: ExpertiseType) =>
  RARITY_ORDER.indexOf(a.group) - RARITY_ORDER.indexOf(b.group) || a.name.localeCompare(b.name);

function weapons(id: string, title: string, weaponClass: WeaponClass): ExpertiseCategory {
  const types = ITEMS.filter((i) => i.kind === "weapon" && i.weaponClass === weaponClass)
    .map((i) => ({ name: i.name, group: RARITY_LABEL[i.rarity!] ?? "Other" }))
    .sort(byName);
  return { id, title, parent: "weapons", types };
}

function gear(id: string, title: string, gearSlot: GearSlot): ExpertiseCategory {
  const types = ITEMS.filter(
    (i) => i.kind === "gear" && i.gearSlot === gearSlot && (i.rarity === "named" || i.rarity === "exotic"),
  )
    .map((i) => ({ name: i.name, group: RARITY_LABEL[i.rarity!] ?? "Other" }))
    .sort(byName);
  return { id, title, parent: "named-exotics", types };
}

// The six specializations' signature weapons each have a proficiency in game.
const SPECIALIZATIONS = ["Demolitionist", "Firewall", "Gunner", "Sharpshooter", "Survivalist", "Technician"];

export const EXPERTISE_CATEGORIES: ExpertiseCategory[] = [
  weapons("rifles", "Rifles", "Rifle"),
  weapons("assault-rifles", "Assault Rifles", "Assault Rifle"),
  weapons("marksman-rifles", "Marksman Rifles", "Marksman Rifle"),
  weapons("shotguns", "Shotguns", "Shotgun"),
  weapons("smgs", "SMGs", "SMG"),
  weapons("lmgs", "LMGs", "LMG"),
  weapons("pistols", "Pistols", "Pistol"),
  {
    id: "specialization",
    title: "Specialization",
    parent: "weapons",
    types: SPECIALIZATIONS.map((name) => ({ name, group: "Specialization" })),
  },
  gear("masks", "Masks", "Mask"),
  gear("body-armor", "Body Armor", "Chest"),
  gear("backpacks", "Backpacks", "Backpack"),
  gear("gloves", "Gloves", "Gloves"),
  gear("holsters", "Holsters", "Holster"),
  gear("kneepads", "Kneepads", "Kneepads"),
  {
    id: "skills",
    title: "Skills",
    types: (skillsJson as { name: string; skill: string }[]).map((s) => ({ name: s.name, group: s.skill })),
  },
  {
    id: "brands",
    title: "Brands",
    // Gear sets have proficiency too; they're listed under brands in their own group.
    types: [
      ...ITEMS.filter((i) => i.kind === "brand").map((i) => ({ name: i.name, group: "Brand Sets" })),
      ...ITEMS.filter((i) => i.kind === "gear-set").map((i) => ({ name: i.name, group: "Gear Sets" })),
    ].sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name)),
  },
];

export const EXPERTISE_CARDS: ExpertiseCard[] = [
  { id: "weapons", title: "Weapons", categories: EXPERTISE_CATEGORIES.filter((c) => c.parent === "weapons") },
  { id: "named-exotics", title: "Named & Exotics", categories: EXPERTISE_CATEGORIES.filter((c) => c.parent === "named-exotics") },
  { id: "skills", title: "Skills", categories: EXPERTISE_CATEGORIES.filter((c) => c.id === "skills") },
  { id: "brands", title: "Brands", categories: EXPERTISE_CATEGORIES.filter((c) => c.id === "brands") },
];

export function cardById(id: string): ExpertiseCard | undefined {
  return EXPERTISE_CARDS.find((c) => c.id === id);
}

/** Combined progress of everything under a top card. */
export function cardProgress(card: ExpertiseCard, profile: Profile) {
  const parts = card.categories.map((c) => categoryProgress(c, profile));
  const proficient = parts.reduce((n, p) => n + p.proficient, 0);
  const total = parts.reduce((n, p) => n + p.total, 0);
  return { proficient, total, complete: total > 0 && proficient === total };
}

export function categoryById(id: string): ExpertiseCategory | undefined {
  return EXPERTISE_CATEGORIES.find((c) => c.id === id);
}

/** Rank for a type, matched on letters and digits ("SOCOM MK16" = "SOCOM Mk16"). */
export function rankOf(profile: Profile, name: string): number {
  const target = keptKey(name);
  for (const [type, rank] of Object.entries(profile.proficiency)) {
    if (keptKey(type) === target) return rank;
  }
  return 0;
}

export function categoryProgress(category: ExpertiseCategory, profile: Profile) {
  const proficient = category.types.filter((t) => rankOf(profile, t.name) >= MAX_RANK).length;
  return { proficient, total: category.types.length, complete: category.types.length > 0 && proficient === category.types.length };
}

/** Proficiency entries that don't match any known item (typed in by hand before). */
export function otherTypes(profile: Profile): { name: string; rank: number }[] {
  const known = new Set(EXPERTISE_CATEGORIES.flatMap((c) => c.types.map((t) => keptKey(t.name))));
  return Object.entries(profile.proficiency)
    .filter(([name]) => !known.has(keptKey(name)))
    .map(([name, rank]) => ({ name, rank }));
}

/** The canonical name of a known type, or undefined. */
export function knownType(categoryId: string, name: string): string | undefined {
  return categoryById(categoryId)?.types.find((t) => keptKey(t.name) === keptKey(name))?.name;
}
