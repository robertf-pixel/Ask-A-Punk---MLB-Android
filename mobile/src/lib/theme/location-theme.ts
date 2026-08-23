import { useLocaleStore, type Locale } from '@/lib/state/locale-store';

export const LOCATION_THEMES: Record<Locale, {
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
}> = {
  melbourne: {
    accent: '#FF6B35',
    background: '#000000',
    surface: '#171717',
    text: '#FFFFFF',
    muted: '#A3A3A3',
  },

  sydney: {
    accent: '#404FFF',
    background: '#000000',
    surface: '#121212',
    text: '#FFFFFF',
    muted: '#767676',
  },

  wollongong: {
    accent: '#22C55E',
    background: '#000000',
    surface: '#171717',
    text: '#FFFFFF',
    muted: '#A3A3A3',
  },

  canberra: {
    accent: '#A855F7',
    background: '#000000',
    surface: '#171717',
    text: '#FFFFFF',
    muted: '#A3A3A3',
  },
};

export function useLocationTheme() {
  const locale = useLocaleStore(state => state.locale);
  return LOCATION_THEMES[locale];
}