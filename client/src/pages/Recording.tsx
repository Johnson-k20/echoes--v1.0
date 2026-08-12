import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Mic, Square, Sparkle, Download, Play } from "lucide-react";
import { toast } from "sonner";
import { MagneticButton } from "@/components/MagneticButton";
import { LiquidRipple } from "@/components/LiquidRipple";

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
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(0);
  const [unlockDays, setUnlockDays] = useState(30);
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);
  const [savedDuration, setSavedDuration] = useState(0);

  // Local draft persistence — save recording blob to localStorage on stop
  useEffect(() => {
    if (audioBlob && !isRecording) {
      // Store a flag that a draft exists (blob too large for localStorage, store metadata)
      try {
        localStorage.setItem("echoes-draft-mode", mode);
        localStorage.setItem("echoes-draft-duration", String(duration));
        localStorage.setItem("echoes-draft-ambience", ambience);
      } catch {}
    }
  }, [audioBlob, isRecording, mode, duration, ambience]);

  // Restore draft state (mode/ambience preference) on mount if an in-progress draft exists
  useEffect(() => {
    try {
      const draftMode = localStorage.getItem("echoes-draft-mode");
      const draftAmbience = localStorage.getItem("echoes-draft-ambience");
      if (draftMode && (draftMode === "vault" || draftMode === "future_self")) {
        setMode(draftMode);
      }
      if (draftAmbience) {
        setAmbience(draftAmbience as Ambience);
      }
    } catch {}
  }, []);

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
    const barCount = 32;
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement("div");
      const dataIndex = Math.floor((i / barCount) * data.length);
      const value = data[dataIndex] || 0;
      const height = Math.max(3, (value / 255) * 48);
      bar.className = "w-[2px] rounded-full bg-amber/80";
      bar.style.height = `${height}px`;
      bar.style.opacity = `${0.4 + (value / 255) * 0.6}`;
      bar.style.transition = "height 0.08s ease, opacity 0.08s ease";
      container.appendChild(bar);
    }

    animFrameRef.current = requestAnimationFrame(animateWaveform);
  }, []);

  const handleSave = useCallback(async () => {
    if (!audioBlob) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `echo-${Date.now()}.webm`);
      const uploadResp = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadResp.json();

      if (!uploadData.url) throw new Error("Upload failed");

      const transcribeResult = await transcribeMutation.mutateAsync({ audioUrl: uploadData.url });

      let mood = null;
      let collection: number | null = null;
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
      // Clear draft persistence once the echo is successfully preserved
      try {
        localStorage.removeItem("echoes-draft-mode");
        localStorage.removeItem("echoes-draft-duration");
        localStorage.removeItem("echoes-draft-ambience");
      } catch {}
      toast.success(mode === "vault" ? "Echo preserved in the Vault." : "Letter sealed. It will arrive on time.");
    } catch (err) {
      toast.error("Failed to save echo.");
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, mode, ambience, duration, unlockDays, selectedMood, selectedCollectionId, title, createEchoMutation, updateEchoMutation]);

  const audioUrlRef = useRef<string | null>(null);

  // Create audio URL for local playback
  useEffect(() => {
    if (audioBlob) {
      audioUrlRef.current = URL.createObjectURL(audioBlob);
    }
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, [audioBlob]);

  const handleLocalSave = useCallback(() => {
    if (!audioBlob) return;
    const url = audioUrlRef.current || URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `echo-${new Date().toISOString().slice(0, 10)}-${mode}.webm`;
    a.click();
    toast.success("Recording saved to your device.");
  }, [audioBlob, mode]);

  const handlePlayLocal = useCallback(() => {
    if (!audioUrlRef.current) return;
    const audio = new Audio(audioUrlRef.current);
    audio.play();
    toast.success("Playing your recording...");
  }, []);

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

  // Onboarding
  if (hasShownOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-6 text-center">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-amber/5 blur-[120px] pointer-events-none" />
        <h1 className="font-serif-sacred text-3xl lg:text-4xl text-foreground mb-3 tracking-wide sacred-reveal">
          What did you almost say,<br />but didn't?
        </h1>
        <p className="text-muted-foreground max-w-md mb-10 text-sm leading-relaxed sacred-reveal sacred-reveal-delay-1">
          Press the circle below. Speak freely. No timer, no judgment.
          Your voice becomes an echo — preserved in your vault.
        </p>
        <div className="flex gap-3 mb-10 sacred-reveal sacred-reveal-delay-2">
          <button
            onClick={() => setMode("vault")}
            className={`px-6 py-2.5 rounded-full text-sm font-serif-sacred tracking-wider transition-all duration-300 ${
              mode === "vault" ? "bg-amber/15 text-amber border border-amber/25 glow-amber" : "text-muted-foreground border border-border/50 hover:border-amber/20"
            }`}
          >
            Vault
          </button>
          <button
            onClick={() => setMode("future_self")}
            className={`px-6 py-2.5 rounded-full text-sm font-serif-sacred tracking-wider transition-all duration-300 ${
              mode === "future_self" ? "bg-amber/15 text-amber border border-amber/25 glow-amber" : "text-muted-foreground border border-border/50 hover:border-amber/20"
            }`}
          >
            Future Self
          </button>
        </div>
        <LiquidRipple
          onClick={startRecording}
          className="relative w-24 h-24 rounded-full bg-amber/8 border-2 border-amber/25 flex items-center justify-center hover:bg-amber/15 transition-all duration-500 active:scale-95 glow-amber-strong sacred-reveal sacred-reveal-delay-3"
        >
          <div className="absolute inset-0 rounded-full bg-amber/5 animate-ping" style={{ animationDuration: "3s" }} />
          <Mic className="h-10 w-10 text-amber/80" />
        </LiquidRipple>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Greeting */}
      <div className="mb-8 sacred-reveal">
        <h1 className="font-serif-sacred text-2xl text-foreground tracking-wide">{greeting()}</h1>
        <p className="text-muted-foreground/70 text-sm mt-1.5 font-light">What echoes through you today?</p>
      </div>

      {/* Mode toggle */}
        <div className="flex gap-3 mb-6 sacred-reveal sacred-reveal-delay-1">
        <LiquidRipple
          onClick={() => setMode("vault")}
          className={`flex-1 rounded-xl transition-all duration-300 ${
            mode === "vault" ? "glass-warm text-amber glow-amber" : "text-muted-foreground border border-border/50 hover:border-amber/15"
          }`}
        >
          <span className="block px-4 py-3 text-sm font-medium">Vault</span>
        </LiquidRipple>
        <LiquidRipple
          onClick={() => setMode("future_self")}
          className={`flex-1 rounded-xl transition-all duration-300 ${
            mode === "future_self" ? "glass-warm text-amber glow-amber" : "text-muted-foreground border border-border/50 hover:border-amber/15"
          }`}
        >
          <span className="block px-4 py-3 text-sm font-medium">Future Self</span>
        </LiquidRipple>
      </div>

      {/* Future Self seal duration */}
      {mode === "future_self" && !isRecording && !audioBlob && (
        <div className="mb-6 p-4 rounded-xl glass-warm sacred-reveal sacred-reveal-delay-1">
          <label className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-serif-sacred">Seal for</label>
          <div className="flex gap-2 mt-3 flex-wrap">
            {[
              { days: 30, label: "1 month" },
              { days: 180, label: "6 months" },
              { days: 365, label: "1 year" },
              { days: 1825, label: "5 years" },
            ].map(opt => (
              <LiquidRipple
                key={opt.days}
                onClick={() => setUnlockDays(opt.days)}
                className={`rounded-lg transition-all duration-300 ${
                  unlockDays === opt.days ? "bg-amber/15 text-amber border border-amber/25" : "text-muted-foreground border border-border/30 hover:border-amber/15 hover:text-foreground"
                }`}
              >
                <span className="block px-4 py-2 text-xs font-serif-sacred tracking-wide">{opt.label}</span>
              </LiquidRipple>
            ))}
          </div>
        </div>
      )}

      {/* Ambience selector */}
      <div className="mb-8 sacred-reveal sacred-reveal-delay-2">
        <label className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-serif-sacred">Ambience</label>
        <div className="flex gap-2 mt-3">
          {AMBIENCE_OPTIONS.map(opt => (
            <LiquidRipple
              key={opt.value}
              onClick={() => setAmbience(opt.value)}
              className={`rounded-full transition-all duration-300 ${
                ambience === opt.value ? "bg-amber/15 text-amber border border-amber/25" : "text-muted-foreground/70 border border-border/30 hover:border-amber/15 hover:text-foreground"
              }`}
            >
              <span className="block px-4 py-2 text-xs font-medium tracking-wide">{opt.label}</span>
            </LiquidRipple>
          ))}
        </div>
      </div>

      {/* Recording button / waveform */}
      <div className="flex flex-col items-center mb-10 sacred-reveal sacred-reveal-delay-3">
        {isRecording ? (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-end gap-[2px] h-12" ref={waveformRef}></div>
            <button
              onClick={stopRecording}
              className="w-14 h-14 rounded-full bg-destructive/60 border border-destructive/30 flex items-center justify-center hover:bg-destructive/80 transition-all duration-300 active:scale-95"
            >
              <Square className="h-5 w-5 text-destructive-foreground" />
            </button>
            <span className="text-muted-foreground/70 text-sm tabular-nums font-light">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}
            </span>
          </div>
        ) : audioBlob ? (
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-16 h-16 rounded-full bg-amber/8 border border-amber/20 flex items-center justify-center glow-amber">
              <Sparkle className="h-6 w-6 text-amber/70" />
            </div>
            <span className="text-muted-foreground/70 text-sm font-light">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")} recorded
            </span>
            <div className="flex items-center gap-3">
              {/* Play locally */}
              <LiquidRipple
                onClick={handlePlayLocal}
                className="rounded-full border border-border/40 text-muted-foreground hover:text-amber hover:border-amber/30 transition-all duration-300 active:success-pulse"
              >
                <span className="flex p-2.5" title="Preview your recording">
                  <Play className="h-4 w-4" />
                </span>
              </LiquidRipple>
              {/* Save locally */}
              <LiquidRipple
                onClick={handleLocalSave}
                className="rounded-full border border-border/40 text-muted-foreground hover:text-amber hover:border-amber/30 transition-all duration-300 active:success-pulse"
              >
                <span className="flex p-2.5" title="Save to your device">
                  <Download className="h-4 w-4" />
                </span>
              </LiquidRipple>
              <MagneticButton
                variant="outline"
                onClick={discardRecording}
                className="border-border/50 text-muted-foreground hover:border-amber/20 hover:text-foreground transition-all duration-300 ml-auto"
                disabled={isProcessing}
              >
                Discard
              </MagneticButton>
              <LiquidRipple
                className="rounded-xl"
              >
                <Button
                  onClick={handleSave}
                  className="bg-amber/80 hover:bg-amber text-primary-foreground shadow-lg shadow-amber/10 transition-all duration-300"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Review & Save"}
                </Button>
              </LiquidRipple>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <LiquidRipple
              onClick={startRecording}
              className="relative w-28 h-28 rounded-full bg-amber/6 border-2 border-amber/20 flex items-center justify-center hover:bg-amber/12 hover:border-amber/35 transition-all duration-500 active:scale-[0.95] glow-amber-strong breathing-pulse"
            >
              <div className="absolute inset-[-8px] rounded-full border border-amber/10" />
              <Mic className="h-10 w-10 text-amber/70" />
            </LiquidRipple>
            <span className="text-muted-foreground/60 text-sm font-light tracking-wide">Press to begin</span>
          </div>
        )}
      </div>

      {/* Save confirmation modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 bg-void/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-strong rounded-2xl p-7 max-w-md w-full max-h-[80vh] overflow-y-auto sacred-reveal glow-inner">
            <h3 className="font-serif-sacred text-xl text-foreground mb-6 tracking-wide">Review your echo</h3>

            {/* Mood */}
            <div className="mb-5">
              <label className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-serif-sacred">Mood</label>
              <input
                type="text"
                value={selectedMood || ""}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="mt-2 w-full bg-charcoal/50 border border-border/50 rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-amber/40 transition-colors duration-300"
                placeholder="tender, restless, hopeful..."
              />
            </div>

            {/* Collection */}
            <div className="mb-5">
              <label className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-serif-sacred">Collection</label>
              <select
                value={selectedCollectionId || ""}
                onChange={(e) => setSelectedCollectionId(e.target.value ? Number(e.target.value) : null)}
                className="mt-2 w-full bg-charcoal/50 border border-border/50 rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-amber/40 transition-colors duration-300"
              >
                <option value="">No collection</option>
                {collections.data?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-serif-sacred">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full bg-charcoal/50 border border-border/50 rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-amber/40 transition-colors duration-300"
                placeholder="A short title for this moment"
              />
            </div>

            {mode === "future_self" && (
              <p className="text-xs text-amber-dim mb-6 italic font-serif-sacred tracking-wide">
                This letter will be sealed for {unlockDays} days and cannot be opened until {new Date(Date.now() + unlockDays * 24 * 60 * 60 * 1000).toLocaleDateString()}.
              </p>
            )}

            <div className="flex gap-3">
              <MagneticButton
                variant="outline"
                onClick={discardRecording}
                className="flex-1 border-border/50 text-muted-foreground hover:border-amber/20 transition-all duration-300"
                disabled={isProcessing}
              >
                Discard
              </MagneticButton>
              <LiquidRipple className="flex-1">
                <Button
                  onClick={confirmSave}
                  className="w-full bg-amber/80 hover:bg-amber text-primary-foreground shadow-lg shadow-amber/10 transition-all duration-300 active:success-pulse"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Saving..." : mode === "future_self" ? "Seal it" : "Preserve"}
                </Button>
              </LiquidRipple>
            </div>
          </div>
        </div>
      )}

      {/* Recent echoes */}
      {recentEchoes.data && recentEchoes.data.length > 0 && (
        <div className="mt-10 border-t border-border/20 pt-6">
          <h3 className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-serif-sacred mb-4">Recent echoes</h3>
          {recentEchoes.data.map((echo) => (
            <div key={echo.id} className="py-4 border-b border-border/15 last:border-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/90 font-light">{echo.title || "Untitled"}</span>
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                  {Math.floor(echo.durationSec / 60)}:{Math.floor(echo.durationSec % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1.5 line-clamp-1 font-light">
                {echo.transcript || "No transcript"}
              </p>
              {echo.mood && (
                <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-amber/8 text-amber-dim border border-amber/10 tracking-wider">
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
