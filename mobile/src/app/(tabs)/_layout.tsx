import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, Settings, Heart, Plus } from 'lucide-react-native';
import { View } from 'react-native';

const ACCENT_COLOR = '#FF6B35';
const BACKGROUND_COLOR = '#0A0A0A';
const INACTIVE_COLOR = '#666666';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BACKGROUND_COLOR,
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 28,
          paddingTop: 10,
        },
        tabBarActiveTintColor: ACCENT_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                padding: 6,
                borderRadius: 8,
                backgroundColor: focused ? `${ACCENT_COLOR}20` : 'transparent',
              }}
            >
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                padding: 6,
                borderRadius: 8,
                backgroundColor: focused ? `${ACCENT_COLOR}20` : 'transparent',
              }}
            >
              <Heart size={22} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : 'none'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                padding: 6,
                borderRadius: 8,
                backgroundColor: focused ? `${ACCENT_COLOR}20` : 'transparent',
              }}
            >
              <Search size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: 'Submit',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                padding: 6,
                borderRadius: 8,
                backgroundColor: focused ? `${ACCENT_COLOR}20` : 'transparent',
              }}
            >
              <Plus size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                padding: 6,
                borderRadius: 8,
                backgroundColor: focused ? `${ACCENT_COLOR}20` : 'transparent',
              }}
            >
              <Settings size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
