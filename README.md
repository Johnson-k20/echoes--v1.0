# Echoes

A personal audio journaling web app with two modes — **Vault** (private memory archive) and **Future Self** (time-locked, encrypted messages to yourself).

**Live URL**: https://echoesvault-9awqy2br.manus.space

---

## Features

### 1. Design System
- Deep charcoal background (`#0f0e0d`) with amber accent (`#f59e0b`)
- Cormorant Garamond (serif) + Inter (sans-serif) typographic pairing
- Ethereal/sacred aesthetic: ambient orbs, particle field, glassmorphic cards, candlelight glow
- Globally defined CSS variables for consistent theming
- Mobile-first responsive layout

### 2. Public Landing Page
- Asymmetric layout introducing both modes (Vault and Future Self)
- Brand copy with atmospheric depth
- Sign-in call-to-action

### 3. One-Tap Recording Ritual
- In-browser recording via MediaRecorder/Web Audio API
- Animated breathing waveform during capture
- Ambience selector (silence, rain, café, night)
- Mode toggle (Vault vs Future Self)
- Direct upload to S3 on completion
- Local save option (download recording before uploading)

### 4. AI Pipeline on Save
- Whisper transcription on uploaded audio
- LLM mood detection and collection suggestion
- Confirm/override before the echo is saved

### 5. Echo Data Model
- `echoes` table: id, user_id, audio_url, audio_key, transcript, duration_sec, created_at, mood, collection_id, ambience, title, mode (vault | future_self), seal_date, unlock_date, is_unlocked (server-computed)
- `collections` table: organizational rooms
- `insight_snapshots` table: monthly qualitative observations

### 6. Timeline View
- Reverse-chronological grouped feed (Today, Yesterday, This Week, Older)
- Each entry shows duration, mood badge, ambience, and transcript preview

### 7. Collections
- Create/delete named collections
- Add echoes to collections
- Visual room cards with echo counts

### 8. Future Self Hub
- Sealing flow with date-picker for unlock date
- Server-enforced unlock gating (`is_unlocked` computed server-side)
- Locked-entry UI showing only seal/unlock dates
- Ceremonial delivery screen on unlock

### 9. Qualitative Insights
- Monthly LLM-generated observation sentence
- Recurring word cloud (no numbers, no axes, no streaks)

### 10. Settings & Privacy
- Plain-language encryption explainer
- One-tap full archive export (zip of audio + JSON metadata)
- Account deletion

### 11. Android Companion
- A native **local-first Vault** designed for daily voice journaling on Android
- One deterministic private reflection prompt per day, generated locally without network or storage reads
- A bounded recording state machine with explicit start, stop, save, error, and reset transitions
- A visible local-data promise: audio is saved to the device before any optional sync is considered
- An optional secure sign-in control in Settings; it is only invoked after a deliberate user tap

---

## Micro-Interactions (Recent Additions)

- **Cursor-follow ambient glow**: Subtle light that follows mouse movement
- **Scroll progress indicator**: Thin amber line at top of page
- **Magnetic hover**: Buttons subtly pull toward cursor (1-2px)
- **Scroll-triggered reveals**: Gentle fade-in via IntersectionObserver
- **Breathing input borders**: Focused inputs pulse with warm glow
- **Film grain overlay**: Subtle shifting noise texture for analog warmth
- **Local recording save**: Download audio file before uploading to server

---

## Tech Stack

### Web App
- **Frontend**: React 19 + Tailwind 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL (Drizzle ORM)
- **Storage**: S3 (audio files)
- **Auth**: Manus OAuth
- **AI**: Whisper transcription + LLM (mood/collection/insights)

### Mobile App (echoes-mobile/)
- **Framework**: Expo SDK 54 (React Native)
- **Styling**: Explicit React Native `StyleSheet` layouts for the active Android routes
- **Navigation**: Expo Router 6
- **Recording**: expo-av + expo-audio
- **Persistence**: Local file storage and AsyncStorage metadata, hydrated only after the Vault mounts
- **Authentication**: Optional, user-initiated secure sign-in in Settings; no sign-in, redirect, query, or storage work occurs during startup

### Micro-interaction Components

| Component | Location | Behavior |
|---|---|---|
| `ParallaxTilt` | `client/src/components/` | Subtle 1-2deg card rotation that follows cursor; wired on Timeline echo cards and Collections room cards |
| `LiquidRipple` | `client/src/components/` | Organic press bloom that grows from the exact press point; wired on all recording controls (record buttons, mode/ambience chips, Review & Save, Seal it/Preserve) |
| `MagneticButton` | `client/src/components/` | Buttons gently attracted toward the cursor on hover; used on destructive actions |
| `AnimatedGrain` | `client/src/components/` | Shifting film-grain overlay; mounted in the authenticated shell (`AuthLayout`) and the landing page |
| `CursorGlow` | `client/src/components/` | Warm radial glow that follows the cursor |
| Scroll progress | `client/src/components/` | Thin amber line across the top of every app page |
| Success pulse | `client/src/index.css` | Brief scale pulse on save actions (`.success-pulse`) |
| Breathing border | `client/src/index.css` | Soft amber border animation on focused inputs |
| Scroll reveal | `client/src/hooks/` | Fade-in-on-scroll for timeline entries and cards |

---

## Project Structure

```
echoes/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Shared UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities (tRPC client)
│   └── index.html
├── server/                 # Express + tRPC backend
│   ├── _core/              # Framework plumbing
│   ├── routers/            # Feature routers (commerce)
│   ├── db.ts               # Database queries
│   ├── routers.ts          # Main tRPC router
│   └── storage.ts          # S3 helpers
├── drizzle/                # Schema + migrations
├── shared/                 # Shared constants & types
└── echoes-mobile/          # Android app (separate Expo project)
    ├── app/                # Expo Router screens
    ├── components/         # Shared components
    └── lib/                # API client
```

---

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm check

# Database migration
pnpm drizzle-kit generate
```

---

## Deployment

Auto-publish is enabled — every checkpoint is automatically deployed to production at `echoesvault-9awqy2br.manus.space`.

---

## Mobile Stability Architecture

The Android companion intentionally prioritizes a dependable opening experience over background work. Its root layout is static: it has **no startup-time redirect, automatic sign-in, deep-link listener, server query, storage read, subscription, or `useSyncExternalStore` integration**. The Vault performs one cancel-safe local hydration only after its native screen mounts. Recording begins only after an explicit press, and saving remains local-first.

Visible mobile routes use React Native `StyleSheet` definitions instead of relying on CSS-to-native transformation at runtime. This avoids a class transformation failure leaving route content as unstructured text and icons. The architecture and the reasons for these constraints are maintained in [`echoes-mobile/REBUILD-GUARDRAILS.md`](../echoes-mobile/REBUILD-GUARDRAILS.md).

### Optional Secure Sign-In

Echoes is useful without an account. The user can open **Settings** and choose **Sign in securely** when they are ready to connect an account. Only that deliberate action dynamically loads the browser authentication client. Cancellation and failure leave local recordings unchanged, and the Settings card communicates the result without affecting the rest of the app.

## Mobile Testing and Android Installation

The mobile project has focused tests for the recording reducer, safe hydration, local-recording snapshot behavior, daily ritual selection, and explicit authentication behavior.

```bash
cd echoes-mobile
npx tsc --noEmit
npx vitest run
npx expo export --platform android --output-dir /tmp/echoes-android-export
```

For a device-installable Android build:

```bash
cd echoes-mobile
npx eas build --platform android --profile preview
```

Use the direct `.apk` artifact URL from the completed build in Chrome on Android. The browser should download the package, after which Android can install it as an update. Avoid relying on Expo Go’s recent-project list for release verification, because it can reopen an older cached development session instead of the intended project URL.
