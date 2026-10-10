import { describe, expect, it } from "vitest";
import { keptKey, type Profile, rollQuality, type ScannedItem, judge } from "@/lib/verdict";

const emptyProfile: Profile = {
  libraryAttributes: {},
  libraryTalents: [],
  proficiency: {},
  exoticsOwned: [],
};

/** A profile where everything is already maxed, so nothing beats it. */
const maxedProfile = (types: string[]): Profile => ({
  libraryAttributes: new Proxy({}, { get: () => 999999 }) as Record<string, number>,
  libraryTalents: ["weapon:Assault Rifle:Ranger"],
  proficiency: Object.fromEntries(types.map((t) => [t, 10])),
  exoticsOwned: ["Fafnir", "Vile"],
});

// Transcribed from samples/phone (2026-10-09).
const samples = {
  fafnir: {
    kind: "weapon", rarity: "exotic", name: "Fafnir", weaponClass: "Shotgun",
    core: [{ name: "Shotgun Damage", value: 15 }, { name: "Damage to Armor", value: 11 }],
    attributes: [{ name: "Rate of Fire", value: 4 }],
    talent: "Dragon's Breath",
  },
  lexington: {
    kind: "weapon", rarity: "named", name: "Lexington", weaponClass: "Assault Rifle",
    core: [{ name: "Assault Rifle Damage", value: 15 }, { name: "Health Damage", value: 21 }],
    attributes: [{ name: "DMG to target out of cover", value: 10 }],
    talent: "Eyeless",
  },
  vile: {
    kind: "gear", rarity: "exotic", name: "Vile", gearSlot: "Mask",
    core: [{ name: "Skill Tier", value: 1 }],
    attributes: [{ name: "Status Effects", value: 9.6 }, { name: "Hazard Protection", value: 9.6 }],
    talent: "Toxic Delivery",
  },
  socom: {
    kind: "weapon", rarity: "high-end", name: "SOCOM Mk16", weaponClass: "Assault Rifle",
    core: [{ name: "Assault Rifle Damage", value: 8.7 }, { name: "Health Damage", value: 11 }],
    attributes: [{ name: "Critical Hit Damage", value: 6 }],
    talent: "Ranger",
  },
  loadoutFrame: {
    kind: "gear", rarity: "gear-set", name: "Loadout Frame", brand: "Ongoing Directive", gearSlot: "Backpack",
    core: [{ name: "Weapon Damage", value: 11.4 }],
    attributes: [{ name: "Status Effects", value: 10 }],
    talent: "Trauma Specialist",
  },
  trainingMask: {
    kind: "gear", rarity: "gear-set", name: "Training Mask", brand: "Core Strength", gearSlot: "Mask",
    core: [{ name: "Armor", value: 79802 }],
    attributes: [{ name: "Status Effects", value: 6.9 }],
  },
  mirrorGloves: {
    kind: "gear", rarity: "gear-set", name: "Mirror Gloves", brand: "Negotiator's Dilemma", gearSlot: "Gloves",
    core: [{ name: "Weapon Damage", value: 8.8 }],
    attributes: [{ name: "Headshot Damage", value: 5.9 }],
  },
  holster: {
    kind: "gear", rarity: "brand", name: "Uncontested Holster", brand: "Unit Alloys", gearSlot: "Holster",
    core: [{ name: "Weapon Damage", value: 10.9 }],
    attributes: [{ name: "Armor Regen", value: 3445 }, { name: "Skill Haste", value: 9.3 }],
  },
  kneepads1: {
    kind: "gear", rarity: "gear-set", name: "Leg Day Kneepads", brand: "Core Strength", gearSlot: "Kneepads",
    core: [{ name: "Weapon Damage", value: 8 }],
    attributes: [{ name: "Hazard Protection", value: 8.6 }],
  },
  kneepads2: {
    kind: "gear", rarity: "gear-set", name: "Leg Day Kneepads", brand: "Core Strength", gearSlot: "Kneepads",
    core: [{ name: "Weapon Damage", value: 6.6 }],
    attributes: [{ name: "Critical Hit Damage", value: 8.3 }],
  },
} satisfies Record<string, ScannedItem>;

const randomPicks = [
  samples.loadoutFrame, samples.trainingMask, samples.mirrorGloves,
  samples.holster, samples.kneepads1, samples.kneepads2,
];
const allTypes = ["SOCOM Mk16", "Ongoing Directive", "Core Strength", "Negotiator's Dilemma", "Unit Alloys"];

describe("judge: the agreed sample verdicts", () => {
  it("keeps the god-rolled named Lexington, ignoring its named talent", () => {
    const v = judge(samples.lexington, emptyProfile);
    expect(v.action).toBe("keep");
    expect(v.rolls.map((r) => r.pct)).toEqual([1, 1, 1]);
    expect(v.warnings).toEqual([]);
  });

  it("keeps the first copy of an exotic", () => {
    expect(judge(samples.vile, emptyProfile).action).toBe("keep");
    expect(judge(samples.fafnir, emptyProfile).action).toBe("keep");
  });

  it("never sends exotics to the library", () => {
    const v = judge(samples.vile, { ...emptyProfile, exoticsOwned: ["Vile"] });
    expect(v.libraryGains).toEqual([]);
    expect(v.action).toBe("expertise");
  });

  it("deconstructs a duplicate exotic once its proficiency is maxed", () => {
    const v = judge(samples.fafnir, { ...emptyProfile, exoticsOwned: ["Fafnir"], proficiency: { Fafnir: 10 } });
    expect(v.action).toBe("deconstruct");
  });

  it("puts the random picks into library or expertise, never keep", () => {
    for (const item of randomPicks) {
      expect(["library", "expertise"]).toContain(judge(item, emptyProfile).action);
    }
  });

  it("deconstructs the random picks when library and proficiency are maxed", () => {
    for (const item of [...randomPicks, samples.socom]) {
      expect(judge(item, maxedProfile(allTypes)).action).toBe("deconstruct");
    }
  });
});

describe("judge: talent rule", () => {
  it("keeps an S-tier talent you haven't unlocked, despite poor rolls", () => {
    const v = judge(samples.socom, emptyProfile);
    expect(v.action).toBe("keep");
    expect(v.reasons[0]).toMatch(/Ranger/);
  });

  it("drops to library once the talent is unlocked", () => {
    const v = judge(samples.socom, { ...emptyProfile, libraryTalents: ["weapon:Assault Rifle:Ranger"] });
    expect(v.action).toBe("library");
  });

  it("ignores gear-set talents for the library", () => {
    const v = judge(samples.loadoutFrame, emptyProfile);
    expect(v.libraryGains.every((g) => g.kind === "attribute")).toBe(true);
    expect(v.notes.join()).toMatch(/Trauma Specialist/);
  });
});

describe("judge: library and expertise", () => {
  it("reports exactly which attributes beat the library", () => {
    const v = judge(samples.holster, {
      ...emptyProfile,
      libraryAttributes: { "gear:Holster:Weapon Damage": 15, "gear:Holster:Armor Regen": 3000, "gear:Holster:Skill Haste": 12 },
    });
    expect(v.action).toBe("library");
    expect(v.libraryGains).toEqual([{ kind: "attribute", name: "Armor Regen", value: 3445, current: 3000 }]);
  });

  it("uses the brand or gear set as the proficiency type for gear", () => {
    const v = judge(samples.kneepads1, {
      ...maxedProfile([]),
      proficiency: { "core strength": 4 },
    });
    expect(v.action).toBe("expertise");
    expect(v.proficiencyType).toBe("Core Strength");
    expect(v.reasons[0]).toMatch(/rank 4/);
  });

  it("flags prototype items as unsupported", () => {
    expect(judge({ ...samples.socom, prototype: true }, emptyProfile).action).toBe("unsupported");
  });

  it("warns instead of guessing when an attribute can't be identified", () => {
    const v = judge({ ...samples.trainingMask, attributes: [{ name: "Xyzzy Plugh", value: 5 }] }, emptyProfile);
    expect(v.warnings.length).toBe(1);
    expect(v.action).not.toBe("keep");
  });

  it("tolerates OCR typos in attribute names", () => {
    const v = judge(
      { ...samples.lexington, attributes: [{ name: "DMG to target 0ut of c0ver", value: 10 }] },
      emptyProfile,
    );
    expect(v.warnings).toEqual([]);
    expect(v.action).toBe("keep");
  });
});

describe("judge: duplicates of an item you're keeping", () => {
  const stElmos = (arDamage: number): ScannedItem => ({
    kind: "weapon", rarity: "exotic", name: "St. Elmo's Engine", weaponClass: "Assault Rifle",
    core: [{ name: "Assault Rifle Damage", value: arDamage }, { name: "Health Damage", value: 21 }],
    attributes: [{ name: "Critical Hit Chance", value: 9.5 }],
  });
  const keeping = (item: ScannedItem): Profile => ({
    ...emptyProfile,
    exoticsOwned: [item.name],
    keptItems: { [keptKey(item.name)]: item },
  });

  it("keeps a better copy and says to junk the old one", () => {
    const v = judge(stElmos(15), keeping(stElmos(7.5)));
    expect(v.action).toBe("keep");
    expect(v.reasons[0]).toMatch(/junk the old copy/);
  });

  it("doesn't keep a worse copy of an exotic", () => {
    const v = judge(stElmos(7.5), keeping(stElmos(15)));
    expect(v.action).toBe("expertise");
    expect(v.notes.join()).toMatch(/you're keeping is as good or better/);
  });

  it("doesn't keep an equal copy", () => {
    expect(judge(stElmos(15), keeping(stElmos(15))).action).not.toBe("keep");
  });

  it("stops a god roll being kept when the kept copy is better", () => {
    const godRoll = samples.lexington;
    const v = judge(godRoll, keeping({ ...godRoll, attributes: [{ name: "DMG to target out of cover", value: 10 }] }));
    expect(v.action).not.toBe("keep");
  });

  it("stops an S-tier talent being kept twice", () => {
    const worse = { ...samples.socom, core: [{ name: "Assault Rifle Damage", value: 5 }, samples.socom.core[1]] };
    expect(judge(worse, keeping(samples.socom)).action).toBe("library");
  });

  it("measures copies by average roll", () => {
    expect(rollQuality(stElmos(15))).toBeCloseTo((1 + 1 + 1) / 3);
    expect(rollQuality(stElmos(7.5))).toBeCloseTo((0.5 + 1 + 1) / 3);
  });
});

describe("judge: the library is per weapon class and gear slot", () => {
  it("compares a holster with the Holsters library only", () => {
    const maxedMasks = { "gear:Mask:Weapon Damage": 15, "gear:Mask:Armor Regen": 4925, "gear:Mask:Skill Haste": 12 };
    expect(judge(samples.holster, { ...emptyProfile, libraryAttributes: maxedMasks }).action).toBe("library");
    const maxedHolsters = { "gear:Holster:Weapon Damage": 15, "gear:Holster:Armor Regen": 4925, "gear:Holster:Skill Haste": 12 };
    expect(judge(samples.holster, { ...emptyProfile, libraryAttributes: maxedHolsters }).libraryGains).toEqual([]);
  });

  it("checks a talent against the weapon's own class", () => {
    const rifleOnly = { ...emptyProfile, libraryTalents: ["weapon:Rifle:Ranger"] };
    // Ranger unlocked for rifles doesn't count for this assault rifle.
    expect(judge(samples.socom, rifleOnly).action).toBe("keep");
  });

  it("warns instead of guessing when the gear slot is unknown", () => {
    const v = judge({ ...samples.holster, gearSlot: undefined }, emptyProfile);
    expect(v.libraryGains).toEqual([]);
    expect(v.warnings.join()).toMatch(/Gear slot unknown/);
  });
});
