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
  ArrowLeft
} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-glow" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <h1 className="font-serif-display text-3xl text-foreground">Echoes</h1>
          <p className="text-muted-foreground max-w-md">
            Your voice, preserved. Your future self, sealed.
          </p>
          <Button 
            onClick={() => startLogin()}
            className="bg-amber/90 hover:bg-amber text-primary-foreground"
          >
            Enter your vault
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal grain-overlay">
      {/* Mobile top nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-charcoal/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link href="/">
              <span className="font-serif-display text-lg text-amber">Echoes</span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-amber/10 text-amber"
                        : "text-muted-foreground hover:text-foreground hover:bg-charcoal-lighter"
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4" />
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
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/50 bg-charcoal/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-around px-2 h-16">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                  isActive ? "text-amber" : "text-muted-foreground"
                }`}>
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
