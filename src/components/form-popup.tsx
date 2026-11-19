import { BottomSheet, Host, RNHostView } from '@expo/ui';
import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { colors } from '@/theme';
import { useLanguage } from '@/i18n/language-provider';

// Keep Android on a transparent route; Expo UI owns its slide and swipe behavior.
export function FormPopup({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const { direction } = useLanguage();
  if (Platform.OS === 'ios') return <View style={{ flex: 1, direction }}>{children}</View>;

  return <Host style={{ flex: 1 }} pointerEvents="box-none" colorScheme="light"
    layoutDirection={direction === 'rtl' ? 'rightToLeft' : 'leftToRight'}>
    <BottomSheet isPresented onDismiss={onClose} snapPoints={['full']}
      contentPadding={0} containerColor={colors.background}>
      <RNHostView>
        <View style={{ flex: 1, direction }}>{children}</View>
      </RNHostView>
    </BottomSheet>
  </Host>;
}
