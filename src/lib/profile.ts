import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { exoticsOwned, libraryAttributes, libraryTalents, proficiency, settings } from "@/db/schema";
import type { LibraryGain, Profile } from "@/lib/verdict";
import { libraryKey, findAttribute } from "@/lib/game";

export function getProfile(): Profile {
  return {
    libraryAttributes: Object.fromEntries(
      db.select().from(libraryAttributes).all().map((r) => [r.key, r.value]),
    ),
    libraryTalents: db.select().from(libraryTalents).all().map((r) => r.name),
    proficiency: Object.fromEntries(db.select().from(proficiency).all().map((r) => [r.type, r.rank])),
    exoticsOwned: db.select().from(exoticsOwned).all().map((r) => r.name),
  };
}

export function getExpertiseLevel(): number {
  const row = db.select().from(settings).where(eq(settings.key, "expertiseLevel")).get();
  return row ? Number(row.value) : 0;
}

export function setExpertiseLevel(level: number) {
  db.insert(settings)
    .values({ key: "expertiseLevel", value: String(level) })
    .onConflictDoUpdate({ target: settings.key, set: { value: String(level) } })
    .run();
}

export function setLibraryValues(values: Record<string, number>) {
  db.transaction((tx) => {
    for (const [key, value] of Object.entries(values)) {
      if (value > 0) {
        tx.insert(libraryAttributes).values({ key, value })
          .onConflictDoUpdate({ target: libraryAttributes.key, set: { value } }).run();
      } else {
        tx.delete(libraryAttributes).where(eq(libraryAttributes.key, key)).run();
      }
    }
  });
}

export function setLibraryTalents(names: string[]) {
  db.transaction((tx) => {
    tx.delete(libraryTalents).run();
    for (const name of names) tx.insert(libraryTalents).values({ name }).run();
  });
}

export function setProficiency(type: string, rank: number) {
  db.insert(proficiency).values({ type, rank })
    .onConflictDoUpdate({ target: proficiency.type, set: { rank } }).run();
}

export function removeProficiency(type: string) {
  db.delete(proficiency).where(eq(proficiency.type, type)).run();
}

export function addExotic(name: string) {
  db.insert(exoticsOwned).values({ name }).onConflictDoNothing().run();
}

export function removeExotic(name: string) {
  db.delete(exoticsOwned).where(eq(exoticsOwned.name, name)).run();
}

/** Record that the user extracted an item: raise library values / unlock its talent. */
export function applyLibraryGains(kind: "weapon" | "gear", gains: LibraryGain[]) {
  db.transaction((tx) => {
    for (const g of gains) {
      if (g.kind === "talent") {
        tx.insert(libraryTalents).values({ name: g.name }).onConflictDoNothing().run();
        continue;
      }
      const def =
        kind === "weapon"
          ? findAttribute("weapon-minor", g.name)
          : (findAttribute("gear-core", g.name) ?? findAttribute("gear-minor", g.name));
      if (!def || g.value === undefined) continue;
      const key = libraryKey(kind, def.name);
      tx.insert(libraryAttributes).values({ key, value: g.value })
        .onConflictDoUpdate({ target: libraryAttributes.key, set: { value: g.value } }).run();
    }
  });
}
