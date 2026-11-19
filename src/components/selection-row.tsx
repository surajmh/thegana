import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { Text } from '@/components/localized-text';
import { colors } from '@/theme';

export function SelectionRow({ label, selected, multiple = false, leading, language, onPress }: {
  label: string; selected: boolean; multiple?: boolean; leading?: ReactNode; language?: string; onPress: () => void;
}) {
  return <Pressable onPress={onPress} accessibilityRole={multiple ? 'checkbox' : 'radio'}
    accessibilityState={{ checked: selected }} aria-checked={selected} accessibilityLanguage={language}
    style={({ pressed }) => ({ minHeight: 80, padding: 16, borderRadius: 16,
      flexDirection: 'row', alignItems: 'center', gap: 16,
      backgroundColor: pressed ? colors.pressed : colors.surface,
      borderWidth: 2, borderColor: selected ? colors.primary : colors.border })}>
    {leading}
    <Text accessibilityLanguage={language} style={{ flex: 1, fontSize: 24, color: colors.ink }}>{label}</Text>
    <SymbolView accessible={false} size={28} tintColor={colors.ink} name={{
      ios: multiple ? (selected ? 'checkmark.square.fill' : 'square') : (selected ? 'largecircle.fill.circle' : 'circle'),
      android: multiple ? (selected ? 'check_box' : 'check_box_outline_blank') : (selected ? 'radio_button_checked' : 'radio_button_unchecked'),
      web: multiple ? (selected ? 'check_box' : 'check_box_outline_blank') : (selected ? 'radio_button_checked' : 'radio_button_unchecked'),
    }} />
  </Pressable>;
}
