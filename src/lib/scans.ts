import "server-only";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import sharp from "sharp";
import { UPLOAD_DIR, db } from "@/db";
import { scans } from "@/db/schema";
import type { ScannedItem, Verdict } from "@/lib/verdict";

export interface Scan {
  id: number;
  createdAt: Date;
  imagePath: string;
  ocrText: string | null;
  item: ScannedItem | null;
  verdict: Verdict | null;
  status: "pending" | "needs-review" | "done" | "failed";
  error: string | null;
}

function toScan(row: typeof scans.$inferSelect): Scan {
  return {
    ...row,
    item: row.item ? (JSON.parse(row.item) as ScannedItem) : null,
    verdict: row.verdict ? (JSON.parse(row.verdict) as Verdict) : null,
  };
}

/** Store an uploaded screenshot as an upright JPEG and create a scan for it. */
export async function createScan(file: File): Promise<number> {
  const name = `${randomUUID()}.jpg`;
  await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate() // honour EXIF orientation from phone cameras
    .resize({ width: 3000, height: 3000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 92 })
    .toFile(join(UPLOAD_DIR, name));
  const row = db
    .insert(scans)
    .values({ createdAt: new Date(), imagePath: name, status: "needs-review" })
    .returning({ id: scans.id })
    .get();
  return row.id;
}

export function getScan(id: number): Scan | undefined {
  const row = db.select().from(scans).where(eq(scans.id, id)).get();
  return row && toScan(row);
}

export function listScans(): Scan[] {
  return db.select().from(scans).orderBy(desc(scans.id)).all().map(toScan);
}

export function saveJudgement(id: number, item: ScannedItem, verdict: Verdict) {
  db.update(scans)
    .set({ item: JSON.stringify(item), verdict: JSON.stringify(verdict), status: "done" })
    .where(eq(scans.id, id))
    .run();
}

export function deleteScan(id: number) {
  db.delete(scans).where(eq(scans.id, id)).run();
}
