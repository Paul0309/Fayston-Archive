"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="auth-nav"><span className="auth-nav-user">Loading...</span></div>;
  }

  if (!session?.user) {
    return (
      <div className="auth-nav">
        <Link href="/login" className="nav-link">Login</Link>
        <Link href="/signup" className="nav-link">Sign Up</Link>
      </div>
    );
  }

  return (
    <div className="auth-nav">
      <Link href="/me" className="nav-link">My Page</Link>
      <span className="auth-nav-user">
        {session.user.name ?? session.user.username ?? session.user.email}
      </span>
      <button
        type="button"
        className="auth-nav-button"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Logout
      </button>
    </div>
  );
}
