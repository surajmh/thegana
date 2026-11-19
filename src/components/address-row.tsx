import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/localized-text';
import { Image } from 'expo-image';
import { Pressable } from 'react-native-gesture-handler';
import Swipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { ReduceMotion } from 'react-native-reanimated';
import { colors } from '@/theme';
import type { Address } from '@/utils/records';
import { useLanguage } from '@/i18n/language-provider';

export function AddressRow({ item, copied, onCopy, onEdit, onDelete }: {
  item: Address; copied: boolean; onCopy: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const { t } = useLanguage();
  const swipeable = useRef<SwipeableMethods>(null);
  const open = useRef(false);
  const [revealed, setRevealed] = useState(false);

  return <Swipeable ref={swipeable} leftThreshold={40} overshootLeft={false} overshootRight={false}
    animationOptions={{ duration: 300, dampingRatio: 1, reduceMotion: ReduceMotion.System }}
    containerStyle={{ borderRadius: 20 }}
    onSwipeableWillOpen={() => { open.current = true; setRevealed(true); }}
    onSwipeableClose={() => { open.current = false; setRevealed(false); }}
    renderLeftActions={() => <Pressable onPress={onDelete} accessibilityRole="button"
      disabled={!revealed} aria-hidden={!revealed}
      importantForAccessibility={revealed ? 'auto' : 'no-hide-descendants'}
      accessibilityLabel={t('deleteLabel', { name: item.name })}
      style={({ pressed }) => ({ width: 88, padding: 10, gap: 6,
        justifyContent: 'center', alignItems: 'center', backgroundColor: colors.error,
        opacity: pressed ? 0.8 : 1 })}>
      <Text accessible={false} style={{ fontSize: 30, color: colors.surface }}>🗑</Text>
      <Text style={{ fontSize: 17, color: colors.surface, textAlign: 'center' }}>{t('delete')}</Text>
    </Pressable>}>
    <Pressable onPress={() => { if (open.current) swipeable.current?.close(); else onCopy(); }}
      onLongPress={() => { swipeable.current?.close(); onEdit(); }}
      accessibilityRole="button" accessibilityLabel={t('copyLabel', { name: item.name })}
      accessibilityHint={t('rowHint')}
      accessibilityActions={[{ name: 'edit', label: t('editAddress') }, { name: 'delete', label: t('delete') }]}
      onAccessibilityAction={({ nativeEvent }) => {
        if (nativeEvent.actionName === 'edit') onEdit();
        else if (nativeEvent.actionName === 'delete') onDelete();
      }}
      style={({ pressed }) => ({ padding: 16, borderRadius: 20, borderWidth: 2,
        borderColor: copied ? colors.primary : colors.border,
        backgroundColor: pressed ? colors.pressed : colors.surface,
        flexDirection: 'row', alignItems: 'center', gap: 16 })}>
      {item.image ? <Image source={item.image} contentFit="cover" style={{ width: 80, height: 80, borderRadius: 14 }} />
        : <View accessibilityElementsHidden style={{ width: 80, height: 80, borderRadius: 14,
          backgroundColor: colors.photoBackground, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 36, color: colors.primary }}>⌂</Text>
        </View>}
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ fontSize: 27, fontWeight: '700', color: colors.ink }}>{item.name}</Text>
        {copied && <Text accessibilityLiveRegion="polite" role="status" style={{ fontSize: 18, color: colors.primary }}>✓ {t('copied')}</Text>}
      </View>
    </Pressable>
  </Swipeable>;
}
