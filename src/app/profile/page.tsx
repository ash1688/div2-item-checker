import { libraryAttributes, TALENTS, type TalentDef } from "@/lib/game";
import { getExpertiseLevel, getProfile } from "@/lib/profile";
import {
  deleteExotic,
  deleteProficiency,
  saveExotic,
  saveExpertise,
  saveLibrary,
  saveProficiency,
  saveTalents,
} from "./actions";

export const dynamic = "force-dynamic";

const tierColour: Record<TalentDef["tier"], string> = {
  S: "text-keep",
  A: "text-library",
  B: "text-expertise",
  C: "text-muted",
  D: "text-deconstruct",
};

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
  const libAttrs = libraryAttributes();
  const unlocked = new Set(profile.libraryTalents);
  const proficiency = Object.entries(profile.proficiency).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Profile</h1>

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

      <Section
        title="Library: attributes"
        hint="Your current best value for each attribute in the recalibration library. Leave blank if you have none."
      >
        <form action={saveLibrary} className="flex flex-col gap-4">
          {(["gear", "weapon"] as const).map((scope) => (
            <fieldset key={scope}>
              <legend className="mb-2 text-sm font-semibold uppercase text-muted">{scope}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {libAttrs
                  .filter((a) => a.scope === scope)
                  .map(({ key, def }) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <span className="flex-1">
                        {def.name}
                        <span className="text-muted">
                          {" "}
                          (max {def.max.toLocaleString("en-GB")}
                          {def.unit === "%" ? "%" : ""})
                        </span>
                      </span>
                      <input
                        name={key}
                        inputMode="decimal"
                        defaultValue={profile.libraryAttributes[key] ?? ""}
                        className="w-24"
                      />
                    </label>
                  ))}
              </div>
            </fieldset>
          ))}
          <button className="btn self-start">Save library</button>
        </form>
      </Section>

      <Section
        title={`Library: talents (${unlocked.size}/${TALENTS.length} unlocked)`}
        hint="Tick the talents you've unlocked. Tier: S/A count towards Keep when not unlocked."
      >
        <form action={saveTalents} className="flex flex-col gap-4">
          {(["weapon", "chest", "backpack"] as const).map((slot) => (
            <fieldset key={slot}>
              <legend className="mb-2 text-sm font-semibold uppercase text-muted">{slot}</legend>
              <div className="grid gap-1 sm:grid-cols-2">
                {TALENTS.filter((t) => t.slot === slot).map((t) => (
                  <label key={t.name} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="talent" value={t.name} defaultChecked={unlocked.has(t.name)} />
                    <span className={`w-4 font-bold ${tierColour[t.tier]}`}>{t.tier}</span>
                    {t.name}
                    {t.restriction !== "Any" && t.restriction !== "None" && (
                      <span className="text-xs text-muted">({t.restriction})</span>
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button className="btn self-start">Save talents</button>
        </form>
      </Section>
    </div>
  );
}
