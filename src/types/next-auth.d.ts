import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      username: string | null;
      phone: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
