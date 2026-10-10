import Link from "next/link";
import { GEAR_GROUPS, groupProgress, type LibraryGroup, WEAPON_GROUPS } from "@/lib/library";
import type { Profile } from "@/lib/verdict";
import { MaxKindButton } from "./MaxKindButton";

/** The recalibration library overview, laid out like the in-game Library > Overview screen. */
export function LibraryOverview({ profile }: { profile: Profile }) {
  return (
    <section className="card flex flex-col gap-4" aria-labelledby="library-heading">
      <h2 id="library-heading" className="text-lg font-semibold">
        Library
      </h2>
      <TileGroup title="Weapons" kind="weapon" groups={WEAPON_GROUPS} profile={profile} />
      <TileGroup title="Gear" kind="gear" groups={GEAR_GROUPS} profile={profile} />
    </section>
  );
}

function TileGroup({
  title,
  kind,
  groups,
  profile,
}: {
  title: string;
  kind: "weapon" | "gear";
  groups: LibraryGroup[];
  profile: Profile;
}) {
  const progress = groups.map((g) => ({ group: g, p: groupProgress(g, profile) }));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h3>
        <div className="ml-auto">
          <MaxKindButton kind={kind} disabled={progress.every(({ p }) => p.complete)} />
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {progress.map(({ group, p }) => (
          <li key={group.id}>
            <Link
              href={`/profile/library/${group.id}`}
              className={`flex h-full flex-col items-center justify-center gap-1 rounded-md border px-2 py-3 text-center transition-colors ${
                p.complete
                  ? "border-shd bg-shd text-black"
                  : "border-line bg-panel-2 hover:border-shd"
              }`}
            >
              <span className="font-semibold">{group.title}</span>
              <span className={`text-xs tabular-nums ${p.complete ? "text-black/70" : "text-muted"}`}>
                {p.complete ? (
                  "All maxed"
                ) : (
                  <>
                    {p.attributesMaxed}/{p.attributesTotal} maxed
                    {p.talentsTotal > 0 && ` · ${p.talentsUnlocked}/${p.talentsTotal} talents`}
                  </>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
