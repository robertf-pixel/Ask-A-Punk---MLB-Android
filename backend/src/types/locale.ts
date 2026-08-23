export const LOCALES = [
  "melbourne",
  "sydney",
  "wollongong",
  "canberra",
] as const;

export type Locale = (typeof LOCALES)[number];