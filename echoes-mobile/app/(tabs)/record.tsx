import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/icon-symbol";
import { api } from "@/lib/api";

const AMBIENCES = [
  { id: "silence", label: "Silence" },
  { id: "rain", label: "Rain" },
  { id: "cafe", label: "Café" },
  { id: "night", label: "Night" },
];

export default function RecordScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<"vault" | "future_self">("vault");
  const [ambience, setAmbience] = useState("silence");
  const [processing, setProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission needed", "Microphone access is required to record.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      if (!uri) {
        Alert.alert("Error", "No audio was captured.");
        return;
      }

      setProcessing(true);

      // Upload to the backend
      await api.uploadRecording({
        audioUri: uri,
        audioMime: "audio/webm",
        mode,
        ambience,
        durationSec: duration,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Echo saved", "Your recording has been preserved.");
      router.back();
    } catch (err) {
      console.error("Failed to stop/upload:", err);
      Alert.alert("Error", "Failed to save your echo. Please try again.");
      setProcessing(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Header */}
        <View className="items-center pt-8">
          <Text className="text-2xl text-foreground font-serif tracking-wide">Record</Text>
          <Text className="text-sm text-muted mt-1">
            {mode === "vault" ? "Private memory archive" : "A letter to your future self"}
          </Text>
        </View>

        {/* Mode Toggle */}
        <View className="flex-row mt-8 mx-4 rounded-xl bg-surface border border-border overflow-hidden">
          <Pressable
            onPress={() => {
              setMode("vault");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.modeButton,
              mode === "vault" && styles.modeButtonActive,
              pressed && { opacity: 0.7 },
            ]}
          >
            <IconSymbol
              name="timeline"
              size={16}
              color={mode === "vault" ? "#f59e0b" : "#8a8378"}
            />
            <Text
              className="text-xs font-medium"
              style={{ color: mode === "vault" ? "#f59e0b" : "#8a8378" }}
            >
              Vault
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setMode("future_self");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.modeButton,
              mode === "future_self" && styles.modeButtonActive,
              pressed && { opacity: 0.7 },
            ]}
          >
            <IconSymbol
              name="future"
              size={16}
              color={mode === "future_self" ? "#f59e0b" : "#8a8378"}
            />
            <Text
              className="text-xs font-medium"
              style={{ color: mode === "future_self" ? "#f59e0b" : "#8a8378" }}
            >
              Future Self
            </Text>
          </Pressable>
        </View>

        {/* Ambient Selector */}
        <View className="mt-6 mx-4">
          <Text className="text-xs text-muted/60 uppercase tracking-[0.2em] mb-3 font-serif">
            Ambience
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {AMBIENCES.map((amb) => (
              <Pressable
                key={amb.id}
                onPress={() => {
                  setAmbience(amb.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => [
                  styles.ambienceChip,
                  ambience === amb.id && styles.ambienceChipActive,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  className="text-xs"
                  style={{ color: ambience === amb.id ? "#f59e0b" : "#8a8378" }}
                >
                  {amb.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recording Area */}
        <View className="flex-1 items-center justify-center mt-8">
          {/* Timer */}
          <Text className="text-4xl font-mono text-foreground/80 mb-8">
            {formatTime(duration)}
          </Text>

          {/* Record Button */}
          <Pressable
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={({ pressed }) => [
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              processing && { opacity: 0.5 },
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            disabled={processing}
          >
            {isRecording ? (
              <View className="w-6 h-6 rounded-sm bg-foreground/80" />
            ) : (
              <IconSymbol name="record" size={36} color="#0f0e0d" />
            )}
          </Pressable>

          {/* Status */}
          <Text className="text-sm text-muted mt-6">
            {processing
              ? "Preserving your echo..."
              : isRecording
              ? "Speak freely. Tap to stop."
              : mode === "vault"
              ? "Hold to record for your vault"
              : "Hold to seal a letter to your future self"}
          </Text>

          {/* Breathing ring animation hint */}
          {isRecording && (
            <View style={styles.breathingRing} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  modeButtonActive: {
    backgroundColor: "#f59e0b15",
  },
  ambienceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2724",
    backgroundColor: "#1a1816",
  },
  ambienceChipActive: {
    borderColor: "#f59e0b40",
    backgroundColor: "#f59e0b10",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  recordButtonActive: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
  },
  breathingRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#f59e0b30",
  },
});
