import Link from "next/link";
import { notFound } from "next/navigation";
import { groupById, librarySections } from "@/lib/library";
import { getProfile } from "@/lib/profile";
import { LibraryEditor } from "./LibraryEditor";

export const dynamic = "force-dynamic";

export default async function LibraryGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const group = groupById((await params).group);
  if (!group) notFound();
  const profile = getProfile();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/profile" className="text-sm text-muted hover:text-ink">
          ← Library overview
        </Link>
        <h1 className="mt-1 text-xl font-semibold">{group.title}</h1>
        <p className="mt-1 text-sm text-muted">
          Your best value for each attribute{group.kind === "weapon" || group.gearSlot === "Chest" || group.gearSlot === "Backpack" ? " and which talents you've unlocked" : ""} for {group.title.toLowerCase()}. Changes save as you go.
        </p>
      </div>
      <LibraryEditor
        groupId={group.id}
        sections={librarySections(group)}
        initialValues={profile.libraryAttributes}
        initialUnlocked={profile.libraryTalents}
      />
    </div>
  );
}
