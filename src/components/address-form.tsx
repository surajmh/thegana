import { colors } from '@/theme';
import { Host, TextInput } from '@expo/ui';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Action } from '@/components/action';
import { FormPopup } from '@/components/form-popup';
import { loadAddresses, saveAddresses } from '@/utils/storage';
import { removeAddress, updateAddress, validateAddress, type Address } from '@/utils/records';
import { confirmDelete } from '@/utils/confirm-delete';
import { useLanguage } from '@/i18n/language-provider';
import type { MessageKey } from '@/i18n/messages';
import { PopupHeader } from '@/components/popup-header';
import { keepPhoto } from '@/utils/photo';

export function AddressForm({ addressId, onClose }: {
  addressId?: string | string[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const editing = addressId !== undefined;
  const [initial] = useState<{ item?: Address; error?: MessageKey }>(() => {
    if (!editing) return {};
    try {
      const item = typeof addressId === 'string'
        ? loadAddresses().find(item => item.id === addressId) : undefined;
      return item ? { item } : { error: 'addressMissing' };
    } catch {
      return { error: 'editLoadFailed' };
    }
  });
  const [name, setName] = useState(initial.item?.name ?? '');
  const [address, setAddress] = useState(initial.item?.address ?? '');
  const [imageUri, setImageUri] = useState(initial.item?.image);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset>();
  const [error, setError] = useState<MessageKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [pickingPhoto, setPickingPhoto] = useState(false);
  const busy = useRef(false);
  const pickerBusy = useRef(false);

  const close = useCallback(() => {
    if (busy.current || pickerBusy.current) return;
    onClose();
  }, [onClose]);

  async function pickPhoto(source: 'camera' | 'gallery') {
    if (pickerBusy.current) return;
    pickerBusy.current = true;
    setPickingPhoto(true);
    setShowPhotoOptions(false);
    setError(null);
    try {
      if (source === 'camera' && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError(permission.canAskAgain
            ? 'cameraPermission'
            : 'cameraSettings');
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5,
        base64: Platform.OS === 'web',
      };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled) {
        setPhoto(result.assets[0]);
        setImageUri(result.assets[0].uri);
      }
    } catch { setError('photoFailed'); }
    finally { pickerBusy.current = false; setPickingPhoto(false); }
  }

  async function save() {
    if (busy.current || initial.error) return;
    const validation = validateAddress(name, address);
    if (validation) { setError(validation); return; }
    busy.current = true; setSaving(true); setError(null);
    try {
      const records = loadAddresses();
      const newId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const id = initial.item?.id ?? newId;
      // A replacement photo must not overwrite the old file before the record is saved.
      const image = photo ? keepPhoto(photo, editing ? `${id}-${newId}` : id) : imageUri;
      const item = { id, name: name.trim(), address: address.trim(), image };
      saveAddresses(editing ? updateAddress(records, item) : [...records, item]);
      onClose();
    } catch { setError('saveFailed'); }
    finally { busy.current = false; setSaving(false); }
  }

  async function remove() {
    if (busy.current || pickerBusy.current || !initial.item) return;
    busy.current = true;
    setError(null);
    try {
      if (!await confirmDelete(initial.item.name, t)) return;
      setDeleting(true);
      saveAddresses(removeAddress(loadAddresses(), initial.item.id));
      onClose();
    } catch {
      setError('deleteFailed');
    } finally {
      busy.current = false;
      setDeleting(false);
    }
  }

  return <FormPopup onClose={close}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <PopupHeader title={t(editing ? 'editAddress' : 'newAddress')} onClose={close}
      disabled={saving || deleting || pickingPhoto} />
    <ScrollView style={{ flex: 1 }} nestedScrollEnabled contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 24, gap: 24, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
      {initial.error ? <Text role="alert" style={{ fontSize: 21, lineHeight: 32, color: colors.error }}>{t(initial.error)}</Text> : <>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '600', color: colors.ink }}>{t('photoOptional')}</Text>
        {imageUri && <Image source={imageUri} style={{ width: 128, height: 128, borderRadius: 20 }} />}
        {showPhotoOptions ? <View style={{ gap: 12 }}>
          <Action label={t('takePhoto')} secondary onPress={() => pickPhoto('camera')} disabled={saving || pickingPhoto} />
          <Action label={t('chooseGallery')} secondary onPress={() => pickPhoto('gallery')} disabled={saving || pickingPhoto} />
          <Action label={t('cancel')} secondary onPress={() => setShowPhotoOptions(false)} />
        </View> : <Action label={t(imageUri ? 'changePhoto' : 'choosePhoto')} secondary
          onPress={() => setShowPhotoOptions(true)} disabled={saving || pickingPhoto} />}
        {imageUri && <Action label={t('removePhoto')} secondary
          onPress={() => { setPhoto(undefined); setImageUri(undefined); }} disabled={saving || pickingPhoto} />}
      </View>
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: '600', color: colors.ink }}>{t('placeName')}</Text>
        <Host matchContents={{ vertical: true }} colorScheme="light" style={{ width: '100%' }}>
          <TextInput defaultValue={initial.item?.name ?? ''} onChangeText={setName} placeholder={t('namePlaceholder')} editable={!saving}
            maxLength={120} testID="address-name"
            style={{ width: '100%', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.surface }}
            textStyle={{ fontSize: 23, color: colors.ink }} />
        </Host>
      </View>
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: '600', color: colors.ink }}>{t('fullAddress')}</Text>
        <Host matchContents={{ vertical: true }} colorScheme="light" style={{ width: '100%' }}>
          <TextInput defaultValue={initial.item?.address ?? ''} onChangeText={setAddress} placeholder={t('addressPlaceholder')} editable={!saving}
            multiline numberOfLines={4} maxLength={2000} testID="actual-address"
            style={{ width: '100%', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.surface }}
            textStyle={{ fontSize: 22, color: colors.ink }} />
        </Host>
      </View>
      {error && <Text role="alert" selectable style={{ fontSize: 21, lineHeight: 32, color: colors.error }}>{t(error)}</Text>}
      </>}
    </ScrollView>
    {!initial.error && <View style={{ paddingTop: 16, paddingHorizontal: 24, paddingBottom: insets.bottom + 16,
      borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <Action label={t(saving ? 'saving' : 'save')} style={{ flex: 1 }}
          onPress={save} disabled={saving || deleting || pickingPhoto} />
        {initial.item && <Action label={t(deleting ? 'deleting' : 'delete')} destructive style={{ flex: 1 }}
          onPress={remove} disabled={saving || deleting || pickingPhoto} />}
      </View>
    </View>}
    </KeyboardAvoidingView>
  </FormPopup>;
}
