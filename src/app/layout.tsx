import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import AuthStatus from "@/components/AuthStatus";
import FloatingActionBar from "@/components/FloatingActionBar";
import WaveScrollIndicator from "@/components/WaveScrollIndicator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fayston School Archive",
  description: "Official school archive for projects, awards, events, publications, and editorial updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthSessionProvider>
          <div className="app-shell">
            <header className="top-nav">
              <div className="nav-wrap">
                <Link href="/" className="nav-brand">
                  FAYSTON ARCHIVE
                </Link>
                <nav className="nav-links" aria-label="Global">
                  <Link href="/" className="nav-link">Home</Link>
                  <Link href="/archive" className="nav-link">Archive</Link>
                  <Link href="/updates" className="nav-link">Updates</Link>
                  <Link href="/projects" className="nav-link">Projects</Link>
                  <Link href="/links" className="nav-link">Links</Link>
                  <Link href="/admin" className="nav-link">Admin</Link>
                  <Link href="/api/archive" className="nav-link">API</Link>
                </nav>
                <AuthStatus />
              </div>
            </header>
            {children}
            <WaveScrollIndicator />
            <FloatingActionBar />
            <footer
              id="site-footer"
              className="border-t border-[var(--border)] px-4 py-5 text-xs text-[var(--muted)]"
            >
              <div className="mx-auto grid w-full max-w-6xl gap-5 md:grid-cols-3">
                <div>
                  <p className="font-semibold text-[var(--primary)]">Fayston Archive</p>
                  <p className="mt-1">
                    Official school archive for records, profiles, activity history, and editorial updates.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-[var(--primary)]">Trust & Policy</p>
                  <div className="mt-1 flex flex-wrap gap-3">
                    <Link href="/policy" className="font-semibold text-[var(--accent)]">
                      Policy
                    </Link>
                    <Link href="/request-update" className="font-semibold text-[var(--accent)]">
                      Request Update
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-[var(--primary)]">Explore</p>
                  <div className="mt-1 flex flex-wrap gap-3">
                    <Link href="/archive" className="font-semibold text-[var(--accent)]">
                      Archive
                    </Link>
                    <Link href="/updates" className="font-semibold text-[var(--accent)]">
                      Updates
                    </Link>
                    <Link href="/links" className="font-semibold text-[var(--accent)]">
                      School Links
                    </Link>
                    <Link href="/admin" className="font-semibold text-[var(--accent)]">
                      Admin
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
