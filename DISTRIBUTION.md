# Getting Pho King Life onto an iPhone

Two paths, depending on what you need. Both require a free Expo account
(https://expo.dev/signup); the repo is already configured (`eas.json`,
bundle identifier `com.phoking.life`).

## Option A — Publish to Expo Go (free, ~5 minutes, no Apple account)

Runs the game inside the Expo Go app without your computer being on.

```bash
npm install -g eas-cli
eas login                  # your free Expo account
eas init                   # links the project, writes the projectId
eas update:configure       # one-time update setup
eas update --branch preview --message "First playable"
```

Then on the iPhone: install **Expo Go**, sign in with the same Expo
account, and the game appears under **Projects**. Updates you publish
later load automatically.

Limits: it lives inside Expo Go (no own home-screen icon), and the
publisher's account is needed on the phone.

## Option C — Android APK for a Galaxy (or any Android) phone

No Apple account, no Google account, no fees. The `preview` profile is
configured to produce an installable APK.

```bash
eas build --platform android --profile preview
```

When the cloud build finishes (~10–15 min) you get a download link/QR.
Open it on the phone, allow "install from unknown sources" when prompted,
and the game installs like a normal app with its own icon.

Fully offline alternative (no Expo account either) with Android Studio
installed locally:

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# APK lands in android/app/build/outputs/apk/release/
```

## Option D — iOS Simulator on a Mac (free)

Install Xcode from the Mac App Store (free, no developer account), then:

```bash
npm install
npx expo start
# press "i" — Expo installs and launches the app in the iOS Simulator
```

Or build a standalone simulator app: `eas build --platform ios --profile
preview` produces a .app you drag onto a running simulator.

## Option E — Your own iPhone with a free Apple ID (7-day builds)

A Mac + cable + free Apple ID (no $99 membership): connect the iPhone,
then `npx expo run:ios --device` and pick your personal team when Xcode
asks about signing. The app installs natively but Apple expires the
signature after 7 days, after which you re-run the command.

## Option B — TestFlight (a real installable app)

Needs an Apple Developer Program membership (US$99/year).

```bash
npm install -g eas-cli
eas login
eas init
eas build --platform ios --profile production   # EAS signs everything for you
eas submit --platform ios                       # pushes to App Store Connect
```

Then add yourself as a TestFlight tester in App Store Connect and install
the **TestFlight** app on the iPhone. You get a proper app icon, and can
invite up to 10,000 testers.

Notes:
- `eas build` runs in Expo's cloud — no Mac or Xcode required.
- First build asks you to log in with your Apple ID and creates the
  signing certificates automatically; say yes to everything.
- Subsequent releases: `eas build … && eas submit …` again, or use
  `eas update` for JS-only changes.

## Option F — Run in a browser (no Xcode, no accounts)

Web support is wired in (react-native-web; saves fall back to
localStorage since expo-sqlite is native-only):

```bash
npm install
npm run web    # opens http://localhost:8081 in your default browser
```

Works in Chrome/Safari/Edge. Best played with the window narrowed to a
phone-ish shape. Dev-server only — for a hosted version, `npx expo export
--platform web` emits a static site you can put anywhere.
