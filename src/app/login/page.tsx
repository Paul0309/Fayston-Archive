import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";

export default async function LoginPage() {
  const dict = getDictionary(await getServerLocale());
  const socialProviders = [
    process.env.GOOGLE_CLIENT_ID ? { id: "google", label: dict.auth.continueGoogle } : null,
    process.env.FACEBOOK_CLIENT_ID ? { id: "facebook", label: dict.auth.continueMeta } : null,
    process.env.APPLE_ID ? { id: "apple", label: dict.auth.continueApple } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <main className="px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <section className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">{dict.auth.loginKicker}</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">{dict.auth.loginTitle}</h1>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            {dict.auth.loginDescription}
          </p>

          <SocialLoginButtons providers={socialProviders} />
          <LoginForm />

          <p className="mt-6 text-sm text-[var(--muted)]">
            {dict.auth.loginNoAccount}
            <Link href="/signup" className="ml-2 font-semibold text-[var(--accent)]">
              {dict.auth.loginCreateOne}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
