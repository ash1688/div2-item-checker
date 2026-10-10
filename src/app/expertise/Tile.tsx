import Link from "next/link";

/** A category tile, orange when everything in it is proficient (like the game). */
export function Tile({ href, title, complete, children }: { href: string; title: string; complete: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex h-full flex-col justify-center gap-1 rounded-md border px-3 py-3 transition-colors ${
        complete ? "border-shd bg-shd text-black" : "border-line bg-panel-2 hover:border-shd"
      }`}
    >
      <span className="font-semibold">{title}</span>
      <span className={`text-xs ${complete ? "text-black/70" : "text-muted"}`}>{children}</span>
    </Link>
  );
}
