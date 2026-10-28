import { automationChanges, type BeforeAfter } from "@/lib/mock-data";
import {
  ArrowRight,
  Power,
  PowerOff,
  Wand2,
  ImageIcon,
  Sparkles,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GeneratedAdItem {
  id: string;
  headline: string;
  body: string;
  cta: string;
  imageUrl?: string;
  gradient?: string;
  basedOn?: string;
  note?: string;
  imageSource?: "gemini_imagen" | "python_fallback";
  imageNotice?: string;
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
    imageSource: "python_fallback",
    imageNotice: "You reached max Gemini image generation quota (or Gemini API key was not configured). The creative engine used Python for image generation.",
  },
];

export function AutomationActions({ generatedAds: passedAds, appliedChanges: passedChanges, summary }: AutomationActionsProps) {
  const ads = passedAds && passedAds.length > 0 ? passedAds : defaultNewAds;
  const changes = passedChanges && passedChanges.length > 0 ? passedChanges : automationChanges;

  // The primary ad variant to highlight
  const primaryAd = ads[0];
  const isPythonFallback = primaryAd?.imageSource === "python_fallback" || !primaryAd?.imageSource || primaryAd?.imageSource !== "gemini_imagen";
  const gradient = primaryAd?.gradient || "linear-gradient(135deg,#7c3aed,#ec4899)";

  return (
    <section className="glass rounded-3xl p-6 md:p-8 space-y-8">
      {/* Header */}
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

      {summary && (
        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-primary uppercase mr-2 tracking-wider">Agent Synthesis:</span>
          {summary}
        </div>
      )}

      {/* Quota Notice if Python rendering was used instead of Gemini */}
      {isPythonFallback && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-800 dark:text-amber-200 block text-xs uppercase tracking-wider mb-0.5">
              Notice: Reached Gemini Image Generation Quota
            </strong>
            You reached the maximum Gemini image generation quota (or your Gemini API key does not have Imagen access enabled). The creative engine automatically fell back to Python image generation to create your display asset without interruption.
          </div>
        </div>
      )}

      {/* Side-by-Side Unified Grid: Left = Generated Ad, Right = The 3 Applied Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Generated Ad Card (Span 5 on large screens, matching height) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="text-base font-bold text-foreground">Generated Ad Variant</h3>
            <span className="text-xs font-mono text-primary font-bold ml-auto">{primaryAd?.id}</span>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card/80 overflow-hidden shadow-md flex-1 flex flex-col justify-between">
            {/* Visual Display Creative Banner */}
            <div className="aspect-[1200/628] relative overflow-hidden bg-black/40 group">
              {primaryAd?.imageUrl ? (
                <img
                  src={primaryAd.imageUrl}
                  alt={primaryAd.headline}
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
                  <span>Display Ad Creative</span>
                </div>
              </div>
              <div className="absolute top-3 left-3">
                <Badge className="bg-black/60 backdrop-blur-md text-white border-0 font-mono text-[10px] tracking-widest font-bold">
                  ✨ NEW AD
                </Badge>
              </div>
              <Badge className="absolute top-3 right-3 bg-primary/80 backdrop-blur-md text-white border-0 font-mono text-[10px]">
                {primaryAd?.imageSize || "300×250"}
              </Badge>
            </div>

            {/* Copy Content & Strategy */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-primary font-bold">{primaryAd?.id}</span>
                  {primaryAd?.basedOn && (
                    <span className="text-muted-foreground text-[11px] bg-secondary/60 px-2 py-0.5 rounded-md">
                      Based on top performer <strong className="text-foreground">{primaryAd.basedOn}</strong>
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-base text-foreground leading-snug">{primaryAd?.headline}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{primaryAd?.body}</p>
              </div>

              <div className="space-y-3 pt-2">
                <Button className="w-full gradient-bg text-white font-medium text-xs h-10 shadow-md shadow-primary/20 hover:opacity-95">
                  {primaryAd?.cta || "Shop Now"}
                </Button>

                {primaryAd?.note && (
                  <div className="p-2.5 rounded-xl bg-secondary/40 text-[11px] text-muted-foreground italic flex items-start gap-1.5 leading-normal">
                    <span className="text-primary font-bold not-italic">↳ Strategy:</span>
                    <span>{primaryAd.note}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: The 3 Applied Autopilot Changes (Span 7, matching height) */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <Power className="h-4 w-4 text-success" />
            <h3 className="text-base font-bold text-foreground">Applied Autopilot Changes</h3>
            <span className="text-xs font-mono text-muted-foreground ml-auto">{changes.length} rules executed</span>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3">
            {changes.map((c, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm hover:border-border transition-colors flex-1 flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {c.label}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30 font-bold">
                    Applied
                  </span>
                </div>

                {/* High-tech Before / After visual comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-destructive font-bold uppercase tracking-wider mb-1">
                      <PowerOff className="h-3 w-3" /> BEFORE
                    </div>
                    <div className="text-xs font-mono text-muted-foreground line-through opacity-85 break-words">
                      {c.before}
                    </div>
                  </div>

                  <div className="hidden sm:grid place-items-center">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>

                  <div className="rounded-xl border-2 border-success/40 bg-success/10 p-3 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[10px] text-success font-bold uppercase tracking-wider mb-1">
                      <CheckCircle2 className="h-3 w-3" /> AFTER
                    </div>
                    <div className="text-xs font-mono font-bold text-foreground break-words">
                      {c.after}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-normal pt-0.5">
                  <TrendingUp className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Why:</strong> {c.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
