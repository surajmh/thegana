import type { Address } from './records';

export const rideProviders = ['Uber', 'Pathao', 'inDrive', 'Yango', 'Ola', 'Rapido', 'Grab', 'Gojek', 'Careem'] as const;
export type RideProvider = typeof rideProviders[number];

export type RidePreferences = { version: 1; providers: RideProvider[] };

export function normalizeRideProviders(value: unknown): RideProvider[] {
  return Array.isArray(value) ? rideProviders.filter(provider => value.includes(provider)) : [];
}

export function parseRidePreferences(raw: string | null): RidePreferences | null {
  try {
    const data: unknown = JSON.parse(raw ?? 'null');
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('providers' in data)) return null;
    const providers = normalizeRideProviders(data.providers);
    return providers.length ? { version: 1, providers } : null;
  } catch { return null; }
}

export const rideApps: Record<Exclude<RideProvider, 'Uber'>, {
  packageName: string; iosLink?: string; appStore: string; webUrl: string;
}> = {
  Pathao: {
    packageName: 'com.pathao.user',
    iosLink: 'pathao://rides',
    appStore: 'https://apps.apple.com/app/id1201700952',
    webUrl: 'https://pathao.go.link/car',
  },
  inDrive: {
    packageName: 'sinet.startup.inDriver',
    // shortcut: the legacy iOS scheme needs device verification; failure opens its App Store listing.
    iosLink: 'indriver://',
    appStore: 'https://apps.apple.com/app/id780125801',
    webUrl: 'https://indrive.com/',
  },
  Yango: {
    packageName: 'com.yandex.yango',
    iosLink: 'https://yango.go.link/route?ref=addressbook&adj_t=vokme8e_nd9s9z9&lang=en&adj_deeplink_js=1&adj_fallback=https%3A%2F%2Fapps.apple.com%2Fapp%2Fid1437157286',
    appStore: 'https://apps.apple.com/app/id1437157286',
    webUrl: 'https://yango.go.link/route?ref=addressbook&adj_t=vokme8e_nd9s9z9&lang=en&adj_deeplink_js=1&adj_fallback=https%3A%2F%2Fyango.com%2Fen_int%2Forder%2F',
  },
  Ola: {
    packageName: 'com.olacabs.customer', iosLink: 'olacabs://app/launch',
    appStore: 'https://apps.apple.com/app/id539179365', webUrl: 'https://book.olacabs.com/',
  },
  Rapido: {
    packageName: 'com.rapido.passenger',
    appStore: 'https://apps.apple.com/app/id1198464606', webUrl: 'https://www.rapido.bike/',
  },
  Grab: {
    packageName: 'com.grabtaxi.passenger', iosLink: 'grab://open?screenType=MAIN',
    appStore: 'https://apps.apple.com/app/id647268330', webUrl: 'https://www.grab.com/global/download/',
  },
  Gojek: {
    packageName: 'com.gojek.app',
    appStore: 'https://apps.apple.com/app/id944875099', webUrl: 'https://www.gojek.com/',
  },
  Careem: {
    packageName: 'com.careem.acma',
    appStore: 'https://apps.apple.com/app/id592978487', webUrl: 'https://www.careem.com/',
  },
};

export function rideLink(provider: RideProvider, item: Address): string {
  if (provider === 'Uber') return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(item.address)}&dropoff[nickname]=${encodeURIComponent(item.name)}`;
  return rideApps[provider].webUrl;
}

export async function openRide(
  provider: RideProvider,
  item: Address,
  copy: (value: string) => Promise<boolean>,
  open: (url: string) => Promise<unknown>,
  platform = 'web',
  openApplication?: (packageName: string) => void | Promise<void>,
) {
  if (!await copy(item.address)) throw new Error('Clipboard unavailable');
  if (provider === 'Uber' || (platform !== 'android' && platform !== 'ios')) {
    await open(rideLink(provider, item));
    return;
  }

  const app = rideApps[provider];
  if (platform === 'ios') {
    if (app.iosLink) {
      try { await open(app.iosLink); return; }
      catch { /* Fall through to the App Store. */ }
    }
    // shortcut: apps without a verified iOS launch link use the store's Open button.
    await open(app.appStore);
    return;
  }

  try {
    if (!openApplication) throw new Error('App launcher unavailable');
    await openApplication(app.packageName);
  } catch {
    try {
      await open(`market://details?id=${app.packageName}`);
    } catch {
      await open(`https://play.google.com/store/apps/details?id=${app.packageName}`);
    }
  }
}
