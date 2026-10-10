"use client";
import { useMemo, useState, useTransition } from "react";
import { maxCategory, removeOther, setOtherRank, setRank } from "../actions";

const MAX = 10;

interface Row {
  name: string;
  group: string;
}

const inputId = (name: string) => `rank-${name.replace(/[^A-Za-z0-9]+/g, "-")}`;

/** Rank (0-10) per item, with Max buttons; changes save as you go. */
export function RankEditor({
  categoryId,
  rows,
  initialRanks,
  other,
}: {
  categoryId: string;
  rows: Row[];
  initialRanks: Record<string, number>;
  /** The "Other" list: hand-typed entries, which can also be removed. */
  other?: boolean;
}) {
  const [ranks, setRanks] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.name, initialRanks[r.name] ? String(initialRanks[r.name]) : ""])),
  );
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, startTransition] = useTransition();

  const save = (job: () => Promise<void>) =>
    startTransition(async () => {
      try {
        await job();
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });

  const rankOf = (name: string) => Math.min(MAX, Math.max(0, Math.round(Number(ranks[name]) || 0)));
  const commit = (name: string, rank: number) => {
    setRanks((r) => ({ ...r, [name]: rank ? String(rank) : "" }));
    save(() => (other ? setOtherRank(name, rank) : setRank(categoryId, name, rank)));
  };

  const visible = rows.filter((r) => !removed.has(r.name) && r.name.toLowerCase().includes(query.trim().toLowerCase()));
  const groups = useMemo(() => [...new Set(rows.map((r) => r.group))], [rows]);
  const proficient = rows.filter((r) => !removed.has(r.name) && rankOf(r.name) >= MAX).length;
  const total = rows.length - removed.size;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">
          Proficient with{" "}
          <span className="font-semibold tabular-nums text-ink">
            {proficient}/{total}
          </span>
        </span>
        {!other && (
          <button
            className="btn ml-auto !px-3 !py-1 text-sm"
            disabled={proficient === total}
            onClick={() => {
              setRanks(Object.fromEntries(rows.map((r) => [r.name, String(MAX)])));
              save(() => maxCategory(categoryId));
            }}
          >
            {proficient === total ? "All proficient" : "Max all"}
          </button>
        )}
        <span className="w-full text-right text-xs text-muted sm:w-auto" aria-live="polite">
          {pending ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Couldn't save, try again" : ""}
        </span>
      </div>

      {rows.length > 12 && (
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search this category"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {groups.map((group) => {
        const items = visible.filter((r) => r.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="card flex flex-col">
            {groups.length > 1 && <h2 className="mb-1 font-semibold">{group}</h2>}
            <ul className="flex flex-col divide-y divide-line">
              {items.map((r) => {
                const maxed = rankOf(r.name) >= MAX;
                return (
                  <li key={r.name} className="flex items-center gap-2 py-2">
                    <label htmlFor={inputId(r.name)} className="min-w-0 flex-1 text-sm">
                      {r.name}
                    </label>
                    <input
                      id={inputId(r.name)}
                      inputMode="numeric"
                      placeholder="0"
                      aria-label={`${r.name} rank`}
                      className={`w-14 text-center tabular-nums ${maxed ? "!border-keep" : ""}`}
                      value={ranks[r.name] ?? ""}
                      onChange={(e) => setRanks((x) => ({ ...x, [r.name]: e.target.value }))}
                      onBlur={() => commit(r.name, rankOf(r.name))}
                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    />
                    <button
                      className={`w-16 rounded-md border py-1.5 text-sm font-semibold ${
                        maxed ? "border-keep text-keep" : "border-shd text-shd"
                      }`}
                      disabled={maxed}
                      onClick={() => commit(r.name, MAX)}
                      aria-label={`Max ${r.name}`}
                    >
                      {maxed ? "✓" : "Max"}
                    </button>
                    {other && (
                      <button
                        className="px-1 text-muted"
                        aria-label={`Remove ${r.name}`}
                        onClick={() => {
                          setRemoved((s) => new Set([...s, r.name]));
                          save(() => removeOther(r.name));
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {visible.length === 0 && <p className="text-sm text-muted">Nothing matches.</p>}
    </div>
  );
}
