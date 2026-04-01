# Macro Tracker - Build TODO

## Phase 0: Stabilize Environment
- [x] Confirm app starts clean with `npx expo start -c` in `macro/`.
- [x] Keep project on an Expo SDK version compatible with Expo Go.
- [x] Ensure `.env` is ignored by git and never committed.

## Phase 1: Backend Connection (Supabase)
- [x] Create a free Supabase project.
- [x] Run `supabase/schema.sql` in the Supabase SQL Editor.
- [x] Copy `.env.example` to `.env`.
- [x] Add Supabase keys to `.env`:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [x] In `stores/diaryStore.ts`, switch from mock data to real data (uncomment the target line).
- [x] Smoke test: add/read a meal and verify data persists after refresh.

## Phase 2: Auth Screens
- [x] Build Sign In screen (email, password, loading, error states).
- [x] Build Sign Up screen (email, password, confirm password).
- [x] Wire both screens to `stores/authStore.ts`.
- [x] Add logged-out route guard and logged-in redirect flow.
- [x] Add sign-out path.
- [ ] Test full auth cycle: sign up, sign in, sign out.

## Phase 3: Edit Meal Screen
- [ ] Replace Confirm Meal "Edit details" alert placeholder with a real form.
- [ ] Add fields: quantity, meal type selector, serving size.
- [ ] Pre-fill fields from selected meal.
- [ ] Validate input and save updates to store/backend.
- [ ] Verify edited values update diary list and totals.

## Phase 4: Voice Logging (Real)
- [x] Add OpenAI API key to `.env` (do not commit).
- [x] Connect mic button to real `expo-av` recording flow.
- [x] Send recorded audio to Whisper transcription using `lib/api/foods.ts`.
- [x] Parse transcript into meal suggestions in the existing flow.
- [x] Add error handling UX (permissions, network, parse failures).
- [ ] Test voice flow end-to-end on a physical device.

## Phase 5: Barcode Scanning
- [ ] Build scanner screen (camera permission + scan UI).
- [ ] Wire scan result to existing food lookup/types.
- [ ] Handle fallback states (unknown barcode, retry, manual entry).
- [ ] Add scanner entry point to meal logging flow.
- [ ] Test with multiple real products.

## Phase 6: App Store Prep
- [ ] Add final assets under `assets/images/` (icon, splash, adaptive icon, favicon if needed).
- [ ] Re-enable/update image references in `app.json` as needed.
- [ ] Verify production bundle/package identifiers.
- [ ] Run `npx eas build --platform ios`.
- [ ] Install/test the build and run final QA.

## Suggested Sequence
- [ ] Week 1: Phase 1 + Phase 2
- [ ] Week 2: Phase 3 + Phase 4
- [ ] Week 3: Phase 5 + Phase 6

