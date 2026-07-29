import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkles, Calendar } from "lucide-react";

export default function Insights() {
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const insight = trpc.insights.get.useQuery({ periodMonth: selectedMonth });

  // Generate available months for selection
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
        <div className="w-6 h-6 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="font-serif-display text-2xl text-foreground mb-2">Insights</h1>
      <p className="text-sm text-muted-foreground mb-8">A quiet reflection on what you've spoken.</p>

      {/* Month selector */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {availableMonths.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
              selectedMonth === m
                ? "bg-amber/20 text-amber border border-amber/30"
                : "text-muted-foreground border border-border/30 hover:border-border/50"
            }`}
          >
            {monthLabel(m)}
          </button>
        ))}
      </div>

      {insight.data ? (
        <div className="space-y-8">
          {/* Generated observation */}
          {insight.data.generatedObservation && (
            <div className="bg-charcoal-light border border-border/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-amber/60" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Observation</span>
              </div>
              <p className="font-serif-display text-lg text-foreground leading-relaxed italic">
                "{insight.data.generatedObservation}"
              </p>
            </div>
          )}

          {/* Word cloud */}
          {insight.data.topWords && Array.isArray(insight.data.topWords) && insight.data.topWords.length > 0 && (
            <div className="bg-charcoal-light border border-border/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-amber/60" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Recurring words</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.data.topWords.map((word: string, i: number) => {
                  const size = Math.max(12, 22 - i * 1.2);
                  const opacity = Math.max(0.4, 1 - i * 0.06);
                  return (
                    <span
                      key={word}
                      className="text-amber-dim"
                      style={{ fontSize: `${size}px`, opacity }}
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
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Sparkles className="h-10 w-10 text-muted-foreground/40 mb-4" />
          <p className="font-serif-display text-lg text-muted-foreground">No insights yet for this month.</p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            Record more echoes to generate a reflection.
          </p>
        </div>
      )}
    </div>
  );
}
