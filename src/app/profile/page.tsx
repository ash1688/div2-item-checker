import Link from "next/link";
import { getKeptItems, getProfile } from "@/lib/profile";
import { rollQuality } from "@/lib/verdict";
import {
  deleteExotic,
  deleteKeptItem,
  saveExotic,
} from "./actions";
import { LibraryOverview } from "./LibraryOverview";

export const dynamic = "force-dynamic";

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
  const kept = getKeptItems().sort((a, b) => a.item.name.localeCompare(b.item.name));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Profile</h1>

      <LibraryOverview profile={profile} />

      <Section
        title={`Kept items (${kept.length})`}
        hint="The copy of each item you're keeping. A new copy is only kept if it rolls better on average; then you junk the old one."
      >
        {kept.length === 0 && <p className="text-sm text-muted">Nothing yet. Use "I'm keeping this" on a scan.</p>}
        <ul className="flex flex-col divide-y divide-line">
          {kept.map((k) => {
            const q = rollQuality(k.item);
            return (
              <li key={k.key} className="flex items-center gap-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  {k.scanId ? (
                    <Link href={`/scans/${k.scanId}`} className="font-medium hover:underline">
                      {k.item.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{k.item.name}</span>
                  )}
                  <span className="block truncate text-xs text-muted">
                    {[...k.item.core, ...k.item.attributes].map((a) => `${a.name} ${a.value.toLocaleString("en-GB")}`).join(" · ")}
                  </span>
                </div>
                <span className="tabular-nums text-muted" title="Average roll">
                  {q === null ? "?" : `${Math.round(q * 100)}%`}
                </span>
                <form action={deleteKeptItem.bind(null, k.key)}>
                  <button className="px-2 text-muted" aria-label={`Stop keeping ${k.item.name}`}>✕</button>
                </form>
              </li>
            );
          })}
        </ul>
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
