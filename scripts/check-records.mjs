import assert from 'node:assert/strict';
import { parseAddresses, removeAddress, updateAddress, validateAddress } from '../src/utils/records.ts';
import { normalizeRideProviders, openRide, parseRidePreferences, rideApps, rideLink, rideProviders } from '../src/utils/rideshare.ts';
import { isLanguage, languageDirection, languages, messages, resolveLanguage, translate } from '../src/i18n/messages.ts';
import fs from 'node:fs';

const record = { id: '1', name: 'घर', address: '123 Main Street, Kathmandu' };
assert.deepEqual(parseAddresses(null), []);
assert.deepEqual(parseAddresses(JSON.stringify([record])), [record]);
assert.deepEqual(parseAddresses(JSON.stringify([{ ...record, image: 'file:///photo.jpg' }])),
  [{ ...record, image: 'file:///photo.jpg' }]);
assert.throws(() => parseAddresses('{bad json'));
assert.throws(() => parseAddresses('[{"id":1}]'));
assert.throws(() => parseAddresses('{}'));
assert.ok(validateAddress('  ', record.address));
assert.ok(validateAddress('घर', '\n  '));
assert.equal(validateAddress('घर', record.address), null);
assert.equal(validateAddress('', record.address), 'nameRequired');
assert.equal(validateAddress(record.name, ''), 'addressRequired');
const other = { ...record, id: '2', name: 'पसल' };
const original = { ...record, image: 'file:///original.jpg' };
const changed = { ...original, name: 'नयाँ नाम', address: 'Updated address' };
const edited = updateAddress([original, other], changed);
assert.deepEqual(edited, [changed, other]);
assert.equal(edited.length, 2);
assert.equal(edited[0].id, original.id);
assert.equal(edited[0].image, original.image);
assert.equal(edited[1], other);
assert.equal(original.name, record.name);
assert.equal(updateAddress([original], { ...changed, image: undefined })[0].image, undefined);
assert.equal(updateAddress([original], { ...changed, image: 'file:///replacement.jpg' })[0].image, 'file:///replacement.jpg');
assert.throws(() => updateAddress([other], changed), /no longer exists/);
assert.throws(() => updateAddress([], changed), /no longer exists/);
assert.deepEqual(removeAddress([original, other], original.id), [other]);
assert.deepEqual(removeAddress([original, other], other.id), [original]);
assert.deepEqual(removeAddress([original, other], 'missing'), [original, other]);
assert.deepEqual(removeAddress([original], original.id), []);
assert.deepEqual(removeAddress([], original.id), []);
console.log('Address validation and saved-record checks passed.');

const destination = { ...record, name: 'घर & Home', address: 'काठमाडौं, A&B #2? घर' };
const uber = new URL(rideLink('Uber', destination));
assert.equal(uber.searchParams.get('dropoff[formatted_address]'), destination.address);
assert.equal(uber.searchParams.get('dropoff[nickname]'), destination.name);
assert.equal(uber.searchParams.get('pickup'), 'my_location');
for (const provider of rideProviders) {
  assert.equal(new URL(rideLink(provider, destination)).protocol, 'https:');
  const calls = [];
  await openRide(provider, destination,
    async value => { calls.push(['copy', value]); return true; },
    async url => { calls.push(['open', url]); });
  assert.deepEqual(calls, [['copy', destination.address], ['open', rideLink(provider, destination)]]);
}
assert.equal(new URL(rideLink('Pathao', destination)).hostname, 'pathao.go.link');
assert.equal(new URL(rideLink('inDrive', destination)).hostname, 'indrive.com');
const yango = new URL(rideLink('Yango', destination));
assert.equal(yango.hostname, 'yango.go.link');
assert.equal(yango.searchParams.get('adj_fallback'), 'https://yango.com/en_int/order/');
await assert.rejects(openRide('Uber', destination, async () => false,
  async () => assert.fail('Must not launch when copying fails')));
await assert.rejects(openRide('Uber', destination, async () => { throw new Error('copy'); },
  async () => assert.fail('Must not launch when copying throws')));
await assert.rejects(openRide('Uber', destination, async () => true,
  async () => { throw new Error('link unavailable'); }));
console.log('Rideshare links, clipboard ordering, and failure checks passed.');

for (const [provider, app] of Object.entries(rideApps)) {
  const calls = [];
  await openRide(provider, destination,
    async value => { calls.push(['copy', value]); return true; },
    async () => assert.fail('Installed Android app must not open a URL'),
    'android', packageName => { calls.push(['app', packageName]); });
  assert.deepEqual(calls, [['copy', destination.address], ['app', app.packageName]]);

  const storeCalls = [];
  await openRide(provider, destination, async () => true,
    async url => { storeCalls.push(url); },
    'android', () => { throw new Error('Not installed'); });
  assert.deepEqual(storeCalls, [`market://details?id=${app.packageName}`]);

  const browserCalls = [];
  await openRide(provider, destination, async () => true,
    async url => {
      browserCalls.push(url);
      if (url.startsWith('market:')) throw new Error('No Play Store');
    }, 'android', () => { throw new Error('Not installed'); });
  assert.deepEqual(browserCalls, [
    `market://details?id=${app.packageName}`,
    `https://play.google.com/store/apps/details?id=${app.packageName}`,
  ]);

  const iosCalls = [];
  await openRide(provider, destination, async () => true,
    async url => { iosCalls.push(url); }, 'ios');
  assert.deepEqual(iosCalls, [app.iosLink ?? app.appStore]);

  const iosFallbackCalls = [];
  await openRide(provider, destination, async () => true,
    async url => {
      iosFallbackCalls.push(url);
      if (app.iosLink && url === app.iosLink) throw new Error('App link unavailable');
    }, 'ios');
  assert.deepEqual(iosFallbackCalls, app.iosLink ? [app.iosLink, app.appStore] : [app.appStore]);
  await assert.rejects(openRide(provider, destination, async () => true,
    async () => { throw new Error('Store unavailable'); }, 'ios'));
}
for (const platform of ['android', 'ios']) {
  const calls = [];
  await openRide('Uber', destination, async () => true,
    async url => { calls.push(url); }, platform,
    () => assert.fail('Uber must keep its destination link'));
  assert.deepEqual(calls, [rideLink('Uber', destination)]);
  await assert.rejects(openRide('Pathao', destination, async () => false,
    async () => assert.fail('Must not open a store when copy fails'), platform,
    () => assert.fail('Must not launch an app when copy fails')));
  await assert.rejects(openRide('inDrive', destination, async () => true,
    async () => { throw new Error('Cannot open store'); }, platform,
    () => { throw new Error('Not installed'); }));
}
console.log('Installed-app launch and Android/iOS store fallback checks passed.');

const keys = Object.keys(messages.en).sort();
const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
assert.deepEqual(languages.map(({ code }) => code), ['ne', 'en', 'hi', 'es', 'vi', 'km', 'ur', 'bn', 'ta', 'si', 'pa']);
const nativeConfig = JSON.parse(fs.readFileSync(new URL('../app.json', import.meta.url), 'utf8')).expo;
for (const { code } of languages) {
  assert.ok(isLanguage(code));
  assert.equal(resolveLanguage([`${code.toUpperCase()}-XX`]), code);
  assert.deepEqual(Object.keys(messages[code]).sort(), keys);
  for (const key of keys) {
    assert.ok(messages[code][key].trim(), `${code}.${key} must not be empty`);
    assert.deepEqual(placeholders(messages[code][key]), placeholders(messages.en[key]), `${code}.${key} placeholders`);
    const translated = translate(code, key, { name: 'घर & 東京', provider: 'Uber', step: '1', total: '2' });
    assert.ok(!/\{(name|provider|step|total)\}/.test(translated), `${code}.${key} must interpolate values`);
  }
  const native = JSON.parse(fs.readFileSync(new URL(`../assets/locales/${code}.json`, import.meta.url), 'utf8'));
  assert.equal(native.android.app_name, messages[code].appTitle);
  assert.equal(native.ios.NSCameraUsageDescription, messages[code].nativeCamera);
  assert.equal(native.ios.NSPhotoLibraryUsageDescription, messages[code].nativePhotos);
  assert.ok(nativeConfig.locales[code]);
}
assert.equal(isLanguage('xx'), false);
assert.equal(isLanguage(null), false);
assert.equal(resolveLanguage(['de-DE', 'vi-VN', 'km-KH']), 'vi');
assert.equal(resolveLanguage(['fr-CA', 'ja-JP']), 'en');
assert.equal(isLanguage('ru'), false);
assert.equal(languageDirection('ur'), 'rtl');
for (const { code } of languages.filter(({ code }) => code !== 'ur')) assert.equal(languageDirection(code), 'ltr');
assert.deepEqual(nativeConfig.plugins.find(plugin => plugin[0] === 'expo-localization')[1], {
  supportedLocales: languages.map(({ code }) => code), supportsRTL: true,
});
assert.equal(resolveLanguage(['NE_np']), 'ne');
assert.equal(resolveLanguage([null, 'de-DE']), 'en');
assert.equal(resolveLanguage([]), 'en');
assert.equal(translate('unknown', 'save'), messages.en.save);
assert.equal(translate('en', 'deleteMessage', { name: 'घर {provider} $&' }), '“घर {provider} $&” cannot be recovered after deleting.');
console.log('All translation catalogs, locale matching, interpolation, fallback, and native locale resources passed.');

assert.deepEqual(rideProviders.slice(0, 4), ['Uber', 'Pathao', 'inDrive', 'Yango']);
assert.deepEqual(rideProviders.slice(4), ['Ola', 'Rapido', 'Grab', 'Gojek', 'Careem']);
assert.deepEqual(normalizeRideProviders(['Careem', 'Uber', 'Careem', 'unknown', null]), ['Uber', 'Careem']);
assert.deepEqual(normalizeRideProviders('Uber'), []);
for (const raw of [null, '{bad', '[]', '{}', '{"version":2,"providers":["Uber"]}', '{"version":1,"providers":[]}', '{"version":1,"providers":["unknown"]}']) {
  assert.equal(parseRidePreferences(raw), null);
}
const storedPreferences = { version: 1, providers: ['Uber', 'Pathao', 'Rapido'] };
assert.deepEqual(parseRidePreferences(JSON.stringify(storedPreferences)), storedPreferences);
assert.deepEqual(parseRidePreferences('{"version":1,"providers":["Rapido","Uber","Uber","removed"]}'),
  { version: 1, providers: ['Uber', 'Rapido'] });
for (const provider of rideProviders) {
  assert.ok(fs.statSync(new URL(`../assets/images/rideshare/${provider.toLowerCase()}.jpg`, import.meta.url)).size > 0);
}
for (const language of languages) assert.match(language.flag, /^\p{Regional_Indicator}{2}$/u);
console.log('Onboarding completion, saved selection validation, provider order, logos, and language flags passed.');
