import { automationChanges } from "@/lib/mock-data";
import { ArrowRight, Power, PowerOff, Wand2, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const newAds = [
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

export function AutomationActions() {
  return (
    <section className="glass rounded-3xl p-6 md:p-8 space-y-10">
      <header>
        <div className="text-xs uppercase tracking-widest text-violet mb-1" style={{ color: "var(--violet)" }}>Agent 3</div>
        <h2 className="text-2xl font-semibold">Automation &amp; Generation Actions</h2>
        <p className="text-sm text-muted-foreground mt-1">What I built and what I changed — autopilot, with receipts.</p>
      </header>

      {/* Generation */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="h-4 w-4 text-accent" />
          <h3 className="text-lg font-semibold">Generated 2 new ads</h3>
          <span className="text-xs text-muted-foreground">based on your top-performing creative</span>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {newAds.map((ad) => (
            <div key={ad.id} className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
              <div
                className="aspect-[1200/628] grid place-items-center text-white/80 text-xs font-mono relative"
                style={{ backgroundImage: ad.gradient }}
              >
                <ImageIcon className="h-8 w-8 opacity-60 mr-2" />
                <span>AI-generated creative</span>
                <Badge className="absolute top-3 right-3 bg-black/40 text-white border-0">NEW</Badge>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-primary">{ad.id}</span>
                  <span className="text-muted-foreground">based on {ad.basedOn}</span>
                </div>
                <h4 className="font-semibold leading-snug">{ad.headline}</h4>
                <p className="text-sm text-muted-foreground">{ad.body}</p>
                <button className="w-full gradient-bg text-white font-medium rounded-lg py-2 text-sm">
                  {ad.cta}
                </button>
                <p className="text-xs text-muted-foreground italic pt-1">{ad.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation diff */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Power className="h-4 w-4 text-success" />
          <h3 className="text-lg font-semibold">Applied 3 automated changes</h3>
        </div>

        <div className="space-y-3">
          {automationChanges.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{c.label}</div>
              <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 text-xs text-destructive mb-2">
                    <PowerOff className="h-3 w-3" /> BEFORE
                  </div>
                  <div className="text-sm font-mono">{c.before}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-primary mx-auto hidden md:block" />
                <div className="rounded-xl border border-success/40 bg-success/5 p-4">
                  <div className="flex items-center gap-2 text-xs text-success mb-2">
                    <Power className="h-3 w-3" /> AFTER
                  </div>
                  <div className="text-sm font-mono">{c.after}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">↳ {c.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
