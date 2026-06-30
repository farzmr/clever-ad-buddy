import "@/lib/fonts";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { campaigns } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AgentLoading } from "@/components/AgentLoading";
import { CreativeAnalyzer } from "@/components/CreativeAnalyzer";
import { PerformanceStats } from "@/components/PerformanceStats";
import { AutomationActions } from "@/components/AutomationActions";
import { Sparkles, Zap, Eye, Target, Megaphone } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AdTech Multi-Agent Optimizer" },
      { name: "description", content: "AI agents that analyze, segment, and optimize ad campaigns in one click." },
      { property: "og:title", content: "AdTech Multi-Agent Optimizer" },
      { property: "og:description", content: "AI agents that analyze, segment, and optimize ad campaigns in one click." },
    ],
  }),
  component: Index,
});

type Focus = "awareness" | "conversion" | "traffic";
type Phase = "idle" | "thinking" | "done";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-success/15 text-success border-success/30",
    paused: "bg-warning/15 text-warning border-warning/30",
    draft: "bg-muted text-muted-foreground border-border",
  };
  return map[status] || map.draft;
}

const focusMeta: Record<Focus, { icon: typeof Eye; label: string }> = {
  awareness: { icon: Eye, label: "Awareness" },
  conversion: { icon: Target, label: "Conversion" },
  traffic: { icon: Megaphone, label: "Traffic" },
};

function Index() {
  const [selectedId, setSelectedId] = useState(campaigns[0].id);
  const [name, setName] = useState(campaigns[0].name);
  const [focus, setFocus] = useState<Focus>("conversion");
  const [phase, setPhase] = useState<Phase>("idle");

  const onPickCampaign = (id: string) => {
    setSelectedId(id);
    const c = campaigns.find((x) => x.id === id);
    if (c) setName(c.name);
    setPhase("idle");
  };

  const runAgents = () => {
    setPhase("thinking");
    setTimeout(() => {
      setPhase("done");
      requestAnimationFrame(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }, 3200);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-bg grid place-items-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display font-semibold text-lg leading-tight">AdPilot</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Multi-Agent Optimizer</div>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/40 text-primary hidden sm:inline-flex">
            <Sparkles className="h-3 w-3 mr-1" /> v0.4 — preview
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Hero / control panel */}
        <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Three agents. <span className="gradient-text">One click.</span><br />
              Your campaigns, optimized.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl">
              Pick a campaign, choose your focus, and let the agents analyze creative,
              segment performance, and rewrite your media plan — automatically.
            </p>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Run an optimization</div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign" className="text-xs mb-1.5 block">Campaign</Label>
                <Select value={selectedId} onValueChange={onPickCampaign}>
                  <SelectTrigger id="campaign"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="font-mono text-xs text-muted-foreground mr-2">{c.id}</span>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name" className="text-xs mb-1.5 block">Campaign name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Optimization focus</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(focusMeta) as Focus[]).map((k) => {
                    const Icon = focusMeta[k].icon;
                    const active = focus === k;
                    return (
                      <button
                        key={k}
                        onClick={() => setFocus(k)}
                        className={`rounded-xl border px-3 py-3 text-xs font-medium transition flex flex-col items-center gap-1.5 ${
                          active
                            ? "border-primary/60 bg-primary/15 text-foreground"
                            : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {focusMeta[k].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={runAgents}
                disabled={phase === "thinking"}
                className="w-full h-12 text-base font-semibold gradient-bg text-white border-0 hover:opacity-95 disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {phase === "thinking" ? "Agents working…" : "Launch Optimization"}
              </Button>
            </div>
          </div>
        </section>

        {/* Campaigns table */}
        <section className="glass rounded-3xl p-6 md:p-8">
          <header className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold">Your campaigns</h2>
              <p className="text-sm text-muted-foreground">Click a row to load it into the optimizer.</p>
            </div>
            <Badge variant="outline">{campaigns.length} total</Badge>
          </header>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <th className="py-3 pr-4 font-medium">Campaign ID</th>
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Channel</th>
                  <th className="py-3 pr-4 font-medium text-right">Current Budget</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Start Date</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onPickCampaign(c.id)}
                    className={`border-b border-border/30 cursor-pointer transition ${
                      selectedId === c.id ? "bg-primary/10" : "hover:bg-primary/5"
                    }`}
                  >
                    <td className="py-4 pr-4 font-mono text-xs text-primary">{c.id}</td>
                    <td className="py-4 pr-4 font-medium">{c.name}</td>
                    <td className="py-4 pr-4 text-muted-foreground">{c.channel}</td>
                    <td className="py-4 pr-4 text-right font-mono tabular-nums">${c.budget.toLocaleString()}</td>
                    <td className="py-4 pr-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusBadge(c.status)} capitalize`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs text-muted-foreground">{c.startDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Loading / Results */}
        {phase === "thinking" && <AgentLoading />}

        {phase === "done" && (
          <div id="results" className="space-y-8 scroll-mt-24">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <span className="text-xs uppercase tracking-widest text-primary font-medium">Optimization Report</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            </div>
            <CreativeAnalyzer />
            <PerformanceStats />
            <AutomationActions />
          </div>
        )}

        <footer className="text-center text-xs text-muted-foreground pt-6 pb-2">
          Mock prototype · numbers are illustrative
        </footer>
      </main>
    </div>
  );
}
