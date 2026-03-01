import Link from "next/link";
import SignupForm from "@/components/SignupForm";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function SignupPage() {
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
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">Create Account</h1>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Register with name, username, email, phone, and password. Social sign up is also available.
          </p>

          <SocialLoginButtons providers={socialProviders} />
          <SignupForm />

          <p className="mt-6 text-sm text-[var(--muted)]">
            Already registered?
            <Link href="/login" className="ml-2 font-semibold text-[var(--accent)]">
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
