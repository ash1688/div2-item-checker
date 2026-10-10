import type { GearSlot, Rarity, WeaponClass } from "@/lib/game";
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

/** A tile on the Expertise overview, like the in-game "Select Category to Research" screen. */
export interface ExpertiseCategory {
  id: string;
  title: string;
  section: "Weapons" | "Named & Exotic Gear" | "Gear Sets & Brands";
  types: ExpertiseType[];
}

const RARITY_LABEL: Partial<Record<Rarity, string>> = { "high-end": "High-end", named: "Named", exotic: "Exotic" };
const RARITY_ORDER = ["High-end", "Named", "Exotic"];

const byName = (a: ExpertiseType, b: ExpertiseType) =>
  RARITY_ORDER.indexOf(a.group) - RARITY_ORDER.indexOf(b.group) || a.name.localeCompare(b.name);

function weapons(id: string, title: string, weaponClass: WeaponClass): ExpertiseCategory {
  const types = ITEMS.filter((i) => i.kind === "weapon" && i.weaponClass === weaponClass)
    .map((i) => ({ name: i.name, group: RARITY_LABEL[i.rarity!] ?? "Other" }))
    .sort(byName);
  return { id, title, section: "Weapons", types };
}

function gear(id: string, title: string, gearSlot: GearSlot): ExpertiseCategory {
  const types = ITEMS.filter(
    (i) => i.kind === "gear" && i.gearSlot === gearSlot && (i.rarity === "named" || i.rarity === "exotic"),
  )
    .map((i) => ({ name: i.name, group: RARITY_LABEL[i.rarity!] ?? "Other" }))
    .sort(byName);
  return { id, title, section: "Named & Exotic Gear", types };
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
    section: "Weapons",
    types: SPECIALIZATIONS.map((name) => ({ name, group: "Specialization" })),
  },
  gear("masks", "Masks", "Mask"),
  gear("body-armor", "Body Armor", "Chest"),
  gear("backpacks", "Backpacks", "Backpack"),
  gear("gloves", "Gloves", "Gloves"),
  gear("holsters", "Holsters", "Holster"),
  gear("kneepads", "Kneepads", "Kneepads"),
  {
    id: "brand-sets",
    title: "Brand Sets",
    section: "Gear Sets & Brands",
    types: ITEMS.filter((i) => i.kind === "brand").map((i) => ({ name: i.name, group: "Brand Set" })).sort(byName),
  },
  {
    id: "gear-sets",
    title: "Gear Sets",
    section: "Gear Sets & Brands",
    types: ITEMS.filter((i) => i.kind === "gear-set").map((i) => ({ name: i.name, group: "Gear Set" })).sort(byName),
  },
];

export const EXPERTISE_SECTIONS = ["Weapons", "Named & Exotic Gear", "Gear Sets & Brands"] as const;

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
  return { proficient, total: category.types.length, complete: proficient === category.types.length };
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
