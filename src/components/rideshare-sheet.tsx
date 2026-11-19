import { BottomSheet, Host, RNHostView } from '@expo/ui';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Text } from '@/components/localized-text';
import { colors } from '@/theme';
import type { RideProvider } from '@/utils/rideshare';
import { useLanguage } from '@/i18n/language-provider';
import { rideLogos } from '@/utils/ride-logos';
import { useRidePreferences } from '@/hooks/ride-preferences';

export function RideshareSheet({ visible, busy, error, onChoose, onDismiss, onManage }: {
  visible: boolean;
  busy: boolean;
  error: string | null;
  onChoose: (provider: RideProvider) => void;
  onDismiss: () => void;
  onManage: () => void;
}) {
  const { height } = useWindowDimensions();
  const { t, direction } = useLanguage();
  const { providers } = useRidePreferences();

  // An empty native Host can intercept touches even with box-none.
  if (!visible) return null;

  return <Host style={StyleSheet.absoluteFill} pointerEvents="box-none" colorScheme="light"
    layoutDirection={direction === 'rtl' ? 'rightToLeft' : 'leftToRight'}>
    <BottomSheet isPresented={visible} onDismiss={onDismiss}
      containerColor={colors.background} contentPadding={{ top: 8, bottom: 20, left: 20, right: 20 }}>
      <RNHostView matchContents={{ vertical: true }}>
        <ScrollView style={{ maxHeight: height * 0.75, direction }} contentContainerStyle={{ gap: 4 }}
          onAccessibilityEscape={onDismiss}>
          {providers.map(provider => <Pressable key={provider} onPress={() => onChoose(provider)}
            accessibilityRole="button" accessibilityLabel={provider} disabled={busy}
            accessibilityState={{ disabled: busy, busy }}
            style={({ pressed }) => ({
              minHeight: 80, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 20,
              borderRadius: 16, backgroundColor: pressed ? colors.pressed : 'transparent',
              opacity: busy ? 0.5 : 1,
            })}>
            <Image source={rideLogos[provider]} accessible={false} contentFit="contain"
              style={{ width: 48, height: 48, borderRadius: 12 }} />
            <Text style={{ flex: 1, fontSize: 24, fontWeight: '600', color: colors.ink }}>{provider}</Text>
          </Pressable>)}
          {error && <Text role="alert" style={{ padding: 12, fontSize: 20, color: colors.error }}>{error}</Text>}
          <Pressable onPress={onManage} accessibilityRole="button" disabled={busy}
            accessibilityState={{ disabled: busy }}
            style={({ pressed }) => ({ minHeight: 64, padding: 16, alignItems: 'center',
              justifyContent: 'center', borderRadius: 16,
              backgroundColor: pressed ? colors.pressed : 'transparent' })}>
            <Text style={{ fontSize: 20, color: colors.ink }}>{t('changeRideApps')}</Text>
          </Pressable>
          <Pressable onPress={onDismiss} accessibilityRole="button"
            style={({ pressed }) => ({ minHeight: 64, padding: 16, alignItems: 'center',
              justifyContent: 'center', borderRadius: 16,
              backgroundColor: pressed ? colors.pressed : 'transparent' })}>
            <Text style={{ fontSize: 20, color: colors.muted }}>{t('close')}</Text>
          </Pressable>
        </ScrollView>
      </RNHostView>
    </BottomSheet>
  </Host>;
}
