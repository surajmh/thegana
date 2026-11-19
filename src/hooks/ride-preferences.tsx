import '@/utils/storage';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { normalizeRideProviders, parseRidePreferences, type RidePreferences, type RideProvider } from '@/utils/rideshare';

const storageKey = 'addressbook.ride-preferences.v1';
const RidePreferencesContext = createContext<{
  complete: boolean;
  providers: RideProvider[];
  saveProviders: (providers: RideProvider[]) => void;
} | null>(null);

export function RidePreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<RidePreferences | null>(() => {
    try { return parseRidePreferences(localStorage.getItem(storageKey)); }
    catch { return null; }
  });
  const saveProviders = useCallback((selection: RideProvider[]) => {
    const providers = normalizeRideProviders(selection);
    if (!providers.length) throw new Error('Choose at least one ride app');
    const next: RidePreferences = { version: 1, providers };
    localStorage.setItem(storageKey, JSON.stringify(next));
    setPreferences(next);
  }, []);

  return <RidePreferencesContext.Provider value={{
    complete: preferences !== null, providers: preferences?.providers ?? [], saveProviders,
  }}>{children}</RidePreferencesContext.Provider>;
}

export function useRidePreferences() {
  const context = useContext(RidePreferencesContext);
  if (!context) throw new Error('RidePreferencesProvider is required');
  return context;
}
