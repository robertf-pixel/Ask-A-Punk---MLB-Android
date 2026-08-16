import React from 'react';
import { Pressable, Text, GestureResponderEvent } from 'react-native';
import { useRouter } from 'expo-router';

const ACCENT_COLOR = '#FF6B35';

interface ClickableTagProps {
  tag: string;
  variant?: 'default' | 'accent';
  onNavigate?: () => void;
}

export function ClickableTag({ tag, variant = 'default', onNavigate }: ClickableTagProps) {
  const router = useRouter();

  const handlePress = (e: GestureResponderEvent) => {
    // Stop propagation to prevent card press
    e.stopPropagation();

    // Navigate to search with tag
    router.push(`/two?tag=${encodeURIComponent(tag)}`);

    // Call optional onNavigate callback (e.g., to close modal)
    onNavigate?.();
  };

  if (variant === 'accent') {
    return (
      <Pressable
        onPress={handlePress}
        className="mr-2 mb-2 px-3 py-1.5 rounded-full"
        style={({ pressed }) => ({
          backgroundColor: `${ACCENT_COLOR}20`,
          opacity: pressed ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <Text style={{ color: ACCENT_COLOR }} className="text-xs font-bold">
          #{tag}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      className="mr-1.5 mb-1.5 px-2.5 py-1 rounded-full bg-neutral-800"
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <Text className="text-neutral-300 text-xs font-medium">
        #{tag}
      </Text>
    </Pressable>
  );
}
