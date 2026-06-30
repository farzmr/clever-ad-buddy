import { topSegments } from "@/lib/mock-data";
import { TrendingUp, TrendingDown } from "lucide-react";

const fmt = (n: number) => n.toLocaleString();
const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function PerformanceStats() {
  const best = topSegments[0];
  const worst = topSegments[topSegments.length - 1];

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-widest text-accent mb-1">Agent 2</div>
        <h2 className="text-2xl font-semibold">Performance Stats &amp; Segments</h2>
        <p className="text-sm text-muted-foreground mt-1">Top 3 device × time segments and where the money works.</p>
      </header>

      <div className="overflow-x-auto -mx-2 px-2 mb-6">
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
            {topSegments.map((s, i) => (
              <tr key={i} className="border-b border-border/30">
                <td className="py-4 pr-4">
                  <div className="font-medium">{s.device}</div>
                  <div className="text-xs text-muted-foreground">{s.time}</div>
                </td>
                <td className="py-4 pr-4 text-right font-mono tabular-nums">{fmt(s.impressions)}</td>
                <td className="py-4 pr-4 text-right font-mono tabular-nums">{fmt(s.clicks)}</td>
                <td className="py-4 pr-4 text-right font-mono tabular-nums">{fmt(s.conversions)}</td>
                <td className="py-4 pr-4 text-right font-mono tabular-nums">{usd(s.spend)}</td>
                <td className="py-4 pr-4 text-right font-mono tabular-nums">
                  <span className={s === best ? "text-success" : s === worst ? "text-destructive" : ""}>
                    {usd(s.cpc)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-success/40 bg-success/5 p-5">
          <div className="flex items-center gap-2 text-success mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest font-medium">Best Segment</span>
          </div>
          <div className="font-semibold">{best.device} — {best.time}</div>
          <p className="text-sm text-muted-foreground mt-2">
            {usd(best.cpc)} per conversion at {((best.conversions / best.clicks) * 100).toFixed(1)}% CVR.
            Mobile at night is your gold mine — high intent, low friction checkout.
          </p>
        </div>
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest font-medium">Worst Segment</span>
          </div>
          <div className="font-semibold">{worst.device} — {worst.time}</div>
          <p className="text-sm text-muted-foreground mt-2">
            {usd(worst.cpc)} per conversion — 5.3× the best segment. Tablet morning sessions show
            high clicks but low purchase intent (window-shopping behavior).
          </p>
        </div>
      </div>
    </section>
  );
}
