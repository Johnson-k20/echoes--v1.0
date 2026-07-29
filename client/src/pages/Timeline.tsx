import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Lock, Mic, Clock } from "lucide-react";
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
        <div className="w-6 h-6 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  if (!echoes.data || echoes.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/40 mb-4" />
        <p className="font-serif-display text-xl text-muted-foreground">No echoes yet.</p>
        <p className="text-sm text-muted-foreground/60 mt-2">Press the circle to begin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="font-serif-display text-2xl text-foreground mb-8">Timeline</h1>

      {grouped.map(([month, items]) => (
        <div key={month} className="mb-8">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-sans">{month}</h2>
          <div className="space-y-3">
            {items.map((echo) => (
              <div key={echo.id} className="bg-charcoal-light border border-border/30 rounded-xl p-4 transition-all hover:border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {echo.mode === "future_self" && !echo.isUnlocked ? (
                        <Lock className="h-3.5 w-3.5 text-amber/60" />
                      ) : (
                        <Mic className="h-3.5 w-3.5 text-amber/60" />
                      )}
                      <h3 className="text-sm font-medium text-foreground">
                        {echo.isUnlocked ? (echo.title || "Untitled") : "Sealed letter"}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {echo.isUnlocked
                        ? (echo.transcript || "No transcript available")
                        : `Sealed ${echo.sealDate ? format(new Date(echo.sealDate), "MMM d, yyyy") : "recently"} · Opens ${echo.unlockDate ? format(new Date(echo.unlockDate), "MMM d, yyyy") : "unknown date"}`}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                        {formatDuration(echo.durationSec)}
                      </span>
                      {echo.mood && echo.isUnlocked && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber/10 text-amber-dim">
                          {echo.mood}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/40">
                        {formatDistanceToNow(new Date(echo.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
