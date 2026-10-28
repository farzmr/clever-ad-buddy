import "@/lib/fonts";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchCampaigns, resetDatabase } from "@/lib/api";
import { type Campaign } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Eye, Target, Megaphone, RotateCcw } from "lucide-react";
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

const focusMeta: Record<Focus, { icon: typeof Eye; label: string }> = {
  awareness: { icon: Eye, label: "Awareness" },
  conversion: { icon: Target, label: "Conversion" },
  traffic: { icon: Megaphone, label: "Traffic" },
};

function Index() {
  const navigate = useNavigate();
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [focus, setFocus] = useState<Focus>("conversion");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchCampaigns().then((data) => {
      setCampaignList(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
        const obj = (data[0] as any).objective?.toLowerCase();
        if (obj?.includes("awareness")) setFocus("awareness");
        else if (obj?.includes("traffic")) setFocus("traffic");
        else setFocus("conversion");
      }
    });
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

  const runAgents = () => {
    if (!selectedId) return;
    navigate({ to: "/optimize", search: { id: selectedId, focus } });
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetDatabase();
      const updated = await fetchCampaigns();
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
            <Badge variant="outline" className="border-primary/40 text-primary hidden sm:inline-flex">
              <Sparkles className="h-3 w-3 mr-1" /> v0.4 — preview
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Three agents. <span className="gradient-text">One click.</span><br />
              Your campaigns, optimized.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed">
              Pick a campaign, choose your focus, and let the agents analyze creative,
              segment performance, and rewrite your media plan — automatically.
            </p>

            {selectedCampaign && (
              <div className="mt-8 p-4 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm max-w-xl flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Currently Selected</div>
                  <div className="font-semibold text-foreground text-sm mt-0.5">
                    {selectedCampaign.id} — {selectedCampaign.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedCampaign.channel} · ${(selectedCampaign.budget || 0).toLocaleString()} budget
                  </div>
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary capitalize text-xs">
                  {selectedCampaign.status}
                </Badge>
              </div>
            )}
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Run an optimization</div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign" className="text-xs mb-1.5 block">Campaign</Label>
                <Select value={selectedId} onValueChange={handleSelectCampaign}>
                  <SelectTrigger id="campaign" className="w-full">
                    <SelectValue placeholder="Select campaign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="font-mono text-xs text-primary mr-2">{c.id}</span>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        type="button"
                        onClick={() => setFocus(k)}
                        className={`rounded-xl border px-3 py-3 text-xs font-medium transition flex flex-col items-center gap-1.5 ${
                          active
                            ? "border-primary/60 bg-primary/10 text-primary shadow-sm"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {focusMeta[k].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={runAgents}
                  disabled={!selectedId}
                  className="w-full h-12 text-base font-semibold gradient-bg text-white border-0 hover:opacity-95 shadow-lg shadow-primary/20"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Launch Optimization
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl p-6 md:p-8">
          <header className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold">Your campaigns</h2>
              <p className="text-sm text-muted-foreground">Click a row to load it into the optimizer.</p>
            </div>
            <Badge variant="outline" className="border-border font-mono">{campaignList.length} total</Badge>
          </header>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <th className="py-3 pr-4 font-medium">Campaign ID</th>
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Channel</th>
                  <th className="py-3 pr-4 font-medium">Device</th>
                  <th className="py-3 pr-4 font-medium">Time of Day</th>
                  <th className="py-3 pr-4 font-medium text-right">Budget</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Start Date</th>
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
                      <td className="py-4 pr-4 text-muted-foreground">{c.channel}</td>
                      <td className="py-4 pr-4 text-muted-foreground capitalize text-xs">{cDevice}</td>
                      <td className="py-4 pr-4 text-muted-foreground capitalize text-xs">{cTime}</td>
                      <td className="py-4 pr-4 text-right font-mono tabular-nums font-medium">${(c.budget || 0).toLocaleString()}</td>
                      <td className="py-4 pr-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${statusBadge(c.status)} capitalize`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 font-mono text-xs text-muted-foreground">{c.startDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground pt-6 pb-2">
          AdPilot Multi-Agent Optimizer · Powered by Google ADK & Gemini
        </footer>
      </main>
    </div>
  );
}
