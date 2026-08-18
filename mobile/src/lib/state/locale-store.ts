import { create } from 'zustand';

export type Locale =
  | 'melbourne'
  | 'sydney'
  | 'wollongong'
  | 'canberra';

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: 'melbourne',
  setLocale: (locale) => set({ locale }),
}));
