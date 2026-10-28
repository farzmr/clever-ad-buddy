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
        <section className="grid lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-8 items-start">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
              Three agents. <span className="gradient-text">One click.</span><br />
              Your campaigns, optimized.
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              AdPilot deploys three coordinated AI agents to continuously diagnose, benchmark, and scale your digital advertising portfolios in real-time. Agent 1 audits creative headlines, copy quality, and policy compliance. Agent 2 computes granular multidimensional performance across device segments and dayparting schedules to uncover wasted ad spend. Agent 3 synthesizes these findings to autonomously write high-converting creative variants and reschedule budgets for maximum conversion return.
            </p>
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
        <DialogContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-y-auto glass border-primary/30 p-5 sm:p-7">
          <DialogHeader className="mb-2">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border/40">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-primary">CAMPAIGN</div>
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
                  {reportData?.campaign?.name || "Campaign Details"}
                </DialogTitle>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-primary font-bold">{reportData?.campaign?.id || selectedId}</span>
                  <span>·</span>
                  <span>{reportData?.campaign?.channel || "Google Display"}</span>
                  <span>·</span>
                  <span><strong>${Number(reportData?.campaign?.budget || 0).toLocaleString()}</strong> budget</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-medium text-xs px-3 py-1.5 flex items-center gap-1.5">
                  <span>🎯</span> Objective: {reportData?.campaign?.objective ? reportData.campaign.objective.charAt(0).toUpperCase() + reportData.campaign.objective.slice(1) : "Conversions"}
                </Badge>
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
            </div>
          </DialogHeader>

          {reportLoading ? (
            <div className="py-12 text-center space-y-3">
              <Zap className="h-8 w-8 text-primary animate-pulse mx-auto" />
              <div className="text-sm font-medium text-muted-foreground">Loading fresh campaign records...</div>
            </div>
          ) : reportData ? (
            <div className="space-y-6">
              {/* 1. Raw Ad Performance Dataset for the campaign (from ad_performance.csv) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="text-lg">📊</span> Campaign Ad Performance Records
                  </h3>
                  <Badge variant="outline" className="font-mono text-xs">
                    {(reportData.performanceRecords || []).length} records
                  </Badge>
                </div>

                <div className="border border-border/60 rounded-2xl overflow-hidden bg-card/40">
                  <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/80 backdrop-blur sticky top-0 z-10 border-b border-border/60 text-muted-foreground uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3 text-left font-semibold">#</th>
                          <th className="py-2.5 px-3 text-left font-semibold">perf_id</th>
                          <th className="py-2.5 px-3 text-left font-semibold">ad_id</th>
                          <th className="py-2.5 px-3 text-left font-semibold">campaign_id</th>
                          <th className="py-2.5 px-3 text-left font-semibold">date</th>
                          <th className="py-2.5 px-3 text-center font-semibold">day_of_week</th>
                          <th className="py-2.5 px-3 text-left font-semibold">device</th>
                          <th className="py-2.5 px-3 text-left font-semibold">time_of_day</th>
                          <th className="py-2.5 px-3 text-right font-semibold">impressions</th>
                          <th className="py-2.5 px-3 text-right font-semibold">clicks</th>
                          <th className="py-2.5 px-3 text-right font-semibold">ctr</th>
                          <th className="py-2.5 px-3 text-right font-semibold">spend</th>
                          <th className="py-2.5 px-3 text-right font-semibold">conversions</th>
                          <th className="py-2.5 px-3 text-right font-semibold">roas</th>
                          <th className="py-2.5 px-3 text-right font-semibold">cost_per_click</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20 font-mono">
                        {(reportData.performanceRecords && reportData.performanceRecords.length > 0) ? (
                          reportData.performanceRecords.map((r, i) => (
                            <tr key={r.perfId || i} className="hover:bg-primary/5 transition">
                              <td className="py-2 px-3 text-muted-foreground">{r.rowIndex ?? (i + 1)}</td>
                              <td className="py-2 px-3 text-primary font-semibold">{r.perfId}</td>
                              <td className="py-2 px-3">{r.adId}</td>
                              <td className="py-2 px-3">{r.campaignId}</td>
                              <td className="py-2 px-3 text-muted-foreground">{r.date}</td>
                              <td className="py-2 px-3 text-center text-muted-foreground">{r.dayOfWeek}</td>
                              <td className="py-2 px-3 capitalize font-sans">{r.device}</td>
                              <td className="py-2 px-3 capitalize font-sans">{r.timeOfDay}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{Number(r.impressions || 0).toLocaleString()}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{Number(r.clicks || 0).toLocaleString()}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{Number(r.ctr || 0).toFixed(2)}</td>
                              <td className="py-2 px-3 text-right tabular-nums">${Number(r.spend || 0).toFixed(2)}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{r.conversions || 0}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{Number(r.roas || 0).toFixed(2)}</td>
                              <td className="py-2 px-3 text-right tabular-nums">${Number(r.costPerClick || 0).toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={15} className="py-8 text-center text-muted-foreground">
                              No performance records found for {reportData.campaign?.id || "this campaign"}.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 2. Raw Ads Table for the campaign with filtered columns (from ads.csv) */}
              {(() => {
                const targetCid = (reportData.campaign?.id || "").trim().toUpperCase();
                const campaignAds = (reportData.ads || []).filter(
                  (ad) => (ad.campaignId || "").trim().toUpperCase() === targetCid
                );

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                        <span className="text-lg">📢</span> Active and Paused Ads
                      </h3>
                      <Badge variant="outline" className="font-mono text-xs">{campaignAds.length} total</Badge>
                    </div>

                    <div className="border border-border/60 rounded-2xl overflow-hidden bg-card/40">
                      <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/80 backdrop-blur sticky top-0 z-10 border-b border-border/60 text-muted-foreground uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-2.5 px-3 text-left font-semibold">ad_id</th>
                              <th className="py-2.5 px-3 text-left font-semibold">headline</th>
                              <th className="py-2.5 px-3 text-left font-semibold">body_text</th>
                              <th className="py-2.5 px-3 text-left font-semibold">cta</th>
                              <th className="py-2.5 px-3 text-left font-semibold">image_size</th>
                              <th className="py-2.5 px-3 text-center font-semibold">quality_score</th>
                              <th className="py-2.5 px-3 text-center font-semibold">status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20">
                            {campaignAds.length > 0 ? (
                              campaignAds.map((ad, aIdx) => {
                                const isPaused = (ad.status || "").toLowerCase() === "paused";
                                return (
                                  <tr key={ad.id || `ad-${aIdx}`} className="hover:bg-primary/5 transition">
                                    <td className="py-2.5 px-3 font-mono font-bold text-primary">{ad.id}</td>
                                    <td className="py-2.5 px-3 font-medium text-foreground max-w-[200px] truncate">{ad.headline || "—"}</td>
                                    <td className="py-2.5 px-3 text-muted-foreground max-w-[260px] truncate">{ad.body || "—"}</td>
                                    <td className="py-2.5 px-3 text-foreground">{ad.cta || "Learn More"}</td>
                                    <td className="py-2.5 px-3 font-mono text-muted-foreground">{ad.imageSize || "300x250"}</td>
                                    <td className="py-2.5 px-3 text-center font-mono font-semibold">{ad.qualityScore ?? "—"}</td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className={`px-2 py-0.5 rounded-full capitalize text-[10px] font-semibold border ${
                                        isPaused ? "bg-warning/15 text-warning border-warning/30" : "bg-success/15 text-success border-success/30"
                                      }`}>
                                        {ad.status || "active"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={7} className="py-6 text-center text-muted-foreground">
                                  No ads found in ads.csv attributed to {reportData.campaign?.id || "this campaign"}.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Summary Metric Cards & Optimization Audit Trail */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
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
                    {Number(reportData.summary?.pausedAdsCount || 0)} paused
                  </div>
                </div>
              </div>

              {/* Optimization Audit Trail */}
              {reportData.changes && reportData.changes.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-card/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <History className="h-4 w-4 text-accent" /> Optimization Audit Trail
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">{reportData.changes.length} events</span>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
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
                </div>
              )}
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
