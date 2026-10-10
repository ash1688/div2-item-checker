import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { exoticsOwned, keptItems, libraryAttributes, libraryTalents, proficiency, settings } from "@/db/schema";
import { keptKey, type LibraryGain, type Profile, type ScannedItem } from "@/lib/verdict";
import { libraryKey, findAttribute } from "@/lib/game";

/**
 * The user's profile. When judging a scan, pass its id: a kept copy that came from
 * that same scan is left out, or the item would be compared against itself.
 */
export function getProfile(forScanId?: number): Profile {
  return {
    libraryAttributes: Object.fromEntries(
      db.select().from(libraryAttributes).all().map((r) => [r.key, r.value]),
    ),
    libraryTalents: db.select().from(libraryTalents).all().map((r) => r.name),
    proficiency: Object.fromEntries(db.select().from(proficiency).all().map((r) => [r.type, r.rank])),
    exoticsOwned: db.select().from(exoticsOwned).all().map((r) => r.name),
    keptItems: Object.fromEntries(
      getKeptItems()
        .filter((k) => forScanId === undefined || k.scanId !== forScanId)
        .map((k) => [k.key, k.item]),
    ),
  };
}

export interface KeptItem {
  key: string;
  item: ScannedItem;
  scanId: number | null;
  keptAt: Date;
}

export function getKeptItems(): KeptItem[] {
  return db
    .select()
    .from(keptItems)
    .all()
    .map((r) => ({ ...r, item: JSON.parse(r.item) as ScannedItem }));
}

/** Keep this copy of the item (replacing any earlier kept copy). Exotics also count as owned. */
export function keepItem(item: ScannedItem, scanId: number | null) {
  const row = { key: keptKey(item.name), item: JSON.stringify(item), scanId, keptAt: new Date() };
  db.transaction((tx) => {
    tx.insert(keptItems).values(row).onConflictDoUpdate({ target: keptItems.key, set: row }).run();
    if (item.rarity === "exotic") tx.insert(exoticsOwned).values({ name: item.name }).onConflictDoNothing().run();
  });
}

export function removeKeptItem(key: string) {
  db.delete(keptItems).where(eq(keptItems.key, key)).run();
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

/** Unlock or lock specific talents, leaving the rest as they are. */
export function setTalentsUnlocked(names: string[], unlocked: boolean) {
  db.transaction((tx) => {
    for (const name of names) {
      if (unlocked) tx.insert(libraryTalents).values({ name }).onConflictDoNothing().run();
      else tx.delete(libraryTalents).where(eq(libraryTalents.name, name)).run();
    }
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
