import { RideSettings } from '@/components/ride-settings';
import { router } from 'expo-router';

export default function RideSettingsScreen() {
  return <RideSettings onClose={() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }} />;
}
