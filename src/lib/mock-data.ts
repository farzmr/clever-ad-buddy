export type CampaignStatus = "active" | "paused" | "draft";

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  status: CampaignStatus;
  startDate: string;
}

export const campaigns: Campaign[] = [
  { id: "CMP-1042", name: "Summer Sneaker Launch", channel: "Meta Ads", budget: 24500, status: "active", startDate: "2026-05-12" },
  { id: "CMP-1043", name: "Back to School — Gen Z", channel: "TikTok", budget: 18900, status: "active", startDate: "2026-06-01" },
  { id: "CMP-1044", name: "Pro Subscription Upsell", channel: "Google Search", budget: 32100, status: "active", startDate: "2026-04-22" },
  { id: "CMP-1045", name: "Holiday Teaser — EU", channel: "YouTube", budget: 12000, status: "paused", startDate: "2026-06-15" },
  { id: "CMP-1046", name: "B2B Demo Drive", channel: "LinkedIn", budget: 9800, status: "active", startDate: "2026-03-30" },
  { id: "CMP-1047", name: "Retargeting — Cart Abandon", channel: "Meta Ads", budget: 7600, status: "draft", startDate: "2026-06-28" },
];

export interface Ad {
  id: string;
  headline: string;
  body: string;
  cta: string;
  imageSize: string;
  imageGradient: string;
  imageLabel: string;
  qualityScore: number;
  flagged: string[];
  improvements: string[];
}

export const adsByCampaign: Record<string, Ad[]> = {
  default: [
    {
      id: "AD-7781",
      headline: "Step Into Summer. Lightweight. Bold.",
      body: "Our new mesh runners are 32% lighter — built for city heat and weekend trails.",
      cta: "Shop the Drop",
      imageSize: "1200×628",
      imageGradient: "linear-gradient(135deg,#f97316,#ec4899)",
      imageLabel: "Hero — sneaker on gradient",
      qualityScore: 87,
      flagged: [],
      improvements: ["Add price anchor in headline", "Test square 1:1 variant for Reels"],
    },
    {
      id: "AD-7782",
      headline: "Click Here For Shoes",
      body: "Buy shoes now! Limited time! Best shoes!!!",
      cta: "Buy",
      imageSize: "600×600",
      imageGradient: "linear-gradient(135deg,#475569,#1e293b)",
      imageLabel: "Stock photo — generic",
      qualityScore: 38,
      flagged: ["Clickbait headline", "Low-res creative", "Weak CTA", "Punctuation spam"],
      improvements: ["Rewrite headline with benefit + product", "Upscale to 1200×628", "Use action CTA ('Shop the Drop')"],
    },
    {
      id: "AD-7783",
      headline: "Engineered For The Long Run",
      body: "Carbon plate. Breathable knit. 5-star reviews from 12,000 runners.",
      cta: "See Reviews",
      imageSize: "1080×1080",
      imageGradient: "linear-gradient(135deg,#a855f7,#6366f1)",
      imageLabel: "Lifestyle — runner mid-stride",
      qualityScore: 79,
      flagged: ["No price visible"],
      improvements: ["Overlay 'From $89' badge", "A/B test shorter body copy"],
    },
    {
      id: "AD-7784",
      headline: "New Arrivals",
      body: "Check out our latest collection of running shoes available now in store.",
      cta: "Learn More",
      imageSize: "1200×628",
      imageGradient: "linear-gradient(135deg,#64748b,#334155)",
      imageLabel: "Product flat-lay",
      qualityScore: 52,
      flagged: ["Generic headline", "Passive CTA"],
      improvements: ["Lead with specific product name", "Replace 'Learn More' with conversion CTA"],
    },
    {
      id: "AD-7785",
      headline: "Trail Tested. City Approved.",
      body: "From Brooklyn pavement to Catskills singletrack — one shoe, every surface.",
      cta: "Find Your Pair",
      imageSize: "1200×628",
      imageGradient: "linear-gradient(135deg,#10b981,#0ea5e9)",
      imageLabel: "Split scene — city/trail",
      qualityScore: 83,
      flagged: [],
      improvements: ["Test video version", "Add UGC carousel variant"],
    },
  ],
};

export interface Segment {
  device: string;
  time: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  cpc: number;
}

export const topSegments: Segment[] = [
  { device: "Mobile — iOS", time: "Weekday 6pm–10pm", impressions: 184320, clicks: 9821, conversions: 612, spend: 4280, cpc: 6.99 },
  { device: "Desktop", time: "Weekday 12pm–2pm", impressions: 76210, clicks: 3104, conversions: 198, spend: 2940, cpc: 14.85 },
  { device: "Mobile — Android", time: "Weekend 9am–12pm", impressions: 142005, clicks: 4218, conversions: 84, spend: 3120, cpc: 37.14 },
];

export interface BeforeAfter {
  label: string;
  before: string;
  after: string;
  reason: string;
}

export const automationChanges: BeforeAfter[] = [
  {
    label: "Primary device allocation",
    before: "40% Mobile-iOS / 35% Android / 25% Desktop",
    after: "62% Mobile-iOS / 18% Android / 20% Desktop",
    reason: "iOS converts at 6.2% vs Android 2.0% — shifted spend to highest CPA-efficient device.",
  },
  {
    label: "Dayparting schedule",
    before: "Always-on 24/7",
    after: "Weekday 11am–10pm + Weekend 9am–1pm",
    reason: "92% of conversions happen in these windows. Off-hours wasted ~$1,840/wk.",
  },
  {
    label: "Active ad set",
    before: "AD-7781, AD-7782, AD-7783, AD-7784, AD-7785",
    after: "AD-7781, AD-7783, AD-7785 + AD-7786 (new), AD-7787 (new)",
    reason: "Paused AD-7782 (score 38) and AD-7784 (score 52). Promoted top 3 + 2 generated variants.",
  },
];
