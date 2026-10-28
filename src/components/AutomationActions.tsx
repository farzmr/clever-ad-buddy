import { automationChanges, type BeforeAfter } from "@/lib/mock-data";
import { ArrowRight, Power, PowerOff, Wand2, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GeneratedAdItem {
  id: string;
  headline: string;
  body: string;
  cta: string;
  imageUrl?: string;
  gradient?: string;
  basedOn?: string;
  note?: string;
}

interface AutomationActionsProps {
  generatedAds?: GeneratedAdItem[];
  appliedChanges?: BeforeAfter[];
  summary?: string;
}

const defaultNewAds: GeneratedAdItem[] = [
  {
    id: "AD-7786",
    headline: "Light. Loud. Limited.",
    body: "The mesh runner that's 32% lighter — now in three sunset colorways. Shipping fades fast.",
    cta: "Claim a Pair",
    gradient: "linear-gradient(135deg,#f43f5e,#fb923c)",
    basedOn: "AD-7781",
    note: "Sharper hook + scarcity, kept your hero gradient.",
  },
  {
    id: "AD-7787",
    headline: "From Brooklyn to the Catskills",
    body: "One shoe, every surface. 12,000 runners agree — see why.",
    cta: "Find Your Pair",
    gradient: "linear-gradient(135deg,#22d3ee,#a855f7)",
    basedOn: "AD-7785",
    note: "UGC-led variant for retargeting audiences.",
  },
];

export function AutomationActions({ generatedAds: passedAds, appliedChanges: passedChanges, summary }: AutomationActionsProps) {
  const ads = passedAds && passedAds.length > 0 ? passedAds : defaultNewAds;
  const changes = passedChanges && passedChanges.length > 0 ? passedChanges : automationChanges;

  return (
    <section className="glass rounded-3xl p-6 md:p-8 space-y-10">
      <header>
        <div className="text-xs uppercase tracking-widest text-violet mb-1" style={{ color: "var(--violet)" }}>Agent 3</div>
        <h2 className="text-2xl font-semibold">Automation &amp; Generation Actions</h2>
        <p className="text-sm text-muted-foreground mt-1">What I built and what I changed — autopilot, with receipts.</p>
      </header>

      {summary && (
        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-primary uppercase mr-2 tracking-wider">Agent Synthesis:</span>
          {summary}
        </div>
      )}

      {/* Generation */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="h-4 w-4 text-accent" />
          <h3 className="text-lg font-semibold">Generated {ads.length} new {ads.length === 1 ? "ad" : "ads"}</h3>
          <span className="text-xs text-muted-foreground">based on your top-performing creative</span>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {ads.map((ad) => {
            const gradient = ad.gradient || "linear-gradient(135deg,#7c3aed,#d946ef)";

            return (
              <div key={ad.id} className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden shadow-sm">
                <div className="aspect-[1200/628] relative overflow-hidden bg-black/20">
                  {ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      alt={ad.headline}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 grid place-items-center text-white/90 text-xs font-mono -z-10"
                    style={{ backgroundImage: gradient }}
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-6 w-6 opacity-80" />
                      <span>AI-generated creative</span>
                    </div>
                  </div>
                  <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white border-0 font-mono text-[10px] tracking-widest">
                    NEW
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-primary font-bold">{ad.id}</span>
                    {ad.basedOn && <span className="text-muted-foreground">based on {ad.basedOn}</span>}
                  </div>
                  <h4 className="font-semibold leading-snug text-foreground">{ad.headline}</h4>
                  <p className="text-sm text-muted-foreground">{ad.body}</p>
                  <button className="w-full gradient-bg text-white font-medium rounded-lg py-2 text-sm shadow-md shadow-primary/10">
                    {ad.cta || "Learn More"}
                  </button>
                  {ad.note && <p className="text-xs text-muted-foreground italic pt-1">↳ {ad.note}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Automation diff */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Power className="h-4 w-4 text-success" />
          <h3 className="text-lg font-semibold">Applied {changes.length} automated changes</h3>
        </div>

        <div className="space-y-3">
          {changes.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">{c.label}</div>
              <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 text-xs text-destructive mb-2 font-semibold">
                    <PowerOff className="h-3 w-3" /> BEFORE
                  </div>
                  <div className="text-sm font-mono text-foreground break-words">{c.before}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-primary mx-auto hidden md:block" />
                <div className="rounded-xl border border-success/40 bg-success/5 p-4">
                  <div className="flex items-center gap-2 text-xs text-success mb-2 font-semibold">
                    <Power className="h-3 w-3" /> AFTER
                  </div>
                  <div className="text-sm font-mono text-foreground break-words">{c.after}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">↳ {c.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
