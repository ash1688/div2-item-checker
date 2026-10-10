import Link from "next/link";
import { LIBRARY_SCOPES, SCOPE_TITLE, scopeProgress } from "@/lib/library";
import { getExpertiseLevel, getProfile } from "@/lib/profile";
import {
  deleteExotic,
  deleteProficiency,
  saveExotic,
  saveExpertise,
  saveProficiency,
} from "./actions";
import { MaxScopeButton } from "./MaxScopeButton";

export const dynamic = "force-dynamic";

function Progress({ label, done, total }: { label: string; done: number; total: number }) {
  return (
    <div className="text-sm">
      <div className="flex justify-between text-muted">
        <span>{label}</span>
        <span className="tabular-nums">
          {done}/{total}
        </span>
      </div>
      <div className="mt-1 h-1.5 rounded bg-panel-2">
        <div className="h-1.5 rounded bg-keep" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function Section({ title, hint, children, open }: { title: string; hint?: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="card" open={open}>
      <summary className="cursor-pointer font-semibold">{title}</summary>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </details>
  );
}

export default function ProfilePage() {
  const profile = getProfile();
  const level = getExpertiseLevel();
  const proficiency = Object.entries(profile.proficiency).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Profile</h1>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Recalibration library">
        {LIBRARY_SCOPES.map((scope) => {
          const p = scopeProgress(scope, profile);
          const all = p.attributesMaxed === p.attributesTotal && p.talentsUnlocked === p.talentsTotal;
          return (
            <div key={scope} className="card flex flex-col gap-3">
              <Link href={`/profile/library/${scope}`} className="group flex flex-col gap-2">
                <div className="flex items-center">
                  <h2 className="font-semibold">{SCOPE_TITLE[scope]} library</h2>
                  <span className="ml-auto text-muted group-hover:text-ink" aria-hidden>→</span>
                </div>
                <Progress label="Attributes maxed" done={p.attributesMaxed} total={p.attributesTotal} />
                <Progress label="Talents unlocked" done={p.talentsUnlocked} total={p.talentsTotal} />
              </Link>
              <div className="self-start">
                <MaxScopeButton scope={scope} title={SCOPE_TITLE[scope]} disabled={all} />
              </div>
            </div>
          );
        })}
      </section>

      <Section title={`Expertise level: ${level}`} open>
        <form action={saveExpertise} className="flex gap-2">
          <input type="number" name="level" min={0} max={30} defaultValue={level} className="w-24" />
          <button className="btn">Save</button>
        </form>
      </Section>

      <Section
        title="Proficiency"
        hint="Rank per item type: weapon model, brand, gear set, named item or exotic. Rank 10 = Proficient (maxed). Types not listed count as below 10."
        open
      >
        <ul className="flex flex-col gap-2">
          {proficiency.map(([type, rank]) => (
            <li key={type} className="flex items-center gap-2">
              <form action={saveProficiency} className="flex flex-1 items-center gap-2">
                <input type="hidden" name="type" value={type} />
                <span className="flex-1 truncate">{type}</span>
                <input type="number" name="rank" min={0} max={10} defaultValue={rank} className="w-16" />
                <button className="btn btn-ghost !px-3 text-sm">Save</button>
              </form>
              <form action={deleteProficiency.bind(null, type)}>
                <button className="px-2 text-muted" aria-label={`Remove ${type}`}>✕</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={saveProficiency} className="mt-3 flex gap-2">
          <input name="type" placeholder="e.g. SOCOM Mk16 or Core Strength" className="flex-1" required />
          <input type="number" name="rank" min={0} max={10} defaultValue={10} className="w-16" />
          <button className="btn">Add</button>
        </form>
      </Section>

      <Section title={`Exotics owned (${profile.exoticsOwned.length})`} hint="A first copy of an exotic is always kept.">
        <ul className="flex flex-wrap gap-2">
          {profile.exoticsOwned.map((name) => (
            <li key={name} className="flex items-center gap-1 rounded bg-panel-2 py-1 pl-3 pr-1 text-sm">
              {name}
              <form action={deleteExotic.bind(null, name)}>
                <button className="px-1 text-muted" aria-label={`Remove ${name}`}>✕</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={saveExotic} className="mt-3 flex gap-2">
          <input name="name" placeholder="Exotic name, e.g. Vile" className="flex-1" required />
          <button className="btn">Add</button>
        </form>
      </Section>
    </div>
  );
}
