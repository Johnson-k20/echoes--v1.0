# Echoes Mobile

A personal audio journaling app for Android, built with Expo (React Native) and NativeWind.

## Features

- **Vault Mode**: Private memory archive — record, transcribe, and organize your daily echoes
- **Future Self Mode**: Time-locked, encrypted letters to your future self
- **One-tap Recording**: Hold-to-record with ambience selector (silence, rain, café, night)
- **Insights**: Monthly qualitative observations and recurring word cloud
- **Settings**: Privacy explainer, archive export, and account deletion

## Architecture

The mobile app connects to the web backend at `https://echoesvault-9awqy2br.manus.space` for all data operations:
- Echo creation, listing, and deletion
- Audio file upload
- Collection management
- Insights retrieval
- Archive export

## Setup

```bash
# Install dependencies
pnpm install

# Start the Expo dev server
npx expo start

# Run on Android
npx expo start --android

# Build for production (EAS Build)
npx eas build --platform android
```

## Project Structure

```
echoes-mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with providers
│   ├── (tabs)/             # Tab navigation
│   │   ├── _layout.tsx     # Tab bar config
│   │   ├── index.tsx       # Vault (timeline)
│   │   ├── record.tsx      # Recording ritual
│   │   ├── future.tsx      # Future Self letters
│   │   ├── insights.tsx    # Qualitative insights
│   │   └── settings.tsx    # Privacy & export
├── components/             # Shared components
├── lib/                    # API client, utilities
├── constants/              # Theme, colors
├── assets/                 # Images, icons
├── app.config.ts           # Expo config
├── theme.config.js         # NativeWind theme colors
├── tailwind.config.js      # Tailwind + NativeWind config
└── babel.config.js         # Babel + NativeWind preset
```

## Design System

- **Background**: `#0f0e0d` (deep charcoal)
- **Primary**: `#f59e0b` (amber)
- **Surface**: `#1a1816`
- **Foreground**: `#e8e4df`
- **Muted**: `#8a8378`
- **Border**: `#2a2724`

## Backend API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/upload` | POST | Upload audio file to S3 |
| `/api/trpc/echoes.list` | GET | List all echoes |
| `/api/trpc/echoes.byMode` | GET | Filter echoes by mode |
| `/api/trpc/echoes.create` | POST | Create a new echo |
| `/api/trpc/echoes.delete` | POST | Delete an echo |
| `/api/trpc/collections.list` | GET | List collections |
| `/api/trpc/insights.list` | GET | Get monthly insights |
| `/api/trpc/archive.export` | POST | Export full archive |

## Testing

To test on your Android device:

1. Install Expo Go from the Play Store
2. Run `npx expo start` in this directory
3. Scan the QR code with Expo Go
4. The app will launch with hot-reload enabled

For a standalone APK/IPA, use EAS Build:
```bash
npx eas build --platform android
```
