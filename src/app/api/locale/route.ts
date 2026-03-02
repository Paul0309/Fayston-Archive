import { NextResponse } from "next/server";
import { type Locale, isLocale } from "@/lib/i18n";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { locale?: string };
  const locale = isLocale(body.locale) ? (body.locale as Locale) : null;

  if (!locale) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("locale", locale, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
