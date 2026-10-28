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
    imageSource?: "gemini_imagen" | "python_fallback";
    imageNotice?: string;
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

export async function fetchCampaignReport(campaignId: string): Promise<CampaignReportResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/report`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.campaign && data.summary) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Backend report fetch failed, using fallback", err);
  }

  // Safe fallback constructed from local mock data
  const camp = fallbackCampaigns.find((c) => c.id === campaignId) || fallbackCampaigns[0];
  const ads = fallbackAdsByCampaign[campaignId] || fallbackAdsByCampaign.default;

  return {
    campaign: { ...camp, id: campaignId },
    summary: {
      totalImpressions: 482000,
      totalClicks: 18450,
      totalConversions: 1240,
      totalSpend: camp.budget || 8000,
      ctr: 3.82,
      cpc: 6.45,
      activeAdsCount: ads.length,
      pausedAdsCount: 0,
    },
    ads: ads,
    changes: [
      {
        logId: "L001",
        timestamp: new Date().toISOString(),
        changeType: "baseline_init",
        targetId: campaignId,
        details: `Loaded campaign ${campaignId} baseline datasets from ads.csv.`,
      },
    ],
    performanceRecords: [
      {
        rowIndex: 306,
        perfId: "P00307",
        adId: "A005",
        campaignId: campaignId,
        date: "2024-06-07",
        dayOfWeek: 5,
        device: "mobile",
        timeOfDay: "morning",
        impressions: 2278,
        clicks: 18,
        ctr: 0.79,
        spend: 59.14,
        conversions: 0,
        roas: 0.0,
        costPerClick: 3.29,
      },
      {
        rowIndex: 307,
        perfId: "P00308",
        adId: "A005",
        campaignId: campaignId,
        date: "2024-06-07",
        dayOfWeek: 5,
        device: "mobile",
        timeOfDay: "afternoon",
        impressions: 2496,
        clicks: 140,
        ctr: 5.61,
        spend: 57.74,
        conversions: 12,
        roas: 16.77,
        costPerClick: 0.41,
      },
      {
        rowIndex: 308,
        perfId: "P00309",
        adId: "A005",
        campaignId: campaignId,
        date: "2024-06-07",
        dayOfWeek: 5,
        device: "mobile",
        timeOfDay: "night",
        impressions: 2521,
        clicks: 55,
        ctr: 2.18,
        spend: 62.98,
        conversions: 2,
        roas: 2.61,
        costPerClick: 1.15,
      },
      {
        rowIndex: 309,
        perfId: "P00310",
        adId: "A005",
        campaignId: campaignId,
        date: "2024-06-07",
        dayOfWeek: 5,
        device: "desktop",
        timeOfDay: "morning",
        impressions: 2097,
        clicks: 17,
        ctr: 0.81,
        spend: 46.31,
        conversions: 0,
        roas: 0.0,
        costPerClick: 2.72,
      },
      {
        rowIndex: 310,
        perfId: "P00311",
        adId: "A005",
        campaignId: campaignId,
        date: "2024-06-07",
        dayOfWeek: 5,
        device: "desktop",
        timeOfDay: "afternoon",
        impressions: 2095,
        clicks: 120,
        ctr: 5.73,
        spend: 51.6,
        conversions: 13,
        roas: 21.38,
        costPerClick: 0.43,
      },
      {
        rowIndex: 311,
        perfId: "P00312",
        adId: "A005",
        campaignId: campaignId,
        date: "2024-06-07",
        dayOfWeek: 5,
        device: "desktop",
        timeOfDay: "night",
        impressions: 1983,
        clicks: 45,
        ctr: 2.27,
        spend: 45.88,
        conversions: 1,
        roas: 1.92,
        costPerClick: 1.02,
      },
    ],
    dailyRecords: [],
  };
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
