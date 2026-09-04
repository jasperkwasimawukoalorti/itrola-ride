# itrola Ride — Rider App (MVP)

React Native (Expo) app for riders. Wired directly to the itrola-ride-backend API contract.

## What's included
- **Auth**: phone + OTP login (`/auth/request-otp`, `/auth/verify-otp`)
- **Home**: get current location, enter pickup/drop-off (geocoded), request a trip (`/trips/request`)
- **Trip tracking**: polls `/trips/{id}` every 4s, shows live status, allows cancel
- **Payment**: MoMo charge via Paystack (`/trips/{id}/pay`), polls for `payment_status: paid`
- Brand theme: forest green / gold / cream, kente-strip accents (`src/theme/theme.js`)

## Integrating into your existing Codespace project
Your `itrola-ride` repo already has `src/api/client.js` — this build replaces it with
the full endpoint set (auth, trips, payments) using the same axios pattern you had.

1. Copy the `src/` folder and `App.js` into your existing project, merging with what's there.
2. Install the new dependencies:
   ```bash
   npx expo install react-native-maps expo-location @react-navigation/native \
     @react-navigation/native-stack react-native-screens react-native-safe-area-context \
     @react-native-async-storage/async-storage axios
   ```
3. Update `API_BASE_URL` in `src/api/client.js` if your ngrok URL has changed since last session.
4. Run `npx expo start` in the Codespace and open with Expo Go, or `npx expo start --tunnel`
   if the Codespace's own URL forwarding doesn't reach your phone.

## Known gaps / next steps
- **LocationInput** uses device geocoding (`expo-location`), not Google Places Autocomplete —
  works but no type-ahead suggestions. Upgrade later with a Places API key.
- **Driver info on trip tracking** currently only shows `driver_id`. Add a `/drivers/{id}` public
  profile endpoint on the backend if you want name/photo/plate shown to the rider.
- **No push notifications yet** — status changes only show while the app is open and polling.
- **Ratings screen** not built yet — backend has `RatingCreate` schema ready for it.
- **itrola Drive (driver app)** not started — next up, once you confirm this rider app looks right.

## Backend contract this was built against
`/auth/request-otp`, `/auth/verify-otp`, `/trips/request`, `/trips/{id}`, `/trips/{id}/cancel`,
`/trips/{id}/pay`, `/webhooks/paystack` — see `TripOut` / `MoMoChargeRequest` schemas in
`itrola-ride-backend/app/schemas/schemas.py`.
