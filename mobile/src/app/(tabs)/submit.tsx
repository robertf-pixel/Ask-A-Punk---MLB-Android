import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Send,
  CalendarDays,
  Clock,
  MapPin,
  Type,
  Tag,
  ImagePlus,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as MailComposer from 'expo-mail-composer';
import * as DocumentPicker from 'expo-document-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { cn } from '@/lib/cn';

const ACCENT_COLOR = '#FF6B35';
const RECIPIENT_EMAIL = 'itsstilloknottodrinkfanzine@hotmail.com';

type FlyerAsset = {
  uri: string;
  name: string;
  mimeType: string | undefined;
};

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

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
          SUBMIT EVENT
        </Text>
        <Text className="text-neutral-500 text-xs font-medium uppercase tracking-wider mt-1">
          Add your gig to the calendar
        </Text>
      </View>
    </View>
  );
}

function FormLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center mb-2">
      {icon}
      <Text className="text-neutral-400 text-xs font-bold uppercase tracking-wider ml-2">
        {label}
      </Text>
    </View>
  );
}

function FeedbackBanner({
  feedback,
  onDismiss,
}: {
  feedback: FeedbackState;
  onDismiss: () => void;
}) {
  if (!feedback) return null;

  const isSuccess = feedback.type === 'success';

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      exiting={FadeOut.duration(200)}
    >
      <Pressable
        onPress={onDismiss}
        className={cn(
          'mx-4 mb-4 p-4 rounded-xl flex-row items-center',
          isSuccess ? 'bg-green-500/15' : 'bg-red-500/15'
        )}
      >
        {isSuccess ? (
          <CheckCircle size={20} color="#22c55e" />
        ) : (
          <AlertCircle size={20} color="#ef4444" />
        )}
        <Text
          className={cn(
            'flex-1 ml-3 text-sm font-medium',
            isSuccess ? 'text-green-400' : 'text-red-400'
          )}
        >
          {feedback.message}
        </Text>
        <X size={16} color={isSuccess ? '#22c55e' : '#ef4444'} />
      </Pressable>
    </Animated.View>
  );
}

export default function SubmitEventScreen() {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState<string>('');
  const [venue, setVenue] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [flyer, setFlyer] = useState<FlyerAsset | null>(null);

  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isFormValid = title.trim().length > 0;

  const handlePickFlyer = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setFlyer({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? undefined,
        });
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Failed to pick flyer:', error);
    }
  }, []);

  const handleRemoveFlyer = useCallback(async () => {
    setFlyer(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        setFeedback({
          type: 'error',
          message:
            'No email client available. Please set up an email account on your device.',
        });
        return;
      }

      const bodyParts: string[] = [];
      bodyParts.push(`Title: ${title.trim()}`);
      if (venue.trim()) {
        bodyParts.push(`Where: ${venue.trim()}`);
      }
      if (date.trim()) {
        bodyParts.push(`Date: ${date.trim()}`);
      }
      if (time.trim()) {
        bodyParts.push(`Time: ${time.trim()}`);
      }
      if (tags.trim()) {
        bodyParts.push(`Tags: ${tags.trim()}`);
      }
      if (flyer) {
        bodyParts.push(`Flyer: attached`);
      }

      const body = bodyParts.join('\n');

      const composeOptions: MailComposer.MailComposerOptions = {
        recipients: [RECIPIENT_EMAIL],
        subject: `Event Submission: ${title.trim()}`,
        body,
        isHtml: false,
      };

      if (flyer) {
        composeOptions.attachments = [flyer.uri];
      }

      const result = await MailComposer.composeAsync(composeOptions);

      if (result.status === MailComposer.MailComposerStatus.SENT) {
        setFeedback({
          type: 'success',
          message: 'Event submitted successfully! We will review it shortly.',
        });
        setTitle('');
        setVenue('');
        setDate('');
        setTime('');
        setTags('');
        setFlyer(null);
      } else if (result.status === MailComposer.MailComposerStatus.SAVED) {
        setFeedback({
          type: 'success',
          message: 'Email saved as draft. Send it when you are ready.',
        });
      }
    } catch (error) {
      console.error('Failed to compose email:', error);
      setFeedback({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  }, [isFormValid, title, venue, date, time, tags, flyer, buttonScale]);

  const dismissFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return (
    <View className="flex-1 bg-black">
      <Header />

      <KeyboardAwareScrollView
        bottomOffset={100}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <FeedbackBanner feedback={feedback} onDismiss={dismissFeedback} />

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <View className="mb-5">
            <FormLabel
              icon={<Type size={14} color={ACCENT_COLOR} />}
              label="Title *"
            />
            <TextInput
              className={cn(
                'bg-neutral-900 rounded-xl px-4 py-3.5 text-white text-base font-medium',
                'border',
                title.trim().length > 0
                  ? 'border-neutral-700'
                  : 'border-neutral-800'
              )}
              placeholder="e.g. Slant (KOREA), Hacker, Paroxys, RAT BAIT & MK Naomi @ The Tote"
              placeholderTextColor="#555"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
        </Animated.View>

        {/* Where */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View className="mb-5">
            <FormLabel
              icon={<MapPin size={14} color={ACCENT_COLOR} />}
              label="Where"
            />
            <TextInput
              className="bg-neutral-900 rounded-xl px-4 py-3.5 text-white text-base font-medium border border-neutral-800"
              placeholder="e.g. The Tote, Collingwood"
              placeholderTextColor="#555"
              value={venue}
              onChangeText={setVenue}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
        </Animated.View>

        {/* Date and Time */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <View className="flex-row mb-5" style={{ gap: 12 }}>
            <View className="flex-1">
              <FormLabel
                icon={<CalendarDays size={14} color={ACCENT_COLOR} />}
                label="Date"
              />
              <TextInput
                className="bg-neutral-900 rounded-xl px-4 py-3.5 text-white text-base font-medium border border-neutral-800"
                placeholder="e.g. Sat 26 April"
                placeholderTextColor="#555"
                value={date}
                onChangeText={setDate}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View className="flex-1">
              <FormLabel
                icon={<Clock size={14} color={ACCENT_COLOR} />}
                label="Time"
              />
              <TextInput
                className="bg-neutral-900 rounded-xl px-4 py-3.5 text-white text-base font-medium border border-neutral-800"
                placeholder="e.g. 7:00 PM"
                placeholderTextColor="#555"
                value={time}
                onChangeText={setTime}
                returnKeyType="next"
              />
            </View>
          </View>
        </Animated.View>

        {/* Tags */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View className="mb-5">
            <FormLabel
              icon={<Tag size={14} color={ACCENT_COLOR} />}
              label="Tags"
            />
            <TextInput
              className="bg-neutral-900 rounded-xl px-4 py-3.5 text-white text-base font-medium border border-neutral-800"
              placeholder="e.g. punk, hardcore, diy"
              placeholderTextColor="#555"
              value={tags}
              onChangeText={setTags}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <Text className="text-neutral-600 text-xs mt-1.5 ml-1">
              Separate tags with commas
            </Text>
          </View>
        </Animated.View>

        {/* Flyer */}
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <View className="mb-6">
            <FormLabel
              icon={<ImagePlus size={14} color={ACCENT_COLOR} />}
              label="Flyer"
            />

            {flyer ? (
              <View className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                <Image
                  source={{ uri: flyer.uri }}
                  className="w-full"
                  style={{ height: 200 }}
                  resizeMode="cover"
                />
                <View className="flex-row items-center p-3">
                  <Text
                    className="flex-1 text-neutral-400 text-sm"
                    numberOfLines={1}
                  >
                    {flyer.name}
                  </Text>
                  <Pressable
                    onPress={handleRemoveFlyer}
                    className="w-8 h-8 rounded-full bg-neutral-800 items-center justify-center ml-2"
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <X size={16} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handlePickFlyer}
                className="bg-neutral-900 rounded-xl border border-dashed border-neutral-700 py-8 items-center justify-center"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: `${ACCENT_COLOR}15` }}
                >
                  <ImagePlus size={24} color={ACCENT_COLOR} />
                </View>
                <Text className="text-neutral-400 text-sm font-medium">
                  Tap to add a flyer image
                </Text>
                <Text className="text-neutral-600 text-xs mt-1">
                  JPG, PNG, or WEBP
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Submit Button */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={buttonAnimatedStyle}
        >
          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid}
            className={cn(
              'rounded-xl py-4 flex-row items-center justify-center',
              !isFormValid ? 'opacity-40' : 'opacity-100'
            )}
            style={({ pressed }) => ({
              backgroundColor: ACCENT_COLOR,
              opacity: !isFormValid ? 0.4 : pressed ? 0.85 : 1,
            })}
          >
            <Send size={20} color="#fff" />
            <Text className="text-white font-black text-base uppercase tracking-wider ml-2">
              Submit Event
            </Text>
          </Pressable>

          <Text className="text-neutral-600 text-xs text-center mt-3">
            Opens your email app with all the details filled in
          </Text>
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
}
