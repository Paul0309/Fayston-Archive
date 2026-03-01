import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function LoginPage() {
  const socialProviders = [
    process.env.GOOGLE_CLIENT_ID ? { id: "google", label: "Continue with Google" } : null,
    process.env.FACEBOOK_CLIENT_ID ? { id: "facebook", label: "Continue with Meta" } : null,
    process.env.APPLE_ID ? { id: "apple", label: "Continue with Apple" } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <main className="px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <section className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">Authentication</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">Log In</h1>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Use Google, Meta, Apple, or sign in with email, phone, or username plus password.
          </p>

          <SocialLoginButtons providers={socialProviders} />
          <LoginForm />

          <p className="mt-6 text-sm text-[var(--muted)]">
            No account yet?
            <Link href="/signup" className="ml-2 font-semibold text-[var(--accent)]">
              Create one
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
