import { cookies } from "next/headers";
import { type Locale, isLocale } from "@/lib/i18n";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  return isLocale(cookieLocale) ? cookieLocale : "en";
}
