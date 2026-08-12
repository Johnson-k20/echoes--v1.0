import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { IconSymbol } from "@/components/icon-symbol";

type Insight = {
  id: number;
  periodMonth: string;
  topWords: string | null;
  generatedObservation: string | null;
  createdAt: string;
};

export default function InsightsScreen() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: () => api.getInsights(),
  });

  const words = insights?.[0]?.topWords || "stillness\nwhisper\nlight\nmemory\nbreathe\nreturn";
  const observation =
    insights?.[0]?.generatedObservation ||
    "Your words carry a quiet weight this month — like pages turning in an old book.";

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        {/* Header */}
        <View className="pt-8 mb-8">
          <Text className="text-2xl text-foreground font-serif tracking-wide">Insights</Text>
          <Text className="text-sm text-muted mt-1">What your echoes reveal</Text>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator color="#f59e0b" size="large" />
          </View>
        ) : (
          <>
            {/* Observation */}
            <View
              style={{
                backgroundColor: "#1a1816",
                borderRadius: 20,
                padding: 24,
                borderWidth: 1,
                borderColor: "#f59e0b20",
                marginBottom: 24,
              }}
            >
              <View className="flex-row items-center gap-2 mb-4">
                <IconSymbol name="insights" size={16} color="#f59e0b" />
                <Text className="text-xs text-primary/70 uppercase tracking-[0.2em] font-serif">
                  This month
                </Text>
              </View>
              <Text
                className="text-lg text-foreground/90 font-serif leading-relaxed italic"
                style={{ lineHeight: 28 }}
              >
                "{observation}"
              </Text>
            </View>

            {/* Word Cloud */}
            <View
              style={{
                backgroundColor: "#1a1816",
                borderRadius: 20,
                padding: 24,
                borderWidth: 1,
                borderColor: "#2a2724",
              }}
            >
              <Text className="text-xs text-muted/60 uppercase tracking-[0.2em] mb-6 font-serif">
                Recurring words
              </Text>
              <View className="flex-row flex-wrap gap-3 items-center justify-center">
                {typeof words === "string"
                  ? words.split("\n").map((word, i) => (
                      <Text
                        key={i}
                        className="text-muted/70 font-serif"
                        style={{
                          fontSize: 14 + (3 - Math.min(i, 3)) * 4,
                          opacity: 1 - i * 0.08,
                        }}
                      >
                        {word}
                      </Text>
                    ))
                  : null}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
