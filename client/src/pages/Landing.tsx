import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mic, Lock, Sparkles, Star } from "lucide-react";
import { AmbientOrbs, ParticleField } from "@/components/AmbientEffects";
import { CursorGlow } from "@/components/CursorGlow";
import { MagneticButton } from "@/components/MagneticButton";
import { AnimatedGrain } from "@/components/AnimatedGrain";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-void text-foreground relative overflow-hidden">
      {/* Atmospheric background */}
      <CursorGlow radius={250} />
      <AmbientOrbs />
      <ParticleField count={25} />
      <AnimatedGrain opacity={0.02} />

      {/* Content above ambient */}
      <div className="relative z-10">
        {/* Nav */}
        <header className="flex items-center justify-between px-6 lg:px-12 h-16 glass-warm">
          <span className="font-serif-display text-xl text-amber glow-text-amber tracking-wide">
            Echoes
          </span>
          {isAuthenticated ? (
            <Link href="/app">
              <Button variant="outline" className="border-amber/30 text-amber hover:bg-amber/10 hover:text-amber transition-all duration-300">
                Enter the chamber
              </Button>
            </Link>
          ) : (
            <MagneticButton
              onClick={() => startLogin()}
              className="bg-amber/80 hover:bg-amber text-primary-foreground shadow-lg shadow-amber/10 transition-all duration-300"
            >
              Enter
            </MagneticButton>
          )}
        </header>

        {/* Hero */}
        <section className="px-6 lg:px-12 pt-24 lg:pt-36 pb-20 lg:pb-32 relative">
          {/* Floating orb behind hero text */}
          <div className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-amber/5 blur-[100px] pointer-events-none" />

          <div className="max-w-4xl mx-auto lg:grid lg:grid-cols-5 lg:gap-12">
            <div className="lg:col-span-3 space-y-8">
              <h1 className="font-serif-sacred text-4xl lg:text-7xl leading-[1.05] text-foreground sacred-reveal">
                Some thoughts<br />
                deserve more<br />
                than a{" "}
                <span className="text-amber glow-text-amber">memory</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-md leading-relaxed sacred-reveal sacred-reveal-delay-1">
                Press once. Speak freely. Your voice becomes an echo —
                preserved, sealed, or sent to your future self.
              </p>
              <div className="sacred-reveal sacred-reveal-delay-2">
                {isAuthenticated ? (
                  <Link href="/app">
                    <Button
                      size="lg"
                      className="bg-amber/80 hover:bg-amber text-primary-foreground text-lg px-10 py-7 shadow-lg shadow-amber/15 hover:shadow-amber/25 transition-all duration-500"
                    >
                      Begin recording
                    </Button>
                  </Link>
                ) : (
                  <MagneticButton
                    onClick={() => startLogin()}
                    size="lg"
                    className="bg-amber/80 hover:bg-amber text-primary-foreground text-lg px-10 py-7 shadow-lg shadow-amber/15 hover:shadow-amber/25 transition-all duration-500"
                  >
                    Begin recording
                  </MagneticButton>
                )}
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-2">
              <div className="h-full flex items-center justify-center relative">
                {/* Luminous mic orb */}
                <div className="relative">
                  <div className="w-56 h-56 rounded-full bg-amber/[0.04] border border-amber/10 flex items-center justify-center breathing-pulse">
                    <div className="w-44 h-44 rounded-full bg-amber/[0.06] border border-amber/15 flex items-center justify-center breathing-pulse" style={{ animationDelay: "0.5s" }}>
                      <div className="w-32 h-32 rounded-full bg-amber/[0.08] border border-amber/20 flex items-center justify-center breathing-pulse" style={{ animationDelay: "1s" }}>
                        <Mic className="h-12 w-12 text-amber/50 candle-flicker" />
                      </div>
                    </div>
                  </div>
                  {/* Soft glow ring */}
                  <div className="absolute inset-0 rounded-full bg-amber/5 blur-2xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="divider-sacred" />
        </div>

        {/* Two modes */}
        <section className="px-6 lg:px-12 py-24 lg:py-36 relative">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Vault */}
            <div className="space-y-6 sacred-reveal sacred-reveal-delay-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full glass-warm flex items-center justify-center glow-amber">
                  <Mic className="h-5 w-5 text-amber" />
                </div>
                <h2 className="font-serif-sacred text-2xl lg:text-3xl text-foreground tracking-wide">
                  The Vault
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-base lg:text-lg">
                A frictionless, timer-free way to speak a thought into a mood-tagged,
                ambient-sound-backed memory capsule. No dashboards. No streaks.
                Just your voice, your moment, preserved exactly as it was.
              </p>
              <p className="text-sm text-amber-dim italic font-serif-sacred tracking-wide">
                Press once to begin. Press again when you're done.
              </p>
            </div>

            {/* Future Self */}
            <div className="space-y-6 sacred-reveal sacred-reveal-delay-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full glass-warm flex items-center justify-center glow-amber">
                  <Lock className="h-5 w-5 text-amber" />
                </div>
                <h2 className="font-serif-sacred text-2xl lg:text-3xl text-foreground tracking-wide">
                  Future Self
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-base lg:text-lg">
                Record a voice letter and seal it for a month, a year, five years.
                Genuinely time-locked — not a UI convention, but real cryptographic
                enforcement. It cannot be opened before the date you chose.
                Not even by you.
              </p>
              <p className="text-sm text-amber-dim italic font-serif-sacred tracking-wide">
                When the date arrives, your letter comes home.
              </p>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="px-6 lg:px-12 py-24 lg:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber/[0.02] to-transparent pointer-events-none" />
          <div className="max-w-2xl mx-auto text-center space-y-8 relative">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Star className="h-4 w-4 text-amber/40" />
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-serif-sacred">
                Our belief
              </span>
              <Star className="h-4 w-4 text-amber/40" />
            </div>
            <blockquote className="font-serif-sacred text-2xl lg:text-4xl text-foreground leading-relaxed">
              "AI listens softly, never replacing your words.
              <br />
              Privacy is provable, not just claimed.
              <br />
              <span className="text-amber">And the lock is real.</span>"
            </blockquote>
            <div className="divider-sacred max-w-xs mx-auto" />
            <p className="text-muted-foreground max-w-lg mx-auto text-sm lg:text-base leading-relaxed">
              One-tap full archive export. Client-side encryption for sealed letters.
              No third-party analytics touching your voice.
              Your memories belong to you — always.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-12 py-10 border-t border-border/20">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="font-serif-display text-sm text-muted-foreground tracking-wide">Echoes</span>
            <span className="text-xs text-muted-foreground/50 tracking-wider">
              Private by default · End-to-end encrypted
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
