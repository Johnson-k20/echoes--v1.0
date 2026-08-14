import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  Clock, 
  FolderOpen, 
  Lock, 
  Sparkles, 
  Settings as SettingsIcon,
  Home,
} from "lucide-react";
import { AmbientOrbs, ParticleField } from "@/components/AmbientEffects";
import { CursorGlow } from "@/components/CursorGlow";
import { ScrollProgress } from "@/components/ScrollProgress";
import { AnimatedGrain } from "@/components/AnimatedGrain";

const navItems = [
  { href: "/app", icon: Home, label: "Home" },
  { href: "/timeline", icon: Clock, label: "Timeline" },
  { href: "/collections", icon: FolderOpen, label: "Collections" },
  { href: "/future-self", icon: Lock, label: "Future Self" },
  { href: "/insights", icon: Sparkles, label: "Insights" },
  { href: "/settings", icon: SettingsIcon, label: "Settings" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden px-6">
        <AmbientOrbs />
        <AnimatedGrain opacity={0.03} />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-7" aria-hidden="true">
            <div className="absolute inset-[-18px] rounded-full border border-amber/10" />
            <div className="absolute inset-[-8px] rounded-full border border-amber/20" />
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber/35 bg-amber/10 shadow-[0_0_42px_rgba(213,166,72,0.12)]">
              <Mic className="h-6 w-6 text-amber" strokeWidth={1.4} />
            </div>
          </div>
          <div role="status" aria-live="polite" className="flex items-center gap-2 text-amber/80">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="font-serif-sacred text-sm tracking-[0.18em] uppercase">Opening the vault</span>
          </div>
          <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-muted-foreground/70">
            Preparing a quiet place for your words.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-4 relative overflow-hidden">
        <AmbientOrbs />
        <section className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-amber/30 bg-amber/10 shadow-[0_0_56px_rgba(213,166,72,0.14)]" aria-hidden="true">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber/20">
              <Mic className="h-6 w-6 text-amber" strokeWidth={1.35} />
            </div>
          </div>
          <p className="font-serif-sacred text-[10px] tracking-[0.24em] text-amber/80 uppercase">Your private memory archive</p>
          <h1 className="mt-4 font-serif-sacred text-4xl leading-tight text-foreground tracking-wide glow-text-amber">Echoes</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm font-light leading-relaxed text-muted-foreground/70">
            A deliberate space for the words you want to preserve now, or leave for your future self.
          </p>
          <Button
            onClick={() => startLogin()}
            className="mt-8 bg-amber/85 px-6 text-primary-foreground shadow-lg shadow-amber/15 transition-all duration-300 hover:bg-amber"
          >
            Enter your vault
          </Button>
          <p className="mt-4 text-[11px] tracking-wide text-muted-foreground/45">Private by default. Your voice remains yours.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Subtle ambient background */}
      <AmbientOrbs />
      <AnimatedGrain opacity={0.025} />
      <div className="fixed inset-0 bg-gradient-to-b from-void via-void to-charcoal/20 pointer-events-none z-0" />

      {/* Content above ambient */}
      <div className="relative z-10">
        <CursorGlow radius={200} />
        <ScrollProgress />
        {/* Mobile top nav */}
        <header className="sticky top-0 z-40 border-b border-border/15 bg-void/85 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <Link href="/" className="group flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-amber/30 bg-amber/10 transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                  <Mic className="h-3.5 w-3.5 text-amber" strokeWidth={1.5} />
                </span>
                <span className="font-serif-sacred text-lg text-amber tracking-wider glow-text-amber">Echoes</span>
              </Link>
            </div>
            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`p-2 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 ${
                        isActive
                          ? "bg-amber/8 text-amber glow-amber"
                          : "text-muted-foreground/50 hover:text-foreground/70 hover:bg-charcoal-lighter/30"
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="pb-20">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/15 bg-void/90 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-around px-2 h-16">
            {navItems.slice(0, 5).map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div aria-current={isActive ? "page" : undefined} className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all duration-300 ${
                    isActive ? "text-amber" : "text-muted-foreground/40 hover:text-muted-foreground/70"
                  }`}>
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                    <span className="text-[10px] tracking-wider font-serif-sacred">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
