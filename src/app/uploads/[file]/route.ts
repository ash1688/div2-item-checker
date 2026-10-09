import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { UPLOAD_DIR } from "@/db";

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const file = basename((await params).file); // no path traversal
  try {
    const data = await readFile(join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
