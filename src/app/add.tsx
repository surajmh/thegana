import { AddressForm } from '@/components/address-form';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

export default function AddressEditor() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);

  return <AddressForm key={Array.isArray(id) ? 'invalid' : id ?? 'new'} addressId={id} onClose={close} />;
}
