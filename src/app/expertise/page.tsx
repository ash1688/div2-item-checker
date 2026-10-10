import {
  cardProgress,
  EXPERTISE_CARDS,
  MAX_EXPERTISE_LEVEL,
  otherTypes,
} from "@/lib/expertise";
import { getExpertiseLevel, getProfile } from "@/lib/profile";
import { ExpertiseLevel } from "./ExpertiseLevel";
import { Tile } from "./Tile";

export const dynamic = "force-dynamic";

/** Laid out like the in-game Expertise screen: level on the left, categories on the right. */
export default function ExpertisePage() {
  const profile = getProfile();
  const level = getExpertiseLevel();
  const progress = EXPERTISE_CARDS.map((card) => ({ card, p: cardProgress(card, profile) }));
  const proficient = progress.reduce((n, { p }) => n + p.proficient, 0);
  const total = progress.reduce((n, { p }) => n + p.total, 0);
  const other = otherTypes(profile);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      <aside className="card flex shrink-0 flex-col items-center gap-3 md:sticky md:top-20 md:w-56">
        <h1 className="self-stretch text-lg font-semibold">Expertise</h1>
        <ExpertiseLevel level={level} max={MAX_EXPERTISE_LEVEL} />
        <div className="w-full rounded-md border-l-4 border-shd bg-panel-2 px-3 py-2">
          <div className="text-sm text-muted">Proficient</div>
          <div className="text-xl font-semibold tabular-nums">
            {proficient}/{total}
          </div>
        </div>
      </aside>

      <section className="card flex min-w-0 flex-1 flex-col gap-4" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-lg font-semibold">
          Select category
        </h2>
        <ul className="grid grid-cols-2 gap-2">
          {progress.map(({ card, p }) => (
            <li key={card.id}>
              <Tile href={`/expertise/${card.id}`} title={card.title} complete={p.complete}>
                {p.total === 0 ? (
                  "List coming soon"
                ) : (
                  <>
                    Proficient with{" "}
                    <span className="font-semibold tabular-nums">
                      {p.proficient}/{p.total}
                    </span>
                  </>
                )}
              </Tile>
            </li>
          ))}
        </ul>
        {other.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Other</h3>
            <ul className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              <li>
                <Tile href="/expertise/other" title="Typed in by hand" complete={false}>
                  {other.length} not matched to a known item
                </Tile>
              </li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
