import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Lock, LockOpen, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function FutureSelf() {
  const sealedLetters = trpc.echoes.byMode.useQuery({ mode: "future_self" });
  const [revealedId, setRevealedId] = useState<number | null>(null);

  const revealedEcho = trpc.echoes.get.useQuery(
    { id: revealedId! },
    { enabled: revealedId !== null }
  );

  // Split into locked and unlocked
  const locked = sealedLetters.data?.filter(e => !e.isUnlocked) || [];
  const unlocked = sealedLetters.data?.filter(e => e.isUnlocked) || [];

  // Check for newly unlocked letters
  const [arrivedLetters, setArrivedLetters] = useState<number[]>([]);

  if (sealedLetters.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  if (sealedLetters.data && sealedLetters.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Lock className="h-10 w-10 text-muted-foreground/40 mb-4" />
        <p className="font-serif-display text-xl text-muted-foreground">No sealed letters yet.</p>
        <p className="text-sm text-muted-foreground/60 mt-2">
          Record in Future Self mode to seal a letter for your future self.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="font-serif-display text-2xl text-foreground mb-2">Future Self</h1>
      <p className="text-sm text-muted-foreground mb-8">Letters sealed across time.</p>

      {/* Arrived letters */}
      {unlocked.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Arrived</h3>
          <div className="space-y-3">
            {unlocked.map(echo => (
              <div key={echo.id}>
                {revealedId === echo.id && revealedEcho.data ? (
                  <div className="bg-charcoal-light border border-amber/30 rounded-xl p-5 fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <LockOpen className="h-4 w-4 text-amber" />
                      <span className="text-sm text-amber">Your letter has arrived</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p>Sealed: {echo.sealDate ? format(new Date(echo.sealDate), "MMMM d, yyyy") : "Unknown"}</p>
                      <p>Arrived: {echo.unlockDate ? format(new Date(echo.unlockDate), "MMMM d, yyyy") : "Unknown"}</p>
                      {echo.durationSec > 0 && (
                        <p>Duration: {Math.floor(echo.durationSec / 60)}:{Math.floor(echo.durationSec % 60).toString().padStart(2, "0")}</p>
                      )}
                    </div>
                    {echo.audioUrl && (
                      <audio controls className="w-full rounded-lg" src={echo.audioUrl}>
                        Your browser does not support audio playback.
                      </audio>
                    )}
                    {echo.transcript && (
                      <p className="text-sm text-foreground mt-3 p-3 bg-charcoal rounded-lg border border-border/20">
                        {echo.transcript}
                      </p>
                    )}
                    {echo.title && (
                      <p className="text-xs text-amber-dim mt-3 italic">{echo.title}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevealedId(null)}
                      className="mt-4 border-border text-muted-foreground"
                    >
                      Close
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => setRevealedId(echo.id)}
                    className="bg-charcoal-light border border-border/30 rounded-xl p-4 cursor-pointer hover:border-amber/20 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <LockOpen className="h-3.5 w-3.5 text-amber" />
                      <h3 className="text-sm font-medium text-foreground">{echo.title || "A letter from you"}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Arrived {echo.unlockDate ? format(new Date(echo.unlockDate), "MMM d, yyyy") : ""}
                    </p>
                    <p className="text-[10px] text-amber-dim mt-1 italic">Tap to open</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sealed letters */}
      {locked.length > 0 && (
        <div>
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Sealed</h3>
          <div className="space-y-3">
            {locked.map(echo => (
              <div key={echo.id} className="bg-charcoal-light border border-border/20 rounded-xl p-4 opacity-70">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <h3 className="text-sm font-medium text-muted-foreground">Sealed letter</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground/80">
                    Sealed: {echo.sealDate ? format(new Date(echo.sealDate), "MMMM d, yyyy") : "Recently"}
                  </p>
                  <p className="text-xs text-amber-dim">
                    Opens: {echo.unlockDate ? format(new Date(echo.unlockDate), "MMMM d, yyyy") : "Unknown"}
                    {" "}({formatDistanceToNow(new Date(echo.unlockDate || Date.now()), { addSuffix: false })} from now)
                  </p>
                </div>
                <div className="mt-3 h-1 bg-charcoal rounded-full overflow-hidden">
                  {echo.unlockDate && (
                    <div
                      className="h-full bg-amber/30 rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, ((Date.now() - new Date(echo.sealDate || Date.now()).getTime()) / (new Date(echo.unlockDate).getTime() - new Date(echo.sealDate || Date.now()).getTime())) * 100))}%`
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
