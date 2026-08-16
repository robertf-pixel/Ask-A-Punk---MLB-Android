import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_SEARCHES_KEY = 'saved_searches';

export interface SavedSearch {
  id: string;
  query: string;
  savedAt: string;
}

interface SavedSearchesState {
  savedSearches: SavedSearch[];
  isInitialized: boolean;
  initializeSavedSearches: () => Promise<void>;
  saveSearch: (query: string) => Promise<void>;
  deleteSearch: (id: string) => Promise<void>;
  isSearchSaved: (query: string) => boolean;
}

export const useSavedSearchesStore = create<SavedSearchesState>((set, get) => ({
  savedSearches: [],
  isInitialized: false,

  initializeSavedSearches: async () => {
    try {
      const stored = await AsyncStorage.getItem(SAVED_SEARCHES_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      set({ savedSearches: parsed, isInitialized: true });
    } catch (error) {
      console.error('Failed to load saved searches:', error);
      set({ isInitialized: true });
    }
  },

  saveSearch: async (query: string) => {
    try {
      const current = get().savedSearches;
      const exists = current.some(
        (s) => s.query.toLowerCase() === query.toLowerCase()
      );
      if (!exists) {
        const newSearch: SavedSearch = {
          id: Date.now().toString(),
          query,
          savedAt: new Date().toISOString(),
        };
        const updated = [newSearch, ...current];
        await AsyncStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
        set({ savedSearches: updated });
      }
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  },

  deleteSearch: async (id: string) => {
    try {
      const current = get().savedSearches;
      const updated = current.filter((s) => s.id !== id);
      await AsyncStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
      set({ savedSearches: updated });
    } catch (error) {
      console.error('Failed to delete search:', error);
    }
  },

  isSearchSaved: (query: string) => {
    return get().savedSearches.some(
      (s) => s.query.toLowerCase() === query.toLowerCase()
    );
  },
}));
