import { describe, expect, it } from "vitest";
import { ITEMS, itemKey, matchItem } from "@/lib/items";

describe("itemKey", () => {
  it("folds characters OCR confuses, so misreads share a key", () => {
    expect(itemKey("SOCOM Mk1e")).toBe(itemKey("SOCOM Mk16"));
    expect(itemKey("SOCOM MK16")).toBe(itemKey("SOCOM Mk16"));
    expect(itemKey("P0lice M4")).toBe(itemKey("Police M4"));
  });

  it("keeps different model numbers apart", () => {
    expect(itemKey("Mk16")).not.toBe(itemKey("Mk17"));
  });
});

describe.skipIf(ITEMS.length === 0)("matchItem against the item list", () => {
  it.each([
    ["SOCOM Mk1e", "SOCOM Mk16"],
    ["SOCOM MK16", "SOCOM Mk16"],
    ["Lexingt0n", "Lexington"],
    ["Fafnir", "Fafnir"],
    ["Vile", "Vile"],
    ["Leg Day Kneepa", "Leg Day Kneepads"],
    ["Uncontested Holster", "Uncontested Holster"],
  ])("%s -> %s", (raw, name) => {
    expect(matchItem(raw)?.name).toBe(name);
  });

  it("knows what each sample item is", () => {
    expect(matchItem("SOCOM Mk16")).toMatchObject({ kind: "weapon", rarity: "high-end", weaponClass: "Assault Rifle" });
    expect(matchItem("Lexington")).toMatchObject({ kind: "weapon", rarity: "named", weaponClass: "Assault Rifle" });
    expect(matchItem("Fafnir")).toMatchObject({ kind: "weapon", rarity: "exotic", weaponClass: "Shotgun" });
    expect(matchItem("Vile")).toMatchObject({ kind: "gear", rarity: "exotic", gearSlot: "Mask" });
    expect(matchItem("Training Mask")).toMatchObject({ gearSlot: "Mask", set: "Core Strength" });
    expect(matchItem("Ongoing Directive")).toMatchObject({ kind: "gear-set" });
    expect(matchItem("Unit Alloys")).toMatchObject({ kind: "brand" });
  });

  it("returns nothing for text that isn't close to any item", () => {
    expect(matchItem("Xyzzy Plugh Quux")).toBeUndefined();
  });
});
