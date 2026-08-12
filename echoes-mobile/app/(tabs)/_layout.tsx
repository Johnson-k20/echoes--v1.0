import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/icon-symbol";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#8a8378",
        tabBarStyle: {
          backgroundColor: "#1a1816",
          borderTopColor: "#2a2724",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 72,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Vault",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="timeline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: "Record",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="record" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="future"
        options={{
          title: "Future Self",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="future" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="insights" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
