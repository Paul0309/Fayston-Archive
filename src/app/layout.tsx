import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import AuthStatus from "@/components/AuthStatus";
import FloatingActionBar from "@/components/FloatingActionBar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LanguageProvider } from "@/components/LanguageProvider";
import WaveScrollIndicator from "@/components/WaveScrollIndicator";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthSessionProvider>
          <LanguageProvider initialLocale={locale}>
            <div className="app-shell">
              <header className="top-nav">
                <div className="nav-wrap">
                  <Link href="/" className="nav-brand">
                    FAYSTON ARCHIVE
                  </Link>
                  <nav className="nav-links" aria-label="Global">
                    <Link href="/" className="nav-link">{dict.nav.home}</Link>
                    <Link href="/archive" className="nav-link">{dict.nav.archive}</Link>
                    <Link href="/updates" className="nav-link">{dict.nav.updates}</Link>
                    <Link href="/projects" className="nav-link">{dict.nav.projects}</Link>
                    <Link href="/links" className="nav-link">{dict.nav.links}</Link>
                    <Link href="/students" className="nav-link">{dict.nav.students}</Link>
                    <Link href="/admin" className="nav-link">{dict.nav.admin}</Link>
                    <Link href="/api/archive" className="nav-link">{dict.nav.api}</Link>
                  </nav>
                  <div className="nav-actions">
                    <LanguageSwitcher />
                    <AuthStatus />
                  </div>
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
                    <p className="font-semibold text-[var(--primary)]">{dict.footer.title}</p>
                    <p className="mt-1">
                      {dict.footer.description}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-[var(--primary)]">{dict.footer.trust}</p>
                    <div className="mt-1 flex flex-wrap gap-3">
                      <Link href="/policy" className="font-semibold text-[var(--accent)]">
                        {dict.footer.policy}
                      </Link>
                      <Link href="/request-update" className="font-semibold text-[var(--accent)]">
                        {dict.footer.requestUpdate}
                      </Link>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-[var(--primary)]">{dict.footer.explore}</p>
                    <div className="mt-1 flex flex-wrap gap-3">
                      <Link href="/archive" className="font-semibold text-[var(--accent)]">
                        {dict.nav.archive}
                      </Link>
                      <Link href="/updates" className="font-semibold text-[var(--accent)]">
                        {dict.nav.updates}
                      </Link>
                      <Link href="/links" className="font-semibold text-[var(--accent)]">
                        {dict.footer.schoolLinks}
                      </Link>
                      <Link href="/students" className="font-semibold text-[var(--accent)]">
                        {dict.nav.students}
                      </Link>
                      <Link href="/admin" className="font-semibold text-[var(--accent)]">
                        {dict.nav.admin}
                      </Link>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </LanguageProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
