import { useLocaleStore, type Locale } from '@/lib/state/locale-store';

export const LOCATION_THEMES: Record<
  Locale,
  {
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  }
> = {
  magandjin: {
    accent: "#FF4D4D", // Red
    background: "#000000",
    surface: "#171717",
    text: "#FFFFFF",
    muted: "#A3A3A3",
  },

  gadigal: {
    accent: "#FF8C00", // Orange
    background: "#000000",
    surface: "#171717",
    text: "#FFFFFF",
    muted: "#A3A3A3",
  },

  melbourne: {
    accent: "#FFED00", // Yellow
    background: "#000000",
    surface: "#171717",
    text: "#FFFFFF",
    muted: "#A3A3A3",
  },

  "kaurna yerta": {
    accent: "#22C55E", // Green
    background: "#000000",
    surface: "#171717",
    text: "#FFFFFF",
    muted: "#A3A3A3",
  },

  boorloo: {
    accent: "#3B82F6", // Blue
    background: "#000000",
    surface: "#171717",
    text: "#FFFFFF",
    muted: "#A3A3A3",
  },

  canberra: {
    accent: "#A855F7", // Purple
    background: "#000000",
    surface: "#171717",
    text: "#FFFFFF",
    muted: "#A3A3A3",
  },

  "north coast": {
    accent: "#74D7EE",
    background: "#000000",
    surface: "#171717",
    text: "#FFFFFF",
    muted: "#A3A3A3",
  },

  "central coast": {
    accent: "#FFAFC8",
    background: "#000000",
    surface: "#171717",
    text: "#FFFFFF",
    muted: "#A3A3A3",
  },

  "south coast": {
    accent: "#FFFFFF",
    background: "#000000",
    surface: "#171717",
    text: "#FFFFFF",
    muted: "#A3A3A3",
  },

  luitruwita: {
    accent: "#A66A4C", // Progress Pride brown
    background: "#000000",
    surface: "#171717",
    text: "#FFFFFF",
    muted: "#A3A3A3",
  },
};

export function useLocationTheme() {
  const locale = useLocaleStore(state => state.locale);
  return LOCATION_THEMES[locale];
}