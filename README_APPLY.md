# Applying this patch to itrola-ride

This folder contains **updated/new files only** — copy them into your
existing `itrola-ride` project, overwriting the matching files.

## Files to copy

| File in this patch | Replace in your project |
|---|---|
| `src/context/AuthContext.js` | `src/context/AuthContext.js` |
| `src/api/client.js` | `src/api/client.js` |
| `src/screens/LoginScreen.js` | `src/screens/LoginScreen.js` |
| `src/screens/OTPScreen.js` | `src/screens/OTPScreen.js` |
| `src/navigation/RootNavigator.js` | `src/navigation/RootNavigator.js` |
| `src/screens/DriverHomeScreen.js` | **new file** — add to `src/screens/` |

No changes needed to: `HomeScreen.js`, `TripTrackingScreen.js`,
`PaymentScreen.js`, `theme.js`, `PrimaryButton.js`, `BrandAccent.js`,
`LocationInput.js` — all untouched, riders keep working exactly as before.

No new npm packages required — `expo-location` and AsyncStorage are
already dependencies (used by the existing rider `HomeScreen.js` and
`client.js`).

## What changed

- **One login screen, one app.** On `LoginScreen`, a Rider/Driver pill
  switch lets the person pick a role before entering their phone number.
  That role is passed to `OTPScreen` → `verifyOtp(phone, otp, role)` →
  stored in `AuthContext`.
- **`RootNavigator` branches after login**: riders get the existing
  `Home → TripTracking → Payment` stack, drivers get the new
  `DriverHomeScreen` (availability toggle, live location tracking, and
  trip accept/start/complete — mirrors your `TripTrackingScreen`'s status
  card and polling style).
- **`client.js`** gained driver-side functions (`setDriverAvailability`,
  `updateDriverLocation`, `getCurrentDriverTrip`, `startTrip`,
  `completeTrip`) alongside the existing rider ones. Note
  `setDriverAvailability` sends `available` as a **query param**, matching
  your backend's `def set_availability(driver_id, available: bool, ...)`
  signature (not a JSON body field).

## Before testing

1. Apply `BACKEND_PATCH.md` first (adds `user_id` to the OTP response, and
   a `/trips/mine/current` endpoint) — the app won't work without it.
2. A phone number must already be onboarded as a driver
   (`POST /drivers/onboard`) and verified (`status = 'verified'`) before it
   can log in with the "I'm a Driver" option — same as Kwame's account.
3. Run as usual: `npx expo start --clear`.
