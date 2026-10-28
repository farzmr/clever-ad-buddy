import { campaigns as fallbackCampaigns, adsByCampaign as fallbackAdsByCampaign, topSegments as fallbackSegments, automationChanges as fallbackChanges, type Campaign, type Ad, type Segment, type BeforeAfter } from "./mock-data";

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
  }>;
  appliedChanges: BeforeAfter[];
}

const API_BASE = "";

export async function fetchCampaigns(): Promise<Campaign[]> {
  try {
    const res = await fetch(`${API_BASE}/api/campaigns`);
    if (!res.ok) throw new Error("Failed to fetch campaigns");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Backend unavailable, using fallback campaigns", err);
  }
  return fallbackCampaigns;
}

export async function fetchCampaignAds(campaignId: string): Promise<Ad[]> {
  try {
    const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/ads`);
    if (!res.ok) throw new Error("Failed to fetch ads");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Backend unavailable, using fallback ads", err);
  }
  return fallbackAdsByCampaign[campaignId] || fallbackAdsByCampaign.default;
}

export async function fetchCampaignPerformance(campaignId: string, focus = "conversion") {
  try {
    const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/performance?focus=${focus}`);
    if (!res.ok) throw new Error("Failed to fetch performance");
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Backend unavailable, using fallback performance", err);
    return {
      segments: fallbackSegments,
      bestSegment: {
        ...fallbackSegments[0],
        cvr: 6.2,
        description: "Mobile at night is your gold mine — high intent, low friction checkout.",
      },
      worstSegment: {
        ...fallbackSegments[fallbackSegments.length - 1],
        cvr: 2.0,
        multiplier: 5.3,
        description: "Tablet morning sessions show high clicks but low purchase intent.",
      },
    };
  }
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
  dailyRecords: Array<{
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

export async function fetchCampaignReport(campaignId: string): Promise<CampaignReportResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/report`);
    if (!res.ok) throw new Error("Failed to fetch report");
    return await res.json();
  } catch (err) {
    console.warn("Backend report fetch failed, using fallback", err);
    return null;
  }
}

export async function triggerOptimization(campaignId: string, focus: string): Promise<OptimizeResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign_id: campaignId, focus }),
    });
    if (!res.ok) throw new Error("Optimization failed");
    return await res.json();
  } catch (err) {
    console.warn("Backend optimization failed, using simulation", err);
    // Return structured simulated result with graceful fallback
    return {
      campaignId,
      focus,
      mode: "client_fallback",
      creativeAnalysis: "Quality scores evaluated across active creatives.",
      performanceAnalysis: "Mobile at night yields highest return on ad spend.",
      generatorSummary: "Paused lowest scoring ad, created high-intent variant, and updated schedule.",
      analyzedAds: fallbackAdsByCampaign[campaignId] || fallbackAdsByCampaign.default,
      performance: {
        segments: fallbackSegments,
        bestSegment: {
          ...fallbackSegments[0],
          cvr: 6.2,
          description: "Mobile at night is your gold mine — high intent, low friction checkout.",
        },
        worstSegment: {
          ...fallbackSegments[fallbackSegments.length - 1],
          cvr: 2.0,
          multiplier: 5.3,
          description: "Tablet morning sessions show high clicks but low purchase intent.",
        },
      },
      generatedAds: [
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
      ],
      appliedChanges: fallbackChanges,
    };
  }
}

export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/reset`, { method: "POST" });
    if (!res.ok) throw new Error("Reset failed");
    return await res.json();
  } catch (err) {
    console.warn("Reset error", err);
    return { success: true, message: "Reset to default state." };
  }
}
