# FitByte

A fitness and nutrition tracker built with Expo Router + Supabase.

## Design system

FitByte uses a grayscale-first dark UI with a single indigo accent, reserved
for primary actions, the active tab, and the ring-progress signature element.
Everything else — text, borders, cards — stays quiet on purpose.

- **Tokens** — `constants/theme.ts` (`DS` colors, `Typography`, `Spacing`, `Radius`)
- **Shared components** — `components/shared/`: `Button`, `TextField`, `Card`,
  `Badge`, `ListRow`, `Avatar`, `RingProgress`, `SegmentedControl`,
  `EmptyState`, `LoadingState`, `ErrorState`, `ProgressBar`, `StatCard`,
  `ScreenHeader`, `SectionHeader`, `BackButton`, `BottomSheet`, `MonoText`
- **Signature element** — `RingProgress` (`components/shared/RingProgress.tsx`),
  an SVG progress ring used for the one primary metric per screen (today's
  calories, weekly workout goal). Everything secondary uses the flat
  `ProgressBar` instead.
- Numeric/data values (calories, macros, timers) render in JetBrains Mono via
  `MonoText`; everything else uses the system font via `ThemedText`.

## Backend setup (Supabase + free food APIs)

No mock data — this app is wired to a real Supabase backend.

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier).
2. **Run the schema**: open your project's SQL Editor and run
   `supabase/migrations/0001_init.sql`. This creates all tables, Row-Level
   Security policies, an auto-profile-on-signup trigger, and a storage bucket
   for avatar/food images.
   - **Already have a FitByte Supabase project from before this fix?** Its
     tables were created with different column names/types than the app
     queries (`fitness_goals.protein_target` instead of `macro_protein`, no
     `food_entries.logged_at`, `workout_sessions.timestamp` instead of
     `performed_at`, and missing `achievements`/`daily_logs`/
     `routine_exercises` tables entirely) — this silently broke food
     logging, workout history, water tracking, and macro targets against
     Supabase, falling back to the on-device cache instead. Run
     `supabase/migrations/0002_align_schema_with_app.sql` once to fix it in
     place. A brand-new project only needs `0001_init.sql`.
3. **Get a free USDA FoodData Central key**: sign up at
   [fdc.nal.usda.gov/api-key-signup](https://fdc.nal.usda.gov/api-key-signup).
   (Open Food Facts, the other food data source, needs no key.)
4. **Configure environment variables**: copy `.env.example` to `.env` and fill in:
   - `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — from your
     Supabase project's Settings → API page.
   - `EXPO_PUBLIC_USDA_FDC_API_KEY` — from step 3.
5. **Email confirmation**: Supabase requires email confirmation on signup by
   default. For local testing, turn this off under Authentication → Providers
   → Email → "Confirm email", or use a real inbox.

Where things live:
- `lib/supabase.ts` — the Supabase client.
- `services/api/*.ts` — all data access (auth, user/profile, nutrition, workouts, food search).
- `contexts/AuthContext.tsx` — session state, consumed by `app/(auth)/*` and the route guard in `app/_layout.tsx`.
- `supabase/migrations/0001_init.sql` — full DB schema + RLS policies.

## Get started

```bash
npm install
npx expo start
```

Open in a [development build](https://docs.expo.dev/develop/development-builds/introduction/),
[Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/),
[iOS simulator](https://docs.expo.dev/workflow/ios-simulator/), or
[Expo Go](https://expo.dev/go).

This project uses [file-based routing](https://docs.expo.dev/router/introduction):
`app/(auth)` for login/signup, `app/(tabs)` for the five main tabs, `app/screens`
for everything pushed on top (settings, detail views, flows).
