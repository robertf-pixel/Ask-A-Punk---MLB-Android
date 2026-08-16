import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Globe, ExternalLink, Check } from 'lucide-react-native';

const ACCENT = '#FF6B35';

export type BrowserPreference = 'inapp' | 'external';

interface Props {
  visible: boolean;
  onChoice: (pref: BrowserPreference, remember: boolean) => void;
}

export function BrowserChoiceSheet({ visible, onChoice }: Props) {
  const [remember, setRemember] = React.useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
          {/* Grabber */}
          <View style={{ width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

          <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 6 }}>Open ticket link</Text>
          <Text style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>How would you like to open this link?</Text>

          {/* In-app option */}
          <Pressable
            onPress={() => onChoice('inapp', remember)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: ACCENT,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: ACCENT + '22', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Globe size={22} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Open in App</Text>
              <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Stay inside the app</Text>
            </View>
          </Pressable>

          {/* External browser option */}
          <Pressable
            onPress={() => onChoice('external', remember)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#333',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#ffffff11', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <ExternalLink size={22} color="#aaa" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Open in Browser</Text>
              <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Opens your default browser</Text>
            </View>
          </Pressable>

          {/* Remember toggle */}
          <Pressable
            onPress={() => setRemember(r => !r)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <View style={{
              width: 22, height: 22, borderRadius: 6,
              backgroundColor: remember ? ACCENT : 'transparent',
              borderWidth: 2, borderColor: remember ? ACCENT : '#555',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {remember ? <Check size={14} color="white" strokeWidth={3} /> : null}
            </View>
            <Text style={{ color: '#aaa', fontSize: 14 }}>Remember my choice</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
