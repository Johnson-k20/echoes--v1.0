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
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber/10 blur-xl" />
          <Loader2 className="h-6 w-6 animate-spin text-amber/70 relative" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-4 relative overflow-hidden">
        <AmbientOrbs />
        <div className="text-center space-y-6 relative z-10">
          <h1 className="font-serif-sacred text-3xl text-foreground tracking-wide glow-text-amber">Echoes</h1>
          <p className="text-muted-foreground/60 max-w-md font-light">
            Your voice, preserved. Your future self, sealed.
          </p>
          <Button 
            onClick={() => startLogin()}
            className="bg-amber/80 hover:bg-amber text-primary-foreground shadow-lg shadow-amber/10 transition-all duration-300"
          >
            Enter your vault
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Subtle ambient background */}
      <AmbientOrbs />
      <div className="fixed inset-0 bg-gradient-to-b from-void via-void to-charcoal/20 pointer-events-none z-0" />

      {/* Content above ambient */}
      <div className="relative z-10">
        <CursorGlow radius={200} />
        <ScrollProgress />
        {/* Mobile top nav */}
        <header className="sticky top-0 z-40 border-b border-border/15 bg-void/85 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <Link href="/">
                <span className="font-serif-sacred text-lg text-amber tracking-wider glow-text-amber">Echoes</span>
              </Link>
            </div>
            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-amber/8 text-amber glow-amber"
                          : "text-muted-foreground/50 hover:text-foreground/70 hover:bg-charcoal-lighter/30"
                      }`}
                      title={item.label}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </button>
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
                  <div className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all duration-300 ${
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
