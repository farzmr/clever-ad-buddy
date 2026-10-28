import "@/lib/fonts";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchCampaigns, resetDatabase } from "@/lib/api";
import { type Campaign } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Eye,
  Target,
  Megaphone,
  RotateCcw,
  BarChart3,
  Github,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AdPilot — Multi-Agent Ad Optimizer" },
      { name: "description", content: "AI agents that analyze, segment, and optimize ad campaigns in one click." },
      { property: "og:title", content: "AdPilot — Multi-Agent Ad Optimizer" },
      { property: "og:description", content: "AI agents that analyze, segment, and optimize ad campaigns in one click." },
    ],
  }),
  component: Index,
});

type Focus = "awareness" | "conversion" | "traffic";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-success/15 text-success border-success/30",
    paused: "bg-warning/15 text-warning border-warning/30",
    draft: "bg-muted text-muted-foreground border-border",
  };
  return map[status] || map.draft;
}

const focusMeta: Record<Focus, { icon: typeof Eye; label: string; desc: string }> = {
  awareness: {
    icon: Eye,
    label: "Awareness",
    desc: "Max impressions & reach across high-visibility channels.",
  },
  conversion: {
    icon: Target,
    label: "Conversion",
    desc: "Target lowest CPA segments to maximize sales volume.",
  },
  traffic: {
    icon: Megaphone,
    label: "Traffic",
    desc: "Drive highest click volume & CTR at optimal cost per click.",
  },
};

function Index() {
  const navigate = useNavigate();
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [focus, setFocus] = useState<Focus>("conversion");
  const [isResetting, setIsResetting] = useState(false);

  const loadCampaigns = async () => {
    const data = await fetchCampaigns();
    setCampaignList(data);
    if (data.length > 0 && !selectedId) {
      setSelectedId(data[0].id);
      const obj = (data[0] as any).objective?.toLowerCase();
      if (obj?.includes("awareness")) setFocus("awareness");
      else if (obj?.includes("traffic")) setFocus("traffic");
      else setFocus("conversion");
    }
    return data;
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleSelectCampaign = (id: string) => {
    setSelectedId(id);
    const camp = campaignList.find((c) => c.id === id);
    if (camp) {
      const obj = (camp as any).objective?.toLowerCase();
      if (obj?.includes("awareness")) setFocus("awareness");
      else if (obj?.includes("traffic")) setFocus("traffic");
      else setFocus("conversion");
    }
  };

  const runAgents = (campaignIdToRun?: string) => {
    const targetId = campaignIdToRun || selectedId;
    if (!targetId) return;
    navigate({ to: "/optimize", search: { id: targetId, focus } });
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetDatabase();
      const updated = await loadCampaigns();
      setCampaignList(updated);
      toast.success("All campaigns and ads reset to baseline!");
    } catch {
      toast.error("Failed to reset database");
    } finally {
      setIsResetting(false);
    }
  };

  const selectedCampaign = campaignList.find((c) => c.id === selectedId) || campaignList[0];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-bg grid place-items-center shadow-lg shadow-primary/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display font-semibold text-lg leading-tight">AdPilot</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Multi-Agent Optimizer</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              disabled={isResetting}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${isResetting ? "animate-spin" : ""}`} />
              Reset Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://github.com/farzmr/clever-ad-buddy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub Repo</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <section className="grid lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-8 items-start">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
              Three agents. <span className="gradient-text">One click.</span><br />
              Your campaigns, optimized.
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AdPilot coordinates three specialized AI agents to autonomously evaluate, benchmark, and scale your digital ad portfolios in real-time:
            </p>
            <ul className="space-y-2.5 pt-1 text-xs text-foreground/90">
              <li className="flex items-start gap-2.5">
                <span className="text-primary text-sm leading-none select-none shrink-0 mt-0.5">✦</span>
                <div>
                  <strong className="text-foreground">Agent 1 (Creative Auditor):</strong>{" "}
                  <span className="text-muted-foreground">Scans headlines, ad copy quality, and creative policy compliance.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary text-sm leading-none select-none shrink-0 mt-0.5">✦</span>
                <div>
                  <strong className="text-foreground">Agent 2 (Performance Analyst):</strong>{" "}
                  <span className="text-muted-foreground">Computes multidimensional performance across device segments and dayparting schedules.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary text-sm leading-none select-none shrink-0 mt-0.5">✦</span>
                <div>
                  <strong className="text-foreground">Agent 3 (Campaign Optimizer):</strong>{" "}
                  <span className="text-muted-foreground">Autonomously writes high-converting creative variants and reschedules budgets for maximum ROI.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="glass rounded-2xl p-4 sm:p-5 shadow-sm border border-border/60">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Run an optimization
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="campaign" className="text-xs mb-1 block font-medium">Campaign</Label>
                <Select value={selectedId} onValueChange={handleSelectCampaign}>
                  <SelectTrigger id="campaign" className="w-full h-9 text-xs">
                    <SelectValue placeholder="Select campaign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="font-mono text-xs text-primary mr-2 font-semibold">{c.id}</span>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block font-medium">Optimization focus</Label>
                <div className="space-y-2">
                  {(Object.keys(focusMeta) as Focus[]).map((k) => {
                    const item = focusMeta[k];
                    const Icon = item.icon;
                    const active = focus === k;
                    return (
                      <div
                        key={k}
                        onClick={() => setFocus(k)}
                        className={`group flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                          active
                            ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                            : "border-border/60 bg-card/40 hover:border-primary/40 hover:bg-card/70"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div
                            className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center transition ${
                              active ? "border-primary" : "border-muted-foreground/40 group-hover:border-primary/60"
                            }`}
                          >
                            {active && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                              {item.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1">
                <Button
                  onClick={() => runAgents()}
                  disabled={!selectedId}
                  className="w-full h-10 text-sm font-semibold gradient-bg text-white border-0 hover:opacity-95 shadow-md shadow-primary/20"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Launch Optimization
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Campaign Table (Channel column removed, Report column added) */}
        <section className="glass rounded-3xl p-6 md:p-8">
          <header className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold">Your campaigns</h2>
              <p className="text-sm text-muted-foreground">
                Click a row to select it, or click <strong className="text-primary">Report</strong> to view live metrics &amp; audit history.
              </p>
            </div>
            <Badge variant="outline" className="border-border font-mono">{campaignList.length} total</Badge>
          </header>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <th className="py-3 pr-4 font-medium">Campaign ID</th>
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Device Targeting</th>
                  <th className="py-3 pr-4 font-medium">Schedule</th>
                  <th className="py-3 pr-4 font-medium text-right">Budget</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Start Date</th>
                  <th className="py-3 pr-4 font-medium text-center">Report</th>
                </tr>
              </thead>
              <tbody>
                {campaignList.map((c) => {
                  const isSel = selectedId === c.id;
                  const cDevice = (c as any).device || "All";
                  const cTime = (c as any).timeOfDay || "All";
                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectCampaign(c.id)}
                      className={`border-b border-border/30 cursor-pointer transition ${
                        isSel ? "bg-primary/10 border-primary/40 font-medium" : "hover:bg-primary/5"
                      }`}
                    >
                      <td className="py-4 pr-4 font-mono text-xs text-primary font-bold">{c.id}</td>
                      <td className="py-4 pr-4">
                        <span className={isSel ? "text-primary font-semibold" : ""}>{c.name}</span>
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground capitalize text-xs">{cDevice}</td>
                      <td className="py-4 pr-4 text-muted-foreground capitalize text-xs">{cTime}</td>
                      <td className="py-4 pr-4 text-right font-mono tabular-nums font-medium">${(c.budget || 0).toLocaleString()}</td>
                      <td className="py-4 pr-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${statusBadge(c.status)} capitalize`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 font-mono text-xs text-muted-foreground">{c.startDate}</td>
                      <td className="py-4 pr-4 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate({ to: "/report", search: { id: c.id } });
                          }}
                          className="h-8 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 font-semibold"
                        >
                          <BarChart3 className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground pt-6 pb-2">
          AdPilot Multi-Agent Optimizer · Powered by Google ADK &amp; Gemini
        </footer>
      </main>
    </div>
  );
}
