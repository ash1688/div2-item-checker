"use client";
import { useActionState } from "react";
import { uploadScreenshots } from "./actions";

export default function ScanPage() {
  const [error, action, pending] = useActionState(uploadScreenshots, null);
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-xl font-semibold">Scan items</h1>
        <p className="mt-1 text-sm text-muted">
          Upload item screenshots (PS5 captures from the PlayStation App work best). You&apos;ll confirm
          what was read, then get a verdict.
        </p>
      </section>
      <form action={action} className="card flex flex-col gap-4">
        <label className="flex flex-col items-center gap-2 rounded-md border-2 border-dashed border-line px-4 py-10 text-center">
          <span className="font-medium">Choose screenshots</span>
          <span className="text-xs text-muted">You can pick several at once</span>
          <input type="file" name="images" accept="image/*" multiple required className="max-w-full text-sm" />
        </label>
        {error && <p className="text-sm text-deconstruct">{error}</p>}
        <button className="btn" disabled={pending}>
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>
    </div>
  );
}
