import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/localized-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/language-provider';
import { useRidePreferences } from '@/hooks/ride-preferences';
import { colors } from '@/theme';
import { Action } from './action';
import { FormPopup } from './form-popup';
import { PopupHeader } from './popup-header';
import { RideOptions } from './ride-options';

export function RideSettings({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { providers, saveProviders } = useRidePreferences();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(providers);
  const [error, setError] = useState(false);

  function save() {
    try { saveProviders(selected); onClose(); }
    catch { setError(true); }
  }

  return <FormPopup onClose={onClose}><View style={{ flex: 1 }}>
    <PopupHeader title={t('rideApps')} onClose={onClose} />
    <ScrollView style={{ flex: 1 }} nestedScrollEnabled contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 21, lineHeight: 30, color: colors.muted }}>{t('chooseRidesHint')}</Text>
      <RideOptions selected={selected} onChange={setSelected} />
      {error && <Text role="alert" style={{ fontSize: 20, color: colors.error }}>{t('setupSaveError')}</Text>}
    </ScrollView>
    <View style={{ padding: 20, paddingBottom: insets.bottom + 20, borderTopWidth: 1, borderTopColor: colors.border }}>
      <Action label={t('save')} disabled={selected.length === 0} onPress={save} />
    </View>
  </View></FormPopup>;
}
