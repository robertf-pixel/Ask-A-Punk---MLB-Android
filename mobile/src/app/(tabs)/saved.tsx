import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Heart, Trash2 } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FormattedEvent } from '@/lib/types/events';
import { useSavedEventsStore } from '@/lib/state/saved-events-store';
import { ClickableTag } from '@/components/ClickableTag';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCENT_COLOR = '#FF6B35';

function SavedEventCard({
  event,
  index,
  onPress,
  onRemovePress,
}: {
  event: FormattedEvent;
  index: number;
  onPress: () => void;
  onRemovePress: () => void;
}) {
  const heartScale = useSharedValue(1);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleHeartPress = async () => {
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

    // Remove from saved
    onRemovePress();
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

          {/* Saved indicator + remove button */}
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
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              <Heart
                size={20}
                color="white"
                fill="white"
                strokeWidth={2}
              />
            </Pressable>
          </Animated.View>
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
            <Text className="text-neutral-400 text-sm ml-1.5 flex-1" numberOfLines={1}>
              {event.venueName}
            </Text>
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

type TabType = 'upcoming' | 'past';

function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-black border-b border-neutral-800"
      style={{ paddingTop: insets.top }}
    >
      <View className="px-4 py-3">
        <Text
          className="text-2xl font-black tracking-tighter"
          style={{ color: ACCENT_COLOR }}
        >
          SAVED EVENTS
        </Text>
        <Text className="text-neutral-500 text-xs font-medium uppercase tracking-wider">
          Your Collection
        </Text>
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
            Upcoming
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
            Past
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <Heart size={48} color="#333" />
      <Text className="text-neutral-500 text-lg font-semibold mt-4">
        No saved events yet
      </Text>
      <Text className="text-neutral-600 text-sm mt-1">
        Save events to see them here
      </Text>
    </View>
  );
}

export default function SavedEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const initSavedEvents = useSavedEventsStore(s => s.initializeSavedEvents);
  const savedEvents = useSavedEventsStore(s => s.savedEvents);
  const unsaveEvent = useSavedEventsStore(s => s.unsaveEvent);

  useEffect(() => {
    initSavedEvents();
  }, [initSavedEvents]);

  const now = useMemo(() => Math.floor(Date.now() / 1000), []);

  const filteredEvents = useMemo(() => {
    if (activeTab === 'upcoming') {
      return savedEvents
        .filter(e => e.startTimestamp >= now)
        .sort((a, b) => a.startTimestamp - b.startTimestamp);
    }
    return savedEvents
      .filter(e => e.startTimestamp < now)
      .sort((a, b) => b.startTimestamp - a.startTimestamp);
  }, [savedEvents, activeTab, now]);

  const handleEventPress = useCallback(
    (event: FormattedEvent) => {
      router.push({
        pathname: '/modal',
        params: { eventId: event.id.toString() },
      });
    },
    [router]
  );

  const handleRemoveSavedEvent = useCallback(
    (eventId: number) => {
      unsaveEvent(eventId);
    },
    [unsaveEvent]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FormattedEvent; index: number }) => (
      <SavedEventCard
        event={item}
        index={index}
        onPress={() => handleEventPress(item)}
        onRemovePress={() => handleRemoveSavedEvent(item.id)}
      />
    ),
    [handleEventPress, handleRemoveSavedEvent]
  );

  const keyExtractor = useCallback(
    (item: FormattedEvent) => item.id.toString(),
    []
  );

  return (
    <View className="flex-1 bg-black">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <FlatList
        data={filteredEvents}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
      />
    </View>
  );
}
