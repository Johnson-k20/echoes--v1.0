import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Mic, Square, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

type Mode = "vault" | "future_self";
type Ambience = "silence" | "rain" | "cafe" | "night";

const AMBIENCE_OPTIONS: { value: Ambience; label: string }[] = [
  { value: "silence", label: "Silence" },
  { value: "rain", label: "Rain" },
  { value: "cafe", label: "Cafe" },
  { value: "night", label: "Night" },
];

export default function Recording() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("vault");
  const [ambience, setAmbience] = useState<Ambience>("silence");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [suggestedMood, setSuggestedMood] = useState<string | null>(null);
  const [suggestedCollection, setSuggestedCollection] = useState<string | null>(null);
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(0);
  const [unlockDays, setUnlockDays] = useState(30);
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const collections = trpc.collections.list.useQuery(undefined, { enabled: !!user });
  const transcribeMutation = trpc.echoes.transcribe.useMutation();
  const suggestMutation = trpc.echoes.suggestMoodAndCollection.useMutation();
  const createEchoMutation = trpc.echoes.create.useMutation();
  const updateEchoMutation = trpc.echoes.update.useMutation();

  // Check if user has any echoes
  const recentEchoes = trpc.echoes.recent.useQuery({ limit: 1 }, { enabled: !!user });

  useEffect(() => {
    if (recentEchoes.data && recentEchoes.data.length === 0 && !isRecording && !audioBlob) {
      setHasShownOnboarding(true);
    }
  }, [recentEchoes.data]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();
      };

      recorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);

      // Start waveform animation
      animateWaveform();
    } catch (err) {
      toast.error("Microphone access required to record.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setIsRecording(false);
    if (waveformRef.current) {
      waveformRef.current.innerHTML = "";
    }
  }, []);

  const animateWaveform = useCallback(() => {
    if (!analyserRef.current || !waveformRef.current) return;
    const analyser = analyserRef.current;
    const container = waveformRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    container.innerHTML = "";
    const barCount = 24;
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement("div");
      const dataIndex = Math.floor((i / barCount) * data.length);
      const value = data[dataIndex] || 0;
      const height = Math.max(4, (value / 255) * 60);
      bar.className = "w-1 rounded-full bg-amber";
      bar.style.height = `${height}px`;
      bar.style.opacity = "0.6";
      bar.style.transition = "height 0.1s ease, opacity 0.1s ease";
      container.appendChild(bar);
    }

    animFrameRef.current = requestAnimationFrame(animateWaveform);
  }, []);

  const handleSave = useCallback(async () => {
    if (!audioBlob) return;
    setIsProcessing(true);

    try {
      // Upload audio to server
      const formData = new FormData();
      formData.append("file", audioBlob, `echo-${Date.now()}.webm`);
      const uploadResp = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadResp.json();

      if (!uploadData.url) {
        throw new Error("Upload failed");
      }

      // Transcribe
      const transcribeResult = await transcribeMutation.mutateAsync({ audioUrl: uploadData.url });

      // Suggest mood and collection
      let mood = null;
      let collection = null;
      let echoTitle = null;
      if (transcribeResult.transcript) {
        const suggestion = await suggestMutation.mutateAsync({ transcript: transcribeResult.transcript });
        mood = suggestion.mood;
        echoTitle = suggestion.title;
        if (suggestion.collection) {
          const found = collections.data?.find(c => c.name.toLowerCase() === suggestion.collection?.toLowerCase());
          if (found) collection = found.id;
        }
      }

      setSuggestedMood(mood);
      setSuggestedCollection(echoTitle);
      setSuggestedTitle(echoTitle);
      setSelectedMood(mood);
      setSelectedCollectionId(collection);
      setTitle(echoTitle || "");
      setShowConfirmation(true);
    } catch (err) {
      toast.error("Failed to process recording. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, transcribeMutation, suggestMutation, collections.data]);

  const confirmSave = useCallback(async () => {
    if (!audioBlob) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `echo-${Date.now()}.webm`);
      const uploadResp = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadResp.json();

      let unlockDate = null;
      let sealDate = null;
      if (mode === "future_self") {
        const now = new Date();
        sealDate = new Date(now);
        unlockDate = new Date(now.getTime() + unlockDays * 24 * 60 * 60 * 1000);
      }

      const echo = await createEchoMutation.mutateAsync({
        audioKey: uploadData.key,
        audioUrl: uploadData.url,
        transcript: null,
        durationSec: duration,
        ambience: ambience,
        mode: mode,
        sealDate: sealDate || undefined,
        unlockDate: unlockDate || undefined,
      });

      // Update with AI suggestions
      if (echo.id) {
        await updateEchoMutation.mutateAsync({
          id: echo.id,
          mood: selectedMood,
          collectionId: selectedCollectionId,
          title: title || null,
        });
      }

      setShowConfirmation(false);
      setAudioBlob(null);
      setDuration(0);
      toast.success(mode === "vault" ? "Echo preserved in the Vault." : "Letter sealed. It will arrive on time.");
    } catch (err) {
      toast.error("Failed to save echo.");
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, mode, ambience, duration, unlockDays, selectedMood, selectedCollectionId, title, createEchoMutation, updateEchoMutation]);

  const discardRecording = useCallback(() => {
    setAudioBlob(null);
    setShowConfirmation(false);
    setDuration(0);
    setSelectedMood(null);
    setSelectedCollectionId(null);
    setTitle("");
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Still awake?";
    if (hour < 12) return "Good morning.";
    if (hour < 17) return "Good afternoon.";
    if (hour < 21) return "Good evening.";
    return "It's late.";
  };

  // If no echoes yet, show onboarding
  if (hasShownOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-6 text-center">
        <h1 className="font-serif-display text-3xl lg:text-4xl text-foreground mb-4">
          What did you almost say,<br />but didn't?
        </h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Press the circle below. Speak freely. No timer, no judgment. 
          Your voice becomes an echo — preserved in your vault.
        </p>
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setMode("vault")}
            className={`px-5 py-2 rounded-full text-sm transition-all ${
              mode === "vault" ? "bg-amber/20 text-amber border border-amber/30" : "text-muted-foreground border border-border"
            }`}
          >
            Vault
          </button>
          <button
            onClick={() => setMode("future_self")}
            className={`px-5 py-2 rounded-full text-sm transition-all ${
              mode === "future_self" ? "bg-amber/20 text-amber border border-amber/30" : "text-muted-foreground border border-border"
            }`}
          >
            Future Self
          </button>
        </div>
        <button
          onClick={startRecording}
          className="w-20 h-20 rounded-full bg-amber/10 border-2 border-amber/30 flex items-center justify-center hover:bg-amber/20 transition-all active:scale-95"
        >
          <Mic className="h-8 w-8 text-amber" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-serif-display text-2xl text-foreground">{greeting()}</h1>
        <p className="text-muted-foreground text-sm mt-1">What echoes through you today?</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode("vault")}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "vault" ? "bg-amber/15 text-amber border border-amber/30" : "text-muted-foreground border border-border hover:border-amber/20"
          }`}
        >
          Vault
        </button>
        <button
          onClick={() => setMode("future_self")}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "future_self" ? "bg-amber/15 text-amber border border-amber/30" : "text-muted-foreground border border-border hover:border-amber/20"
          }`}
        >
          Future Self
        </button>
      </div>

      {/* Future Self seal duration */}
      {mode === "future_self" && !isRecording && !audioBlob && (
        <div className="mb-6 p-4 rounded-xl bg-charcoal-lighter border border-border/50">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Seal for</label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {[
              { days: 30, label: "1 month" },
              { days: 180, label: "6 months" },
              { days: 365, label: "1 year" },
              { days: 1825, label: "5 years" },
            ].map(opt => (
              <button
                key={opt.days}
                onClick={() => setUnlockDays(opt.days)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  unlockDays === opt.days ? "bg-amber/20 text-amber" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ambience selector */}
      <div className="mb-8">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">Ambience</label>
        <div className="flex gap-2 mt-2">
          {AMBIENCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setAmbience(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                ambience === opt.value ? "bg-amber/20 text-amber" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recording button / waveform */}
      <div className="flex flex-col items-center mb-10">
        {isRecording ? (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-end gap-1 h-16" ref={waveformRef}></div>
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-destructive/80 flex items-center justify-center hover:bg-destructive transition-all active:scale-95"
            >
              <Square className="h-6 w-6 text-destructive-foreground" />
            </button>
            <span className="text-muted-foreground text-sm tabular-nums">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}
            </span>
          </div>
        ) : audioBlob ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber/10 border-2 border-amber/30 flex items-center justify-center">
              <Link2 className="h-6 w-6 text-amber" />
            </div>
            <span className="text-muted-foreground text-sm">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")} recorded
            </span>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={discardRecording}
                className="border-border text-muted-foreground"
                disabled={isProcessing}
              >
                Discard
              </Button>
              <Button
                onClick={handleSave}
                className="bg-amber/90 hover:bg-amber text-primary-foreground"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Review & Save"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={startRecording}
              className="w-24 h-24 rounded-full bg-amber/10 border-2 border-amber/30 flex items-center justify-center hover:bg-amber/20 transition-all active:scale-95"
            >
              <Mic className="h-10 w-10 text-amber" />
            </button>
            <span className="text-muted-foreground text-sm">Press to begin</span>
          </div>
        )}
      </div>

      {/* Save confirmation modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal-light border border-border rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="font-serif-display text-xl text-foreground mb-4">Review your echo</h3>
            
            {/* Mood */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Mood</label>
              <input
                type="text"
                value={selectedMood || ""}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="mt-1 w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-amber/50"
                placeholder="tender, restless, hopeful..."
              />
            </div>

            {/* Collection */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Collection</label>
              <select
                value={selectedCollectionId || ""}
                onChange={(e) => setSelectedCollectionId(e.target.value ? Number(e.target.value) : null)}
                className="mt-1 w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-amber/50"
              >
                <option value="">No collection</option>
                {collections.data?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-amber/50"
                placeholder="A short title for this moment"
              />
            </div>

            {mode === "future_self" && (
              <p className="text-xs text-amber-dim mb-4 italic">
                This letter will be sealed for {unlockDays} days and cannot be opened until {new Date(Date.now() + unlockDays * 24 * 60 * 60 * 1000).toLocaleDateString()}.
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={discardRecording}
                className="flex-1 border-border text-muted-foreground"
                disabled={isProcessing}
              >
                Discard
              </Button>
              <Button
                onClick={confirmSave}
                className="flex-1 bg-amber/90 hover:bg-amber text-primary-foreground"
                disabled={isProcessing}
              >
                {isProcessing ? "Saving..." : mode === "future_self" ? "Seal it" : "Preserve"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recent echoes */}
      {recentEchoes.data && recentEchoes.data.length > 0 && (
        <div className="mt-8 border-t border-border/30 pt-6">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Recent echoes</h3>
          {recentEchoes.data.map((echo) => (
            <div key={echo.id} className="py-3 border-b border-border/20 last:border-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {echo.title || "Untitled"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.floor(echo.durationSec / 60)}:{Math.floor(echo.durationSec % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {echo.transcript || "No transcript"}
              </p>
              {echo.mood && (
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber/10 text-amber-dim">
                  {echo.mood}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
