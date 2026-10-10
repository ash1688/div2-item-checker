import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryById, otherTypes, rankOf } from "@/lib/expertise";
import { getProfile } from "@/lib/profile";
import { RankEditor } from "./RankEditor";

export const dynamic = "force-dynamic";

export default async function ExpertiseCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const id = (await params).category;
  const profile = getProfile();

  const back = (
    <Link href="/expertise" className="text-sm text-muted hover:text-ink">
      ← Expertise overview
    </Link>
  );

  if (id === "other") {
    const other = otherTypes(profile);
    return (
      <div className="flex flex-col gap-3">
        <div>
          {back}
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
  return (
    <div className="flex flex-col gap-3">
      <div>
        {back}
        <h1 className="mt-1 text-xl font-semibold">{category.title}</h1>
        <p className="mt-1 text-sm text-muted">
          Proficiency rank for each (0–10). Rank 10 is Proficient. Changes save as you go.
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
