import { colors } from '@/theme';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '@/components/localized-text';

export function Action({ label, onPress, disabled = false, secondary = false, destructive = false, style }: {
  label: string; onPress: () => void; disabled?: boolean; secondary?: boolean;
  destructive?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const accent = destructive ? colors.destructive : colors.primary;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [{
        alignSelf: 'stretch', minHeight: 64, paddingVertical: 16, paddingHorizontal: 20,
        justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 1,
        backgroundColor: secondary ? (pressed ? colors.pressed : 'transparent') : accent,
        borderColor: secondary ? (destructive ? accent : colors.inputBorder) : accent,
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
      }, style]}>
      <Text style={{ fontSize: 22, fontWeight: '600', textAlign: 'center',
        color: secondary ? (destructive ? accent : colors.ink) : colors.surface }}>{label}</Text>
    </Pressable>
  );
}
