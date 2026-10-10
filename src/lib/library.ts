import {
  ATTRIBUTES,
  type AttributeCategory,
  type GearSlot,
  TALENTS,
  type TalentDef,
  type WeaponClass,
} from "@/lib/game";
import type { Profile, ScannedItem } from "@/lib/verdict";

/**
 * The recalibration library is kept per weapon class and per gear slot, as on the
 * in-game Library > Overview screen. Each one is a "group".
 */
export interface LibraryGroup {
  /** URL slug, e.g. "holsters". */
  id: string;
  /** Prefix for stored keys, e.g. "gear:Holster". */
  key: string;
  kind: "weapon" | "gear";
  title: string;
  weaponClass?: WeaponClass;
  gearSlot?: GearSlot;
}

const weapon = (id: string, title: string, weaponClass: WeaponClass): LibraryGroup => ({
  id, title, weaponClass, kind: "weapon", key: `weapon:${weaponClass}`,
});
const gear = (id: string, title: string, gearSlot: GearSlot): LibraryGroup => ({
  id, title, gearSlot, kind: "gear", key: `gear:${gearSlot}`,
});

// Same order as the game's overview screen.
export const WEAPON_GROUPS: LibraryGroup[] = [
  weapon("rifles", "Rifles", "Rifle"),
  weapon("assault-rifles", "Assault Rifles", "Assault Rifle"),
  weapon("marksman-rifles", "Marksman Rifles", "Marksman Rifle"),
  weapon("shotguns", "Shotguns", "Shotgun"),
  weapon("smgs", "SMGs", "SMG"),
  weapon("lmgs", "LMGs", "LMG"),
  weapon("pistols", "Pistols", "Pistol"),
];
export const GEAR_GROUPS: LibraryGroup[] = [
  gear("masks", "Masks", "Mask"),
  gear("body-armor", "Body Armor", "Chest"),
  gear("backpacks", "Backpacks", "Backpack"),
  gear("gloves", "Gloves", "Gloves"),
  gear("holsters", "Holsters", "Holster"),
  gear("kneepads", "Kneepads", "Kneepads"),
];
export const LIBRARY_GROUPS = [...WEAPON_GROUPS, ...GEAR_GROUPS];

export function groupById(id: string): LibraryGroup | undefined {
  return LIBRARY_GROUPS.find((g) => g.id === id);
}

/** The library an item's stats go into, or undefined if its class/slot isn't known. */
export function groupForItem(item: Pick<ScannedItem, "kind" | "weaponClass" | "gearSlot">): LibraryGroup | undefined {
  return item.kind === "weapon"
    ? WEAPON_GROUPS.find((g) => g.weaponClass === item.weaponClass)
    : GEAR_GROUPS.find((g) => g.gearSlot === item.gearSlot);
}

/** Stored key for an attribute or talent in a group: "gear:Holster:Critical Hit Chance". */
export const entryKey = (group: LibraryGroup, name: string) => `${group.key}:${name}`;

/** Which attribute categories a group's library holds (weapon cores can't be recalibrated). */
export function libraryCategory(category: AttributeCategory, kind: "weapon" | "gear"): boolean {
  return kind === "gear" ? category === "gear-core" || category === "gear-minor" : category === "weapon-minor";
}

const RESTRICTION_CLASSES: Record<string, WeaponClass> = {
  AR: "Assault Rifle",
  Rifle: "Rifle",
  MMR: "Marksman Rifle",
  SMG: "SMG",
  LMG: "LMG",
  Shotgun: "Shotgun",
  Pistol: "Pistol",
};

/** Whether a weapon talent can roll on a weapon class ("Rifle,MMR" -> rifles and marksman rifles). */
export function talentFitsClass(talent: TalentDef, weaponClass: WeaponClass): boolean {
  if (talent.restriction === "Any" || talent.restriction === "None") return true;
  return talent.restriction.split(",").some((r) => RESTRICTION_CLASSES[r.trim()] === weaponClass);
}

/** The talents a group's library can hold. */
export function groupTalents(group: LibraryGroup): TalentDef[] {
  if (group.kind === "weapon") {
    return TALENTS.filter((t) => t.slot === "weapon" && talentFitsClass(t, group.weaponClass!));
  }
  if (group.gearSlot === "Chest") return TALENTS.filter((t) => t.slot === "chest");
  if (group.gearSlot === "Backpack") return TALENTS.filter((t) => t.slot === "backpack");
  return [];
}

export interface LibraryAttribute {
  key: string;
  name: string;
  max: number;
  unit: "%" | "flat";
}

export interface LibraryTalent extends TalentDef {
  key: string;
}

export type LibrarySection =
  | { id: string; title: string; kind: "attributes"; attributes: LibraryAttribute[] }
  | { id: string; title: string; kind: "talents"; talents: LibraryTalent[] };

function attrs(group: LibraryGroup, category: AttributeCategory): LibraryAttribute[] {
  return ATTRIBUTES.filter((a) => a.category === category).map((a) => ({
    key: entryKey(group, a.name),
    name: a.name,
    max: a.max,
    unit: a.unit,
  }));
}

/** What one group's library holds, grouped as in game. */
export function librarySections(group: LibraryGroup): LibrarySection[] {
  const talents = groupTalents(group).map((t) => ({ ...t, key: entryKey(group, t.name) }));
  const sections: LibrarySection[] =
    group.kind === "gear"
      ? [
          { id: "core", title: "Core attributes", kind: "attributes", attributes: attrs(group, "gear-core") },
          { id: "attributes", title: "Attributes", kind: "attributes", attributes: attrs(group, "gear-minor") },
        ]
      : [{ id: "attributes", title: "Attributes", kind: "attributes", attributes: attrs(group, "weapon-minor") }];
  if (talents.length) sections.push({ id: "talents", title: "Talents", kind: "talents", talents });
  return sections;
}

/** Every attribute and talent key in a group (or one section of it). */
export function groupContents(group: LibraryGroup, sectionId?: string) {
  const sections = librarySections(group).filter((s) => !sectionId || s.id === sectionId);
  return {
    attributes: sections.flatMap((s) => (s.kind === "attributes" ? s.attributes : [])),
    talents: sections.flatMap((s) => (s.kind === "talents" ? s.talents.map((t) => t.key) : [])),
  };
}

export function isMaxed(profile: Profile, a: LibraryAttribute): boolean {
  return (profile.libraryAttributes[a.key] ?? 0) >= a.max;
}

/** Progress shown on a group's tile: attributes maxed, talents unlocked. */
export function groupProgress(group: LibraryGroup, profile: Profile) {
  const { attributes, talents } = groupContents(group);
  const unlocked = new Set(profile.libraryTalents);
  const p = {
    attributesMaxed: attributes.filter((a) => isMaxed(profile, a)).length,
    attributesTotal: attributes.length,
    talentsUnlocked: talents.filter((k) => unlocked.has(k)).length,
    talentsTotal: talents.length,
  };
  return { ...p, complete: p.attributesMaxed === p.attributesTotal && p.talentsUnlocked === p.talentsTotal };
}
