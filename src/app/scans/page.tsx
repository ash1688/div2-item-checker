import Link from "next/link";
import { VerdictBadge } from "@/components/VerdictBadge";
import { listScans } from "@/lib/scans";

export const dynamic = "force-dynamic";

export default function HistoryPage() {
  const scans = listScans();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">History</h1>
      {scans.length === 0 && <p className="text-muted">No scans yet.</p>}
      <ul className="flex flex-col gap-2">
        {scans.map((s) => (
          <li key={s.id}>
            <Link href={`/scans/${s.id}`} className="card flex items-center gap-3 !p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/uploads/${s.imagePath}`} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{s.item?.name ?? "Not reviewed yet"}</div>
                <div className="truncate text-xs text-muted">
                  {[s.item?.brand ?? s.item?.weaponClass, s.createdAt.toLocaleString("en-GB")]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              {s.verdict ? (
                <VerdictBadge action={s.verdict.action} />
              ) : (
                <span className="text-xs text-expertise">Review</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
