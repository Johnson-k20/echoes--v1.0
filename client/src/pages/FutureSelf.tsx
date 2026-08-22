import { useState } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { journalService } from "@/services/journalService";
import { Button } from "@/components/ui/button";
import { Lock, LockOpen, Clock, Sparkle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function FutureSelf() {
  const sealedLetters = useAsyncResource(() => journalService.listByMode("future_self"), []);
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const revealedEcho = useAsyncResource(
    () => journalService.getById(revealedId!),
    [revealedId],
    revealedId !== null,
  );

  const locked = sealedLetters.data?.filter(e => !e.isUnlocked) || [];
  const unlocked = sealedLetters.data?.filter(e => e.isUnlocked) || [];

  if (sealedLetters.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-amber/20 border-t-amber/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (sealedLetters.data && sealedLetters.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Lock className="h-10 w-10 text-muted-foreground/25 mb-5" strokeWidth={1} />
        <p className="font-serif-sacred text-xl text-muted-foreground/60 tracking-wide">No sealed letters yet.</p>
        <p className="text-sm text-muted-foreground/40 mt-2 font-light">
          Record in Future Self mode to seal a letter for your future self.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="font-serif-sacred text-2xl text-foreground mb-1 tracking-wide">Future Self</h1>
      <p className="text-sm text-muted-foreground/50 mb-10 font-light">Letters sealed across time.</p>

      {/* Arrived letters */}
      {unlocked.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-xs text-muted-foreground/60 uppercase tracking-[0.2em] font-serif-sacred">Arrived</h3>
            <div className="flex-1 divider-sacred" />
          </div>
          <div className="space-y-3">
            {unlocked.map(echo => (
              <ScrollReveal key={echo.id}>
              <div>
                {revealedId === echo.id && revealedEcho.data ? (
                  <div className="glass-warm border border-amber/20 rounded-xl p-6 fade-in glow-inner">
                    {/* Ceremonial header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center">
                        <LockOpen className="h-4 w-4 text-amber" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-sm text-amber font-serif-sacred tracking-wide">Your letter has arrived</span>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5 tracking-wider">
                          Sealed {echo.sealDate ? format(new Date(echo.sealDate), "MMMM d, yyyy") : "Unknown"}
                        </p>
                      </div>
                    </div>

                    {/* Audio player */}
                    {echo.audioUrl && (
                      <audio controls className="w-full rounded-lg my-4 accent-amber" src={echo.audioUrl}>
                        Your browser does not support audio playback.
                      </audio>
                    )}

                    {/* Transcript */}
                    {echo.transcript && (
                      <p className="text-sm text-foreground/80 mt-3 p-4 glass rounded-lg border border-border/20 font-light leading-relaxed">
                        {echo.transcript}
                      </p>
                    )}

                    {/* Title */}
                    {echo.title && (
                      <p className="text-xs text-amber-dim mt-4 italic font-serif-sacred tracking-wide">{echo.title}</p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevealedId(null)}
                      className="mt-5 border-border/40 text-muted-foreground hover:border-amber/20 transition-all duration-300"
                    >
                      Close
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => setRevealedId(echo.id)}
                    className="glass-warm border border-amber/15 rounded-xl p-5 cursor-pointer hover:border-amber/25 transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-amber/8 border border-amber/20 flex items-center justify-center">
                        <Sparkle className="h-3.5 w-3.5 text-amber/60" />
                      </div>
                      <h3 className="text-sm font-medium text-foreground/90 font-serif-sacred tracking-wide">
                        {echo.title || "A letter from you"}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground/50 mt-1 font-light">
                      Arrived {echo.unlockDate ? format(new Date(echo.unlockDate), "MMM d, yyyy") : ""}
                    </p>
                    <p className="text-[10px] text-amber-dim/70 mt-2 italic tracking-wider">Tap to open</p>
                  </div>
                )}
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

      {/* Sealed letters */}
      {locked.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-xs text-muted-foreground/60 uppercase tracking-[0.2em] font-serif-sacred">Sealed</h3>
            <div className="flex-1 divider-sacred" />
          </div>
          <div className="space-y-3">
            {locked.map(echo => {
              const progress = echo.unlockDate && echo.sealDate
                ? Math.max(0, Math.min(100, ((Date.now() - new Date(echo.sealDate).getTime()) / (new Date(echo.unlockDate).getTime() - new Date(echo.sealDate).getTime())) * 100))
                : 0;

              return (
                <ScrollReveal key={echo.id}>
                <div className="glass border border-border/20 rounded-xl p-5 opacity-60 hover:opacity-80 transition-all duration-500 relative">
                  {/* Wax seal */}
                  <div className="absolute -top-2 -right-2 w-10 h-10 wax-seal rounded-full flex items-center justify-center z-10 shadow-lg">
                    <Lock className="h-3.5 w-3.5 text-amber-100/60" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-charcoal-lighter border border-border/30 flex items-center justify-center">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground/80 font-serif-sacred tracking-wide">Sealed letter</h3>
                  </div>
                  <div className="space-y-1.5 ml-11">
                    <p className="text-xs text-muted-foreground/60 font-light">
                      Sealed {echo.sealDate ? format(new Date(echo.sealDate), "MMMM d, yyyy") : "Recently"}
                    </p>
                    <p className="text-xs text-amber-dim/70 font-light">
                      Opens {echo.unlockDate ? format(new Date(echo.unlockDate), "MMMM d, yyyy") : "Unknown"}
                      {echo.unlockDate && (
                        <span className="text-muted-foreground/40"> ({formatDistanceToNow(new Date(echo.unlockDate), { addSuffix: false })} from now)</span>
                      )}
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-4 ml-11 h-[2px] bg-charcoal-lighter rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber/20 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
