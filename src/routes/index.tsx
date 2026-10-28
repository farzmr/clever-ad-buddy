import "@/lib/fonts";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchCampaigns, resetDatabase, fetchCampaignReport, type CampaignReportResponse } from "@/lib/api";
import { type Campaign } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sparkles,
  Zap,
  Eye,
  Target,
  Megaphone,
  RotateCcw,
  BarChart3,
  TrendingUp,
  History,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
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

  // Campaign Report Dialog State
  const [reportData, setReportData] = useState<CampaignReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

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
    setIsReportOpen(false);
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

  const handleOpenReport = async (campaignId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReportLoading(true);
    setIsReportOpen(true);
    try {
      const rep = await fetchCampaignReport(campaignId);
      setReportData(rep);
    } catch (err) {
      toast.error("Could not load campaign report");
    } finally {
      setReportLoading(false);
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
                <Label className="text-xs mb-2 block font-medium">Optimization focus</Label>
                <div className="space-y-2.5">
                  {(Object.keys(focusMeta) as Focus[]).map((k) => {
                    const item = focusMeta[k];
                    const Icon = item.icon;
                    const active = focus === k;
                    return (
                      <div
                        key={k}
                        onClick={() => setFocus(k)}
                        className={`group flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition select-none ${
                          active
                            ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                            : "border-border/60 bg-card/40 hover:border-primary/40 hover:bg-card/70"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center transition ${
                              active ? "border-primary" : "border-muted-foreground/40 group-hover:border-primary/60"
                            }`}
                          >
                            {active && <div className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
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

              <div className="pt-2">
                <Button
                  onClick={() => runAgents()}
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
                          onClick={(e) => handleOpenReport(c.id, e)}
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

      {/* Live Campaign Report Modal Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto glass border-primary/30 p-6 sm:p-8">
          <DialogHeader className="mb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary font-semibold">Live Campaign Report</div>
                <DialogTitle className="text-2xl font-bold mt-1 text-foreground">
                  {reportData?.campaign?.name || "Campaign Report"}
                </DialogTitle>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-primary font-semibold">{reportData?.campaign?.id || selectedId}</span>
                  <span>·</span>
                  <span>Targeting: <strong className="text-foreground capitalize">{reportData?.campaign?.device || "All"}</strong> ({reportData?.campaign?.timeOfDay || "All"})</span>
                  <span>·</span>
                  <span>Budget: <strong className="text-foreground">${Number(reportData?.campaign?.budget || 0).toLocaleString()}</strong></span>
                </div>
              </div>
              {reportData?.campaign?.id && (
                <Button
                  size="sm"
                  onClick={() => runAgents(reportData.campaign.id)}
                  className="gradient-bg text-white text-xs font-semibold shadow-md shadow-primary/20 shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Optimize Now
                </Button>
              )}
            </div>
          </DialogHeader>

          {reportLoading ? (
            <div className="py-12 text-center space-y-3">
              <Zap className="h-8 w-8 text-primary animate-pulse mx-auto" />
              <div className="text-sm font-medium text-muted-foreground">Loading fresh campaign records...</div>
            </div>
          ) : reportData ? (
            <div className="space-y-6">
              {/* 4 Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl border border-border/60 bg-card/60">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total Spend</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                    ${Number(reportData.summary?.totalSpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl border border-border/60 bg-card/60">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Conversions</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {Number(reportData.summary?.totalConversions || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    CPA: ${Number(reportData.summary?.cpc || 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl border border-border/60 bg-card/60">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total Clicks</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {Number(reportData.summary?.totalClicks || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    CTR: {Number(reportData.summary?.ctr || 0).toFixed(2)}%
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl border border-border/60 bg-card/60">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Ad Set Health</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                    <span className="text-success">{Number(reportData.summary?.activeAdsCount || 0)}</span>
                    <span className="text-muted-foreground text-sm font-normal"> active</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {Number(reportData.summary?.pausedAdsCount || 0)} paused by optimizer
                  </div>
                </div>
              </div>

              {/* Current Ads in this campaign (Only shows ads attributed to this campaign id from data/ads.csv) */}
              {(() => {
                const targetCid = (reportData.campaign?.id || "").trim().toUpperCase();
                const campaignAds = (reportData.ads || []).filter(
                  (ad) => (ad.campaignId || "").trim().toUpperCase() === targetCid
                );

                return (
                  <div className="rounded-2xl border border-border/60 bg-card/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-primary" /> Attributed Ads for {reportData.campaign?.id || "Campaign"}
                      </h3>
                      <span className="text-xs text-muted-foreground font-mono">{campaignAds.length} total</span>
                    </div>
                    {campaignAds.length > 0 ? (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {campaignAds.map((ad, aIdx) => {
                          const isPaused = (ad.status || "").toLowerCase() === "paused";
                          return (
                            <div
                              key={ad.id || `ad-${aIdx}`}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                                isPaused ? "border-destructive/30 bg-destructive/5 opacity-75" : "border-border/60 bg-card/60"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-3">
                                <span className="font-mono text-primary font-bold shrink-0">{ad.id}</span>
                                <span className="font-medium text-foreground truncate">{ad.headline || "Ad Creative"}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-muted-foreground">Score: {ad.qualityScore ?? "—"}</span>
                                <span className={`px-2 py-0.5 rounded-full capitalize text-[10px] font-semibold border ${
                                  isPaused ? "bg-warning/15 text-warning border-warning/30" : "bg-success/15 text-success border-success/30"
                                }`}>
                                  {ad.status || "active"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No ads found in ads.csv attributed to {reportData.campaign?.id || "this campaign"}.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Optimization Audit Trail / Change Logs */}
              <div className="rounded-2xl border border-border/60 bg-card/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <History className="h-4 w-4 text-accent" /> Optimization Audit Trail
                  </h3>
                  <span className="text-xs text-muted-foreground">Updates with each optimization</span>
                </div>

                {reportData.changes && reportData.changes.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {reportData.changes.map((log, lIdx) => {
                      let timeStr = "Recently";
                      try {
                        if (log.timestamp) {
                          const d = new Date(log.timestamp);
                          if (!isNaN(d.getTime())) {
                            timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          }
                        }
                      } catch {
                        timeStr = "Recently";
                      }
                      return (
                        <div key={log.logId || `log-${lIdx}`} className="p-2.5 rounded-xl border border-border/40 bg-card/60 text-xs flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-foreground">{log.details || "Optimization step executed"}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                              {log.changeType || "system"} · Target: {log.targetId || "N/A"} · {timeStr}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                    No automated changes logged yet. Click &ldquo;Optimize Now&rdquo; to test the multi-agent autopilot.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No report available for this campaign.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
