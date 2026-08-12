import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { IconSymbol } from "@/components/icon-symbol";
import { format, formatDistanceToNow } from "date-fns";
import * as Haptics from "expo-haptics";

type Echo = {
  id: number;
  title: string | null;
  transcript: string | null;
  mode: string;
  mood: string | null;
  ambience: string | null;
  durationSec: number;
  createdAt: string;
  isUnlocked: boolean;
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function HomeScreen() {
  const router = useRouter();

  const { data: echoes, isLoading } = useQuery({
    queryKey: ["echoes"],
    queryFn: () => api.getEchoes(),
  });

  const vaultEchoes = echoes?.filter((e: Echo) => e.mode === "vault") || [];

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-16 pb-4">
        <Text className="text-2xl text-foreground font-serif tracking-wide">Vault</Text>
        <Text className="text-sm text-muted mt-1">Your private memory archive</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#f59e0b" size="large" />
          </View>
        ) : vaultEchoes.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <IconSymbol name="timeline" size={48} color="#3a3530" />
            <Text className="text-lg text-muted mt-4 text-center font-serif">No echoes yet</Text>
            <Text className="text-sm text-muted/60 mt-1 text-center">
              Press the mic to begin recording
            </Text>
          </View>
        ) : (
          <FlatList
            data={vaultEchoes}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            renderItem={({ item, index }) => (
              <View
                style={styles.card}
              >
                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center">
                    <IconSymbol name="record" size={14} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-foreground/90 font-medium">
                      {item.title || "Untitled"}
                    </Text>
                    <Text className="text-xs text-muted/60 mt-1" numberOfLines={2}>
                      {item.transcript || "No transcript"}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-2">
                      <Text className="text-[10px] text-muted/50">
                        {formatDuration(item.durationSec)}
                      </Text>
                      {item.mood && (
                        <Text className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">
                          {item.mood}
                        </Text>
                      )}
                      <Text className="text-[10px] text-muted/40">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* FAB */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/record");
        }}
        style={({ pressed }) => [
          styles.fab,
          pressed && { transform: [{ scale: 0.95 }], opacity: 0.8 },
        ]}
      >
        <IconSymbol name="record" size={28} color="#0f0e0d" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1816",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2724",
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
