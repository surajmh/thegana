import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/localized-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/language-provider';
import { useRidePreferences } from '@/hooks/ride-preferences';
import type { Language, MessageKey } from '@/i18n/messages';
import type { RideProvider } from '@/utils/rideshare';
import { colors } from '@/theme';
import { Action } from './action';
import { LanguageOptions } from './language-options';
import { RideOptions } from './ride-options';

export function Onboarding() {
  const { t, preference, setLanguage } = useLanguage();
  const { saveProviders } = useRidePreferences();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(preference);
  const [selectedRides, setSelectedRides] = useState<RideProvider[]>([]);
  const [error, setError] = useState<MessageKey | null>(null);

  function chooseLanguage(language: Language) {
    try { setLanguage(language); setSelectedLanguage(language); setError(null); }
    catch { setError('languageSaveError'); }
  }

  function next() {
    if (step === 1) {
      if (selectedLanguage) { setStep(2); setError(null); }
      return;
    }
    try { saveProviders(selectedRides); }
    catch { setError('setupSaveError'); }
  }

  return <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
    <View style={{ padding: 24, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
      <Text style={{ fontSize: 20, color: colors.muted }}>{t('setupStep', { step: String(step), total: '2' })}</Text>
      <Text role="heading" style={{ fontSize: 30, fontWeight: '700', color: colors.ink }}>
        {t(step === 1 ? 'chooseLanguage' : 'chooseRides')}
      </Text>
      <Text style={{ fontSize: 21, lineHeight: 30, color: colors.muted }}>
        {t(step === 1 ? 'chooseLanguageHint' : 'chooseRidesHint')}
      </Text>
    </View>
    <ScrollView key={step} style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 12,
      width: '100%', maxWidth: 640, alignSelf: 'center' }}>
      {step === 1 ? <LanguageOptions selected={selectedLanguage} onChoose={chooseLanguage} />
        : <RideOptions selected={selectedRides} onChange={setSelectedRides} />}
    </ScrollView>
    <View style={{ padding: 20, paddingBottom: insets.bottom + 20, gap: 12,
      borderTopWidth: 1, borderTopColor: colors.border }}>
      {error && <Text role="alert" style={{ fontSize: 20, color: colors.error }}>{t(error)}</Text>}
      <View style={{ flexDirection: 'row', gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {step === 2 && <Action label={t('back')} secondary style={{ flex: 1 }} onPress={() => { setStep(1); setError(null); }} />}
        <Action label={t(step === 1 ? 'next' : 'finishSetup')} style={{ flex: 1 }} onPress={next}
          disabled={step === 1 ? selectedLanguage === null : selectedRides.length === 0} />
      </View>
    </View>
  </View>;
}
