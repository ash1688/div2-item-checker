"use client";
import { useState, useTransition } from "react";
import { saveExpertiseLevel } from "./actions";

/** The level ring from the game's Expertise screen, editable. */
export function ExpertiseLevel({ level: initial, max }: { level: number; max: number }) {
  const [level, setLevel] = useState(initial);
  const [text, setText] = useState(String(initial));
  const [pending, startTransition] = useTransition();

  const save = (n: number) => {
    const v = Math.min(max, Math.max(0, Math.round(n) || 0));
    setLevel(v);
    setText(String(v));
    startTransition(() => saveExpertiseLevel(v));
  };

  const r = 44;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-32">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-panel-2)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--color-shd)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - level / max)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums">{level}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            {level >= max ? "Completed" : `of ${max}`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="size-9 rounded-md border border-line text-lg font-semibold disabled:opacity-40"
          disabled={level <= 0}
          onClick={() => save(level - 1)}
          aria-label="Lower expertise level by 1"
        >
          −
        </button>
        <label htmlFor="expertise-level" className="sr-only">
          Expertise level
        </label>
        <input
          id="expertise-level"
          inputMode="numeric"
          className="w-14 text-center tabular-nums"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => save(Number(text))}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
        <button
          className="size-9 rounded-md border border-line text-lg font-semibold disabled:opacity-40"
          disabled={level >= max}
          onClick={() => save(level + 1)}
          aria-label="Raise expertise level by 1"
        >
          +
        </button>
      </div>
      <div>
        <button
          className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${level >= max ? "border-keep text-keep" : "border-shd text-shd"}`}
          disabled={level >= max || pending}
          onClick={() => save(max)}
        >
          {level >= max ? "✓" : "Max"}
        </button>
      </div>
    </div>
  );
}
