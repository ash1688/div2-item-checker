import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as schema from "@/db/schema";

export const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), "data");
export const UPLOAD_DIR = join(DATA_DIR, "uploads");

function open() {
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const sqlite = new Database(join(DATA_DIR, "app.db"));
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  return db;
}

// Reuse one connection across hot reloads in dev.
const g = globalThis as unknown as { __db?: ReturnType<typeof open> };
export const db = (g.__db ??= open());
