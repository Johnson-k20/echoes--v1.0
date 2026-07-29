import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Lock, Mic, Clock, Sparkle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface EchoWithUnlock {
  id: number;
  userId: number;
  audioUrl: string | null;
  audioKey: string;
  transcript: string | null;
  durationSec: number;
  createdAt: Date;
  mood: string | null;
  collectionId: number | null;
  ambience: string | null;
  title: string | null;
  mode: "vault" | "future_self";
  sealDate: Date | null;
  unlockDate: Date | null;
  encryptedAudioKey: string | null;
  encrypted: boolean;
  isUnlocked: boolean;
}

export default function Timeline() {
  const echoes = trpc.echoes.list.useQuery(undefined);

  const grouped = useMemo(() => {
    if (!echoes.data) return [];
    const groups: Record<string, EchoWithUnlock[]> = {};
    echoes.data.forEach(e => {
      const date = new Date(e.createdAt);
      const key = format(date, "MMMM yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      const da = new Date(a + " 01");
      const db = new Date(b + " 01");
      return db.getTime() - da.getTime();
    });
  }, [echoes.data]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (echoes.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-amber/20 border-t-amber/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!echoes.data || echoes.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/30 mb-5" strokeWidth={1} />
        <p className="font-serif-sacred text-xl text-muted-foreground/70 tracking-wide">No echoes yet.</p>
        <p className="text-sm text-muted-foreground/40 mt-2 font-light">Press the circle to begin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="font-serif-sacred text-2xl text-foreground mb-10 tracking-wide">Timeline</h1>

      {grouped.map(([month, items], gi) => (
        <div key={month} className="mb-10 sacred-reveal" style={{ animationDelay: `${gi * 0.1}s` }}>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xs text-muted-foreground/60 uppercase tracking-[0.2em] font-serif-sacred">{month}</h2>
            <div className="flex-1 divider-sacred" />
          </div>
          <div className="space-y-3">
            {items.map((echo, ei) => (
              <div
                key={echo.id}
                className="glass rounded-xl p-5 transition-all duration-500 hover:bg-charcoal-lighter/60 group"
                style={{ animationDelay: `${(gi * items.length + ei) * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-8 h-8 rounded-full bg-amber/5 border border-amber/15 flex items-center justify-center shrink-0">
                    {echo.mode === "future_self" && !echo.isUnlocked ? (
                      <Lock className="h-3.5 w-3.5 text-amber/50" strokeWidth={1.5} />
                    ) : (
                      <Mic className="h-3.5 w-3.5 text-amber/50" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground/90 truncate">
                      {echo.isUnlocked ? (echo.title || "Untitled") : "Sealed letter"}
                    </h3>
                    <p className="text-xs text-muted-foreground/60 mt-1.5 line-clamp-2 font-light leading-relaxed">
                      {echo.isUnlocked
                        ? (echo.transcript || "No transcript available")
                        : `Sealed ${echo.sealDate ? format(new Date(echo.sealDate), "MMM d, yyyy") : "recently"} · Opens ${echo.unlockDate ? format(new Date(echo.unlockDate), "MMM d, yyyy") : "unknown date"}`}
                    </p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <span className="text-[10px] text-muted-foreground/50 tabular-nums tracking-wide">
                        {formatDuration(echo.durationSec)}
                      </span>
                      {echo.mood && echo.isUnlocked && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber/6 text-amber-dim border border-amber/8 tracking-wider">
                          {echo.mood}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/40 tracking-wide">
                        {formatDistanceToNow(new Date(echo.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  {echo.mode === "future_self" && !echo.isUnlocked && (
                    <div className="shrink-0 w-6 h-6 rounded-full bg-amber/5 flex items-center justify-center">
                      <Sparkle className="h-3 w-3 text-amber/30" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
