import { colors } from '@/theme';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import type { NativeStackNavigationOptions } from 'expo-router/native-stack';
import { LanguageProvider, useLanguage } from '@/i18n/language-provider';

export const unstable_settings = { anchor: 'index' };

export default function Layout() {
  return <LanguageProvider><Navigation /></LanguageProvider>;
}

const popupOptions: NativeStackNavigationOptions = {
  presentation: Platform.OS === 'ios' ? 'formSheet' : 'transparentModal',
  animation: Platform.OS === 'ios' ? 'default' : 'none',
  headerShown: false,
  sheetAllowedDetents: [0.9, 1], sheetGrabberVisible: true, sheetCornerRadius: 24,
  contentStyle: { backgroundColor: Platform.OS === 'ios' ? colors.background : 'transparent' },
};

function Navigation() {
  const { language, t } = useLanguage();
  return <GestureHandlerRootView style={{ flex: 1 }} accessibilityLanguage={language}>
    <StatusBar style="dark" />
    <Stack screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.ink, headerShadowVisible: false,
      headerTitleStyle: { fontSize: 25, fontWeight: '700' },
      contentStyle: { backgroundColor: colors.background },
    }}>
      <Stack.Screen name="index" options={{ title: t('appTitle'), headerRight: () =>
        <Pressable onPress={() => router.push('/language')} accessibilityRole="button"
          accessibilityLabel={t('language')} style={{ minHeight: 48, minWidth: 64, alignItems: 'center', justifyContent: 'center' }}>
          <SymbolView name={{ ios: 'globe', android: 'language', web: 'language' }} size={28} tintColor={colors.ink} />
        </Pressable>,
      }} />
      <Stack.Screen name="add" options={popupOptions} />
      <Stack.Screen name="language" options={popupOptions} />
    </Stack>
  </GestureHandlerRootView>;
}
