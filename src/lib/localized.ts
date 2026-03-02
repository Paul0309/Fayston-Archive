import type { Locale } from "@/lib/i18n";

export interface LocalizedText {
  en: string;
  ko: string;
}

export function localized(en: string, ko: string): LocalizedText {
  return { en, ko };
}

export function getLocalizedText(value: string | LocalizedText, locale: Locale): string {
  return typeof value === "string" ? value : value[locale];
}

export function getLocalizedList(values: Array<string | LocalizedText>, locale: Locale): string[] {
  return values.map((value) => getLocalizedText(value, locale));
}
