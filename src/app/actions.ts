"use server";
import { redirect } from "next/navigation";
import { analyseScan, createScan } from "@/lib/scans";

export async function uploadScreenshots(_prev: string | null, form: FormData): Promise<string | null> {
  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return "Pick at least one screenshot.";
  const ids: number[] = [];
  for (const file of files) {
    try {
      ids.push(await createScan(file));
    } catch {
      return `Couldn't read ${file.name}. Use a JPEG or PNG screenshot.`;
    }
  }
  // Read each screenshot now; a few seconds per image.
  for (const id of ids) await analyseScan(id);
  redirect(ids.length === 1 ? `/scans/${ids[0]}` : "/scans");
}
