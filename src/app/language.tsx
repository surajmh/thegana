import { LanguagePicker } from '@/components/language-picker';
import { router } from 'expo-router';

export default function LanguageScreen() {
  return <LanguagePicker onClose={() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }} />;
}
