import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { IconSymbol } from "@/components/icon-symbol";
import { format, formatDistanceToNow } from "date-fns";

type Letter = {
  id: number;
  title: string | null;
  mode: string;
  createdAt: string;
  sealDate: string | null;
  unlockDate: string | null;
  isUnlocked: boolean;
};

export default function FutureSelfScreen() {
  const { data: letters, isLoading } = useQuery({
    queryKey: ["letters"],
    queryFn: () => api.getEchoesByMode("future_self"),
  });

  const sealed = letters?.filter((l: Letter) => !l.isUnlocked) || [];
  const arrived = letters?.filter((l: Letter) => l.isUnlocked) || [];

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-16 pb-4">
        <Text className="text-2xl text-foreground font-serif tracking-wide">Future Self</Text>
        <Text className="text-sm text-muted mt-1">Letters sealed across time</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#f59e0b" size="large" />
        </View>
      ) : sealed.length === 0 && arrived.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <IconSymbol name="future" size={48} color="#3a3530" />
          <Text className="text-lg text-muted mt-4 text-center font-serif">
            No sealed letters yet
          </Text>
          <Text className="text-sm text-muted/60 mt-1 text-center">
            Record in Future Self mode to seal a letter
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...arrived, ...sealed]}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          ListHeaderComponent={
            arrived.length > 0 ? (
              <View className="mb-6">
                <View className="flex-row items-center gap-2 mb-3">
                  <Text className="text-xs text-muted/60 uppercase tracking-[0.2em] font-serif">
                    Arrived
                  </Text>
                  <View className="flex-1 h-px bg-border" />
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const letter = item as Letter;
            const isArrived = letter.isUnlocked;

            return (
              <View
                style={{
                  backgroundColor: isArrived ? "#1a1816" : "#141312",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isArrived ? "#f59e0b30" : "#2a2724",
                  opacity: isArrived ? 1 : 0.6,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isArrived ? "bg-primary/15" : "bg-surface"
                    }`}
                  >
                    <IconSymbol
                      name={isArrived ? "future" : "record"}
                      size={14}
                      color={isArrived ? "#f59e0b" : "#8a8378"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-foreground/90 font-medium font-serif">
                      {letter.title || "A letter from you"}
                    </Text>
                    <Text className="text-xs text-muted/50 mt-1">
                      {isArrived
                        ? `Arrived ${letter.unlockDate ? format(new Date(letter.unlockDate), "MMM d, yyyy") : ""}`
                        : `Sealed ${letter.sealDate ? format(new Date(letter.sealDate), "MMM d, yyyy") : "Recently"}`}
                    </Text>
                    {!isArrived && letter.unlockDate && (
                      <Text className="text-xs text-primary/60 mt-1">
                        Opens {formatDistanceToNow(new Date(letter.unlockDate), { addSuffix: true })}
                      </Text>
                    )}
                  </View>
                  {!isArrived && (
                    <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
                      <IconSymbol name="future" size={12} color="#f59e0b50" />
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
