import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  X,
  Clock,
  MapPin,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Trash2,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  fetchEvents,
  formatEvent,
  filterEvents,
  sortEventsByDate,
} from '@/lib/api/events-api';
import { FormattedEvent } from '@/lib/types/events';
import { CompactEventCard } from '@/components/CompactEventCard';
import {
  useSavedSearchesStore,
  SavedSearch,
} from '@/lib/state/saved-searches-store';

const ACCENT_COLOR = '#FF6B35';
type TabType = 'search' | 'saved';

function Header({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onClear,
  onSaveSearch,
  isSearchSaved,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClear: () => void;
  onSaveSearch: () => void;
  isSearchSaved: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-black border-b border-neutral-800"
      style={{ paddingTop: insets.top }}
    >
      <View className="px-4 pt-3 pb-2">
        <Text
          className="text-2xl font-black tracking-tighter"
          style={{ color: ACCENT_COLOR }}
        >
          SEARCH
        </Text>
        <Text className="text-neutral-500 text-xs font-medium uppercase tracking-wider">
          Find Events
        </Text>
      </View>

      {/* Tab toggle */}
      <View className="flex-row px-4 pb-3">
        <Pressable
          onPress={() => onTabChange('search')}
          className="flex-1 py-2.5 rounded-l-xl items-center"
          style={{
            backgroundColor: activeTab === 'search' ? ACCENT_COLOR : '#1a1a1a',
          }}
        >
          <Text
            className="font-bold text-sm"
            style={{ color: activeTab === 'search' ? '#fff' : '#666' }}
          >
            Search
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onTabChange('saved')}
          className="flex-1 py-2.5 rounded-r-xl items-center"
          style={{
            backgroundColor: activeTab === 'saved' ? ACCENT_COLOR : '#1a1a1a',
          }}
        >
          <Text
            className="font-bold text-sm"
            style={{ color: activeTab === 'saved' ? '#fff' : '#666' }}
          >
            Saved Searches
          </Text>
        </Pressable>
      </View>

      {/* Search input — only on search tab */}
      {activeTab === 'search' && (
        <View className="px-4 pb-3">
          <View className="flex-row items-center bg-neutral-900 rounded-xl px-4 py-3">
            <Search size={20} color="#666" />
            <TextInput
              className="flex-1 ml-3 text-white text-base"
              placeholder="Search bands, venues, tags..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={onSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={onSaveSearch}
                  className="p-1"
                  hitSlop={8}
                >
                  {isSearchSaved ? (
                    <BookmarkCheck size={18} color={ACCENT_COLOR} />
                  ) : (
                    <Bookmark size={18} color="#888" />
                  )}
                </Pressable>
                <Pressable onPress={onClear} className="p-1" hitSlop={8}>
                  <X size={18} color="#666" />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function EmptySearchState({ searchQuery }: { searchQuery: string }) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <Search size={48} color="#333" />
      {searchQuery ? (
        <>
          <Text className="text-neutral-400 text-lg font-semibold mt-4 text-center">
            No results for "{searchQuery}"
          </Text>
          <Text className="text-neutral-600 text-sm mt-2 text-center">
            Try different bands, venues, or tags
          </Text>
        </>
      ) : (
        <>
          <Text className="text-neutral-400 text-lg font-semibold mt-4">
            Find your next show
          </Text>
          <Text className="text-neutral-600 text-sm mt-2 text-center">
            Search by band name, venue, or tag
          </Text>
        </>
      )}
    </View>
  );
}

function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={ACCENT_COLOR} />
    </View>
  );
}

function SavedSearchSection({
  savedSearch,
  allEvents,
  onEventPress,
  onDelete,
  onTapSearch,
}: {
  savedSearch: SavedSearch;
  allEvents: FormattedEvent[];
  onEventPress: (event: FormattedEvent) => void;
  onDelete: () => void;
  onTapSearch: (query: string) => void;
}) {
  const matchingEvents = useMemo(
    () => filterEvents(allEvents, savedSearch.query),
    [allEvents, savedSearch.query]
  );

  return (
    <View className="mb-6">
      {/* Section header */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Pressable
          onPress={() => onTapSearch(savedSearch.query)}
          className="flex-row items-center flex-1"
        >
          <View
            className="px-3 py-1.5 rounded-full mr-2"
            style={{ backgroundColor: `${ACCENT_COLOR}20` }}
          >
            <Text
              className="font-bold text-sm"
              style={{ color: ACCENT_COLOR }}
            >
              {savedSearch.query}
            </Text>
          </View>
          <Text className="text-neutral-500 text-xs">
            {matchingEvents.length} event{matchingEvents.length !== 1 ? 's' : ''}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          className="p-2"
          hitSlop={8}
        >
          <Trash2 size={16} color="#555" />
        </Pressable>
      </View>

      {/* Matching events */}
      {matchingEvents.length > 0 ? (
        matchingEvents.slice(0, 5).map((event, index) => (
          <CompactEventCard
            key={event.id}
            event={event}
            index={index}
            onPress={() => onEventPress(event)}
          />
        ))
      ) : (
        <View className="mx-4 py-4 px-4 bg-neutral-900 rounded-xl items-center">
          <Text className="text-neutral-500 text-sm text-center">
            No events yet — new events matching this search will appear here automatically
          </Text>
        </View>
      )}

      {matchingEvents.length > 5 && (
        <Pressable
          onPress={() => onTapSearch(savedSearch.query)}
          className="mx-4 mt-1 py-2 items-center"
        >
          <Text className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>
            +{matchingEvents.length - 5} more — tap to see all
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function EmptySavedSearches() {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <Bookmark size={48} color="#333" />
      <Text className="text-neutral-400 text-lg font-semibold mt-4">
        No saved searches yet
      </Text>
      <Text className="text-neutral-600 text-sm mt-2 text-center">
        Search for something and tap the bookmark icon to save it
      </Text>
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tag } = useLocalSearchParams<{ tag?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('search');

  const savedSearches = useSavedSearchesStore((s) => s.savedSearches);
  const isInitialized = useSavedSearchesStore((s) => s.isInitialized);
  const initializeSavedSearches = useSavedSearchesStore(
    (s) => s.initializeSavedSearches
  );
  const saveSearch = useSavedSearchesStore((s) => s.saveSearch);
  const deleteSearch = useSavedSearchesStore((s) => s.deleteSearch);
  const isSearchSavedFn = useSavedSearchesStore((s) => s.isSearchSaved);

  useEffect(() => {
    if (!isInitialized) {
      initializeSavedSearches();
    }
  }, [isInitialized, initializeSavedSearches]);

  useEffect(() => {
    if (tag) {
      setSearchQuery(`#${tag}`);
      setActiveTab('search');
    }
  }, [tag]);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
  });

  const allFormattedEvents = useMemo(() => {
    if (!events) return [];
    return sortEventsByDate(events).map(formatEvent);
  }, [events]);

  const sections = useMemo(() => {
    const filtered = filterEvents(allFormattedEvents, searchQuery);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const upcoming = filtered
      .filter((e) => e.startTimestamp >= nowSeconds)
      .sort((a, b) => a.startTimestamp - b.startTimestamp);
    const past = filtered
      .filter((e) => e.startTimestamp < nowSeconds)
      .sort((a, b) => b.startTimestamp - a.startTimestamp);
    const result: { title: string; data: FormattedEvent[] }[] = [];
    if (upcoming.length > 0) result.push({ title: 'Upcoming Events', data: upcoming });
    if (past.length > 0) result.push({ title: 'Past Events', data: past });
    return result;
  }, [allFormattedEvents, searchQuery]);

  const totalFilteredCount = useMemo(
    () => sections.reduce((sum, s) => sum + s.data.length, 0),
    [sections]
  );

  const isSearchSaved = useMemo(
    () => (searchQuery ? isSearchSavedFn(searchQuery) : false),
    [searchQuery, isSearchSavedFn]
  );

  const handleEventPress = useCallback(
    (event: FormattedEvent) => {
      router.push({
        pathname: '/modal',
        params: { eventId: event.id.toString() },
      });
    },
    [router]
  );

  const handleClear = useCallback(() => setSearchQuery(''), []);

  const handleSaveSearch = useCallback(async () => {
    if (!searchQuery || isSearchSaved) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await saveSearch(searchQuery);
  }, [searchQuery, isSearchSaved, saveSearch]);

  const handleDeleteSearch = useCallback(
    async (id: string) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await deleteSearch(id);
    },
    [deleteSearch]
  );

  const handleTapSavedSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setActiveTab('search');
    },
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FormattedEvent; index: number }) => (
      <CompactEventCard
        event={item}
        index={index}
        onPress={() => handleEventPress(item)}
      />
    ),
    [handleEventPress]
  );

  const keyExtractor = useCallback(
    (item: FormattedEvent) => item.id.toString(),
    []
  );

  return (
    <View className="flex-1 bg-black">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={handleClear}
        onSaveSearch={handleSaveSearch}
        isSearchSaved={isSearchSaved}
      />

      {activeTab === 'search' ? (
        isLoading ? (
          <LoadingState />
        ) : (
          <>
            <SectionList
              sections={sections}
              renderItem={renderItem}
              renderSectionHeader={({ section }) => (
                <View className="px-4 pt-4 pb-2">
                  <Text className="text-neutral-500 text-xs font-bold uppercase tracking-wider">
                    {section.title}
                  </Text>
                </View>
              )}
              keyExtractor={keyExtractor}
              contentContainerStyle={{
                paddingTop: 16,
                paddingBottom: insets.bottom + 48,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptySearchState searchQuery={searchQuery} />
              }
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              stickySectionHeadersEnabled={false}
            />
            {totalFilteredCount > 0 && (
              <View
                className="absolute bottom-0 left-0 right-0 py-2 px-4 bg-neutral-900/95"
                style={{ paddingBottom: insets.bottom + 8 }}
              >
                <Text className="text-neutral-500 text-xs text-center">
                  {totalFilteredCount} event
                  {totalFilteredCount !== 1 ? 's' : ''} found
                </Text>
              </View>
            )}
          </>
        )
      ) : (
        isLoading ? (
          <LoadingState />
        ) : savedSearches.length === 0 ? (
          <EmptySavedSearches />
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: insets.bottom + 16,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {savedSearches.map((savedSearch) => (
              <SavedSearchSection
                key={savedSearch.id}
                savedSearch={savedSearch}
                allEvents={allFormattedEvents}
                onEventPress={handleEventPress}
                onDelete={() => handleDeleteSearch(savedSearch.id)}
                onTapSearch={handleTapSavedSearch}
              />
            ))}
          </ScrollView>
        )
      )}
    </View>
  );
}
