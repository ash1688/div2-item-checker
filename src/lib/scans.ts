import "server-only";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { db } from "@/db";
import { UPLOAD_DIR } from "@/lib/paths";
import { scans } from "@/db/schema";
import { readItemScreenshot } from "@/lib/ocr/ocr";
import { getProfile } from "@/lib/profile";
import { judge, type ScannedItem, type Verdict } from "@/lib/verdict";

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

/**
 * Store an uploaded screenshot and create a scan for it. Upright JPEG/PNG files
 * (console captures) are kept byte-for-byte: re-encoding shifts pixels enough to
 * hurt OCR. Anything else is converted to an upright JPEG.
 */
export async function createScan(file: File): Promise<number> {
  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input).metadata();
  const upright = !meta.orientation || meta.orientation === 1;
  let name: string;
  if (upright && (meta.format === "jpeg" || meta.format === "png")) {
    name = `${randomUUID()}.${meta.format === "png" ? "png" : "jpg"}`;
    await writeFile(join(UPLOAD_DIR, name), input);
  } else {
    name = `${randomUUID()}.jpg`;
    await sharp(input)
      .rotate() // honour EXIF orientation from phone cameras
      .resize({ width: 3840, height: 3840, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 95 })
      .toFile(join(UPLOAD_DIR, name));
  }
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

/**
 * Read the screenshot and judge it. Clear readings are marked done; anything
 * the OCR wasn't sure about is left for the user to check in the review form.
 */
export async function analyseScan(id: number) {
  const scan = getScan(id);
  if (!scan) return;
  try {
    const { item, text } = await readItemScreenshot(await readFile(join(UPLOAD_DIR, scan.imagePath)));
    const unsure = [...item.core, ...item.attributes].some((a) => a.uncertain) || !item.name;
    db.update(scans)
      .set({
        ocrText: JSON.stringify(text),
        item: JSON.stringify(item),
        verdict: JSON.stringify(judge(item, getProfile())),
        status: unsure ? "needs-review" : "done",
        error: null,
      })
      .where(eq(scans.id, id))
      .run();
  } catch (e) {
    db.update(scans)
      .set({ status: "needs-review", error: e instanceof Error ? e.message : String(e) })
      .where(eq(scans.id, id))
      .run();
  }
}

export function deleteScan(id: number) {
  db.delete(scans).where(eq(scans.id, id)).run();
}
