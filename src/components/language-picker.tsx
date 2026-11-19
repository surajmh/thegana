import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/localized-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/language-provider';
import type { Language } from '@/i18n/messages';
import { colors } from '@/theme';
import { FormPopup } from './form-popup';
import { PopupHeader } from './popup-header';
import { LanguageOptions } from './language-options';
import { SelectionRow } from './selection-row';

export function LanguagePicker({ onClose }: { onClose: () => void }) {
  const { t, preference, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState(false);

  function choose(language: Language | null) {
    try { setLanguage(language); onClose(); }
    catch { setError(true); }
  }

  return <FormPopup onClose={onClose}>
    <View style={{ flex: 1 }}>
      <PopupHeader title={t('language')} onClose={onClose} />
      <ScrollView nestedScrollEnabled contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 8 }}>
        <SelectionRow label={t('systemLanguage')} selected={preference === null} onPress={() => choose(null)} />
        <LanguageOptions selected={preference} onChoose={choose} />
        {error && <Text role="alert" style={{ fontSize: 20, color: colors.error }}>{t('languageSaveError')}</Text>}
      </ScrollView>
    </View>
  </FormPopup>;
}
