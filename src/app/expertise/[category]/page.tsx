import Link from "next/link";
import { notFound } from "next/navigation";
import { cardById, categoryById, categoryProgress, otherTypes, rankOf } from "@/lib/expertise";
import { getProfile } from "@/lib/profile";
import { Tile } from "../Tile";
import { RankEditor } from "./RankEditor";

export const dynamic = "force-dynamic";

export default async function ExpertiseCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const id = (await params).category;
  const profile = getProfile();

  const back = (href = "/expertise", label = "Expertise overview") => (
    <Link href={href} className="text-sm text-muted hover:text-ink">
      ← {label}
    </Link>
  );

  // Weapons and Named & Exotics open a page of tiles (weapon classes / gear slots).
  const card = cardById(id);
  if (card && card.categories.length > 1) {
    return (
      <div className="flex flex-col gap-3">
        <div>
          {back()}
          <h1 className="mt-1 text-xl font-semibold">{card.title}</h1>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {card.categories.map((c) => {
            const p = categoryProgress(c, profile);
            return (
              <li key={c.id}>
                <Tile href={`/expertise/${c.id}`} title={c.title} complete={p.complete}>
                  Proficient with{" "}
                  <span className="font-semibold tabular-nums">
                    {p.proficient}/{p.total}
                  </span>
                </Tile>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (id === "other") {
    const other = otherTypes(profile);
    return (
      <div className="flex flex-col gap-3">
        <div>
          {back()}
          <h1 className="mt-1 text-xl font-semibold">Typed in by hand</h1>
          <p className="mt-1 text-sm text-muted">
            Proficiency entries that don&apos;t match a known item. Remove them once the matching item is ranked in its
            category.
          </p>
        </div>
        <RankEditor
          categoryId="other"
          other
          rows={other.map((o) => ({ name: o.name, group: "Other" }))}
          initialRanks={Object.fromEntries(other.map((o) => [o.name, o.rank]))}
        />
      </div>
    );
  }

  const category = categoryById(id);
  if (!category) notFound();
  const parent = category.parent && cardById(category.parent);
  return (
    <div className="flex flex-col gap-3">
      <div>
        {parent ? back(`/expertise/${parent.id}`, parent.title) : back()}
        <h1 className="mt-1 text-xl font-semibold">{category.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {category.types.length === 0
            ? "This list isn't available yet."
            : "Proficiency rank for each (0–10). Rank 10 is Proficient. Changes save as you go."}
        </p>
      </div>
      <RankEditor
        categoryId={category.id}
        rows={category.types}
        initialRanks={Object.fromEntries(category.types.map((t) => [t.name, rankOf(profile, t.name)]))}
      />
    </div>
  );
}
