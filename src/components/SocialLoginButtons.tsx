"use client";

import { signIn } from "next-auth/react";

interface SocialProvider {
  id: string;
  label: string;
}

export default function SocialLoginButtons({ providers }: { providers: SocialProvider[] }) {
  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="social-login-grid">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          className="social-login-button"
          onClick={() => signIn(provider.id, { callbackUrl: "/admin" })}
        >
          {provider.label}
        </button>
      ))}
    </div>
  );
}
