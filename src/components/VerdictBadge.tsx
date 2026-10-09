import type { Action } from "@/lib/verdict";

const styles: Record<Action, { label: string; className: string }> = {
  keep: { label: "Keep", className: "bg-keep text-black" },
  library: { label: "Library", className: "bg-library text-black" },
  expertise: { label: "Expertise", className: "bg-expertise text-black" },
  deconstruct: { label: "Deconstruct", className: "bg-deconstruct text-black" },
  unsupported: { label: "Unsupported", className: "bg-line text-ink" },
};

export function VerdictBadge({ action, large }: { action: Action; large?: boolean }) {
  const s = styles[action];
  return (
    <span
      className={`inline-block rounded font-bold uppercase tracking-wide ${s.className} ${
        large ? "px-3 py-1 text-base" : "px-2 py-0.5 text-xs"
      }`}
    >
      {s.label}
    </span>
  );
}
