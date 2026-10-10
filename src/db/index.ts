import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as schema from "@/db/schema";
import { DATA_DIR, UPLOAD_DIR } from "@/lib/paths";

function open() {
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const sqlite = new Database(join(DATA_DIR, "app.db"));
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  return db;
}

type Db = ReturnType<typeof open>;

// One connection, reused across hot reloads in dev.
const g = globalThis as unknown as { __db?: Db };

/**
 * Opened on first use, not on import: `next build` loads every page module in
 * parallel workers, and opening (and migrating) the database there made the
 * workers race to create the same tables.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    g.__db ??= open();
    const value = Reflect.get(g.__db, prop);
    return typeof value === "function" ? value.bind(g.__db) : value;
  },
});
