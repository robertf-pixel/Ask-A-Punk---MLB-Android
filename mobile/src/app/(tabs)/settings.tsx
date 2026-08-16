import React from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { RefreshCw, Calendar, Clock, CheckCircle, XCircle, Info, Shield, Mail, ChevronRight, Globe } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { fetchSyncStatus, triggerSync, formatSyncDate } from '@/lib/api/events-api';
import { SyncStatus } from '@/lib/types/events';

const ACCENT_COLOR = '#FF6B35';

function Header() {
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
          SETTINGS
        </Text>
        <Text className="text-neutral-500 text-xs font-medium uppercase tracking-wider mt-1">
          App Configuration
        </Text>
      </View>
    </View>
  );
}

function StatusIcon({ status }: { status: SyncStatus['status'] }) {
  switch (status) {
    case 'success':
      return <CheckCircle size={20} color="#22c55e" />;
    case 'failed':
      return <XCircle size={20} color="#ef4444" />;
    case 'in_progress':
      return <ActivityIndicator size="small" color={ACCENT_COLOR} />;
    default:
      return <Info size={20} color="#666" />;
  }
}

function getStatusText(status: SyncStatus['status']): string {
  switch (status) {
    case 'success':
      return 'Synced successfully';
    case 'failed':
      return 'Sync failed';
    case 'in_progress':
      return 'Syncing...';
    default:
      return 'Never synced';
  }
}

function getStatusColor(status: SyncStatus['status']): string {
  switch (status) {
    case 'success':
      return '#22c55e';
    case 'failed':
      return '#ef4444';
    case 'in_progress':
      return ACCENT_COLOR;
    default:
      return '#666';
  }
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      className="flex-row items-center py-4 border-b border-neutral-800"
    >
      <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-white text-base font-medium">{label}</Text>
        {value ? (
          <Text className="text-neutral-500 text-sm mt-0.5">{value}</Text>
        ) : null}
      </View>
      <ChevronRight size={20} color="#666" />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: syncStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ['syncStatus'],
    queryFn: fetchSyncStatus,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      // Refresh sync status and events after successful sync
      queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => {
      // Refresh status to show error state
      refetchStatus();
    },
  });

  const handleRefresh = () => {
    if (!syncMutation.isPending) {
      syncMutation.mutate();
    }
  };

  const isRefreshing = syncMutation.isPending || syncStatus?.status === 'in_progress';

  const handleOpenPrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const handleOpenSupport = async () => {
    try {
      await Linking.openURL('mailto:itsstilloknottodrinkfanzine@hotmail.com');
    } catch (error) {
      console.error('Failed to open email:', error);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <Header />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sync Status Card */}
        <Animated.View entering={FadeInDown.springify()}>
          <View className="bg-neutral-900 rounded-2xl p-5 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-lg">Data Sync</Text>
              {syncStatus ? <StatusIcon status={syncStatus.status} /> : null}
            </View>

            {isLoadingStatus ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color={ACCENT_COLOR} />
              </View>
            ) : syncStatus ? (
              <>
                {/* Status */}
                <View className="flex-row items-center mb-4">
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: getStatusColor(syncStatus.status) }}
                  />
                  <Text
                    className="text-sm font-medium"
                    style={{ color: getStatusColor(syncStatus.status) }}
                  >
                    {getStatusText(syncStatus.status)}
                  </Text>
                </View>

                {/* Last Updated */}
                <View className="flex-row items-center mb-3 py-3 border-t border-neutral-800">
                  <Clock size={16} color="#666" />
                  <View className="ml-3 flex-1">
                    <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-0.5">
                      Last Updated
                    </Text>
                    <Text className="text-white text-sm font-medium">
                      {formatSyncDate(syncStatus.lastSyncedAt)}
                    </Text>
                  </View>
                </View>

                {/* Event Count */}
                <View className="flex-row items-center py-3 border-t border-neutral-800">
                  <Calendar size={16} color="#666" />
                  <View className="ml-3 flex-1">
                    <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-0.5">
                      Events Cached
                    </Text>
                    <Text className="text-white text-sm font-medium">
                      {syncStatus.eventCount} event{syncStatus.eventCount !== 1 ? 's' : null}
                    </Text>
                  </View>
                </View>

                {/* Error Message */}
                {syncStatus.errorMessage && syncStatus.status === 'failed' ? (
                  <View className="mt-3 py-3 px-3 bg-red-500/10 rounded-lg border-t border-neutral-800">
                    <Text className="text-red-400 text-xs">
                      {syncStatus.errorMessage}
                    </Text>
                  </View>
                ) : null}

                {/* Success Message */}
                {syncMutation.isSuccess ? (
                  <View className="mt-3 py-3 px-3 bg-green-500/10 rounded-lg">
                    <Text className="text-green-400 text-xs font-medium">
                      Sync completed successfully
                    </Text>
                  </View>
                ) : null}

                {/* Error from mutation */}
                {syncMutation.isError ? (
                  <View className="mt-3 py-3 px-3 bg-red-500/10 rounded-lg">
                    <Text className="text-red-400 text-xs font-medium">
                      Failed to sync. Please try again.
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}

            {/* Refresh Button */}
            <Pressable
              onPress={handleRefresh}
              disabled={isRefreshing}
              className="mt-4 py-4 rounded-xl flex-row items-center justify-center"
              style={({ pressed }) => ({
                backgroundColor: isRefreshing ? '#333' : ACCENT_COLOR,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              {isRefreshing ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white font-bold ml-2">Syncing...</Text>
                </>
              ) : (
                <>
                  <RefreshCw size={18} color="#fff" />
                  <Text className="text-white font-bold ml-2">Refresh Now</Text>
                </>
              )}
            </Pressable>
          </View>
        </Animated.View>

        {/* Privacy & Support Section */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View className="bg-neutral-900 rounded-2xl px-4 mb-4">
            <SettingsRow
              icon={<Shield size={18} color={ACCENT_COLOR} />}
              label="Privacy Policy"
              value="How we handle your data"
              onPress={handleOpenPrivacyPolicy}
            />
            <View className="flex-row items-center py-4">
              <Pressable
                onPress={handleOpenSupport}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="flex-row items-center flex-1"
              >
                <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
                  <Mail size={18} color={ACCENT_COLOR} />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-medium">Support</Text>
                  <Text className="text-neutral-500 text-sm mt-0.5">itsstilloknottodrinkfanzine@hotmail.com</Text>
                </View>
                <ChevronRight size={20} color="#666" />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View className="bg-neutral-900 rounded-2xl p-5">
            <Text className="text-white font-bold text-lg mb-3">About</Text>
            <Text className="text-neutral-400 text-sm leading-5">
              This app displays upcoming punk and alternative music events in Melbourne,
              sourced from the Ask A Punk community calendar.
            </Text>

            <View className="mt-4 pt-4 border-t border-neutral-800">
              <Pressable
                onPress={() => Linking.openURL('https://the-counterforce.org/ask-a-punk-how-to/')}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="flex-row items-center py-3"
              >
                <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
                  <Globe size={18} color={ACCENT_COLOR} />
                </View>
                <Text className="text-white text-base font-medium flex-1">Learn more about Ask A Punk</Text>
                <ChevronRight size={20} color="#666" />
              </Pressable>

              <Pressable
                onPress={() => Linking.openURL('https://askapunk.au/')}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="flex-row items-center py-3 border-t border-neutral-800"
              >
                <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
                  <Globe size={18} color={ACCENT_COLOR} />
                </View>
                <Text className="text-white text-base font-medium flex-1">Learn more about Ask A Punk Au</Text>
                <ChevronRight size={20} color="#666" />
              </Pressable>

              <Pressable
                onPress={() => Linking.openURL('https://linktr.ee/llrrecords')}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="flex-row items-center py-3 border-t border-neutral-800"
              >
                <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
                  <Globe size={18} color={ACCENT_COLOR} />
                </View>
                <Text className="text-white text-base font-medium flex-1">Learn more about LLR</Text>
                <ChevronRight size={20} color="#666" />
              </Pressable>
            </View>

            <View className="mt-4 pt-4 border-t border-neutral-800">
              <Text className="text-neutral-600 text-xs font-medium tracking-wide text-center">
                app created by life.lair.regret. records
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Version Info */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View className="mt-6 items-center">
            <Text className="text-neutral-700 text-xs">
              ASK A PUNK Melbourne v1.11
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
