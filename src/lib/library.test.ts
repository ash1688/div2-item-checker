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

  it("gives gear and weapons core and attribute sections", () => {
    expect(librarySections(groupById("holsters")!).map((s) => s.id)).toEqual(["core", "attributes"]);
    expect(librarySections(groupById("rifles")!).map((s) => s.id)).toEqual(["core", "attributes", "talents"]);
    const holster = librarySections(groupById("holsters")!).find((s) => s.id === "attributes");
    expect(holster?.kind === "attributes" && holster.attributes.length).toBe(12);
  });


  it.each([
    ["rifles", ["Rifle Damage", "Critical Hit Damage"]],
    ["assault-rifles", ["Assault Rifle Damage", "Health Damage"]],
    ["marksman-rifles", ["Marksman Rifle Damage", "Headshot Damage"]],
    ["shotguns", ["Shotgun Damage", "Damage to Armor"]],
    ["smgs", ["SMG Damage", "Critical Hit Chance"]],
    ["lmgs", ["LMG Damage", "Damage to Targets Out of Cover"]],
    ["pistols", ["Pistol Damage"]],
  ])("%s core attributes: %j", (id, names) => {
    const core = librarySections(groupById(id)!).find((s) => s.id === "core");
    expect(core?.kind === "attributes" && core.attributes.map((a) => a.name)).toEqual(names);
  });

  it("keeps a weapon core apart from the attribute with the same name", () => {
    const rifles = librarySections(groupById("rifles")!);
    const core = rifles.find((s) => s.id === "core");
    const attrs = rifles.find((s) => s.id === "attributes");
    const coreChd = core?.kind === "attributes" ? core.attributes.find((a) => a.name === "Critical Hit Damage") : undefined;
    const attrChd = attrs?.kind === "attributes" ? attrs.attributes.find((a) => a.name === "Critical Hit Damage") : undefined;
    expect(coreChd).toMatchObject({ key: "weapon:Rifle:core:Critical Hit Damage", max: 17 });
    expect(attrChd).toMatchObject({ key: "weapon:Rifle:Critical Hit Damage", max: 10 });
  });

  it("lists Damage to Armor only once for shotguns, as a core attribute", () => {
    const names = librarySections(groupById("shotguns")!).flatMap((s) => (s.kind === "attributes" ? s.attributes.map((a) => a.name) : []));
    expect(names.filter((n) => n === "Damage to Armor")).toHaveLength(1);
    const attrs = librarySections(groupById("shotguns")!).find((s) => s.id === "attributes");
    expect(attrs?.kind === "attributes" && attrs.attributes.map((a) => a.name)).not.toContain("Damage to Armor");
  });

  it("lists Critical Hit Chance only once for SMGs, as a core attribute", () => {
    const attrs = librarySections(groupById("smgs")!).find((s) => s.id === "attributes");
    expect(attrs?.kind === "attributes" && attrs.attributes.map((a) => a.name)).not.toContain("Critical Hit Chance");
    expect(attrs?.kind === "attributes" && attrs.attributes.map((a) => a.name)).toContain("Health Damage");
  });
});
