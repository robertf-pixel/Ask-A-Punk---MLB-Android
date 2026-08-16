import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { X, MapPin, Calendar } from 'lucide-react-native';
import { fetchEvents, formatEvent, sortEventsByDate } from '@/lib/api/events-api';
import { FormattedEvent } from '@/lib/types/events';
import { CompactEventCard } from '@/components/CompactEventCard';

const ACCENT_COLOR = '#FF6B35';

export default function VenuePage() {
  const { venueName, venueAddress } = useLocalSearchParams<{
    venueName: string;
    venueAddress?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
  });

  const { upcoming, past } = React.useMemo(() => {
    if (!events || !venueName) return { upcoming: [], past: [] };

    const now = Math.floor(Date.now() / 1000);
    const sorted = sortEventsByDate(events);
    const formatted = sorted.map(formatEvent);

    const venueEvents = formatted.filter(
      (e) => e.venueName.toLowerCase() === venueName.toLowerCase()
    );

    const upcomingEvents = venueEvents.filter((e) => e.startTimestamp >= now);
    const pastEvents = venueEvents
      .filter((e) => e.startTimestamp < now)
      .reverse();

    return { upcoming: upcomingEvents, past: pastEvents };
  }, [events, venueName]);

  const handleClose = () => {
    router.back();
  };

  const handleOpenMaps = async () => {
    if (venueAddress) {
      const address = encodeURIComponent(`${venueName}, ${venueAddress}`);
      const url = Platform.select({
        ios: `maps://maps.apple.com/?q=${address}`,
        android: `geo:0,0?q=${address}`,
        default: `https://maps.google.com/?q=${address}`,
      });
      try {
        await Linking.openURL(url);
      } catch {}
    }
  };

  const handleEventPress = (event: FormattedEvent) => {
    router.push({ pathname: '/modal', params: { eventId: event.id.toString() } });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Header Section */}
      <View
        className="bg-neutral-900 px-4 pb-5"
        style={{
          paddingTop: insets.top + 12,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        {/* Top bar with buttons */}
        <View className="flex-row justify-between items-center mb-4">
          {/* Open in Maps button */}
          {venueAddress ? (
            <Pressable
              onPress={handleOpenMaps}
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <MapPin size={20} color="white" />
            </Pressable>
          ) : (
            <View className="w-10 h-10" />
          )}

          {/* Close button */}
          <Pressable
            onPress={handleClose}
            className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <X size={20} color="white" />
          </Pressable>
        </View>

        {/* Venue name */}
        <Text
          className="text-3xl font-black mb-1"
          style={{ color: ACCENT_COLOR }}
        >
          {venueName}
        </Text>

        {/* Venue address */}
        {venueAddress ? (
          <Text className="text-neutral-400 text-sm">{venueAddress}</Text>
        ) : null}

        {/* Event count summary */}
        <View className="flex-row items-center mt-3">
          <Calendar size={14} color="#888" />
          <Text className="text-neutral-500 text-xs ml-1.5">
            {upcoming.length} upcoming, {past.length} past
          </Text>
        </View>
      </View>

      {/* Event Sections */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 20 }}
      >
        {/* Upcoming Events */}
        <Text className="text-neutral-500 text-xs font-bold uppercase tracking-widest px-4 mb-3">
          Upcoming Events
        </Text>

        {upcoming.length > 0 ? (
          upcoming.map((event, index) => (
            <CompactEventCard
              key={event.id}
              event={event}
              index={index}
              onPress={() => handleEventPress(event)}
            />
          ))
        ) : (
          <View className="mx-4 mb-3 py-8 bg-neutral-900 rounded-xl items-center">
            <Text className="text-neutral-600 text-sm">
              No upcoming events at this venue
            </Text>
          </View>
        )}

        {/* Past Events */}
        <Text className="text-neutral-500 text-xs font-bold uppercase tracking-widest px-4 mb-3 mt-6">
          Past Events
        </Text>

        {past.length > 0 ? (
          past.slice(0, 20).map((event, index) => (
            <CompactEventCard
              key={event.id}
              event={event}
              index={index}
              onPress={() => handleEventPress(event)}
            />
          ))
        ) : (
          <View className="mx-4 mb-3 py-8 bg-neutral-900 rounded-xl items-center">
            <Text className="text-neutral-600 text-sm">
              No past events found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
