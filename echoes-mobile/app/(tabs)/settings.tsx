import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { IconSymbol } from "@/components/icon-symbol";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        {/* Header */}
        <View className="pt-8 mb-8">
          <Text className="text-2xl text-foreground font-serif tracking-wide">Settings</Text>
          <Text className="text-sm text-muted mt-1">Privacy &amp; archive</Text>
        </View>

        {/* Privacy Explainer */}
        <View
          style={{
            backgroundColor: "#1a1816",
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: "#f59e0b20",
            marginBottom: 20,
          }}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <IconSymbol name="future" size={16} color="#f59e0b" />
            <Text className="text-sm text-primary/80 font-serif font-medium">Encryption</Text>
          </View>
          <Text className="text-xs text-muted/70 leading-relaxed">
            Future Self letters are encrypted on your device before they leave it.
            The server never sees the audio until your chosen unlock date arrives.
            Only you hold the key — not even we can listen before then.
          </Text>
        </View>

        {/* Export */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert(
              "Export Archive",
              "Your full archive (audio + metadata) will be generated. This may take a moment.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Export", onPress: () => {} },
              ]
            );
          }}
          style={({ pressed }) => [
            styles.actionRow,
            pressed && { opacity: 0.7 },
          ]}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <IconSymbol name="insights" size={18} color="#8a8378" />
            <View className="flex-1">
              <Text className="text-sm text-foreground/90">Export full archive</Text>
              <Text className="text-xs text-muted/50 mt-0.5">
                Download all audio + metadata as a zip
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Account */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert(
              "Delete Account",
              "This will permanently erase all your echoes, letters, and data. This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete Everything", style: "destructive", onPress: () => {} },
              ]
            );
          }}
          style={({ pressed }) => [
            styles.actionRow,
            pressed && { opacity: 0.7 },
          ]}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <IconSymbol name="settings" size={18} color="#ef4444" />
            <View className="flex-1">
              <Text className="text-sm text-error">Delete account</Text>
              <Text className="text-xs text-muted/50 mt-0.5">
                Permanently erase all data
              </Text>
            </View>
          </View>
        </Pressable>

        {/* App Info */}
        <View className="items-center mt-12">
          <Text className="text-xs text-muted/30 font-serif">
            Echoes — a sanctuary for your voice
          </Text>
          <Text className="text-[10px] text-muted/20 mt-1">v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  actionRow: {
    backgroundColor: "#1a1816",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2a2724",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2724",
    marginVertical: 16,
  },
};
