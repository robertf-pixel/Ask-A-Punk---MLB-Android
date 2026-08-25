export const LOCALES = [
  "magandjin",
  "gadigal",
  "melbourne",
  "kaurna yerta",
  "boorloo",
  "canberra",
  "north coast",
  "central coast",
  "south coast",
  "luitruwita",
] as const;

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}