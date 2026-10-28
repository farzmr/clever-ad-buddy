import "@/lib/fonts";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { fetchCampaignReport, type CampaignReportResponse } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  TrendingUp,
  History,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const searchSchema = z.object({
  id: z.string().default("C001"),
});

export const Route = createFileRoute("/report")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Campaign Performance Report — AdPilot" },
      { name: "description", content: "Campaign Ad Performance Records from ad_performance.csv" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const search = Route.useSearch();
  const campaignId = (search.id as string) || "C001";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<CampaignReportResponse | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchCampaignReport(campaignId).then((data) => {
      if (!active) return;
      setReportData(data);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [campaignId]);

  const camp = reportData?.campaign;
  const objective = camp?.objective || "conversions";
  const focus = objective.toLowerCase().includes("awareness")
    ? "awareness"
    : objective.toLowerCase().includes("traffic")
    ? "traffic"
    : "conversion";

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-bg grid place-items-center shadow-lg shadow-primary/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display font-semibold text-lg leading-tight">AdPilot</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Performance Report</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to campaigns
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => navigate({ to: "/optimize", search: { id: campaignId, focus } })}
              className="gradient-bg text-white text-xs font-semibold shadow-md shadow-primary/20"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Optimize Campaign
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Zap className="h-8 w-8 text-primary animate-pulse mx-auto" />
            <div className="text-sm font-medium text-muted-foreground">Loading performance records...</div>
          </div>
        ) : reportData ? (
          <>
            {/* Campaign Header Card (Matches Screenshot) */}
            <section className="glass rounded-3xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary font-bold mb-1">CAMPAIGN</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {camp?.name || `Campaign ${campaignId}`}
                </h1>
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2 flex-wrap font-sans">
                  <span className="font-mono text-primary font-bold">{camp?.id || campaignId}</span>
                  <span>·</span>
                  <span>{camp?.channel || "Google Display"}</span>
                  <span>·</span>
                  <span><strong className="text-foreground">${Number(camp?.budget || 0).toLocaleString()}</strong> budget</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-semibold text-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                  <span>🎯</span> Objective: {objective.charAt(0).toUpperCase() + objective.slice(1)}
                </Badge>
              </div>
            </section>

            {/* 1. Raw Ad Performance Dataset for the campaign (from ad_performance.csv) */}
            <section className="glass rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-2xl">📊</span> Campaign Ad Performance Records
                </h2>
                <Badge variant="outline" className="font-mono text-xs">
                  {(reportData.performanceRecords || []).length} records
                </Badge>
              </div>

              <div className="border border-border/60 rounded-2xl overflow-hidden bg-card/40">
                <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
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
                            No performance records found in ad_performance.csv for {campaignId}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 2. Raw Ads Table for the campaign with filtered columns (from ads.csv) */}
            {(() => {
              const targetCid = campaignId.trim().toUpperCase();
              const campaignAds = (reportData.ads || []).filter(
                (ad) => (ad.campaignId || "").trim().toUpperCase() === targetCid
              );

              return (
                <section className="glass rounded-3xl p-6 md:p-8 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <span className="text-2xl">📢</span> Active and Paused Ads
                    </h2>
                    <Badge variant="outline" className="font-mono text-xs">{campaignAds.length} total</Badge>
                  </div>

                  <div className="border border-border/60 rounded-2xl overflow-hidden bg-card/40">
                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
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
                                  <td className="py-2.5 px-3 text-muted-foreground max-w-[280px] truncate">{ad.body || "—"}</td>
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
                                No ads found in ads.csv attributed to {campaignId}.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* 3. Summary Metric Cards */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass p-5 rounded-2xl border border-border/60">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Spend</div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  ${Number(reportData.summary?.totalSpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="glass p-5 rounded-2xl border border-border/60">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Conversions</div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  {Number(reportData.summary?.totalConversions || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  CPA: ${Number(reportData.summary?.cpc || 0).toFixed(2)}
                </div>
              </div>
              <div className="glass p-5 rounded-2xl border border-border/60">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Clicks</div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  {Number(reportData.summary?.totalClicks || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  CTR: {Number(reportData.summary?.ctr || 0).toFixed(2)}%
                </div>
              </div>
              <div className="glass p-5 rounded-2xl border border-border/60">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Ad Set Health</div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  <span className="text-success">{Number(reportData.summary?.activeAdsCount || 0)}</span>
                  <span className="text-muted-foreground text-base font-normal"> active</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Number(reportData.summary?.pausedAdsCount || 0)} paused by optimizer
                </div>
              </div>
            </section>

            {/* 4. Optimization Audit Trail */}
            {reportData.changes && reportData.changes.length > 0 && (
              <section className="glass rounded-3xl p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <History className="h-5 w-5 text-accent" /> Optimization Audit Trail
                  </h2>
                  <span className="text-xs text-muted-foreground font-mono">{reportData.changes.length} events logged</span>
                </div>
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
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
                      <div key={log.logId || `log-${lIdx}`} className="p-3 rounded-xl border border-border/40 bg-card/60 text-xs flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground text-sm">{log.details || "Optimization step executed"}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                            {log.changeType || "system"} · Target: {log.targetId || "N/A"} · {timeStr}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No report found for campaign {campaignId}.
          </div>
        )}
      </main>
    </div>
  );
}
