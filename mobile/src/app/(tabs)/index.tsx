import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Heart, Check, X } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { endOfWeek, endOfMonth, endOfDay } from 'date-fns';
import {
  fetchEvents,
  formatEvent,
  sortEventsByDate,
  triggerSync,
} from '@/lib/api/events-api';
import { BackendEvent, FormattedEvent } from '@/lib/types/events';
import { cn } from '@/lib/cn';
import { useSavedEventsStore } from '@/lib/state/saved-events-store';
import { ClickableTag } from '@/components/ClickableTag';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCENT_COLOR = '#FF6B35';

const DATE_FILTERS = ['Today', 'This Week', 'This Month'] as const;
type DateFilter = typeof DATE_FILTERS[number];

function EventCard({
  event,
  index,
  onPress,
  onSavePress,
  onVenuePress,
  isSaved,
}: {
  event: FormattedEvent;
  index: number;
  onPress: () => void;
  onSavePress: () => void;
  onVenuePress: () => void;
  isSaved: boolean;
}) {
  const heartScale = useSharedValue(1);
  const toastOpacity = useSharedValue(0);
  const [showToast, setShowToast] = useState(false);
  const [toastAction, setToastAction] = useState<'saved' | 'removed'>('saved');

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const toastAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  const handleHeartPress = async () => {
    // Determine the action being taken
    const isBeingSaved = !isSaved;
    setToastAction(isBeingSaved ? 'saved' : 'removed');

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate heart scale
    heartScale.value = withSpring(0.9, {
      damping: 8,
      mass: 0.6,
      overshootClamping: false,
    });

    setTimeout(() => {
      heartScale.value = withSpring(1, {
        damping: 8,
        mass: 0.6,
        overshootClamping: false,
      });
    }, 100);

    // Show confirmation toast
    setShowToast(true);
    toastOpacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });

    // Auto-hide toast after 1.5 seconds
    setTimeout(() => {
      toastOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      setTimeout(() => setShowToast(false), 300);
    }, 1500);

    // Update saved state
    onSavePress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        className="mb-4 mx-4 rounded-2xl overflow-hidden bg-neutral-900"
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        {/* Event Image */}
        <View className="w-full aspect-[4/3] relative">
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#1A1A1A', '#0A0A0A']}
              style={{ width: '100%', height: '100%' }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="flex-1 items-center justify-center">
                <Text
                  className="text-5xl font-black text-center px-4"
                  style={{ color: ACCENT_COLOR }}
                >
                  {event.title.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            </LinearGradient>
          )}

          {/* Gradient overlay at bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />

          {/* Date badge */}
          <View
            className="absolute top-3 right-3 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          >
            <Text className="text-white font-bold text-xs uppercase">
              {event.formattedDate}
            </Text>
          </View>

          {/* Save button */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 12,
                left: 12,
              },
              heartAnimatedStyle,
            ]}
          >
            <Pressable
              onPress={handleHeartPress}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: isSaved ? ACCENT_COLOR : 'rgba(0,0,0,0.5)' }}
            >
              <Heart
                size={20}
                color="white"
                fill={isSaved ? 'white' : 'none'}
                strokeWidth={2}
              />
            </Pressable>
          </Animated.View>

          {/* Confirmation Toast */}
          {showToast ? (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  right: 20,
                  backgroundColor: ACCENT_COLOR,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                },
                toastAnimatedStyle,
              ]}
            >
              <Check size={18} color="white" strokeWidth={3} />
              <Text className="text-white font-bold text-sm">
                {toastAction === 'saved' ? 'Saved!' : 'Removed'}
              </Text>
            </Animated.View>
          ) : null}
        </View>

        {/* Event Details */}
        <View className="p-4">
          {/* Title */}
          <Text className="text-white text-xl font-black mb-2" numberOfLines={2}>
            {event.title}
          </Text>

          {/* Time and Venue */}
          <View className="flex-row items-center mb-2">
            <Clock size={14} color="#888" />
            <Text className="text-neutral-400 text-sm ml-1.5">
              {event.formattedTime}
            </Text>
            <View className="w-1 h-1 bg-neutral-600 rounded-full mx-2" />
            <MapPin size={14} color="#888" />
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onVenuePress();
              }}
              hitSlop={4}
            >
              <Text className="text-neutral-400 text-sm ml-1.5 underline" numberOfLines={1}>
                {event.venueName}
              </Text>
            </Pressable>
          </View>

          {/* Tags */}
          {event.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-2 -mb-1">
              {event.tags.slice(0, 4).map((tag, i) => (
                <ClickableTag key={`${tag}-${i}`} tag={tag} />
              ))}
              {event.tags.length > 4 && (
                <View className="mb-1.5 px-2.5 py-1 rounded-full bg-neutral-800">
                  <Text className="text-neutral-500 text-xs">
                    +{event.tags.length - 4}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: 'upcoming' | 'past';
  onTabChange: (tab: 'upcoming' | 'past') => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-black border-b border-neutral-800"
      style={{ paddingTop: insets.top }}
    >
      <View className="px-4 py-3 flex-row items-center justify-between">
        <View>
          <Text
            className="text-2xl font-black tracking-tighter"
            style={{ color: ACCENT_COLOR }}
          >
            ASK A PUNK
          </Text>
          <Text className="text-neutral-500 text-xs font-medium uppercase tracking-wider">
            Melbourne Events
          </Text>
          <Text className="text-neutral-600 text-[10px] font-medium tracking-wide mt-0.5">
            app created by life.lair.regret. records
          </Text>
        </View>
        <View
          className="px-3 py-1.5 rounded-full"
          style={{ backgroundColor: `${ACCENT_COLOR}20` }}
        >
          <Text style={{ color: ACCENT_COLOR }} className="text-xs font-bold">
            LIVE
          </Text>
        </View>
      </View>
      <View className="flex-row px-4 pb-3">
        <Pressable
          onPress={() => onTabChange('upcoming')}
          className="flex-1 py-2.5 rounded-l-xl items-center"
          style={{
            backgroundColor: activeTab === 'upcoming' ? ACCENT_COLOR : '#1a1a1a',
          }}
        >
          <Text
            className="font-bold text-sm"
            style={{
              color: activeTab === 'upcoming' ? '#fff' : '#666',
            }}
          >
            Upcoming Events
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onTabChange('past')}
          className="flex-1 py-2.5 rounded-r-xl items-center"
          style={{
            backgroundColor: activeTab === 'past' ? ACCENT_COLOR : '#1a1a1a',
          }}
        >
          <Text
            className="font-bold text-sm"
            style={{
              color: activeTab === 'past' ? '#fff' : '#666',
            }}
          >
            Previous Events
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-2 px-3 py-1.5 rounded-full flex-row items-center"
      style={{
        backgroundColor: active ? ACCENT_COLOR : '#1a1a1a',
        borderWidth: 1,
        borderColor: active ? ACCENT_COLOR : '#333',
      }}
    >
      <Text
        className="text-xs font-bold"
        style={{ color: active ? '#fff' : '#888' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FilterBar({
  activeTab,
  activeDateFilter,
  activeVenueFilter,
  activeTagFilters,
  allVenues,
  allTags,
  onDateFilterPress,
  onVenueFilterPress,
  onTagFilterPress,
  onClearFilters,
  hasActiveFilters,
}: {
  activeTab: 'upcoming' | 'past';
  activeDateFilter: DateFilter | null;
  activeVenueFilter: string | null;
  activeTagFilters: string[];
  allVenues: string[];
  allTags: string[];
  onDateFilterPress: (filter: DateFilter) => void;
  onVenueFilterPress: (venue: string) => void;
  onTagFilterPress: (tag: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <View className="bg-black pb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        style={{ flexGrow: 0 }}
      >
        {activeTab === 'upcoming' ? (
          <>
            {DATE_FILTERS.map((filter) => (
              <FilterChip
                key={filter}
                label={filter}
                active={activeDateFilter === filter}
                onPress={() => onDateFilterPress(filter)}
              />
            ))}
            <View className="w-px bg-neutral-700 mx-1 my-1" />
          </>
        ) : null}

        {allVenues.map((venue) => (
          <FilterChip
            key={`v-${venue}`}
            label={venue}
            active={activeVenueFilter === venue}
            onPress={() => onVenueFilterPress(venue)}
          />
        ))}

        {allVenues.length > 0 && allTags.length > 0 ? (
          <View className="w-px bg-neutral-700 mx-1 my-1" />
        ) : null}

        {allTags.map((tag) => (
          <FilterChip
            key={`t-${tag}`}
            label={`#${tag}`}
            active={activeTagFilters.includes(tag)}
            onPress={() => onTagFilterPress(tag)}
          />
        ))}
      </ScrollView>

      {hasActiveFilters ? (
        <Pressable
          onPress={onClearFilters}
          className="flex-row items-center justify-center py-1"
        >
          <X size={12} color={ACCENT_COLOR} />
          <Text
            className="text-xs font-bold ml-1"
            style={{ color: ACCENT_COLOR }}
          >
            Clear filters
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <Calendar size={48} color="#333" />
      <Text className="text-neutral-500 text-lg font-semibold mt-4">
        No events found
      </Text>
      <Text className="text-neutral-600 text-sm mt-1">
        Check back later for upcoming shows
      </Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={ACCENT_COLOR} />
      <Text className="text-neutral-500 mt-4 font-medium">Loading events...</Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-red-500 text-xl font-bold mb-2">
        Failed to load events
      </Text>
      <Text className="text-neutral-500 text-center mb-4">
        Could not connect to the events server. Please check your connection.
      </Text>
      <Pressable
        onPress={onRetry}
        className="px-6 py-3 rounded-full"
        style={{ backgroundColor: ACCENT_COLOR }}
      >
        <Text className="text-white font-bold">Try Again</Text>
      </Pressable>
    </View>
  );
}

export default function EventsFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [activeVenueFilter, setActiveVenueFilter] = useState<string | null>(null);
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilter | null>(null);

  // Initialize saved events on mount
  const initSavedEvents = useSavedEventsStore(s => s.initializeSavedEvents);
  const saveEvent = useSavedEventsStore(s => s.saveEvent);
  const unsaveEvent = useSavedEventsStore(s => s.unsaveEvent);
  const savedEvents = useSavedEventsStore(s => s.savedEvents);

  // Create a memoized check function that updates when savedEvents changes
  const checkIsSaved = useCallback((eventId: number) => {
    return savedEvents.some(e => e.id === eventId);
  }, [savedEvents]);

  useEffect(() => {
    initSavedEvents();
  }, [initSavedEvents]);

  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to sync with website feed
  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      // Invalidate cache to force fresh fetch from server
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const { allTags, allVenues } = React.useMemo(() => {
    if (!events) return { allTags: [], allVenues: [] };
    const formatted = events.map(formatEvent);

    const tagCounts = new Map<string, number>();
    formatted.forEach(e => e.tags.forEach(t => {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }));
    const sortedTags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);

    const venueCounts = new Map<string, number>();
    formatted.forEach(e => {
      if (e.venueName && e.venueName !== 'TBA') {
        venueCounts.set(e.venueName, (venueCounts.get(e.venueName) || 0) + 1);
      }
    });
    const sortedVenues = [...venueCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([venue]) => venue);

    return { allTags: sortedTags, allVenues: sortedVenues };
  }, [events]);

  const { upcomingEvents, previousEvents } = React.useMemo(() => {
    if (!events) return { upcomingEvents: [], previousEvents: [] };
    const nowSeconds = Math.floor(Date.now() / 1000);
    const now = new Date();
    const sorted = sortEventsByDate(events);
    let formatted = sorted.map(formatEvent);

    if (activeTagFilters.length > 0) {
      formatted = formatted.filter(e =>
        e.tags.some(t => activeTagFilters.includes(t))
      );
    }

    if (activeVenueFilter) {
      formatted = formatted.filter(e => e.venueName === activeVenueFilter);
    }

    if (activeDateFilter && activeTab === 'upcoming') {
      let endDate: Date;
      if (activeDateFilter === 'Today') {
        endDate = endOfDay(now);
      } else if (activeDateFilter === 'This Week') {
        endDate = endOfWeek(now, { weekStartsOn: 1 });
      } else {
        endDate = endOfMonth(now);
      }
      const endSeconds = Math.floor(endDate.getTime() / 1000);
      formatted = formatted.filter(e =>
        e.startTimestamp >= nowSeconds && e.startTimestamp <= endSeconds
      );
    }

    const upcoming = formatted.filter(e => e.startTimestamp >= nowSeconds);
    const previous = formatted.filter(e => e.startTimestamp < nowSeconds).reverse();
    return { upcomingEvents: upcoming, previousEvents: previous };
  }, [events, activeTagFilters, activeVenueFilter, activeDateFilter, activeTab]);

  const handleEventPress = useCallback(
    (event: FormattedEvent) => {
      router.push({
        pathname: '/modal',
        params: { eventId: event.id.toString() },
      });
    },
    [router]
  );

  const handleSaveEvent = useCallback(
    (event: FormattedEvent) => {
      if (checkIsSaved(event.id)) {
        unsaveEvent(event.id);
      } else {
        saveEvent(event);
      }
    },
    [checkIsSaved, saveEvent, unsaveEvent]
  );

  const handleTabChange = useCallback((tab: 'upcoming' | 'past') => {
    setActiveTab(tab);
    if (tab === 'past') {
      setActiveDateFilter(null);
    }
  }, []);

  const handleDateFilterPress = useCallback(async (filter: DateFilter) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveDateFilter(prev => prev === filter ? null : filter);
  }, []);

  const handleVenueFilterPress = useCallback(async (venue: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveVenueFilter(prev => prev === venue ? null : venue);
  }, []);

  const handleTagFilterPress = useCallback(async (tag: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTagFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveTagFilters([]);
    setActiveVenueFilter(null);
    setActiveDateFilter(null);
  }, []);

  const hasActiveFilters = activeTagFilters.length > 0 || activeVenueFilter !== null || activeDateFilter !== null;

  const handleVenuePress = useCallback(
    (event: FormattedEvent) => {
      router.push({
        pathname: '/venue',
        params: { venueName: event.venueName, venueAddress: event.venueAddress },
      });
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    // Trigger sync with Gancio API first, then refetch
    syncMutation.mutate();
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: FormattedEvent; index: number }) => (
      <EventCard
        event={item}
        index={index}
        onPress={() => handleEventPress(item)}
        onSavePress={() => handleSaveEvent(item)}
        onVenuePress={() => handleVenuePress(item)}
        isSaved={checkIsSaved(item.id)}
      />
    ),
    [handleEventPress, handleSaveEvent, handleVenuePress, checkIsSaved]
  );

  const keyExtractor = useCallback(
    (item: FormattedEvent) => item.id.toString(),
    []
  );

  return (
    <View className="flex-1 bg-black">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={handleRefresh} />
      ) : (
        <>
          {(allTags.length > 0 || allVenues.length > 0) ? (
            <FilterBar
              activeTab={activeTab}
              activeDateFilter={activeDateFilter}
              activeVenueFilter={activeVenueFilter}
              activeTagFilters={activeTagFilters}
              allVenues={allVenues}
              allTags={allTags}
              onDateFilterPress={handleDateFilterPress}
              onVenueFilterPress={handleVenueFilterPress}
              onTagFilterPress={handleTagFilterPress}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          ) : null}
          <FlatList
            data={activeTab === 'upcoming' ? upcomingEvents : previousEvents}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: insets.bottom + 16,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={syncMutation.isPending}
                onRefresh={handleRefresh}
                tintColor={ACCENT_COLOR}
                colors={[ACCENT_COLOR]}
              />
            }
            ListEmptyComponent={EmptyState}
          />
        </>
      )}
    </View>
  );
}
