import type { Address } from './records';

export const rideProviders = ['Uber', 'Pathao', 'inDrive', 'Yango'] as const;
export type RideProvider = typeof rideProviders[number];

export const rideApps = {
  Pathao: {
    packageName: 'com.pathao.user',
    iosLink: 'pathao://rides',
    appStore: 'https://apps.apple.com/app/id1201700952',
  },
  inDrive: {
    packageName: 'sinet.startup.inDriver',
    // shortcut: the legacy iOS scheme needs device verification; failure opens its App Store listing.
    iosLink: 'indriver://',
    appStore: 'https://apps.apple.com/app/id780125801',
  },
  Yango: {
    packageName: 'com.yandex.yango',
    iosLink: 'https://yango.go.link/route?ref=addressbook&adj_t=vokme8e_nd9s9z9&lang=en&adj_deeplink_js=1&adj_fallback=https%3A%2F%2Fapps.apple.com%2Fapp%2Fid1437157286',
    appStore: 'https://apps.apple.com/app/id1437157286',
  },
} as const;

export function rideLink(provider: RideProvider, item: Address): string {
  switch (provider) {
    case 'Uber':
      return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(item.address)}&dropoff[nickname]=${encodeURIComponent(item.name)}`;
    case 'Pathao':
      return 'https://pathao.go.link/car';
    case 'inDrive':
      return 'https://indrive.com/';
    case 'Yango':
      return 'https://yango.go.link/route?ref=addressbook&adj_t=vokme8e_nd9s9z9&lang=en&adj_deeplink_js=1&adj_fallback=https%3A%2F%2Fyango.com%2Fen_int%2Forder%2F';
  }
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
    try {
      await open(app.iosLink);
    } catch {
      await open(app.appStore);
    }
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
