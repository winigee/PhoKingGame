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
