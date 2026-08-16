import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { X, Shield, Database, Eye, Share2, ExternalLink } from 'lucide-react-native';

const ACCENT_COLOR = '#FF6B35';

interface PolicySectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function PolicySection({ icon, title, description }: PolicySectionProps) {
  return (
    <View className="flex-row items-start py-4 border-b border-neutral-800">
      <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-base mb-1">{title}</Text>
        <Text className="text-neutral-400 text-sm leading-5">{description}</Text>
      </View>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Header */}
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
              PRIVACY POLICY
            </Text>
            <Text className="text-neutral-500 text-xs font-medium uppercase tracking-wider mt-1">
              Ask A Punk - MLB
            </Text>
          </View>
          <Pressable
            onPress={handleClose}
            className="w-10 h-10 rounded-full bg-neutral-900 items-center justify-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <X size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <View className="bg-neutral-900 rounded-2xl p-5 mb-4">
          <Text className="text-white font-bold text-lg mb-3">Your Privacy Matters</Text>
          <Text className="text-neutral-400 text-sm leading-5">
            Ask A Punk - MLB is designed with your privacy in mind. We believe in transparency
            about how your information is handled.
          </Text>
        </View>

        {/* Policy Details */}
        <View className="bg-neutral-900 rounded-2xl px-4 mb-4">
          <PolicySection
            icon={<Database size={18} color={ACCENT_COLOR} />}
            title="Event Data Source"
            description="All event information is sourced from the Ask A Punk community calendar via the Gancio API. We display this publicly available information to help you discover local punk and alternative music events."
          />

          <PolicySection
            icon={<Shield size={18} color={ACCENT_COLOR} />}
            title="Local Storage Only"
            description="Your saved events are stored locally on your device only. This data never leaves your phone and is not synced to any external servers."
          />

          <PolicySection
            icon={<Eye size={18} color={ACCENT_COLOR} />}
            title="No Personal Data Collection"
            description="We do not collect, store, or process any personal information. No account creation is required, and no user data is transmitted from your device."
          />

          <PolicySection
            icon={<Eye size={18} color={ACCENT_COLOR} />}
            title="No Analytics or Tracking"
            description="This app does not use any analytics services, tracking pixels, or third-party SDKs that monitor your behavior. Your usage remains completely private."
          />

          <PolicySection
            icon={<Share2 size={18} color={ACCENT_COLOR} />}
            title="No Data Sharing"
            description="We do not share any data with third parties because we simply do not collect any data to share."
          />

          <View className="flex-row items-start py-4">
            <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
              <ExternalLink size={18} color={ACCENT_COLOR} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base mb-1">External Links</Text>
              <Text className="text-neutral-400 text-sm leading-5">
                When you tap links to external services (Maps, ticket sites, venue websites),
                those services are governed by their own privacy policies. We encourage you
                to review their policies.
              </Text>
            </View>
          </View>
        </View>

        {/* Last Updated */}
        <View className="bg-neutral-900 rounded-2xl p-5 mb-4">
          <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-2">
            Last Updated
          </Text>
          <Text className="text-white text-sm font-medium">April 2026</Text>
        </View>

        {/* Contact */}
        <View className="items-center pt-4">
          <Text className="text-neutral-600 text-xs">
            Questions? Contact us at itsstilloknottodrinkfanzine@hotmail.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
