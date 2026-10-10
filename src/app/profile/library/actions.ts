"use server";
import { revalidatePath } from "next/cache";
import { GEAR_GROUPS, groupById, groupContents, type LibraryGroup, WEAPON_GROUPS } from "@/lib/library";
import { setLibraryValues, setTalentsUnlocked } from "@/lib/profile";

// Everything is checked against the game data: keys must be known, and "max"
// always means the real max, never a value sent by the browser.

function group(id: string): LibraryGroup {
  const g = groupById(id);
  if (!g) throw new Error("Unknown library.");
  return g;
}

function refresh(g: LibraryGroup) {
  revalidatePath("/profile");
  revalidatePath(`/profile/library/${g.id}`);
}

/** Set one attribute's library value; null clears it. */
export async function saveAttribute(groupId: string, key: string, value: number | null) {
  const g = group(groupId);
  const attr = groupContents(g).attributes.find((a) => a.key === key);
  if (!attr) throw new Error("Unknown attribute.");
  const v = value === null || !Number.isFinite(value) ? 0 : Math.min(Math.max(value, 0), attr.max);
  setLibraryValues({ [key]: v });
  refresh(g);
}

/** Max these attributes (or every attribute in the group / section when keys is omitted). */
export async function maxAttributes(groupId: string, keys?: string[], sectionId?: string) {
  const g = group(groupId);
  const attrs = groupContents(g, sectionId).attributes.filter((a) => !keys || keys.includes(a.key));
  setLibraryValues(Object.fromEntries(attrs.map((a) => [a.key, a.max])));
  refresh(g);
}

/** Unlock or lock talents by key (every talent in the group when keys is omitted). */
export async function setTalents(groupId: string, unlocked: boolean, keys?: string[]) {
  const g = group(groupId);
  const known = groupContents(g).talents;
  setTalentsUnlocked(keys ? known.filter((k) => keys.includes(k)) : known, unlocked);
  refresh(g);
}

/** Max every attribute and unlock every talent in one group, e.g. Holsters. */
export async function maxGroup(groupId: string) {
  await maxAttributes(groupId);
  await setTalents(groupId, true);
}

/** Max every weapon class or every gear slot at once. */
export async function maxKind(kind: "weapon" | "gear") {
  for (const g of kind === "weapon" ? WEAPON_GROUPS : GEAR_GROUPS) await maxGroup(g.id);
}
