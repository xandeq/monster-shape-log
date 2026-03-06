# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Monster Log** is a React Native fitness tracking mobile app built with Expo and Expo Router. It features a cyberpunk/neon "brutalist" design aesthetic with animated components, gradient effects, and pulsing glows. The app uses Supabase for backend authentication and data storage.

**Package:** `br.com.monsterlog`
**Current Version:** 1.0.3
**Target:** Android (primary), iOS (supported)

## Essential Commands

### Development

```bash
# Start Metro bundler only (for development server)
cd apps/mobile && npm start

# Build and run on connected Android device via USB
cd apps/mobile && npm run android

# Build and run on iOS simulator
cd apps/mobile && npm run ios

# Run web version
cd apps/mobile && npm run web
```

### Device Testing

```bash
# Check connected Android devices
adb devices

# Force open app on device (if not launching)
adb shell monkey -p br.com.monsterlog -c android.intent.category.LAUNCHER 1

# Check if app is installed
adb shell pm list packages | grep monster

# View device logs
adb logcat | grep monsterlog
```

### Build & Deploy

```bash
# Build APK for internal testing (EAS)
cd apps/mobile && eas build --profile apk --platform android

# Build production (Play Store)
cd apps/mobile && eas build --profile production --platform android

# Build development client
cd apps/mobile && eas build --profile development --platform android
```

### Dependency Management

```bash
# Install dependencies (run from project root first, then mobile)
npm install
cd apps/mobile && npm install

# Clean install (when dependencies are corrupted)
cd apps/mobile
rm -rf node_modules package-lock.json
npm install

# After installing new native modules, rebuild
npm run android  # or npm run ios
```

## Architecture

### File Structure

```
apps/mobile/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Auth flow (login, register)
│   │   ├── _layout.tsx           # Auth layout wrapper
│   │   ├── login.tsx             # Login screen with AsyncStorage credentials
│   │   └── register.tsx          # Registration screen
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Dashboard/Home
│   │   ├── track.tsx             # Workout tracking
│   │   ├── history.tsx           # Workout history
│   │   ├── library.tsx           # Exercise library
│   │   └── timer.tsx             # Timer/rest periods
│   ├── _layout.tsx               # Root layout (fonts, providers, auth guard)
│   └── welcome.tsx               # Onboarding/welcome screen
├── components/                   # Reusable UI components
│   ├── Monster*.tsx              # Core design system components
│   │   ├── MonsterLayout.tsx    # Screen wrapper with gradient bg
│   │   ├── MonsterButton.tsx    # Primary button with neon effects
│   │   ├── MonsterCard.tsx      # Glass-morphism card
│   │   └── MonsterText.tsx      # Typography with glow effects
│   ├── Gradient*.tsx             # Gradient text/effects
│   ├── Glass*.tsx                # Glass-morphism components
│   ├── Animated*.tsx             # Reanimated 2 components
│   └── Fitness*.tsx              # SVG fitness illustrations
├── constants/                    # Configuration & theme
│   ├── Colors.ts                 # MonsterColors palette (cyberpunk theme)
│   ├── Gradients.ts              # Gradient definitions
│   ├── Animations.ts             # Animation configurations
│   └── Exercises.ts              # Exercise database
├── context/                      # React Context providers
│   ├── AuthContext.tsx           # Supabase auth state
│   ├── WorkoutContext.tsx        # Active workout state
│   └── ProgressContext.tsx       # User progress tracking
├── lib/                          # Utilities & services
│   └── supabase.ts               # Supabase client configuration
└── assets/                       # Static assets (images, fonts)
```

### Navigation Flow

The app uses **Expo Router** (file-based routing):

1. `_layout.tsx` → Root layout with providers and auth guard
2. If not authenticated → Redirect to `welcome.tsx` → `(auth)/login.tsx`
3. If authenticated → `(tabs)/_layout.tsx` → Tab navigation

**Auth Guard Logic:** Located in `app/_layout.tsx`, uses `useProtectedRoute()` hook to redirect unauthenticated users.

### State Management

- **Auth:** Supabase auth + `AuthContext` provider wraps entire app
- **Workouts:** `WorkoutContext` manages active workout sessions
- **Progress:** `ProgressContext` tracks user stats and history
- **Local Storage:** `AsyncStorage` for persisting login credentials (email/password)

### Design System

**Theme:** "Cyberpunk Neon Brutalism"

- **Primary Color:** `#FF00FF` (magenta/neon pink)
- **Accent Color:** `#00FFFF` (cyan)
- **Background:** `#050510` (near black with blue tint)
- **Effects:** Pulsing glows, glass-morphism, animated gradients
- **Typography:** Space Grotesk font family (300-700 weights)
- **Components:** All UI uses `Monster*` components for consistency

### Backend Integration

**Supabase Configuration:**
- Client initialized in `lib/supabase.ts`
- Credentials loaded from `.env` file (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
- Authentication flows handled via `signInWithPassword()`, `signUp()`, `signOut()`
- **Important:** The `.env` file is gitignored for security

### Key Features

1. **Credential Persistence:** Login screen saves email/password using AsyncStorage when "Remember Me" is checked
2. **Animated Components:** Uses `react-native-reanimated` for smooth 60fps animations
3. **Glass Effects:** Custom glass-morphism cards with blur and transparency
4. **Responsive Design:** Safe area handling for notches and system UI

## Common Workflows

### Adding a New Screen

1. Create file in `app/` following Expo Router conventions
2. Use `MonsterLayout` wrapper for consistent background/padding
3. Import necessary context providers via `useAuth()`, `useWorkout()`, etc.
4. Follow existing component patterns (see `(tabs)/index.tsx` for example)

### Modifying the Design System

- Colors: Edit `constants/Colors.ts` → `MonsterColors` object
- Gradients: Edit `constants/Gradients.ts`
- Animations: Edit `constants/Animations.ts` for timing/easing curves
- Components: Modify base `Monster*.tsx` components for app-wide changes

### Working with Supabase

```typescript
import { supabase } from '@/lib/supabase';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Sign up
const { data, error } = await supabase.auth.signUp({ email, password });

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Query data
const { data, error } = await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', user.id);
```

### Debugging on Physical Device

1. Ensure USB debugging enabled on Android device
2. Check device connection: `adb devices`
3. Run with live reload: `npm run android` (Metro bundler stays open)
4. View logs in terminal or use `adb logcat`
5. If app doesn't launch, force open: `adb shell monkey -p br.com.monsterlog -c android.intent.category.LAUNCHER 1`

## Important Notes

- **New Architecture:** Enabled via `newArchEnabled: true` in `app.json`
- **Android Package:** Always use `br.com.monsterlog` (not `com.anonymous.monsterlog`)
- **Metro Bundler:** Runs on port 8081 by default
- **Hot Reload:** Works automatically when Metro is running
- **Native Modules:** After installing modules with native code, must rebuild with `npm run android`
- **Git:** Single repository on `main` branch (see CONSOLIDATION_REPORT.md for history)
- **Device Testing:** Primary test device is Samsung Galaxy S23 (Serial: RQCX601DYRZ)

## Environment Setup

Create `.env` in `apps/mobile/` (gitignored):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear Metro cache
cd apps/mobile && npx expo start -c
```

### Build Failures
```bash
# Clean Gradle cache (Android)
cd apps/mobile/android
./gradlew clean
cd ../..
npm run android
```

### Module Resolution Errors
```bash
# Reinstall all dependencies
cd apps/mobile
rm -rf node_modules package-lock.json
npm install
```

### App Won't Install on Device
```bash
# Uninstall old version first
adb uninstall br.com.monsterlog
# Then rebuild
npm run android
```
