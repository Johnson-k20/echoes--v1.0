import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mic, Lock, Sparkles } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-charcoal grain-overlay text-foreground">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 lg:px-12 h-16 border-b border-border/30">
        <span className="font-serif-display text-xl text-amber">Echoes</span>
        {isAuthenticated ? (
          <Link href="/app">
            <Button variant="outline" className="border-amber/30 text-amber hover:bg-amber/10 hover:text-amber">
              Enter
            </Button>
          </Link>
        ) : (
          <Button 
            onClick={() => startLogin()}
            className="bg-amber/90 hover:bg-amber text-primary-foreground"
          >
            Enter
          </Button>
        )}
      </header>

      {/* Hero */}
      <section className="px-6 lg:px-12 pt-20 lg:pt-32 pb-16 lg:pb-24">
        <div className="max-w-4xl mx-auto lg:grid lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3 space-y-8">
            <h1 className="font-serif-display text-4xl lg:text-6xl leading-[1.1] text-foreground">
              Some thoughts<br />
              deserve more<br />
              than a <span className="text-amber">memory</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-md leading-relaxed">
              Press once. Speak freely. Your voice becomes an echo — 
              preserved, sealed, or sent to your future self.
            </p>
            {isAuthenticated ? (
              <Link href="/app">
                <Button 
                  size="lg"
                  className="bg-amber/90 hover:bg-amber text-primary-foreground text-lg px-8"
                >
                  Begin recording
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => startLogin()}
                size="lg"
                className="bg-amber/90 hover:bg-amber text-primary-foreground text-lg px-8"
              >
                Begin recording
              </Button>
            )}
          </div>
          <div className="hidden lg:block lg:col-span-2">
            <div className="h-full flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-amber/5 border border-amber/10 flex items-center justify-center">
                <Mic className="h-16 w-16 text-amber/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two modes */}
      <section className="px-6 lg:px-12 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Vault */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <Mic className="h-5 w-5 text-amber" />
              </div>
              <h2 className="font-serif-display text-2xl text-foreground">The Vault</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              A frictionless, timer-free way to speak a thought into a mood-tagged, 
              ambient-sound-backed memory capsule. No dashboards. No streaks. 
              Just your voice, your moment, preserved exactly as it was.
            </p>
            <p className="text-sm text-amber-dim italic">
              Press once to begin. Press again when you're done.
            </p>
          </div>

          {/* Future Self */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-amber" />
              </div>
              <h2 className="font-serif-display text-2xl text-foreground">Future Self</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Record a voice letter and seal it for a month, a year, five years. 
              Genuinely time-locked — not a UI convention, but real cryptographic 
              enforcement. It cannot be opened before the date you chose. 
              Not even by you.
            </p>
            <p className="text-sm text-amber-dim italic">
              When the date arrives, your letter comes home.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-6 lg:px-12 py-20 lg:py-32 border-t border-border/30">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Sparkles className="h-5 w-5 text-amber/60" />
            <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Our belief</span>
            <Sparkles className="h-5 w-5 text-amber/60" />
          </div>
          <blockquote className="font-serif-display text-2xl lg:text-3xl text-foreground leading-relaxed">
            "AI listens softly, never replacing your words. 
            Privacy is provable, not just claimed. 
            And the lock is real."
          </blockquote>
          <p className="text-muted-foreground max-w-lg mx-auto">
            One-tap full archive export. Client-side encryption for sealed letters. 
            No third-party analytics touching your voice. 
            Your memories belong to you — always.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 border-t border-border/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-serif-display text-sm text-muted-foreground">Echoes</span>
          <span className="text-xs text-muted-foreground/60">Private by default · End-to-end encrypted</span>
        </div>
      </footer>
    </div>
  );
}
