"use server";
import { revalidatePath } from "next/cache";
import {
  addExotic,
  removeExotic,
  removeProficiency,
  setExpertiseLevel,
  setProficiency,
} from "@/lib/profile";

const clampInt = (v: FormDataEntryValue | null, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number(v) || 0)));

export async function saveExpertise(form: FormData) {
  setExpertiseLevel(clampInt(form.get("level"), 0, 30));
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
