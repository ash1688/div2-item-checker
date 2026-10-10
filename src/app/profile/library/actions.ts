"use server";
import { revalidatePath } from "next/cache";
import { LIBRARY_SCOPES, type LibraryScope, scopeContents } from "@/lib/library";
import { setLibraryValues, setTalentsUnlocked } from "@/lib/profile";

// Everything is checked against the game data: keys and talent names must be
// known, and "max" always means the real max, never a value sent by the browser.

function scopeOf(raw: string): LibraryScope {
  if (!LIBRARY_SCOPES.includes(raw as LibraryScope)) throw new Error("Unknown library.");
  return raw as LibraryScope;
}

function refresh(scope: LibraryScope) {
  revalidatePath("/profile");
  revalidatePath(`/profile/library/${scope}`);
}

/** Set one attribute's library value; null clears it. */
export async function saveAttribute(scope: string, key: string, value: number | null) {
  const s = scopeOf(scope);
  const attr = scopeContents(s).attributes.find((a) => a.key === key);
  if (!attr) throw new Error("Unknown attribute.");
  const v = value === null || !Number.isFinite(value) ? 0 : Math.min(Math.max(value, 0), attr.max);
  setLibraryValues({ [key]: v });
  refresh(s);
}

/** Max these attributes (or every attribute in the scope / section when keys is omitted). */
export async function maxAttributes(scope: string, keys?: string[], sectionId?: string) {
  const s = scopeOf(scope);
  const attrs = scopeContents(s, sectionId).attributes.filter((a) => !keys || keys.includes(a.key));
  setLibraryValues(Object.fromEntries(attrs.map((a) => [a.key, a.max])));
  refresh(s);
}

/** Unlock or lock talents (every talent in the scope / section when names is omitted). */
export async function setTalents(scope: string, unlocked: boolean, names?: string[], sectionId?: string) {
  const s = scopeOf(scope);
  const known = scopeContents(s, sectionId).talents;
  setTalentsUnlocked(names ? known.filter((n) => names.includes(n)) : known, unlocked);
  refresh(s);
}

/** The card button: max every attribute and unlock every talent in gear or weapons. */
export async function maxScope(scope: string) {
  await maxAttributes(scope);
  await setTalents(scope, true);
}
