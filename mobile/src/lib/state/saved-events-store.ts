import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormattedEvent } from '@/lib/types/events';

const SAVED_EVENTS_KEY = 'saved_events';

interface SavedEventsState {
  savedEvents: FormattedEvent[];
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initializeSavedEvents: () => Promise<void>;
  saveEvent: (event: FormattedEvent) => Promise<void>;
  unsaveEvent: (eventId: number) => Promise<void>;
  isSaved: (eventId: number) => boolean;
  clearAllSaved: () => Promise<void>;
}

export const useSavedEventsStore = create<SavedEventsState>((set, get) => ({
  savedEvents: [],
  isLoading: false,
  isInitialized: false,

  initializeSavedEvents: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(SAVED_EVENTS_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      set({
        savedEvents: parsed,
        isInitialized: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load saved events:', error);
      set({
        isInitialized: true,
        isLoading: false
      });
    }
  },

  saveEvent: async (event: FormattedEvent) => {
    try {
      const current = get().savedEvents;
      const exists = current.some(e => e.id === event.id);

      if (!exists) {
        const updated = [event, ...current];
        await AsyncStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(updated));
        set({ savedEvents: updated });
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  },

  unsaveEvent: async (eventId: number) => {
    try {
      const current = get().savedEvents;
      const updated = current.filter(e => e.id !== eventId);
      await AsyncStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(updated));
      set({ savedEvents: updated });
    } catch (error) {
      console.error('Failed to unsave event:', error);
    }
  },

  isSaved: (eventId: number) => {
    return get().savedEvents.some(e => e.id === eventId);
  },

  clearAllSaved: async () => {
    try {
      await AsyncStorage.removeItem(SAVED_EVENTS_KEY);
      set({ savedEvents: [] });
    } catch (error) {
      console.error('Failed to clear saved events:', error);
    }
  },
}));
