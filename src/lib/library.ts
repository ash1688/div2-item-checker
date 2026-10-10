import { libraryAttributes, TALENTS, type TalentDef } from "@/lib/game";
import type { Profile } from "@/lib/verdict";

export type LibraryScope = "gear" | "weapon";
export const LIBRARY_SCOPES: LibraryScope[] = ["gear", "weapon"];

export interface LibraryAttribute {
  key: string;
  name: string;
  max: number;
  unit: "%" | "flat";
}

export type LibrarySection =
  | { id: string; title: string; kind: "attributes"; attributes: LibraryAttribute[] }
  | { id: string; title: string; kind: "talents"; talents: TalentDef[] };

const attrs = (scope: LibraryScope, category: string): LibraryAttribute[] =>
  libraryAttributes()
    .filter((a) => a.scope === scope && a.def.category === category)
    .map(({ key, def }) => ({ key, name: def.name, max: def.max, unit: def.unit }));

const talents = (slot: TalentDef["slot"]) => TALENTS.filter((t) => t.slot === slot);

/** What the recalibration library holds for gear or weapons, grouped as in game. */
export function librarySections(scope: LibraryScope): LibrarySection[] {
  if (scope === "gear") {
    return [
      { id: "core", title: "Core attributes", kind: "attributes", attributes: attrs("gear", "gear-core") },
      { id: "attributes", title: "Attributes", kind: "attributes", attributes: attrs("gear", "gear-minor") },
      { id: "chest", title: "Chest talents", kind: "talents", talents: talents("chest") },
      { id: "backpack", title: "Backpack talents", kind: "talents", talents: talents("backpack") },
    ];
  }
  // Weapon core attributes can't be recalibrated, so the library doesn't hold them.
  return [
    { id: "attributes", title: "Attributes", kind: "attributes", attributes: attrs("weapon", "weapon-minor") },
    { id: "talents", title: "Talents", kind: "talents", talents: talents("weapon") },
  ];
}

export const SCOPE_TITLE: Record<LibraryScope, string> = { gear: "Gear", weapon: "Weapons" };

/** Every attribute key and talent name in a scope (or one section of it). */
export function scopeContents(scope: LibraryScope, sectionId?: string) {
  const sections = librarySections(scope).filter((s) => !sectionId || s.id === sectionId);
  return {
    attributes: sections.flatMap((s) => (s.kind === "attributes" ? s.attributes : [])),
    talents: sections.flatMap((s) => (s.kind === "talents" ? s.talents.map((t) => t.name) : [])),
  };
}

export function isMaxed(profile: Profile, a: LibraryAttribute): boolean {
  return (profile.libraryAttributes[a.key] ?? 0) >= a.max;
}

/** Progress shown on a library card. */
export function scopeProgress(scope: LibraryScope, profile: Profile) {
  const { attributes, talents: names } = scopeContents(scope);
  const unlocked = new Set(profile.libraryTalents);
  return {
    attributesMaxed: attributes.filter((a) => isMaxed(profile, a)).length,
    attributesTotal: attributes.length,
    talentsUnlocked: names.filter((n) => unlocked.has(n)).length,
    talentsTotal: names.length,
  };
}
