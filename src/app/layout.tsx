import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Div2 Item Checker",
  description: "Keep, extract, feed or junk your Division 2 loot.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f1114" };

const nav = [
  { href: "/", label: "Scan" },
  { href: "/scans", label: "History" },
  { href: "/expertise", label: "Expertise" },
  { href: "/profile", label: "Profile" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <header className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
            <Link href="/" className="font-bold tracking-wide text-shd">
              DIV2 CHECKER
            </Link>
            <nav className="ml-auto flex gap-4 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-muted hover:text-ink">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
