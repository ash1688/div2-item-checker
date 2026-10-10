import Link from "next/link";
import { notFound } from "next/navigation";
import { LIBRARY_SCOPES, type LibraryScope, librarySections, SCOPE_TITLE } from "@/lib/library";
import { getProfile } from "@/lib/profile";
import { LibraryEditor } from "./LibraryEditor";

export const dynamic = "force-dynamic";

export default async function LibraryScopePage({ params }: { params: Promise<{ scope: string }> }) {
  const { scope } = await params;
  if (!LIBRARY_SCOPES.includes(scope as LibraryScope)) notFound();
  const s = scope as LibraryScope;
  const profile = getProfile();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/profile" className="text-sm text-muted hover:text-ink">
          ← Profile
        </Link>
        <h1 className="mt-1 text-xl font-semibold">{SCOPE_TITLE[s]} library</h1>
        <p className="mt-1 text-sm text-muted">
          Your best value for each attribute and which talents you&apos;ve unlocked. Changes save as you go.
        </p>
      </div>
      <LibraryEditor
        scope={s}
        sections={librarySections(s)}
        initialValues={profile.libraryAttributes}
        initialUnlocked={profile.libraryTalents}
      />
    </div>
  );
}
