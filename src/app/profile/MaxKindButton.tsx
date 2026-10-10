"use client";
import { useTransition } from "react";
import { maxKind } from "./library/actions";

/** "Max all" for every weapon class or every gear slot: overwrites a lot, so it asks once. */
export function MaxKindButton({ kind, disabled }: { kind: "weapon" | "gear"; disabled: boolean }) {
  const [pending, startTransition] = useTransition();
  const what = kind === "weapon" ? "weapon class" : "gear slot";
  return (
    <button
      className="btn !px-3 !py-1 text-sm"
      disabled={disabled || pending}
      onClick={() => {
        if (confirm(`Max every attribute and unlock every talent for every ${what}?`)) {
          startTransition(() => maxKind(kind));
        }
      }}
    >
      {pending ? "Saving…" : disabled ? "All maxed" : "Max all"}
    </button>
  );
}
