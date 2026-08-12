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
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router 6
- **Recording**: expo-av + expo-audio
- **Backend connection**: Same API at https://echoesvault-9awqy2br.manus.space

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

## Mobile Testing

To test on Android:

1. Install Expo Go from Play Store
2. In the `echoes-mobile/` directory: `npx expo start`
3. Scan QR code with Expo Go

For production build:
```bash
cd echoes-mobile
npx eas build --platform android
```
