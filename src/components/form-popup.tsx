import { BottomSheet, Host, RNHostView } from '@expo/ui';
import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { colors } from '@/theme';

// Keep Android on a transparent route; Expo UI owns its slide and swipe behavior.
export function FormPopup({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  if (Platform.OS === 'ios') return <>{children}</>;

  return <Host style={{ flex: 1 }} pointerEvents="box-none" colorScheme="light">
    <BottomSheet isPresented onDismiss={onClose} snapPoints={['full']}
      contentPadding={0} containerColor={colors.background}>
      <RNHostView>
        <View style={{ flex: 1 }}>{children}</View>
      </RNHostView>
    </BottomSheet>
  </Host>;
}
