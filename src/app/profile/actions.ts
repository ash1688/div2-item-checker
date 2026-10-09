"use server";
import { revalidatePath } from "next/cache";
import { libraryAttributes as allLibraryAttributes, TALENTS } from "@/lib/game";
import {
  addExotic,
  removeExotic,
  removeProficiency,
  setExpertiseLevel,
  setLibraryTalents,
  setLibraryValues,
  setProficiency,
} from "@/lib/profile";

const clampInt = (v: FormDataEntryValue | null, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number(v) || 0)));

export async function saveExpertise(form: FormData) {
  setExpertiseLevel(clampInt(form.get("level"), 0, 30));
  revalidatePath("/profile");
}

export async function saveLibrary(form: FormData) {
  const values: Record<string, number> = {};
  for (const { key } of allLibraryAttributes()) {
    const raw = String(form.get(key) ?? "").replace(/[^0-9.]/g, "");
    values[key] = raw ? Number(raw) : 0;
  }
  setLibraryValues(values);
  revalidatePath("/profile");
}

export async function saveTalents(form: FormData) {
  const known = new Set(TALENTS.map((t) => t.name));
  setLibraryTalents(form.getAll("talent").map(String).filter((t) => known.has(t)));
  revalidatePath("/profile");
}

export async function saveProficiency(form: FormData) {
  const type = String(form.get("type") ?? "").trim();
  if (type) setProficiency(type, clampInt(form.get("rank"), 0, 10));
  revalidatePath("/profile");
}

export async function deleteProficiency(type: string) {
  removeProficiency(type);
  revalidatePath("/profile");
}

export async function saveExotic(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (name) addExotic(name);
  revalidatePath("/profile");
}

export async function deleteExotic(name: string) {
  removeExotic(name);
  revalidatePath("/profile");
}
