import { Text as NativeText, type TextProps } from 'react-native';
import { useLanguage } from '@/i18n/language-provider';
import { languageDirection } from '@/i18n/messages';

// Match the interface direction while allowing explicit centered button styles.
export function Text({ style, accessibilityLanguage, ...props }: TextProps) {
  const { language } = useLanguage();
  const direction = languageDirection(accessibilityLanguage ?? language);
  return <NativeText {...props} accessibilityLanguage={accessibilityLanguage ?? language}
    style={[{ writingDirection: direction, textAlign: direction === 'rtl' ? 'right' : 'left' }, style]} />;
}
