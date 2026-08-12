import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Echoes",
  slug: "echoes-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "echoes",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.echoes.mobile",
    infoPlist: {
      NSMicrophoneUsageDescription: "Allow Echoes to record your voice for journaling.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0f0e0d",
      foregroundImage: "./assets/images/icon.png",
    },
    edgeToEdgeEnabled: true,
    package: "com.echoes.mobile",
    permissions: ["RECORD_AUDIO", "INTERNET", "ACCESS_NETWORK_STATE"],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-audio",
      {
        microphonePermission: "Allow Echoes to access your microphone.",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["arm64-v8a"],
          minSdkVersion: 24,
        },
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0f0e0d",
        dark: { backgroundColor: "#0f0e0d" },
        image: "./assets/images/splash-icon.png",
        imageWidth: 128,
        resizeMode: "contain",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
