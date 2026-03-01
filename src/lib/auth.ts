import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeIdentity, resolveUserRole } from "@/lib/roles";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  );
}

if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    }),
  );
}

providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      identifier: { label: "Identifier", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const identifier = normalizeIdentity(credentials?.identifier);
      const password = credentials?.password ?? "";

      if (!identifier || !password) return null;

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }, { phone: identifier }],
        },
      });

      if (!user?.passwordHash) return null;

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        username: user.username,
        phone: user.phone,
      };
    },
  }),
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user }) {
      if (!user.id) {
        return true;
      }

      const role = resolveUserRole({
        email: user.email,
        username: (user as { username?: string | null }).username ?? null,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { role },
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string | null }).role ?? resolveUserRole({
          email: user.email,
          username: (user as { username?: string | null }).username ?? null,
        });
        token.username = (user as { username?: string | null }).username ?? null;
        token.phone = (user as { phone?: string | null }).phone ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as string | null | undefined) ?? "USER";
        session.user.username = (token.username as string | null | undefined) ?? null;
        session.user.phone = (token.phone as string | null | undefined) ?? null;
      }
      return session;
    },
  },
};
