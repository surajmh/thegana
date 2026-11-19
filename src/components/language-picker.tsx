import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/language-provider';
import { languages, type Language } from '@/i18n/messages';
import { colors } from '@/theme';
import { FormPopup } from './form-popup';
import { PopupHeader } from './popup-header';

export function LanguagePicker({ onClose }: { onClose: () => void }) {
  const { t, preference, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState(false);
  const options = [{ code: null, name: t('systemLanguage') }, ...languages];

  function choose(language: Language | null) {
    try { setLanguage(language); onClose(); }
    catch { setError(true); }
  }

  return <FormPopup onClose={onClose}>
    <View style={{ flex: 1 }}>
      <PopupHeader title={t('language')} onClose={onClose} />
      <ScrollView nestedScrollEnabled contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 8 }}>
        {options.map(option => <Pressable key={option.code ?? 'system'}
          accessibilityRole="radio" accessibilityState={{ checked: preference === option.code }}
          accessibilityLanguage={option.code ?? undefined}
          onPress={() => choose(option.code)}
          style={({ pressed }) => ({ minHeight: 64, padding: 16, borderRadius: 16,
            flexDirection: 'row', alignItems: 'center', gap: 16,
            backgroundColor: pressed ? colors.pressed : colors.surface,
            borderWidth: 2, borderColor: preference === option.code ? colors.primary : colors.border })}>
          <Text style={{ flex: 1, fontSize: 24, color: colors.ink }}>{option.name}</Text>
          {preference === option.code && <Text accessible={false} style={{ fontSize: 26, color: colors.ink }}>✓</Text>}
        </Pressable>)}
        {error && <Text role="alert" style={{ fontSize: 20, color: colors.error }}>{t('languageSaveError')}</Text>}
      </ScrollView>
    </View>
  </FormPopup>;
}
