import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

export const LOCALE_OPTIONS = [
  { value: "magandjin", label: "Brisbane / Magandjin" },
  { value: "gadigal", label: "Sydney / Gadigal" },
  { value: "melbourne", label: "Melbourne / Naarm" },
  { value: "kaurna yerta", label: "Adelaide / Kaurna Yerta" },
  { value: "boorloo", label: "Perth / Boorloo" },
  { value: "canberra", label: "Canberra / ACT" },
  { value: "north coast", label: "Byron / Coffs Harbour" },
  { value: "central coast", label: "Newcastle / Gosford" },
  { value: "south coast", label: "Wollongong / Batemans" },
  { value: "luitruwita", label: "Tasmania / Lutruwita" },
  { value: "aotearoa", label: "New Zealand / Aotearoa" },
] as const;

export type Locale = (typeof LOCALE_OPTIONS)[number]["value"];

export function getLocaleLabel(locale: Locale): string {
  return (
    LOCALE_OPTIONS.find((option) => option.value === locale)?.label ?? locale
  );
}

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: "melbourne",
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "ask-a-punk-locale",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);