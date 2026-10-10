import { describe, expect, it } from "vitest";
import { cleanWords, fixDecimal, parseAttributeLine, parseTooltip, parseValue, voteValue } from "./parse";

describe("parseValue", () => {
  it("reads percentages, flat values and HP/s", () => {
    expect(parseValue("+9.6%")).toEqual({ value: 9.6, hasDecimal: true, percent: true });
    expect(parseValue("+79,802")).toEqual({ value: 79802, hasDecimal: false, percent: false });
    expect(parseValue("+3,445HP/s")).toEqual({ value: 3445, hasDecimal: false, percent: false });
  });

  it("treats a misread thousands comma as a separator", () => {
    expect(parseValue("+79.802")?.value).toBe(79802);
  });

  it("drops a misread % after the single decimal place", () => {
    expect(parseValue("+11.47")?.value).toBe(11.4);
  });

  it("fixes letters OCR confuses with digits", () => {
    expect(parseValue("+B.3%")?.value).toBe(8.3);
  });
});

describe("fixDecimal", () => {
  it("restores a lost decimal point when the value is impossible for the stat", () => {
    expect(fixDecimal(109, false, true, "gear-core", "Weapon Damage")).toBe(10.9);
    expect(fixDecimal(66, false, true, "gear-core", "Weapon Damage")).toBe(6.6);
  });

  it("divides an unrecognised percentage over 100 by 10", () => {
    expect(fixDecimal(137, false, true, "gear-minor", "Xyzzy Plugh")).toBe(13.7);
  });

  it("leaves real values above 100% alone (MMR headshot damage)", () => {
    expect(fixDecimal(105, false, true, "weapon-secondary", "Headshot Damage", "Marksman Rifle")).toBe(105);
  });

  it("leaves values that already have a decimal point alone", () => {
    expect(fixDecimal(10.9, true, true, "gear-core", "Weapon Damage")).toBe(10.9);
  });
});

describe("voteValue", () => {
  it("takes the majority and ignores impossible readings", () => {
    const reads = ["+10.9%", "+10.9%", "+309%", "+70.9%", "+10.9%", "+10.8%"];
    expect(voteValue(reads, "gear-core", "Weapon Damage")).toEqual({ value: 10.9, uncertain: false });
  });

  it("counts different spellings of the same number together", () => {
    const reads = ["+3.445HP/s", "+3,445HP/s", "+3445HP/s"];
    expect(voteValue(reads, "gear-minor", "Armor Regen")).toEqual({ value: 3445, uncertain: false });
  });

  it("breaks ties towards readings that kept the decimal point", () => {
    expect(voteValue(["+10%", "+15.0%"], "weapon-core", "Assault Rifle Damage", "Assault Rifle")?.value).toBe(15);
  });

  it("flags a split vote as uncertain", () => {
    expect(voteValue(["+8.6%", "+6.6%", "+5.6%"], "gear-core", "Weapon Damage")?.uncertain).toBe(true);
  });
});

describe("parseAttributeLine", () => {
  it("ignores junk after the stat name", () => {
    expect(parseAttributeLine("{+15.0%} Assault Rifle Damage - oo a")?.name).toBe("Assault Rifle Damage");
  });

  it("reads a plain OCR line", () => {
    expect(parseAttributeLine("0+15.0% Assault Rifle Damage")).toEqual({ reads: ["+15.0%"], name: "Assault Rifle Damage" });
  });
});

describe("cleanWords", () => {
  it("keeps the readable words of a noisy header line", () => {
    expect(cleanWords("| yc iii Lexington 40")).toBe("Lexington");
    expect(cleanWords("Negotiator’s Dilemma")).toBe("Negotiator's Dilemma");
  });

  it("keeps digits that follow letters", () => {
    expect(cleanWords("SOCOM MK16")).toBe("SOCOM MK16");
  });
});

describe("parseTooltip", () => {
  it("builds a gear item from header and body text", () => {
    const item = parseTooltip({
      header: ["Uncontested Holster", "Unit Alloys"],
      body: [
        "Core Attribute",
        "{+10.9%|+10.9%} Weapon Damage",
        "Attributes",
        "{+3,445HP/s} Armor Regen",
        "{+9.3%|+9.3%|+3.3%} Skill Haste",
        "Sockets",
        "Unit Alloys Brand Set (0/3)",
      ],
      isWeapon: false,
      colourRarity: "other",
    });
    expect(item).toEqual({
      kind: "gear",
      rarity: "brand",
      name: "Uncontested Holster",
      gearSlot: "Holster",
      brand: "Unit Alloys",
      weaponClass: undefined,
      core: [{ name: "Weapon Damage", value: 10.9 }],
      attributes: [
        { name: "Armor Regen", value: 3445 },
        { name: "Skill Haste", value: 9.3 },
      ],
      talent: undefined,
    });
  });

  it("picks the most common talent reading, not a stray fragment", () => {
    const item = parseTooltip({
      header: ["Loadout Frame", "Ongoing Directive"],
      body: ["Talents", "Trauma Specialist", "Trauma Specialist |", "7 Trauma", "Sockets"],
      isWeapon: false,
      colourRarity: "gear-set",
    });
    expect(item.talent).toBe("Trauma Specialist");
  });

  it("takes Skill Tier +1.0 from the battery icon, whatever the core row read as", () => {
    const item = parseTooltip({
      header: ["Vile"],
      body: ["Core Attribute", "{0+0s|10s} Tier m", "Attributes", "{+9.6%|+9.6%} Status Effects"],
      isWeapon: false,
      colourRarity: "exotic",
      skillTierIcon: true,
    });
    expect(item.core).toEqual([{ name: "Skill Tier", value: 1 }]);
    expect(item.attributes).toEqual([{ name: "Status Effects", value: 9.6 }]);
  });

  it("flags greyed-out rows and tolerates misread section headers", () => {
    const item = parseTooltip({
      header: ["Fafnir"],
      body: ["Core Attributes", "~{+15.0%|+15.0%} Shotgun Damage", "~{+11.0%} Damage to Armor", "Autributes", "{+4.0%|+4.0%} Rate of Fire", "Taients"],
      isWeapon: true,
      colourRarity: "exotic",
    });
    expect(item.core).toEqual([
      { name: "Shotgun Damage", value: 15, uncertain: true },
      { name: "Damage to Armor", value: 11, uncertain: true },
    ]);
    expect(item.attributes).toEqual([{ name: "Rate of Fire", value: 4 }]);
  });
});
