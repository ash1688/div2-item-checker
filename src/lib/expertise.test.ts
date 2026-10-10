import { describe, expect, it } from "vitest";
import { categoryById, categoryProgress, EXPERTISE_CATEGORIES, knownType, otherTypes, rankOf } from "@/lib/expertise";
import { judge, type Profile, type ScannedItem } from "@/lib/verdict";

const profile = (proficiency: Record<string, number>): Profile => ({
  libraryAttributes: {},
  libraryTalents: [],
  proficiency,
  exoticsOwned: [],
});

describe("expertise categories", () => {
  it("has the game's categories: 7 weapon classes, specialization, 6 gear slots, brand and gear sets", () => {
    expect(EXPERTISE_CATEGORIES.map((c) => c.title)).toEqual([
      "Rifles", "Assault Rifles", "Marksman Rifles", "Shotguns", "SMGs", "LMGs", "Pistols", "Specialization",
      "Masks", "Body Armor", "Backpacks", "Gloves", "Holsters", "Kneepads", "Brand Sets", "Gear Sets",
    ]);
  });

  it("lists every assault rifle: high-end models, named and exotic", () => {
    const ar = categoryById("assault-rifles")!;
    expect(ar.types.map((t) => t.name)).toEqual(expect.arrayContaining(["Police M4", "Lexington", "St. Elmo's Engine"]));
    expect(new Set(ar.types.map((t) => t.group))).toEqual(new Set(["High-end", "Named", "Exotic"]));
  });

  it("puts named and exotic gear in their slot", () => {
    expect(categoryById("masks")!.types.map((t) => t.name)).toContain("Vile");
  });
});

describe("ranks", () => {
  it("matches names on letters and digits, ignoring case and punctuation", () => {
    const p = profile({ "SOCOM MK16": 10 });
    expect(rankOf(p, "SOCOM Mk16")).toBe(10);
    expect(rankOf(p, "Military Mk17")).toBe(0);
  });

  it("counts proficient types per category", () => {
    const p = profile({ "Police M4": 10, Lexington: 4 });
    expect(categoryProgress(categoryById("assault-rifles")!, p).proficient).toBe(1);
  });

  it("collects hand-typed entries that match nothing", () => {
    expect(otherTypes(profile({ "Police M4": 10, "My Typo Gun": 3 }))).toEqual([{ name: "My Typo Gun", rank: 3 }]);
  });

  it("only accepts names from the category", () => {
    expect(knownType("assault-rifles", "police m4")).toBe("Police M4");
    expect(knownType("assault-rifles", "Vile")).toBeUndefined();
  });

  it("doesn't mix up Mk16 and Mk17 in the verdict", () => {
    const item: ScannedItem = {
      kind: "weapon", rarity: "high-end", name: "SOCOM Mk16", weaponClass: "Assault Rifle",
      core: [{ name: "Assault Rifle Damage", value: 5 }, { name: "Health Damage", value: 5 }],
      attributes: [],
    };
    const v = judge(item, { ...profile({ "Military Mk17": 10 }), libraryAttributes: new Proxy({}, { get: () => 999 }) });
    expect(v.action).toBe("expertise");
  });
});
