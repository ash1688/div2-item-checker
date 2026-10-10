import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Best value extracted per attribute, keyed by libraryKey(scope, name). */
export const libraryAttributes = sqliteTable("library_attributes", {
  key: text("key").primaryKey(),
  value: real("value").notNull(),
});

/** Talents unlocked in the recalibration library. */
export const libraryTalents = sqliteTable("library_talents", {
  name: text("name").primaryKey(),
});

/** Proficiency rank (0-10) per item type: weapon model, brand, gear set, named, exotic. */
export const proficiency = sqliteTable("proficiency", {
  type: text("type").primaryKey(),
  rank: integer("rank").notNull(),
});

export const exoticsOwned = sqliteTable("exotics_owned", {
  name: text("name").primaryKey(),
});

/** Misc profile values, e.g. expertiseLevel. */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const scans = sqliteTable("scans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  imagePath: text("image_path").notNull(),
  ocrText: text("ocr_text"),
  /** JSON ScannedItem, null until parsed. */
  item: text("item"),
  /** JSON Verdict, null until judged. */
  verdict: text("verdict"),
  status: text("status", { enum: ["pending", "needs-review", "done", "failed"] }).notNull(),
  error: text("error"),
});

/** The copy of each item the user is keeping, with its stats, so duplicates can be compared. */
export const keptItems = sqliteTable("kept_items", {
  /** keptKey(item name): lowercase letters and digits. */
  key: text("key").primaryKey(),
  /** JSON ScannedItem. */
  item: text("item").notNull(),
  scanId: integer("scan_id"),
  keptAt: integer("kept_at", { mode: "timestamp" }).notNull(),
});
