import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BrowserChoiceSheet, BrowserPreference } from '@/components/BrowserChoiceSheet';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  Ticket,
  Share2,
  ChevronRight,
  Heart,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { fetchEvents, formatEvent, stripHtml } from '@/lib/api/events-api';
import { GancioEvent, FormattedEvent, GANCIO_BASE_URL } from '@/lib/types/events';
import { useSavedEventsStore } from '@/lib/state/saved-events-store';
import { ClickableTag } from '@/components/ClickableTag';
import { buildGoogleCalendarUrl } from '@/lib/calendar-utils';

const ACCENT_COLOR = '#FF6B35';

function DetailRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const content = (
    <View className="flex-row items-start py-3 border-b border-neutral-800">
      <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-neutral-500 text-xs uppercase tracking-wide mb-0.5">
          {label}
        </Text>
        <Text className="text-white text-base" numberOfLines={2}>
          {value}
        </Text>
      </View>
      {onPress ? (
        <View className="justify-center">
          <ChevronRight size={20} color="#666" />
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export default function EventDetailModal() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const storage = React.useMemo(() => new MMKV({ id: 'browser-prefs' }), []);
  const [showBrowserChoice, setShowBrowserChoice] = React.useState(false);
  const pendingUrl = React.useRef<string | null>(null);

  const saveEvent = useSavedEventsStore(s => s.saveEvent);
  const unsaveEvent = useSavedEventsStore(s => s.unsaveEvent);
  const isSaved = useSavedEventsStore(s => s.isSaved);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
  });

  const event = React.useMemo(() => {
    if (!events || !eventId) return null;
    const rawEvent = events.find((e) => e.id.toString() === eventId);
    if (!rawEvent) return null;
    return {
      raw: rawEvent,
      formatted: formatEvent(rawEvent),
    };
  }, [events, eventId]);

  const openUrl = (url: string, pref: BrowserPreference) => {
    if (pref === 'inapp') {
      router.push({ pathname: '/browser', params: { url } });
    } else {
      Linking.openURL(url);
    }
  };

  const handleOpenTickets = async () => {
    const url = event?.formatted.ticketUrl;
    if (!url) return;
    const saved = storage.getString('browserPreference') as BrowserPreference | undefined;
    if (saved) {
      openUrl(url, saved);
    } else {
      pendingUrl.current = url;
      setShowBrowserChoice(true);
    }
  };

  const handleBrowserChoice = async (pref: BrowserPreference, remember: boolean) => {
    setShowBrowserChoice(false);
    if (remember) {
      storage.set('browserPreference', pref);
    }
    if (pendingUrl.current) {
      openUrl(pendingUrl.current, pref);
      pendingUrl.current = null;
    }
  };

  const handleOpenMaps = async () => {
    if (event?.formatted.venueAddress) {
      const address = encodeURIComponent(
        `${event.formatted.venueName}, ${event.formatted.venueAddress}`
      );
      const url = Platform.select({
        ios: `maps://maps.apple.com/?q=${address}`,
        android: `geo:0,0?q=${address}`,
        default: `https://maps.google.com/?q=${address}`,
      });
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error('Failed to open maps:', error);
      }
    }
  };

  const handleAddToCalendar = async () => {
    if (!event) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const url = buildGoogleCalendarUrl(event.formatted, event.raw);
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open calendar:', error);
    }
  };

  const handleOpenVenue = () => {
    if (!event) return;
    router.push({
      pathname: '/venue',
      params: {
        venueName: event.formatted.venueName,
        venueAddress: event.formatted.venueAddress,
      },
    });
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        title: event.formatted.title,
        message: `Check out ${event.formatted.title} at ${event.formatted.venueName} on ${event.formatted.formattedDate}!\n\n${GANCIO_BASE_URL}/event/${event.raw.id}`,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleSaveEvent = async () => {
    if (!event) return;
    if (isSaved(event.formatted.id)) {
      unsaveEvent(event.formatted.id);
    } else {
      saveEvent(event.formatted);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-red-500 text-xl font-bold mb-2">Event not found</Text>
        <Pressable
          onPress={handleClose}
          className="mt-4 px-6 py-3 rounded-full"
          style={{ backgroundColor: '#FF6B35' }}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
        <StatusBar style="light" />
      </View>
    );
  }

  const { raw, formatted } = event;
  const saved = isSaved(formatted.id);

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Image */}
        <View className="w-full aspect-square relative">
          {formatted.imageUrl ? (
            <Image
              source={{ uri: formatted.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#1A1A1A', '#0A0A0A']}
              style={{ width: '100%', height: '100%' }}
            >
              <View className="flex-1 items-center justify-center">
                <Text
                  className="text-8xl font-black"
                  style={{ color: '#FF6B35' }}
                >
                  {formatted.title.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            </LinearGradient>
          )}

          {/* Gradient overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.9)']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Close button */}
          <Pressable
            onPress={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            style={{ marginTop: insets.top }}
          >
            <X size={24} color="white" />
          </Pressable>

          {/* Save button */}
          <Pressable
            onPress={handleSaveEvent}
            className="absolute top-4 left-[60px] w-10 h-10 rounded-full items-center justify-center"
            style={{
              marginTop: insets.top,
              backgroundColor: saved ? '#FF6B35' : 'rgba(0,0,0,0.5)'
            }}
          >
            <Heart
              size={20}
              color="white"
              fill={saved ? 'white' : 'none'}
              strokeWidth={2}
            />
          </Pressable>

          {/* Share button */}
          <Pressable
            onPress={handleShare}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            style={{ marginTop: insets.top }}
          >
            <Share2 size={20} color="white" />
          </Pressable>
        </View>

        {/* Content */}
        <View className="px-4 -mt-16 relative">
          {/* Title Card */}
          <View className="bg-neutral-900 rounded-2xl p-5 mb-4">
            <Text className="text-white text-2xl font-black mb-3">
              {formatted.title}
            </Text>

            {/* Tags */}
            {formatted.tags.length > 0 && (
              <View className="flex-row flex-wrap -mb-2">
                {formatted.tags.map((tag, i) => (
                  <ClickableTag
                    key={`${tag}-${i}`}
                    tag={tag}
                    variant="accent"
                    onNavigate={handleClose}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Details Card */}
          <View className="bg-neutral-900 rounded-2xl px-4 mb-4">
            <DetailRow
              icon={<Calendar size={18} color="#FF6B35" />}
              label="Date"
              value={formatted.formattedDate}
            />
            <DetailRow
              icon={<Clock size={18} color="#FF6B35" />}
              label="Time"
              value={formatted.formattedTime}
            />
            <DetailRow
              icon={<MapPin size={18} color="#FF6B35" />}
              label="Venue"
              value={
                formatted.venueAddress
                  ? `${formatted.venueName}\n${formatted.venueAddress}`
                  : formatted.venueName
              }
              onPress={formatted.venueName !== 'TBA' ? handleOpenVenue : undefined}
            />
            <DetailRow
              icon={<CalendarPlus size={18} color="#FF6B35" />}
              label="Calendar"
              value="Add to your calendar"
              onPress={handleAddToCalendar}
            />
          </View>

          {/* Description */}
          {formatted.description ? (
            <View className="bg-neutral-900 rounded-2xl p-5 mb-4">
              <Text className="text-neutral-500 text-xs uppercase tracking-wide mb-3">
                About
              </Text>
              <Text className="text-neutral-300 text-base leading-6">
                {formatted.description}
              </Text>
            </View>
          ) : null}

          {/* Ticket Button */}
          {formatted.ticketUrl ? (
            <Pressable
              onPress={handleOpenTickets}
              className="flex-row items-center justify-center py-4 rounded-2xl mb-4"
              style={({ pressed }) => ({
                backgroundColor: '#FF6B35',
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Ticket size={20} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Get Tickets
              </Text>
            </Pressable>
          ) : null}

          {/* Spacer for bottom safe area */}
          <View style={{ height: insets.bottom + 20 }} />
        </View>
      </ScrollView>

      <BrowserChoiceSheet
        visible={showBrowserChoice}
        onChoice={handleBrowserChoice}
      />
    </View>
  );
}
