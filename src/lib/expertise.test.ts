import { describe, expect, it } from "vitest";
import { cardById, cardProgress, categoryById, categoryProgress, EXPERTISE_CARDS, knownType, otherTypes, rankOf } from "@/lib/expertise";
import { judge, type Profile, type ScannedItem } from "@/lib/verdict";

const profile = (proficiency: Record<string, number>): Profile => ({
  libraryAttributes: {},
  libraryTalents: [],
  proficiency,
  exoticsOwned: [],
});

describe("expertise categories", () => {
  it("has four cards: weapons (7 classes + specialization), named & exotics (6 slots), skills, brands", () => {
    expect(EXPERTISE_CARDS.map((c) => [c.title, c.categories.map((x) => x.title)])).toEqual([
      ["Weapons", ["Rifles", "Assault Rifles", "Marksman Rifles", "Shotguns", "SMGs", "LMGs", "Pistols", "Specialization"]],
      ["Named & Exotics", ["Masks", "Body Armor", "Backpacks", "Gloves", "Holsters", "Kneepads"]],
      ["Skills", ["Skills"]],
      ["Brands", ["Brands"]],
    ]);
  });

  it("lists brands with gear sets in their own group", () => {
    const groups = new Set(categoryById("brands")!.types.map((t) => t.group));
    expect(groups).toEqual(new Set(["Brand Sets", "Gear Sets"]));
    expect(categoryById("brands")!.types.map((t) => t.name)).toEqual(expect.arrayContaining(["Unit Alloys", "Ongoing Directive"]));
  });

  it("adds up a card's progress across its lists", () => {
    const p = cardProgress(cardById("weapons")!, profile({ "Police M4": 10, "M1A CQB": 10 }));
    expect(p.proficient).toBe(2);
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

describe("skills", () => {
  it("lists all 43 skill variants grouped by skill", () => {
    const skills = categoryById("skills")!;
    expect(skills.types).toHaveLength(43);
    expect(skills.types.map((t) => t.name)).toEqual(expect.arrayContaining(["Assault Turret", "Restorer Hive", "Striker Drone"]));
    expect(new Set(skills.types.map((t) => t.group)).size).toBe(12);
  });
});
