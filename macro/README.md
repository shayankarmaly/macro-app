# Macro Tracker 🥗

A fully-functional iOS macro tracking app built with **Expo + React Native**, featuring your Figma UI.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Expo SDK 51 + Expo Router | File-based routing, easy App Store builds |
| UI Styling | NativeWind v4 (Tailwind) | Fast to build, matches Figma tokens |
| State | Zustand | Lightweight, no boilerplate |
| Backend | Supabase | Auth + PostgreSQL + real-time, no server needed |
| Food DB | Open Food Facts API | Free, 3M+ foods, no key needed |
| Voice | expo-av + OpenAI Whisper | Record → transcribe → parse → log |
| Data Fetching | TanStack Query | Caching, background refresh |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
# or
npx expo install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Fill in your Supabase URL + anon key (see below)
```

### 3. Set up Supabase
1. Create a free project at https://supabase.com
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Copy your **Project URL** and **anon key** into `.env`

### 4. Run on your iPhone
```bash
npx expo start
```
Scan the QR code with the **Expo Go** app on your iPhone.

---

## Project Structure

```
macro-tracker/
├── app/
│   ├── _layout.tsx              # Root layout (React Query, navigation)
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar
│   │   ├── index.tsx            # 📖 Diary (home screen)
│   │   ├── explore.tsx          # 🔍 Food search
│   │   └── profile.tsx          # 👤 Profile & goals
│   └── modals/
│       ├── voice-logging.tsx    # 🎙️ Voice logging (full blue screen)
│       ├── shortcuts.tsx        # ✨ Quick shortcuts
│       └── confirm-meal.tsx     # ✅ Confirm & log
│
├── components/
│   └── diary/
│       ├── MacroProgressCard.tsx  # Progress bars
│       ├── MealSection.tsx        # Breakfast/Lunch/Dinner/Snacks
│       └── FoodItem.tsx           # Individual food row
│
├── stores/
│   ├── diaryStore.ts            # Zustand: diary state
│   └── authStore.ts             # Zustand: auth/session
│
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── api/
│       ├── meals.ts             # CRUD for diary entries
│       └── foods.ts             # Open Food Facts + voice parsing
│
├── constants/colors.ts          # Design tokens (matches your Figma)
├── types/index.ts               # TypeScript types
├── data/mockData.ts             # Demo data (used while offline)
└── supabase/schema.sql          # DB schema — run this first!
```

---

## Screens

| Screen | File | Status |
|---|---|---|
| Diary (home) | `app/(tabs)/index.tsx` | ✅ |
| Food Explore | `app/(tabs)/explore.tsx` | ✅ |
| Profile | `app/(tabs)/profile.tsx` | ✅ |
| Voice Logging | `app/modals/voice-logging.tsx` | ✅ |
| Quick Shortcuts | `app/modals/shortcuts.tsx` | ✅ |
| Confirm Meal | `app/modals/confirm-meal.tsx` | ✅ |

---

## Switching from Mock Data → Real Supabase

The app ships with `MOCK_TODAY_ENTRIES` so you can see the UI immediately.

To enable real data, in `stores/diaryStore.ts` uncomment:
```ts
// const entries = await getDiaryEntries(userId, date);
```
and comment out the mock line below it.

---

## App Store Submission

1. Install Xcode (Mac required)
2. Run `eas build --platform ios` (needs Expo EAS account)
3. Submit via `eas submit --platform ios`

Or use `expo build:ios` for the legacy build service.
