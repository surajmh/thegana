import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import type { Address } from './records';
import { openRide, type RideProvider } from './rideshare';

export function openRideApp(provider: RideProvider, item: Address) {
  return openRide(provider, item, Clipboard.setStringAsync, Linking.openURL, Platform.OS,
    async packageName => {
      const { openApplication } = await import('expo-intent-launcher');
      openApplication(packageName);
    });
}
