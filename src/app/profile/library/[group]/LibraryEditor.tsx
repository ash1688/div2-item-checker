"use client";
import { useState, useTransition } from "react";
import type { LibraryAttribute, LibrarySection } from "@/lib/library";
import { maxAttributes, maxGroup, saveAttribute, setTalents } from "../actions";

const tierColour: Record<string, string> = {
  S: "text-keep",
  A: "text-library",
  B: "text-expertise",
  C: "text-muted",
  D: "text-deconstruct",
};

const fmtMax = (a: LibraryAttribute) => `${a.max.toLocaleString("en-GB")}${a.unit === "%" ? "%" : ""}`;
// Library keys contain spaces and colons ("gear:Weapon Damage"), which aren't valid in an HTML id.
const inputId = (key: string) => `lib-${key.replace(/[^A-Za-z0-9]+/g, "-")}`;
const toText = (v: number | undefined) => (v ? String(v) : "");
const parse = (s: string) => {
  const n = Number(s.replace(/[^0-9.]/g, ""));
  return s.trim() && Number.isFinite(n) ? n : null;
};

export function LibraryEditor({
  groupId,
  sections,
  initialValues,
  initialUnlocked,
}: {
  groupId: string;
  sections: LibrarySection[];
  initialValues: Record<string, number>;
  initialUnlocked: string[];
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(initialValues).map(([k, v]) => [k, toText(v)])),
  );
  const [unlocked, setUnlocked] = useState(() => new Set(initialUnlocked));
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, startTransition] = useTransition();

  // Update the screen straight away, save in the background.
  const save = (job: () => Promise<void>) =>
    startTransition(async () => {
      try {
        await job();
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });

  const maxed = (a: LibraryAttribute) => (parse(values[a.key] ?? "") ?? 0) >= a.max;

  const setMax = (attrs: LibraryAttribute[], sectionId?: string) => {
    setValues((v) => ({ ...v, ...Object.fromEntries(attrs.map((a) => [a.key, String(a.max)])) }));
    save(() => maxAttributes(groupId, sectionId ? undefined : attrs.map((a) => a.key), sectionId));
  };

  const commit = (a: LibraryAttribute) => {
    const n = parse(values[a.key] ?? "");
    const clamped = n === null ? null : Math.min(n, a.max);
    setValues((v) => ({ ...v, [a.key]: toText(clamped ?? undefined) }));
    save(() => saveAttribute(groupId, a.key, clamped));
  };

  const toggleTalents = (keys: string[], on: boolean) => {
    setUnlocked((u) => {
      const next = new Set(u);
      for (const n of keys) {
        if (on) next.add(n);
        else next.delete(n);
      }
      return next;
    });
    save(() => setTalents(groupId, on, keys));
  };

  const allAttrs = sections.flatMap((s) => (s.kind === "attributes" ? s.attributes : []));
  const allTalents = sections.flatMap((s) => (s.kind === "talents" ? s.talents.map((t) => t.key) : []));
  const everything = allAttrs.every(maxed) && allTalents.every((k) => unlocked.has(k));
  const maxEverything = () => {
    setValues((v) => ({ ...v, ...Object.fromEntries(allAttrs.map((a) => [a.key, String(a.max)])) }));
    setUnlocked((u) => new Set([...u, ...allTalents]));
    save(() => maxGroup(groupId));
  };

  return (
    <div className="flex flex-col gap-4">
      <button className="btn self-start" disabled={everything} onClick={maxEverything}>
        {everything ? "Everything maxed" : "Max everything"}
      </button>
      <p className="sticky top-14 z-10 -mx-1 self-end rounded bg-bg/90 px-2 py-1 text-xs text-muted" aria-live="polite">
        {pending ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Couldn't save, try again" : ""}
      </p>

      {sections.map((section) => {
        if (section.kind === "attributes") {
          const done = section.attributes.filter(maxed).length;
          return (
            <section key={section.id} className="card flex flex-col gap-3">
              <header className="flex items-center gap-3">
                <h2 className="font-semibold">{section.title}</h2>
                <span className="text-sm text-muted">
                  {done}/{section.attributes.length} maxed
                </span>
                <button
                  className="btn ml-auto !px-3 !py-1 text-sm"
                  disabled={done === section.attributes.length}
                  onClick={() => setMax(section.attributes, section.id)}
                >
                  Max all
                </button>
              </header>
              <ul className="flex flex-col divide-y divide-line">
                {section.attributes.map((a) => (
                  <li key={a.key} className="flex items-center gap-2 py-2">
                    <label htmlFor={inputId(a.key)} className="min-w-0 flex-1 text-sm">
                      {a.name}
                      <span className="block text-xs text-muted">max {fmtMax(a)}</span>
                    </label>
                    <input
                      id={inputId(a.key)}
                      inputMode="decimal"
                      placeholder="0"
                      className={`w-24 text-right tabular-nums ${maxed(a) ? "!border-keep" : ""}`}
                      value={values[a.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [a.key]: e.target.value }))}
                      onBlur={() => commit(a)}
                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    />
                    <button
                      className={`w-16 rounded-md border py-1.5 text-sm font-semibold ${
                        maxed(a) ? "border-keep text-keep" : "border-shd text-shd"
                      }`}
                      disabled={maxed(a)}
                      onClick={() => setMax([a])}
                      aria-label={`Max ${a.name}`}
                    >
                      {maxed(a) ? "✓" : "Max"}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        const names = section.talents.map((t) => t.key);
        const done = names.filter((n) => unlocked.has(n)).length;
        return (
          <section key={section.id} className="card flex flex-col gap-3">
            <header className="flex items-center gap-3">
              <h2 className="font-semibold">{section.title}</h2>
              <span className="text-sm text-muted">
                {done}/{names.length} unlocked
              </span>
              <button
                className="btn ml-auto !px-3 !py-1 text-sm"
                disabled={done === names.length}
                onClick={() => toggleTalents(names, true)}
              >
                Unlock all
              </button>
            </header>
            <ul className="grid gap-x-4 sm:grid-cols-2">
              {section.talents.map((t) => (
                <li key={t.key}>
                  <label className="flex items-center gap-2 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      className="size-5 accent-[var(--color-keep)]"
                      checked={unlocked.has(t.key)}
                      onChange={(e) => toggleTalents([t.key], e.target.checked)}
                    />
                    <span className={`w-4 font-bold ${tierColour[t.tier]}`}>{t.tier}</span>
                    <span className="min-w-0 flex-1">
                      {t.name}
                      {t.restriction !== "Any" && t.restriction !== "None" && (
                        <span className="text-xs text-muted"> ({t.restriction})</span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
