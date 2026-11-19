import { Alert, Platform } from 'react-native';
import type { Translator } from '@/i18n/messages';

export function confirmDelete(name: string, t: Translator): Promise<boolean> {
  const title = t('deleteTitle');
  const message = t('deleteMessage', { name });
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));

  return new Promise(resolve => {
    Alert.alert(title, message, [
      { text: t('cancel'), style: 'cancel', onPress: () => resolve(false) },
      { text: t('delete'), style: 'destructive', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}
