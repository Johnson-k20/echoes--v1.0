import { Stack } from "expo-router";
import { StatusBar as RNStatusBar } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Set status bar style
    RNStatusBar.setBarStyle("light-content");
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0f0e0d" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="record" options={{ headerShown: false, presentation: "modal" }} />
          <Stack.Screen name="future" options={{ headerShown: false }} />
          <Stack.Screen name="insights" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
        <ExpoStatusBar style="light" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
