"use server";
import { revalidatePath } from "next/cache";
import {
  addExotic,
  removeExotic,
  removeKeptItem,
} from "@/lib/profile";

export async function saveExotic(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (name) addExotic(name);
  revalidatePath("/profile");
}

export async function deleteExotic(name: string) {
  removeExotic(name);
  revalidatePath("/profile");
}

export async function deleteKeptItem(key: string) {
  removeKeptItem(key);
  revalidatePath("/profile");
}
