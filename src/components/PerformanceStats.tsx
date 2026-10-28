import { topSegments, type Segment } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Award, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
          <div className="text-xs uppercase tracking-widest text-accent mb-1 font-semibold">Agent 2</div>
          <h2 className="text-2xl font-semibold">Performance Stats &amp; Segments</h2>
          <p className="text-sm text-muted-foreground mt-1">Top device × time segments and where the money works.</p>
        </div>
        <Badge className="bg-success/15 text-success border-success/30 gap-1 text-xs font-semibold py-1">
          <Award className="h-3.5 w-3.5" /> Best: {best.device} ({best.time})
        </Badge>
      </header>

      {summary && (
        <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-accent uppercase mr-2 tracking-wider">Agent Synthesis:</span>
          {summary}
        </div>
      )}

      {/* Best & Worst Segment Cards — SHOWN ABOVE THE TABLE */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border-2 border-success/50 bg-success/10 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-success">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs uppercase tracking-widest font-bold">Top Performing Segment</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-success bg-success/20 px-2 py-0.5 rounded-full border border-success/40">
              🟢 Best
            </span>
          </div>
          <div className="font-black text-xl text-foreground mt-1">{best.device} — {best.time}</div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {best.description || (
              <>
                <strong className="text-foreground">{usd(best.cpc)}</strong> per conversion at{" "}
                <strong className="text-foreground">{Number(best.cvr).toFixed(1)}% CVR</strong>. High intent, low friction conversions.
              </>
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-destructive">
              <TrendingDown className="h-5 w-5" />
              <span className="text-xs uppercase tracking-widest font-semibold">Underperforming Segment</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/20 px-2 py-0.5 rounded-full border border-destructive/30">
              🔴 Least Efficient
            </span>
          </div>
          <div className="font-bold text-lg text-foreground mt-1">{worst.device} — {worst.time}</div>
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

      {/* Segments Table with bold highlighted best segment */}
      <div className="overflow-x-auto -mx-2 px-2 pt-2">
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
              const isBest = s.device.toLowerCase() === best.device.toLowerCase() && s.time.toLowerCase() === best.time.toLowerCase();
              const isWorst = s.device.toLowerCase() === worst.device.toLowerCase() && s.time.toLowerCase() === worst.time.toLowerCase();

              return (
                <tr
                  key={i}
                  className={`border-b transition ${
                    isBest
                      ? "bg-success/15 border-success/40 shadow-sm"
                      : isWorst
                      ? "bg-destructive/5 border-destructive/20"
                      : "border-border/30 hover:bg-card/50"
                  }`}
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className={`text-sm ${isBest ? "font-black text-foreground" : isWorst ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                          {s.device}
                        </div>
                        <div className="text-xs text-muted-foreground">{s.time}</div>
                      </div>
                      {isBest && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success bg-success/20 px-2 py-0.5 rounded-full border border-success/30 ml-2">
                          🟢 Best
                        </span>
                      )}
                      {isWorst && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-destructive bg-destructive/15 px-2 py-0.5 rounded-full border border-destructive/20 ml-2">
                          🔴 Inefficient
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`py-4 pr-4 text-right font-mono tabular-nums ${isBest ? "font-bold text-foreground" : ""}`}>
                    {fmt(s.impressions)}
                  </td>
                  <td className={`py-4 pr-4 text-right font-mono tabular-nums ${isBest ? "font-bold text-foreground" : ""}`}>
                    {fmt(s.clicks)}
                  </td>
                  <td className={`py-4 pr-4 text-right font-mono tabular-nums ${isBest ? "font-bold text-foreground text-sm" : ""}`}>
                    {fmt(s.conversions)}
                  </td>
                  <td className={`py-4 pr-4 text-right font-mono tabular-nums ${isBest ? "font-bold text-foreground" : ""}`}>
                    {usd(s.spend)}
                  </td>
                  <td className="py-4 pr-4 text-right font-mono tabular-nums font-semibold">
                    <span className={isBest ? "text-success font-black text-sm" : isWorst ? "text-destructive" : ""}>
                      {usd(s.cpc)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
