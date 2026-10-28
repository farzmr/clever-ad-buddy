import { useState } from "react";
import { adsByCampaign, type Ad } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";

function ScoreBar({ score }: { score: number }) {
  const tone = score >= 75 ? "bg-success" : score >= 55 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${tone} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums font-semibold">{score}</span>
    </div>
  );
}

interface CreativeAnalyzerProps {
  ads?: Ad[];
  summary?: string;
}

export function CreativeAnalyzer({ ads: passedAds, summary }: CreativeAnalyzerProps) {
  const ads = passedAds && passedAds.length > 0 ? passedAds : adsByCampaign.default;
  const [open, setOpen] = useState<Ad | null>(null);

  return (
    <section className="glass rounded-3xl p-6 md:p-8 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary mb-1">Agent 1</div>
          <h2 className="text-2xl font-semibold">Creative Analyzer Report</h2>
          <p className="text-sm text-muted-foreground mt-1">Quality, weak elements &amp; rewrite suggestions per ad.</p>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary">
          {ads.length} ads analyzed
        </Badge>
      </header>

      {summary && (
        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-primary uppercase mr-2 tracking-wider">Agent Synthesis:</span>
          {summary}
        </div>
      )}

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
              <th className="py-3 pr-4 font-medium">Ad ID</th>
              <th className="py-3 pr-4 font-medium">Headline</th>
              <th className="py-3 pr-4 font-medium">Image Size</th>
              <th className="py-3 pr-4 font-medium">Quality</th>
              <th className="py-3 pr-4 font-medium">Flagged</th>
              <th className="py-3 pr-4 font-medium">Recommendations</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => {
              const flaggedList = (ad.flagged || []).filter((f) => f.toLowerCase() !== "clean");
              const isClean = flaggedList.length === 0;

              return (
                <tr key={ad.id} className="border-b border-border/30 hover:bg-primary/5 transition">
                  <td className="py-4 pr-4">
                    <button
                      onClick={() => setOpen(ad)}
                      className="font-mono text-primary font-bold hover:underline underline-offset-4"
                    >
                      {ad.id}
                    </button>
                  </td>
                  <td className="py-4 pr-4 max-w-[260px]">
                    <div className="font-medium text-foreground truncate">{ad.headline}</div>
                    {ad.body && <div className="text-xs text-muted-foreground truncate mt-0.5">{ad.body}</div>}
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs text-muted-foreground">{ad.imageSize || "300×250"}</td>
                  <td className="py-4 pr-4"><ScoreBar score={ad.qualityScore} /></td>
                  <td className="py-4 pr-4">
                    {isClean ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                        <CheckCircle2 className="h-3 w-3" /> clean
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {flaggedList.map((f) => (
                          <span key={f} className="inline-flex items-center gap-1 text-xs rounded-full bg-destructive/15 text-destructive px-2 py-0.5">
                            <AlertTriangle className="h-3 w-3" />{f}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    <ul className="space-y-1">
                      {(ad.improvements && ad.improvements.length > 0 ? ad.improvements : ["No changes required"]).map((r) => (
                        <li key={r} className="flex gap-2 text-xs text-muted-foreground">
                          <Sparkles className="h-3 w-3 mt-0.5 text-accent shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-md glass border-primary/30">
          <DialogTitle className="sr-only">Ad preview</DialogTitle>
          {open && <AdPreview ad={open} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function AdPreview({ ad }: { ad: Ad }) {
  const gradient = ad.imageGradient || "linear-gradient(135deg,#7c3aed,#ec4899)";
  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-muted-foreground">{ad.id} · {ad.imageSize || "300×250"}</div>
      <div className="rounded-2xl overflow-hidden border border-border">
        {ad.imageUrl && ad.imageUrl.startsWith("http") ? (
          <img src={ad.imageUrl} alt={ad.headline} className="w-full aspect-[1200/628] object-cover" />
        ) : (
          <div
            className="aspect-[1200/628] grid place-items-center text-white/90 text-xs font-mono p-4 text-center"
            style={{ backgroundImage: gradient }}
          >
            {ad.imageLabel || `${ad.id} Display Creative`}
          </div>
        )}
        <div className="p-4 bg-card space-y-2">
          <h3 className="font-semibold leading-snug">{ad.headline}</h3>
          <p className="text-sm text-muted-foreground">{ad.body}</p>
          <button className="mt-2 w-full gradient-bg text-white font-medium rounded-lg py-2 text-sm">
            {ad.cta || "Learn More"}
          </button>
        </div>
      </div>
    </div>
  );
}
