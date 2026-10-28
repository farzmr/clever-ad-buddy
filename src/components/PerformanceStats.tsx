import { topSegments, type Segment } from "@/lib/mock-data";
import { TrendingUp, TrendingDown } from "lucide-react";

const fmt = (n: number) => n.toLocaleString();
const usd = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface PerformanceStatsProps {
  performance?: {
    segments: Segment[];
    bestSegment?: Segment & { cvr: number; description?: string };
    worstSegment?: Segment & { cvr: number; multiplier?: number; description?: string };
  };
  summary?: string;
}

export function PerformanceStats({ performance, summary }: PerformanceStatsProps) {
  const segments = performance?.segments && performance.segments.length > 0 ? performance.segments : topSegments;
  
  const best = performance?.bestSegment || {
    ...segments[0],
    cvr: ((segments[0].conversions / (segments[0].clicks || 1)) * 100),
    description: "Mobile at night is your gold mine — high intent, low friction checkout.",
  };

  const worst = performance?.worstSegment || {
    ...segments[segments.length - 1],
    cvr: ((segments[segments.length - 1].conversions / (segments[segments.length - 1].clicks || 1)) * 100),
    multiplier: ((segments[segments.length - 1].cpc || 1) / (best.cpc || 1)),
    description: "Tablet morning sessions show high clicks but low purchase intent.",
  };

  return (
    <section className="glass rounded-3xl p-6 md:p-8 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent mb-1">Agent 2</div>
          <h2 className="text-2xl font-semibold">Performance Stats &amp; Segments</h2>
          <p className="text-sm text-muted-foreground mt-1">Top device × time segments and where the money works.</p>
        </div>
      </header>

      {summary && (
        <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-accent uppercase mr-2 tracking-wider">Agent Synthesis:</span>
          {summary}
        </div>
      )}

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
              <th className="py-3 pr-4 font-medium">Segment</th>
              <th className="py-3 pr-4 font-medium text-right">Impressions</th>
              <th className="py-3 pr-4 font-medium text-right">Clicks</th>
              <th className="py-3 pr-4 font-medium text-right">Conversions</th>
              <th className="py-3 pr-4 font-medium text-right">Spend</th>
              <th className="py-3 pr-4 font-medium text-right">Cost / Conv.</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s, i) => {
              const isBest = s.device === best.device && s.time === best.time;
              const isWorst = s.device === worst.device && s.time === worst.time;

              return (
                <tr key={i} className="border-b border-border/30 hover:bg-card/50 transition">
                  <td className="py-4 pr-4">
                    <div className="font-semibold text-foreground">{s.device}</div>
                    <div className="text-xs text-muted-foreground">{s.time}</div>
                  </td>
                  <td className="py-4 pr-4 text-right font-mono tabular-nums">{fmt(s.impressions)}</td>
                  <td className="py-4 pr-4 text-right font-mono tabular-nums">{fmt(s.clicks)}</td>
                  <td className="py-4 pr-4 text-right font-mono tabular-nums">{fmt(s.conversions)}</td>
                  <td className="py-4 pr-4 text-right font-mono tabular-nums">{usd(s.spend)}</td>
                  <td className="py-4 pr-4 text-right font-mono tabular-nums font-semibold">
                    <span className={isBest ? "text-success" : isWorst ? "text-destructive" : ""}>
                      {usd(s.cpc)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-success/40 bg-success/5 p-5">
          <div className="flex items-center gap-2 text-success mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">Best Segment</span>
          </div>
          <div className="font-bold text-base text-foreground">{best.device} — {best.time}</div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {best.description || (
              <>
                <strong className="text-foreground">{usd(best.cpc)}</strong> per conversion at{" "}
                <strong className="text-foreground">{Number(best.cvr).toFixed(1)}% CVR</strong>. High intent, low friction conversions.
              </>
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">Worst Segment</span>
          </div>
          <div className="font-bold text-base text-foreground">{worst.device} — {worst.time}</div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {worst.description || (
              <>
                <strong className="text-foreground">{usd(worst.cpc)}</strong> per conversion —{" "}
                <strong className="text-foreground">{Number(worst.multiplier || 1).toFixed(1)}×</strong> the best segment.
                Sessions show inefficient conversion relative to spend.
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
