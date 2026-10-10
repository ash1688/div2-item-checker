"use server";
import { revalidatePath } from "next/cache";
import { categoryById, knownType, MAX_EXPERTISE_LEVEL, MAX_RANK } from "@/lib/expertise";
import { getProfile, removeProficiency, setExpertiseLevel, setProficiency } from "@/lib/profile";
import { keptKey } from "@/lib/verdict";

const clamp = (n: number, max: number) => Math.min(max, Math.max(0, Math.round(Number.isFinite(n) ? n : 0)));

function refresh(categoryId?: string) {
  revalidatePath("/expertise");
  if (categoryId) revalidatePath(`/expertise/${categoryId}`);
}

/** Set ranks, replacing any older spelling of the same type. Rank 0 clears it. */
function writeRanks(entries: { name: string; rank: number }[]) {
  const existing = Object.keys(getProfile().proficiency);
  for (const { name, rank } of entries) {
    for (const old of existing) if (keptKey(old) === keptKey(name)) removeProficiency(old);
    if (rank > 0) setProficiency(name, rank);
  }
}

export async function saveExpertiseLevel(level: number) {
  setExpertiseLevel(clamp(level, MAX_EXPERTISE_LEVEL));
  refresh();
}

/** Set one type's rank (only names from the category's list are accepted). */
export async function setRank(categoryId: string, name: string, rank: number) {
  const canonical = knownType(categoryId, name);
  if (!canonical) throw new Error("Unknown item.");
  writeRanks([{ name: canonical, rank: clamp(rank, MAX_RANK) }]);
  refresh(categoryId);
}

/** Max every type in a category. */
export async function maxCategory(categoryId: string) {
  const category = categoryById(categoryId);
  if (!category) throw new Error("Unknown category.");
  writeRanks(category.types.map((t) => ({ name: t.name, rank: MAX_RANK })));
  refresh(categoryId);
}

/** Older hand-typed entries that don't match a known item ("Other" tile). */
export async function setOtherRank(name: string, rank: number) {
  if (!(name in getProfile().proficiency)) throw new Error("Unknown entry.");
  writeRanks([{ name, rank: clamp(rank, MAX_RANK) }]);
  refresh("other");
}

export async function removeOther(name: string) {
  removeProficiency(name);
  refresh("other");
}
