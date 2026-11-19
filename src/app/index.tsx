import { colors } from '@/theme';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Text } from '@/components/localized-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Action } from '@/components/action';
import { AddressRow } from '@/components/address-row';
import { RideshareSheet } from '@/components/rideshare-sheet';
import { loadAddresses, saveAddresses } from '@/utils/storage';
import type { Address } from '@/utils/records';
import { removeAddress } from '@/utils/records';
import type { RideProvider } from '@/utils/rideshare';
import { openRideApp } from '@/utils/open-ride';
import { confirmDelete } from '@/utils/confirm-delete';
import { useLanguage } from '@/i18n/language-provider';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [rideError, setRideError] = useState<RideProvider | null>(null);
  const [openingRide, setOpeningRide] = useState(false);
  const [rideAddress, setRideAddress] = useState<Address | null>(null);
  const rideBusy = useRef(false);
  const copyBusy = useRef(false);
  const deleteBusy = useRef(false);

  const load = useCallback(() => {
    try { setAddresses(loadAddresses()); setError(false); }
    catch { setError(true); }
    finally { setLoading(false); }
    setCopied(null);
    setRideAddress(null);
    setRideError(null);
  }, []);
  useFocusEffect(load);

  async function copy(item: Address) {
    if (copyBusy.current) return;
    copyBusy.current = true;
    try {
      const success = await Clipboard.setStringAsync(item.address);
      if (!success) throw new Error('Clipboard unavailable');
      setCopied(item.id); setCopyError(false);
      setRideError(null);
      setRideAddress(item);
    } catch { setCopyError(true); setCopied(null); }
    finally { copyBusy.current = false; }
  }

  async function ride(provider: RideProvider, item: Address) {
    if (rideBusy.current) return;
    rideBusy.current = true;
    setOpeningRide(true);
    setRideError(null);
    try {
      await openRideApp(provider, item);
      setRideAddress(null);
    } catch {
      setRideError(provider);
    } finally {
      rideBusy.current = false;
      setOpeningRide(false);
    }
  }

  async function remove(item: Address) {
    if (deleteBusy.current) return;
    deleteBusy.current = true;
    try {
      if (!await confirmDelete(item.name, t)) return;
      const remaining = removeAddress(loadAddresses(), item.id);
      saveAddresses(remaining);
      setAddresses(remaining);
      if (copied === item.id) setCopied(null);
      if (rideAddress?.id === item.id) setRideAddress(null);
      setDeleteError(false);
    } catch { setDeleteError(true); }
    finally { deleteBusy.current = false; }
  }

  return <View style={{ flex: 1 }}>
    <FlatList data={error ? [] : addresses} keyExtractor={item => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 14, flexGrow: 1 }}
      ListHeaderComponent={<View style={{ gap: 10, paddingBottom: 12 }}>
        {!loading && !error && addresses.length > 0 && <Text style={{ fontSize: 19, lineHeight: 30, color: colors.muted }}>{t('tapToCopy')}</Text>}
        {copyError && <Text role="alert" style={{ fontSize: 20, color: colors.error }}>{t('copyFailed')}</Text>}
        {deleteError && <Text role="alert" style={{ fontSize: 20, color: colors.error }}>{t('deleteFailed')}</Text>}
      </View>}
      ListEmptyComponent={<View style={{ gap: 18, paddingVertical: 32 }}>
        {loading ? <ActivityIndicator size="large" color={colors.primary} /> : error ? <>
          <Text role="alert" style={{ fontSize: 22, lineHeight: 34 }}>{t('loadFailed')}</Text>
          <Action label={t('retry')} onPress={load} />
        </> : <>
          <Text style={{ fontSize: 23, color: colors.muted }}>{t('empty')}</Text>
        </>}
      </View>}
      renderItem={({ item }) => <AddressRow item={item} copied={copied === item.id}
        onEdit={() => router.push({ pathname: '/add', params: { id: item.id } })}
        onCopy={() => copy(item)} onDelete={() => remove(item)} />}
    />
    <View style={{ padding: 20, paddingBottom: insets.bottom + 20, borderTopWidth: 1, borderTopColor: colors.border }}>
      <Action label={`＋ ${t('addAddress')}`} disabled={loading || error} onPress={() => router.push('/add')} />
    </View>
    <RideshareSheet visible={rideAddress !== null} busy={openingRide} error={rideError ? t('rideFailed', { provider: rideError }) : null}
      onDismiss={() => setRideAddress(null)}
      onManage={() => { setRideAddress(null); router.push('/rideshares'); }}
      onChoose={provider => { if (rideAddress) void ride(provider, rideAddress); }} />
  </View>;
}
