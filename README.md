# मेरो ठेगाना · Address book

An Expo address book for older users and multilingual communities. Save a place once, then recognize its photo and name and tap the row to copy the full address for Uber, Pathao, inDrive, or Yango.

## First launch

The first launch has two steps: choose one language from flag-and-language rows, then select one or more ride apps using checkboxes. Uber, Pathao, inDrive, and Yango appear first, followed by Ola, Rapido, Grab, Gojek, and Careem. Continue requires a language; Get started requires at least one ride app. Back preserves the choices made in the current session.

Completing setup saves ride preferences separately under `addressbook.ride-preferences.v1`; subsequent launches go straight to the address list. Existing address books are preserved when this setup first appears after an upgrade. Only selected ride apps appear when tapping an address. Use **Change ride apps** in that popup to change the selection later. The language picker remains in the list header and also displays flags.

## Languages

The interface supports Nepali, English, Hindi, Spanish, Vietnamese, Khmer (Cambodia), Urdu, Bengali, Tamil, Sinhala, and Punjabi. Tap the globe and language name in the list header to choose a language, or use the phone's language. The app uses the first supported device language, falling back to English. Urdu uses right-to-left content, text alignment, and native input direction; switching back restores left-to-right layout without restarting. Previously saved unsupported language choices fall back to the phone language or English. An explicit choice is saved separately from addresses and survives restarts.

Names, addresses, photos, and rideshare brand names are kept exactly as entered. Switching interface languages does not translate or rewrite saved content. Interface text, validation, errors, accessibility labels, and both deletion confirmations share the typed catalog in `src/i18n/messages.ts`. Add and edit continue to use the same form and popup.

Native app names and iOS camera/photo permission descriptions are configured for all supported languages in `assets/locales/`. Native system text follows the device/per-app system language and requires a new development/production build; Expo Go uses its own system prompts. The in-app picker works in SDK 58 Expo Go after reloading. Every catalog must supply every message key and preserve interpolation placeholders; `npm test` checks these and the native locale resources.

## Run

```sh
npm install
npm start
```

Scan the QR code with an Expo Go version that supports SDK 58. Press `a` for Android or `i` for iOS when a simulator is available. `npm run web` opens a browser preview.

## Use

1. Tap **ठेगाना थप्नुहोस्** to slide up the new-address popup. Swipe down from the handle or use the close icon at the top right to return to the list without saving.
2. Optionally take a photo with Camera or choose one from Gallery, then enter a place name and the full address in any language.
3. Save. Tap the saved row to copy the actual address.
4. A popup shows the logos and names of your selected ride apps. Choose a service. The address is copied again before opening it; paste it into the destination field if needed. Swipe down, tap outside, or tap Close to dismiss the popup.

Uber receives the destination text through its existing universal link (confirm the destination in Uber). On Android, Pathao, inDrive, and Yango open directly by package name; if launching fails, their Play Store listing opens, with a browser listing as a fallback when Play Store is unavailable. On iOS, Pathao and inDrive try their app schemes before falling back to their App Store listings; Yango uses its official universal link with an App Store fallback. inDrive's legacy iOS scheme still needs device verification. Paste the copied address in these three apps. No ride is booked automatically. Web previews retain the provider website/universal-link flow.

Android uses `expo-intent-launcher` and a config plugin declaring visibility of supported ride apps. Rebuild the development/production app after this change so both the native module and manifest queries are included; Expo Go does not use this project's manifest queries.

Ola, Rapido, Grab, Gojek, and Careem use the same Android installed-app launch and Play Store fallback. Ola and Grab have verified iOS launch links. Rapido, Gojek, and Careem open their App Store listing on iOS, where an installed app can be opened using Open; a public iOS launch URI has not been verified for these three. Their web previews open the official provider websites. Service availability depends on region.

The Android visibility plugin now declares all eight non-Uber packages. Rebuild to include new package declarations; Expo Go may use the store fallback even for an installed app. Uber's working destination link is unchanged.

Additional provider references: [Ola deep links](https://developers.olacabs.com/docs/deep-linking), [Rapido](https://www.rapido.bike/), [Grab](https://www.grab.com/global/download/), [Gojek](https://www.gojek.com/), [Careem](https://www.careem.com/).

Link references: [Uber deep links](https://developer.uber.com/docs/riders/ride-requests/tutorials/deep-links/introduction), [Pathao car link](https://pathao.go.link/car), [inDrive](https://indrive.com/), [Yango integration](https://yango.com/en_int/partner-program/documentation/).

Swipe an address row to the right to reveal the trash button. Tap **हटाउनुहोस्** to show the same confirmation as the edit popup; the address is only removed after confirming. Screen readers also expose this confirmed delete action on the row.

Tap and hold an address to edit it in the same popup, with its name, address, and photo filled in. Save updates the existing entry; close or swipe down to cancel. Screen readers also expose an edit action. Add and edit share `AddressForm` and `FormPopup`.

Edit mode has Save and a red **हटाउनुहोस्** button side by side in a fixed footer below the scrolling fields. Delete asks for confirmation naming the saved place. Cancel keeps the form and any unsaved edits; confirming returns to the list. Add mode shows only Save in the same footer.

Black text and buttons, white surfaces, and a small grayscale palette keep the interface clear. Photos and official rideshare logos retain their colors for recognition. Large touch targets, scalable text, translated instructions, and a copy confirmation make the main task easy to follow. Addresses are stored locally using Expo SQLite's localStorage implementation. Photos are copied into the app's documents directory; web previews store image data in browser storage. Failed saves preserve the form. Failed reads block new entries to protect existing data.

Saved data stays on this device. Opening Uber passes the selected name and address in its destination link. Uninstalling the app or clearing storage removes saved addresses. There is no account or cloud backup. Use a keyboard for your preferred language; the app does not translate or geocode saved addresses.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npx expo-doctor
```

Device checks: add entries with and without photos, restart the app, tap a row, and paste into another app. Try all four services with and without their apps installed, verify the destination (including Nepali text), and return to copy a different address. Check large system text and the keyboard on the add screen. Native clipboard, provider handoff, and photo persistence need a phone or simulator for final verification.
