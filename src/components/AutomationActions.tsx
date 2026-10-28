import { useState } from "react";
import { automationChanges, type BeforeAfter } from "@/lib/mock-data";
import {
  ArrowRight,
  Power,
  PowerOff,
  Wand2,
  ImageIcon,
  Sparkles,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (ad: GeneratedAdItem) => {
    const text = `${ad.headline}\n${ad.body}\nCTA: ${ad.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedId(ad.id);
    toast.success(`Copied copy for ${ad.id} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="glass rounded-3xl p-6 md:p-8 space-y-10">
      {/* Header with Agent Badge */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-violet mb-1 font-semibold" style={{ color: "var(--violet)" }}>
            Agent 3 · Autopilot Engine
          </div>
          <h2 className="text-2xl font-bold text-foreground">Automation &amp; Generation Actions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Autonomous actions executed and creative variants generated based on real-time campaign telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold gap-1 text-xs py-1">
            <Zap className="h-3.5 w-3.5" /> Autopilot Verified
          </Badge>
        </div>
      </header>

      {/* KPI Impact Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-bg grid place-items-center text-white shrink-0">
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">New Creatives</div>
            <div className="text-lg font-bold text-foreground">{ads.length} Variants Generated</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-success/20 bg-success/5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-success/20 text-success grid place-items-center shrink-0">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Applied Actions</div>
            <div className="text-lg font-bold text-foreground">{changes.length} Autopilot Updates</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent grid place-items-center shrink-0">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Execution Mode</div>
            <div className="text-lg font-bold text-foreground">Active Telemetry</div>
          </div>
        </div>
      </div>

      {summary && (
        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-primary uppercase mr-2 tracking-wider">Agent Synthesis:</span>
          {summary}
        </div>
      )}

      {/* Section 1: AI Generated Ad Creatives */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="text-lg font-bold text-foreground">Generated Display Ad Variants</h3>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              · Synthesized from high-performing historical creative
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{ads.length} ready for deployment</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ads.map((ad) => {
            const gradient = ad.gradient || "linear-gradient(135deg,#7c3aed,#ec4899)";
            const isCopied = copiedId === ad.id;

            return (
              <div
                key={ad.id}
                className="rounded-3xl border border-border/80 bg-card/80 overflow-hidden shadow-lg shadow-black/5 hover:border-primary/40 transition-all duration-300 flex flex-col"
              >
                {/* Visual Asset Container */}
                <div className="aspect-[1200/628] relative overflow-hidden bg-black/40 group">
                  {ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      alt={ad.headline}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                      <span>AI-Generated Ad Creative</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <Badge className="bg-black/60 backdrop-blur-md text-white border-0 font-mono text-[10px] tracking-widest font-bold">
                      ✨ NEW VARIANT
                    </Badge>
                  </div>
                  <Badge className="absolute top-3 right-3 bg-primary/80 backdrop-blur-md text-white border-0 font-mono text-[10px] tracking-wider">
                    {ad.id}
                  </Badge>
                </div>

                {/* Copy & Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-primary font-bold">{ad.id}</span>
                      {ad.basedOn && (
                        <span className="text-muted-foreground text-[11px] bg-secondary/60 px-2 py-0.5 rounded-md">
                          Modeled on top performer <strong className="text-foreground">{ad.basedOn}</strong>
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-base text-foreground leading-snug">{ad.headline}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{ad.body}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        className="flex-1 gradient-bg text-white font-medium text-xs h-10 shadow-md shadow-primary/20 hover:opacity-95"
                      >
                        {ad.cta || "Shop Now"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyText(ad)}
                        className="h-10 px-3 text-xs shrink-0"
                        title="Copy ad copy"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-success mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        {isCopied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    {ad.note && (
                      <div className="p-2.5 rounded-xl bg-secondary/40 text-[11px] text-muted-foreground italic flex items-start gap-1.5 leading-normal">
                        <span className="text-primary font-bold not-italic">↳ Strategy:</span>
                        <span>{ad.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Applied Autopilot Changes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Power className="h-4 w-4 text-success" />
          <h3 className="text-lg font-bold text-foreground">Applied Autopilot Changes</h3>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            · Executed updates to budget, schedule, and live ad states
          </span>
        </div>

        <div className="space-y-4">
          {changes.map((c, index) => (
            <div
              key={index}
              className="rounded-3xl border border-border/80 bg-card/60 p-5 sm:p-6 shadow-sm hover:border-border transition-colors space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {c.label}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                  Rule Executed
                </span>
              </div>

              {/* High-tech Before / After visual comparison */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                {/* BEFORE STATE */}
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-destructive font-bold uppercase tracking-wider">
                    <PowerOff className="h-3.5 w-3.5" /> Previous Configuration
                  </div>
                  <div className="text-sm font-mono text-muted-foreground line-through opacity-85 break-words">
                    {c.before}
                  </div>
                </div>

                <div className="grid place-items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary hidden md:grid place-items-center">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* AFTER STATE */}
                <div className="rounded-2xl border-2 border-success/40 bg-success/10 p-4 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs text-success font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Optimized Setting
                  </div>
                  <div className="text-sm font-mono font-bold text-foreground break-words">
                    {c.after}
                  </div>
                </div>
              </div>

              {/* RATIONALE CALLOUT */}
              <div className="pt-1 flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                <TrendingUp className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Optimization Insight:</strong> {c.reason}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
