import React, { useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react-native';

const ACCENT = '#FF6B35';

export default function BrowserScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [navState, setNavState] = useState<WebViewNavigation | null>(null);
  const [loading, setLoading] = useState(true);

  const displayUrl = (() => {
    try {
      const u = new URL(navState?.url ?? url ?? '');
      return u.hostname;
    } catch {
      return url ?? '';
    }
  })();

  if (!url) {
    router.back();
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />

      {/* Toolbar */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: '#111',
          borderBottomWidth: 1,
          borderBottomColor: '#222',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 }}>
          {/* Close */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: '#222',
              alignItems: 'center', justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
              marginRight: 8,
            })}
          >
            <X size={18} color="#fff" />
          </Pressable>

          {/* URL bar */}
          <View style={{
            flex: 1,
            backgroundColor: '#1A1A1A',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginRight: 8,
          }}>
            <Text style={{ color: '#aaa', fontSize: 13, fontWeight: '500' }} numberOfLines={1}>
              {displayUrl}
            </Text>
          </View>

          {/* Back */}
          <Pressable
            onPress={() => webViewRef.current?.goBack()}
            disabled={!navState?.canGoBack}
            style={({ pressed }) => ({
              width: 36, height: 36, borderRadius: 18,
              alignItems: 'center', justifyContent: 'center',
              opacity: navState?.canGoBack ? (pressed ? 0.6 : 1) : 0.3,
              marginRight: 4,
            })}
          >
            <ChevronLeft size={22} color="#fff" />
          </Pressable>

          {/* Forward */}
          <Pressable
            onPress={() => webViewRef.current?.goForward()}
            disabled={!navState?.canGoForward}
            style={({ pressed }) => ({
              width: 36, height: 36, borderRadius: 18,
              alignItems: 'center', justifyContent: 'center',
              opacity: navState?.canGoForward ? (pressed ? 0.6 : 1) : 0.3,
              marginRight: 4,
            })}
          >
            <ChevronRight size={22} color="#fff" />
          </Pressable>

          {/* Refresh */}
          <Pressable
            onPress={() => webViewRef.current?.reload()}
            style={({ pressed }) => ({
              width: 36, height: 36, borderRadius: 18,
              alignItems: 'center', justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <RotateCcw size={18} color="#fff" />
          </Pressable>
        </View>

        {/* Loading bar */}
        {loading ? (
          <View style={{ height: 2, backgroundColor: '#222' }}>
            <View style={{ height: 2, width: '60%', backgroundColor: ACCENT }} />
          </View>
        ) : null}
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={{ flex: 1 }}
        onNavigationStateChange={setNavState}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        renderLoading={() => (
          <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        )}
      />
    </View>
  );
}
