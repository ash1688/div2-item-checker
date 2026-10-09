"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { GEAR_SLOTS, RARITIES, WEAPON_CLASSES } from "@/lib/game";
import { addExotic, applyLibraryGains, getProfile } from "@/lib/profile";
import { deleteScan, getScan, saveJudgement } from "@/lib/scans";
import { judge } from "@/lib/verdict";

const attr = z.object({ name: z.string().trim().min(1), value: z.number().finite() });
const itemSchema = z.object({
  kind: z.enum(["weapon", "gear"]),
  rarity: z.enum(RARITIES),
  name: z.string().trim().min(1, "Item name is required."),
  brand: z.string().trim().optional(),
  weaponClass: z.enum(WEAPON_CLASSES).optional(),
  gearSlot: z.enum(GEAR_SLOTS).optional(),
  core: z.array(attr),
  attributes: z.array(attr),
  talent: z.string().trim().optional(),
  prototype: z.boolean().optional(),
});

export async function judgeScan(id: number, raw: unknown): Promise<string | null> {
  const parsed = itemSchema.safeParse(raw);
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid item.";
  const item = {
    ...parsed.data,
    talent: parsed.data.talent || undefined,
    brand: parsed.data.brand || undefined,
  };
  saveJudgement(id, item, judge(item, getProfile()));
  revalidatePath(`/scans/${id}`);
  return null;
}

/** "I extracted it": push this item's library gains into the profile. */
export async function markExtracted(id: number) {
  const scan = getScan(id);
  if (!scan?.item || !scan.verdict) return;
  applyLibraryGains(scan.item.kind, scan.verdict.libraryGains);
  saveJudgement(id, scan.item, judge(scan.item, getProfile()));
  revalidatePath(`/scans/${id}`);
}

export async function markExoticOwned(id: number) {
  const scan = getScan(id);
  if (!scan?.item) return;
  addExotic(scan.item.name);
  revalidatePath(`/scans/${id}`);
}

export async function removeScan(id: number) {
  deleteScan(id);
  redirect("/scans");
}
