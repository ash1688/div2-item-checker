import { describe, expect, it } from "vitest";
import { findTalent } from "@/lib/game";
import { GEAR_GROUPS, groupById, groupForItem, groupTalents, librarySections, talentFitsClass, WEAPON_GROUPS } from "@/lib/library";

describe("library groups", () => {
  it("matches the in-game overview: 7 weapon classes, 6 gear slots", () => {
    expect(WEAPON_GROUPS.map((g) => g.title)).toEqual([
      "Rifles", "Assault Rifles", "Marksman Rifles", "Shotguns", "SMGs", "LMGs", "Pistols",
    ]);
    expect(GEAR_GROUPS.map((g) => g.title)).toEqual(["Masks", "Body Armor", "Backpacks", "Gloves", "Holsters", "Kneepads"]);
  });

  it("finds an item's library from its class or slot", () => {
    expect(groupForItem({ kind: "gear", gearSlot: "Holster" })?.id).toBe("holsters");
    expect(groupForItem({ kind: "weapon", weaponClass: "Marksman Rifle" })?.id).toBe("marksman-rifles");
    expect(groupForItem({ kind: "gear" })).toBeUndefined();
  });

  it("only offers talents a weapon class can roll", () => {
    expect(talentFitsClass(findTalent("Rifleman")!, "Rifle")).toBe(true);
    expect(talentFitsClass(findTalent("Rifleman")!, "SMG")).toBe(false);
    expect(talentFitsClass(findTalent("Ranger")!, "SMG")).toBe(true);
    expect(groupTalents(groupById("smgs")!).map((t) => t.name)).not.toContain("Rifleman");
  });

  it("puts chest talents on body armor, backpack talents on backpacks, none elsewhere", () => {
    expect(groupTalents(groupById("body-armor")!).every((t) => t.slot === "chest")).toBe(true);
    expect(groupTalents(groupById("backpacks")!).every((t) => t.slot === "backpack")).toBe(true);
    expect(groupTalents(groupById("holsters")!)).toEqual([]);
  });

  it("gives gear core and attribute sections, weapons attributes only (cores can't be recalibrated)", () => {
    expect(librarySections(groupById("holsters")!).map((s) => s.id)).toEqual(["core", "attributes"]);
    expect(librarySections(groupById("rifles")!).map((s) => s.id)).toEqual(["attributes", "talents"]);
    const holster = librarySections(groupById("holsters")!).find((s) => s.id === "attributes");
    expect(holster?.kind === "attributes" && holster.attributes.length).toBe(12);
  });
});
