import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/language-provider';
import { colors } from '@/theme';

export function PopupHeader({ title, onClose, disabled = false }: {
  title: string; onClose: () => void; disabled?: boolean;
}) {
  const { t } = useLanguage();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingLeft: 24, paddingRight: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border }}>
    <Text role="heading" style={{ flex: 1, fontSize: 25, fontWeight: '700', color: colors.ink }}>{title}</Text>
    <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('closeToList')}
      disabled={disabled} accessibilityState={{ disabled }}
      style={({ pressed }) => ({ width: 64, height: 64, alignItems: 'center', justifyContent: 'center',
        borderRadius: 16, backgroundColor: pressed ? colors.pressed : 'transparent',
        opacity: disabled ? 0.5 : 1 })}>
      <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }}
        size={28} tintColor={colors.ink} accessible={false} />
    </Pressable>
  </View>;
}
