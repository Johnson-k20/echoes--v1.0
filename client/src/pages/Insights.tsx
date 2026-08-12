import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkles, Calendar } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Insights() {
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const insight = trpc.insights.get.useQuery({ periodMonth: selectedMonth });

  const availableMonths = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`);
    }
    return months;
  }, []);

  const monthLabel = (m: string) => {
    const [year, month] = m.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (insight.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-amber/20 border-t-amber/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="font-serif-sacred text-2xl text-foreground mb-1 tracking-wide">Insights</h1>
      <p className="text-sm text-muted-foreground/50 mb-10 font-light">A quiet reflection on what you've spoken.</p>

      {/* Month selector */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
        {availableMonths.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-full text-xs font-serif-sacred tracking-wide whitespace-nowrap transition-all duration-300 ${
              selectedMonth === m
                ? "glass-warm text-amber border border-amber/20"
                : "text-muted-foreground/60 border border-border/20 hover:border-amber/10 hover:text-foreground"
            }`}
          >
            {monthLabel(m)}
          </button>
        ))}
      </div>

      {insight.data ? (
        <div className="space-y-10">
          {/* Generated observation */}
          {insight.data.generatedObservation && (
            <div className="glass-warm rounded-xl p-8 relative overflow-hidden sacred-reveal">
              {/* Subtle ambient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber/5 blur-[60px] pointer-events-none" />

              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-4 w-4 text-amber/50" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground/60 uppercase tracking-[0.2em] font-serif-sacred">Observation</span>
              </div>
              <p className="font-serif-sacred text-xl lg:text-2xl text-foreground/90 leading-[1.6] tracking-wide">
                "{insight.data.generatedObservation}"
              </p>
            </div>
          )}

          {/* Word cloud */}
          {insight.data.topWords && Array.isArray(insight.data.topWords) && insight.data.topWords.length > 0 && (
            <div className="glass rounded-xl p-8 sacred-reveal sacred-reveal-delay-1">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-4 w-4 text-amber/50" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground/60 uppercase tracking-[0.2em] font-serif-sacred">Recurring words</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-3 items-baseline justify-center">
                {insight.data.topWords.map((word: string, i: number) => {
                  const size = Math.max(14, 28 - i * 1.5);
                  const opacity = Math.max(0.3, 1 - i * 0.05);
                  return (
                    <span
                      key={word}
                      className="font-serif-sacred text-amber-dim/80 tracking-wide hover:text-amber transition-colors duration-300 cursor-default"
                      style={{
                        fontSize: `${size}px`,
                        opacity: opacity * 0.7 + 0.3,
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center sacred-reveal">
          <Sparkles className="h-10 w-10 text-muted-foreground/25 mb-5" strokeWidth={1} />
          <p className="font-serif-sacred text-lg text-muted-foreground/60 tracking-wide">No insights yet for this month.</p>
          <p className="text-sm text-muted-foreground/40 mt-2 font-light">
            Record more echoes to generate a reflection.
          </p>
        </div>
      )}
    </div>
  );
}
