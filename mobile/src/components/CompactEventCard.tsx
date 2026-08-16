import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FormattedEvent } from '@/lib/types/events';

const ACCENT_COLOR = '#FF6B35';

export function CompactEventCard({
  event,
  index,
  onPress,
}: {
  event: FormattedEvent;
  index: number;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={onPress}
        className="mx-4 mb-3 flex-row bg-neutral-900 rounded-xl overflow-hidden"
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <View className="w-24 h-24">
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
            >
              <View className="flex-1 items-center justify-center">
                <Text
                  className="text-2xl font-black"
                  style={{ color: ACCENT_COLOR }}
                >
                  {event.title.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            </LinearGradient>
          )}
        </View>

        <View className="flex-1 p-3 justify-center">
          <Text className="text-white font-bold text-sm mb-1" numberOfLines={2}>
            {event.title}
          </Text>
          <View className="flex-row items-center mb-1">
            <Calendar size={12} color="#888" />
            <Text className="text-neutral-400 text-xs ml-1">
              {event.formattedDate}
            </Text>
            <Clock size={12} color="#888" style={{ marginLeft: 8 }} />
            <Text className="text-neutral-400 text-xs ml-1">
              {event.formattedTime}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={12} color="#888" />
            <Text className="text-neutral-500 text-xs ml-1" numberOfLines={1}>
              {event.venueName}
            </Text>
          </View>
        </View>

        <View className="justify-center pr-3">
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: `${ACCENT_COLOR}20` }}
          >
            <Text style={{ color: ACCENT_COLOR }} className="text-xs">
              {'>'}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
