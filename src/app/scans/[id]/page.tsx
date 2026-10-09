import { notFound } from "next/navigation";
import { VerdictBadge } from "@/components/VerdictBadge";
import { ATTRIBUTES, TALENTS, type AttributeCategory } from "@/lib/game";
import { getProfile } from "@/lib/profile";
import { getScan } from "@/lib/scans";
import { markExoticOwned, markExtracted, removeScan } from "./actions";
import { ReviewForm } from "./ReviewForm";

export const dynamic = "force-dynamic";

function namesFor(...categories: AttributeCategory[]) {
  return [...new Set(ATTRIBUTES.filter((a) => categories.includes(a.category)).map((a) => a.name))];
}

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const scan = getScan(id);
  if (!scan) notFound();
  const v = scan.verdict;
  const ownsExotic =
    scan.item?.rarity === "exotic" && getProfile().exoticsOwned.includes(scan.item.name);

  const unsure = scan.item && [...scan.item.core, ...scan.item.attributes].some((a) => a.uncertain);

  return (
    <div className="flex flex-col gap-6">
      {scan.error && (
        <p className="card border-expertise text-sm">
          Couldn&apos;t read this screenshot automatically ({scan.error}) Fill in the form below.
        </p>
      )}
      {unsure && (
        <p className="card border-expertise text-sm">
          Some values weren&apos;t read clearly. They&apos;re highlighted in yellow below: check them against the
          screenshot, then press <strong>Get verdict</strong>. The verdict shown is provisional until then.
        </p>
      )}
      {v && (
        <section className="card flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <VerdictBadge action={v.action} large />
            <span className="font-semibold">{scan.item?.name}</span>
          </div>
          <ul className="list-disc pl-5 text-sm">
            {v.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {v.notes.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-muted">
              {v.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
          {v.warnings.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-expertise">
              {v.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <table className="w-full text-sm">
            <tbody>
              {v.rolls.map((r, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="py-1.5 pr-2">{r.name}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">
                    {r.value.toLocaleString("en-GB")}
                    {r.max !== null && <span className="text-muted"> / {r.max.toLocaleString("en-GB")}</span>}
                  </td>
                  <td className="w-20 py-1.5">
                    <div className="h-2 rounded bg-panel-2">
                      <div
                        className={`h-2 rounded ${(r.pct ?? 0) >= 0.95 ? "bg-keep" : "bg-muted"}`}
                        style={{ width: `${Math.min(100, Math.round((r.pct ?? 0) * 100))}%` }}
                      />
                    </div>
                  </td>
                  <td className="w-16 py-1.5 text-right tabular-nums text-muted">
                    {r.pct === null ? "?" : r.perfect ? "perfect" : `${Math.round(r.pct * 100)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap gap-2">
            {v.libraryGains.length > 0 && (
              <form action={markExtracted.bind(null, id)}>
                <button className="btn btn-ghost text-sm">I extracted it: update my library</button>
              </form>
            )}
            {scan.item?.rarity === "exotic" && !ownsExotic && (
              <form action={markExoticOwned.bind(null, id)}>
                <button className="btn btn-ghost text-sm">I kept it: mark exotic as owned</button>
              </form>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/uploads/${scan.imagePath}`}
          alt="Uploaded screenshot"
          className="w-full rounded-md border border-line"
        />
        <ReviewForm
          scanId={id}
          initial={scan.item}
          names={{
            weaponCore: namesFor("weapon-core", "weapon-secondary"),
            weaponMinor: namesFor("weapon-minor"),
            gearCore: namesFor("gear-core"),
            gearMinor: namesFor("gear-minor"),
            talents: TALENTS.map((t) => t.name),
          }}
        />
      </section>

      <form action={removeScan.bind(null, id)} className="self-end">
        <button className="text-sm text-muted underline">Delete this scan</button>
      </form>
    </div>
  );
}
