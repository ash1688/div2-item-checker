"use client";
import { useTransition } from "react";
import { maxScope } from "./library/actions";

/** Card-level "Max all": overwrites a whole library, so it asks once. */
export function MaxScopeButton({ scope, title, disabled }: { scope: string; title: string; disabled: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="btn !px-3 !py-1.5 text-sm"
      disabled={disabled || pending}
      onClick={() => {
        if (confirm(`Mark every ${title.toLowerCase()} attribute as maxed and every talent as unlocked?`)) {
          startTransition(() => maxScope(scope));
        }
      }}
    >
      {pending ? "Saving…" : disabled ? "All maxed" : "Max all"}
    </button>
  );
}
