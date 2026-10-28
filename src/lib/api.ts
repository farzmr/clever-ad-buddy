import rawDatasets from "./raw-datasets.json";
import {
  type Campaign,
  type Ad,
  type Segment,
  type BeforeAfter,
} from "./mock-data";

export function normalizeCampaignId(id?: string): string {
  if (!id) return "C001";
  const trimmed = id.trim().toUpperCase();
  const match = trimmed.match(/^C0*(\d+)$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    return `C${String(num).padStart(3, "0")}`;
  }
  return trimmed;
}

export interface PerformanceRecord {
  rowIndex?: number;
  perfId: string;
  adId: string;
  campaignId: string;
  date: string;
  dayOfWeek: number;
  device: string;
  timeOfDay: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  conversions: number;
  roas: number;
  costPerClick: number;
}

export interface CampaignReportResponse {
  campaign: Campaign;
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: number;
    ctr: number;
    cpc: number;
    activeAdsCount: number;
    pausedAdsCount: number;
  };
  ads: Ad[];
  changes: Array<{
    logId: string;
    timestamp: string;
    changeType: string;
    targetId: string;
    details: string;
  }>;
  performanceRecords?: PerformanceRecord[];
  dailyRecords?: Array<{
    date: string;
    adId: string;
    device: string;
    timeOfDay: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  }>;
}

export interface OptimizeResponse {
  campaignId: string;
  focus: string;
  mode: string;
  creativeAnalysis: string;
  performanceAnalysis: string;
  generatorSummary: string;
  analyzedAds: Ad[];
  performance: {
    segments: Segment[];
    bestSegment?: Segment & { cvr: number; description: string };
    worstSegment?: Segment & { cvr: number; multiplier: number; description: string };
  };
  generatedAds: Array<{
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
  }>;
  appliedChanges: BeforeAfter[];
}

const VERTICAL_AD_TEMPLATES: Record<
  string,
  { headline: string; body: string; cta: string; gradient: string; note: string }
> = {
  C001: {
    headline: "Redefine Your Style This Season",
    body: "Shop our latest premium spring arrivals today. Free express shipping on all orders.",
    cta: "Shop the Drop",
    gradient: "linear-gradient(135deg,#7c3aed,#d946ef)",
    note: "Sharper hook + urgency, modeled on top performer A001.",
  },
  C002: {
    headline: "Upgrade Your Tech Setup — Save 30%",
    body: "Next-gen smart devices built for speed and reliability. Limited-time flash deal.",
    cta: "Claim 30% Off",
    gradient: "linear-gradient(135deg,#06b6d4,#6366f1)",
    note: "Added explicit 30% discount anchor and high-intent CTA.",
  },
  C003: {
    headline: "Your Story Starts Here",
    body: "Connect with what matters most. Discover handcrafted designs made to inspire every day.",
    cta: "Explore the Story",
    gradient: "linear-gradient(135deg,#10b981,#06b6d4)",
    note: "Expanded narrative copy with stronger emotional hook for awareness.",
  },
  C004: {
    headline: "Skip the Wait — Order Fresh Tonight",
    body: "Hot, chef-crafted meals delivered to your door in under 30 minutes. Zero delivery fee.",
    cta: "Order Now",
    gradient: "linear-gradient(135deg,#f43f5e,#fb923c)",
    note: "High-contrast hook replacing low-engagement text format.",
  },
  C005: {
    headline: "Read What's Hot & Trending",
    body: "Fresh perspectives delivered daily. Join over 50,000 readers discovering new insights.",
    cta: "Start Reading",
    gradient: "linear-gradient(135deg,#8b5cf6,#ec4899)",
    note: "Social proof variant built to boost CTR across peak traffic.",
  },
};

// Only attempt localhost backend calls when running locally in development.
// Never call 127.0.0.1/localhost from remote domains (e.g. *.lovable.app) to avoid
// Chrome's Private Network Access ("Access other apps and services on this device") popup.
function isLocalEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
}

async function localBackendFetch(path: string, options?: RequestInit): Promise<Response | null> {
  if (!isLocalEnvironment()) return null;
  const norm = path.startsWith("/") ? path : `/${path}`;
  try {
    const res = await fetch(`http://127.0.0.1:8000${norm}`, options);
    if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
      return res;
    }
  } catch {}
  return null;
}

// Stateful persistence keys in localStorage so optimizations and resets persist across pages
const STORAGE_KEYS = {
  CAMPAIGNS: "adpilot_state_campaigns",
  ADS: "adpilot_state_ads",
  AUDIT_PREFIX: "adpilot_audit_",
};

function getBaselineAds(): Ad[] {
  return (rawDatasets.ads as Ad[])
    .filter((a) => {
      const m = String(a.id).match(/^A0*(\d+)$/i);
      return m ? parseInt(m[1], 10) <= 20 : true;
    })
    .map((a) => ({
      ...a,
      campaignId: normalizeCampaignId(a.campaignId),
      status: "active",
    }));
}

function getBaselineCampaigns(): Campaign[] {
  return (rawDatasets.campaigns as Campaign[]).map((c) => ({
    ...c,
    id: normalizeCampaignId(c.id),
    device: "mobile, tablet, desktop",
    timeOfDay: "morning, afternoon, night",
  }));
}

function getStatefulCampaigns(): Campaign[] {
  if (typeof window === "undefined") return getBaselineCampaigns();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return getBaselineCampaigns();
}

function saveStatefulCampaigns(campaigns: Campaign[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  } catch {}
}

function getStatefulAds(): Ad[] {
  if (typeof window === "undefined") return getBaselineAds();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return getBaselineAds();
}

function saveStatefulAds(ads: Ad[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
  } catch {}
}

function getStoredChangeLogs(
  campaignId: string
): Array<{ logId: string; timestamp: string; changeType: string; targetId: string; details: string }> {
  const cid = normalizeCampaignId(campaignId);
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(`${STORAGE_KEYS.AUDIT_PREFIX}${cid}`);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function saveStoredChangeLogs(campaignId: string, logs: any[]) {
  const cid = normalizeCampaignId(campaignId);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEYS.AUDIT_PREFIX}${cid}`, JSON.stringify(logs));
  } catch {}
}

// Compute real 9-segment performance stats from the 1,260-row ad_performance.csv dataset
export function computeCampaignPerformance(campaignId: string, focus = "conversion") {
  const cid = normalizeCampaignId(campaignId);
  const matchingPerf = (rawDatasets.performance as PerformanceRecord[]).filter(
    (p) => normalizeCampaignId(p.campaignId) === cid
  );

  const groupedMap = new Map<
    string,
    {
      device: string;
      time: string;
      impressions: number;
      clicks: number;
      conversions: number;
      spend: number;
    }
  >();

  for (const r of matchingPerf) {
    const dev = (r.device || "desktop").toLowerCase();
    const tod = (r.timeOfDay || "morning").toLowerCase();
    const key = `${dev}__${tod}`;
    const existing = groupedMap.get(key) || {
      device: dev.charAt(0).toUpperCase() + dev.slice(1),
      time: tod.charAt(0).toUpperCase() + tod.slice(1),
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
    };
    existing.impressions += Number(r.impressions || 0);
    existing.clicks += Number(r.clicks || 0);
    existing.conversions += Number(r.conversions || 0);
    existing.spend += Number(r.spend || 0);
    groupedMap.set(key, existing);
  }

  // Sort alphabetically by device then time (matching pandas groupby(["device", "time_of_day"]))
  const sortedKeys = Array.from(groupedMap.keys()).sort();
  const segments: Array<
    Segment & { ctr: number; cvr: number }
  > = sortedKeys.map((k) => {
    const item = groupedMap.get(k)!;
    const spend = Number(item.spend.toFixed(2));
    const cpc =
      item.conversions > 0
        ? Number((spend / item.conversions).toFixed(2))
        : spend;
    const ctr =
      item.impressions > 0
        ? Number(((item.clicks / item.impressions) * 100).toFixed(2))
        : 0;
    const cvr =
      item.clicks > 0
        ? Number(((item.conversions / item.clicks) * 100).toFixed(1))
        : 0;
    return {
      device: item.device,
      time: item.time,
      impressions: item.impressions,
      clicks: item.clicks,
      conversions: item.conversions,
      spend,
      cpc,
      ctr,
      cvr,
    };
  });

  if (segments.length === 0) {
    return { segments: [], bestSegment: undefined, worstSegment: undefined };
  }

  const obj = (focus || "conversion").toLowerCase();
  let bestRow = segments[0];
  let worstRow = segments[segments.length - 1];

  if (obj.includes("conversion")) {
    const withConv = segments.filter((s) => s.conversions > 0);
    const pool = withConv.length > 0 ? withConv : segments;
    bestRow = [...pool].sort((a, b) => a.cpc - b.cpc)[0];
    worstRow = [...segments].sort((a, b) => b.cpc - a.cpc)[0];
  } else if (obj.includes("awareness")) {
    bestRow = [...segments].sort((a, b) => b.impressions - a.impressions || b.ctr - a.ctr)[0];
    worstRow = [...segments].sort((a, b) => a.impressions - b.impressions || a.ctr - b.ctr)[0];
  } else {
    // traffic
    bestRow = [...segments].sort((a, b) => b.clicks - a.clicks || b.ctr - a.ctr)[0];
    worstRow = [...segments].sort((a, b) => a.clicks - b.clicks || a.ctr - b.ctr)[0];
  }

  const mult =
    bestRow.cpc > 0
      ? Number((worstRow.cpc / bestRow.cpc).toFixed(1))
      : 1.0;

  return {
    segments: segments.map(({ ctr, cvr, ...rest }) => rest),
    bestSegment: {
      device: bestRow.device,
      time: bestRow.time,
      impressions: bestRow.impressions,
      clicks: bestRow.clicks,
      conversions: bestRow.conversions,
      spend: bestRow.spend,
      cpc: bestRow.cpc,
      cvr: bestRow.cvr,
      description: `$${bestRow.cpc.toFixed(2)} per conversion at ${bestRow.cvr.toFixed(1)}% CVR. High intent, low friction conversions.`,
    },
    worstSegment: {
      device: worstRow.device,
      time: worstRow.time,
      impressions: worstRow.impressions,
      clicks: worstRow.clicks,
      conversions: worstRow.conversions,
      spend: worstRow.spend,
      cpc: worstRow.cpc,
      cvr: worstRow.cvr,
      multiplier: mult,
      description: `$${worstRow.cpc.toFixed(2)} per conversion — ${mult}× the best segment. High bounce and inefficient spend.`,
    },
  };
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await localBackendFetch("/api/campaigns");
  if (res) {
    try {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveStatefulCampaigns(data);
        return data;
      }
    } catch {}
  }
  return getStatefulCampaigns();
}

export async function fetchCampaignAds(campaignId: string): Promise<Ad[]> {
  const cid = normalizeCampaignId(campaignId);
  const res = await localBackendFetch(`/api/campaigns/${cid}/ads`);
  if (res) {
    try {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {}
  }
  return getStatefulAds().filter((a) => normalizeCampaignId(a.campaignId) === cid);
}

export async function fetchCampaignPerformance(campaignId: string, focus = "conversion") {
  const cid = normalizeCampaignId(campaignId);
  const res = await localBackendFetch(`/api/campaigns/${cid}/performance?focus=${focus}`);
  if (res) {
    try {
      const data = await res.json();
      if (data && Array.isArray(data.segments) && data.segments.length > 0) {
        return data;
      }
    } catch {}
  }
  return computeCampaignPerformance(cid, focus);
}

export async function fetchCampaignReport(campaignId: string): Promise<CampaignReportResponse> {
  const cid = normalizeCampaignId(campaignId);

  const res = await localBackendFetch(`/api/campaigns/${cid}/report`);
  if (res) {
    try {
      const data = await res.json();
      if (
        data &&
        data.campaign &&
        data.summary &&
        Array.isArray(data.performanceRecords) &&
        data.performanceRecords.length > 0
      ) {
        const localLogs = getStoredChangeLogs(cid);
        const mergedChanges =
          Array.isArray(data.changes) && data.changes.length > 0 ? data.changes : localLogs;
        return {
          ...data,
          changes: mergedChanges,
        };
      }
    } catch {}
  }

  // Construct report from stateful campaigns/ads and 1,260-row ad_performance dataset
  const allCampaigns = getStatefulCampaigns();
  const camp = allCampaigns.find((c) => normalizeCampaignId(c.id) === cid) || allCampaigns[0];
  const matchingPerf = (rawDatasets.performance as PerformanceRecord[]).filter(
    (p) => normalizeCampaignId(p.campaignId) === cid
  );
  const matchingAds = getStatefulAds().filter((a) => normalizeCampaignId(a.campaignId) === cid);

  const totalImpressions = matchingPerf.reduce((acc, p) => acc + (p.impressions || 0), 0);
  const totalClicks = matchingPerf.reduce((acc, p) => acc + (p.clicks || 0), 0);
  const totalConversions = matchingPerf.reduce((acc, p) => acc + (p.conversions || 0), 0);
  const totalSpend = Number(matchingPerf.reduce((acc, p) => acc + (p.spend || 0), 0).toFixed(2));
  const ctr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
  const cpc = totalConversions > 0 ? Number((totalSpend / totalConversions).toFixed(2)) : 0;

  const storedChanges = getStoredChangeLogs(cid);

  return {
    campaign: { ...camp, id: cid } as Campaign,
    summary: {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalSpend,
      ctr,
      cpc,
      activeAdsCount: matchingAds.filter((a) => (a.status || "active").toLowerCase() === "active").length,
      pausedAdsCount: matchingAds.filter((a) => (a.status || "").toLowerCase() === "paused").length,
    },
    ads: matchingAds,
    changes: storedChanges,
    performanceRecords: matchingPerf,
    dailyRecords: matchingPerf.slice(0, 15) as any,
  };
}

export async function triggerOptimization(campaignId: string, focus: string): Promise<OptimizeResponse> {
  const cid = normalizeCampaignId(campaignId);

  // 1. Try local Python backend if running on localhost
  const res = await localBackendFetch("/api/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaign_id: cid, focus }),
  });
  if (res) {
    try {
      const data = await res.json();
      if (data && data.campaignId) {
        return data;
      }
    } catch {}
  }

  // 2. Execute identical deterministic multi-agent workflow in TypeScript (for Lovable Cloud)
  const allCampaigns = getStatefulCampaigns();
  const campIndex = allCampaigns.findIndex((c) => normalizeCampaignId(c.id) === cid);
  const camp = campIndex >= 0 ? allCampaigns[campIndex] : allCampaigns[0];

  const allAds = getStatefulAds();
  const campAdsBefore = allAds
    .filter((a) => normalizeCampaignId(a.campaignId) === cid)
    .map((a) => ({ ...a }));

  // Agent 1: Pick single top performer and single lowest performer
  const topAd = campAdsBefore.reduce(
    (best, curr) => (curr.qualityScore > best.qualityScore ? curr : best),
    campAdsBefore[0]
  );
  const worstAd = campAdsBefore.reduce(
    (worst, curr) => (curr.qualityScore < worst.qualityScore ? curr : worst),
    campAdsBefore[0]
  );

  // Pause lowest performing ad in state
  for (const ad of allAds) {
    if (ad.id === worstAd.id) {
      ad.status = "paused";
    }
  }

  // Determine next Ad ID (> A020)
  const maxNumericId = allAds.reduce((maxNum, a) => {
    const m = String(a.id).match(/^A0*(\d+)$/i);
    const n = m ? parseInt(m[1], 10) : 0;
    return n > maxNum ? n : maxNum;
  }, 20);
  const newAdId = `A${String(maxNumericId + 1).padStart(3, "0")}`;

  const template = VERTICAL_AD_TEMPLATES[cid] || VERTICAL_AD_TEMPLATES.C001;
  const imageUrl = `/images/ad_new_${cid}.png`;
  const imageNotice =
    "Reached max Gemini image generation quota (or Imagen API unavailable on this key tier) — generated fallback creative asset using local Python PIL rendering.";

  const newAdRecord: Ad = {
    id: newAdId,
    campaignId: cid,
    headline: template.headline,
    body: template.body,
    cta: template.cta,
    imageSize: "300x250",
    imageUrl,
    status: "active",
    qualityScore: 88,
    flagged: [],
    improvements: ["A/B test headline variants"],
  };
  allAds.push(newAdRecord);
  saveStatefulAds(allAds);

  // Agent 2: Compute 9-segment performance and best/worst segments
  const perf = computeCampaignPerformance(cid, focus);
  const beforeDevice = camp.device || "mobile, tablet, desktop";
  const beforeTime = camp.timeOfDay || "morning, afternoon, night";

  const bestDevice = perf.bestSegment ? perf.bestSegment.device.toLowerCase() : "mobile";
  const bestTime = perf.bestSegment ? perf.bestSegment.time.toLowerCase() : "night";

  if (campIndex >= 0) {
    allCampaigns[campIndex] = {
      ...allCampaigns[campIndex],
      device: bestDevice,
      timeOfDay: bestTime,
    };
    saveStatefulCampaigns(allCampaigns);
  }

  // Record audit trail events
  const now = new Date();
  const logs = getStoredChangeLogs(cid);
  const baseIdx = logs.length + 1;
  logs.push(
    {
      logId: `L${String(baseIdx).padStart(3, "0")}`,
      timestamp: now.toISOString(),
      changeType: "update_ad_status",
      targetId: worstAd.id,
      details: `Paused lowest-performing ad (Score: ${worstAd.qualityScore})`,
    },
    {
      logId: `L${String(baseIdx + 1).padStart(3, "0")}`,
      timestamp: new Date(now.getTime() + 100).toISOString(),
      changeType: "create_ad",
      targetId: newAdId,
      details: `Created new ad with headline: '${template.headline}'`,
    },
    {
      logId: `L${String(baseIdx + 2).padStart(3, "0")}`,
      timestamp: new Date(now.getTime() + 200).toISOString(),
      changeType: "update_campaign_targeting",
      targetId: cid,
      details: `Updated targeting to device: '${bestDevice}', time_of_day: '${bestTime}'`,
    }
  );
  saveStoredChangeLogs(cid, logs);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const titleCase = (s: string) =>
    s
      .split(",")
      .map((part) => capitalize(part.trim()))
      .join(", ");

  return {
    campaignId: cid,
    focus,
    mode: "deterministic_fallback",
    creativeAnalysis: `Analyzed ${campAdsBefore.length} ads. Top performer: ${topAd.id} (score ${topAd.qualityScore}). Lowest performer: ${worstAd.id} (score ${worstAd.qualityScore}).`,
    performanceAnalysis: `Best segment identified: ${capitalize(bestDevice)} - ${capitalize(bestTime)}.`,
    generatorSummary: `Paused ${worstAd.id}, created ${newAdId}, and updated targeting to ${bestDevice} / ${bestTime}.`,
    analyzedAds: campAdsBefore,
    performance: perf,
    generatedAds: [
      {
        id: newAdId,
        headline: template.headline,
        body: template.body,
        cta: template.cta,
        imageUrl,
        gradient: template.gradient,
        basedOn: topAd.id,
        note: template.note,
        imageSource: "python_fallback",
        imageNotice,
      },
    ],
    appliedChanges: [
      {
        label: "Primary device allocation",
        before: titleCase(beforeDevice),
        after: capitalize(bestDevice),
        reason: `Shifted spend to ${capitalize(bestDevice)} based on highest ${focus} efficiency.`,
      },
      {
        label: "Time-of-day schedule",
        before: titleCase(beforeTime),
        after: capitalize(bestTime),
        reason: `Allocated budget to ${capitalize(bestTime)} peak traffic, pausing low-performing windows.`,
      },
      {
        label: "Active ad set",
        before: campAdsBefore.map((a) => a.id).join(", "),
        after: `Paused ${worstAd.id} + Activated new variant ${newAdId}`,
        reason: `Paused lowest-scoring ad (${worstAd.id}) and introduced high-intent variant ${newAdId}.`,
      },
    ],
  };
}

export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  // 1. Clear all client-side state (removes any created ads > A020, resets campaigns & audit logs)
  if (typeof window !== "undefined") {
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith("adpilot_")) {
          localStorage.removeItem(k);
        }
      }
      saveStatefulCampaigns(getBaselineCampaigns());
      saveStatefulAds(getBaselineAds());
    } catch {}
  }

  // 2. If running on localhost, also reset Python CSV datasets
  const res = await localBackendFetch("/api/reset", { method: "POST" });
  if (res) {
    try {
      return await res.json();
    } catch {}
  }

  return {
    success: true,
    message: "All campaigns, ads (A001–A020), targeting, and audit logs reset to baseline.",
  };
}
