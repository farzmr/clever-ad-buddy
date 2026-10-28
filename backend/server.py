import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CAMPAIGNS_FILE = os.path.join(DATA_DIR, "campaigns.csv")
ADS_FILE = os.path.join(DATA_DIR, "ads.csv")
PERFORMANCE_FILE = os.path.join(DATA_DIR, "ad_performance.csv")
GENERATED_ADS_DIR = os.path.join(BASE_DIR, "generated_ads")
os.makedirs(GENERATED_ADS_DIR, exist_ok=True)

from orchestrator import (
    reset_datasets,
    get_ad_analysis,
    get_campaign_performance_data,
    get_best_worst_segments,
    run_optimization_workflow,
    execute_fallback_optimization,
    create_local_fallback_image,
)

# Core Business Logic Helpers
def list_campaigns_data():
    if not os.path.exists(CAMPAIGNS_FILE):
        return []
    df = pd.read_csv(CAMPAIGNS_FILE)
    campaigns = []
    for _, row in df.iterrows():
        campaigns.append({
            "id": str(row.get("campaign_id")),
            "name": str(row.get("name")),
            "objective": str(row.get("objective", "conversion")),
            "channel": str(row.get("channel", "Meta Ads")),
            "budget": int(row.get("total_budget", 0)),
            "status": str(row.get("status", "active")).lower(),
            "startDate": str(row.get("start_date", "2026-01-01")),
            "endDate": str(row.get("end_date", "2026-12-31")),
            "device": str(row.get("device", "all")),
            "timeOfDay": str(row.get("time_of_day", "all")),
        })
    return campaigns

def get_campaign_ads_data(campaign_id: str):
    if not os.path.exists(ADS_FILE):
        return []
    df = pd.read_csv(ADS_FILE)
    camp_ads = df[df["campaign_id"].astype(str) == str(campaign_id)]
    
    ads = []
    for _, row in camp_ads.iterrows():
        ad_id = str(row.get("ad_id"))
        analysis = get_ad_analysis(ad_id, str(row.get("headline")), str(row.get("body_text")))
        ads.append({
            "id": ad_id,
            "campaignId": str(row.get("campaign_id")),
            "headline": str(row.get("headline", "")),
            "body": str(row.get("body_text", "")),
            "cta": str(row.get("cta", "Learn More")),
            "imageSize": str(row.get("image_size", "300x250")),
            "imageUrl": str(row.get("image_url", "")),
            "status": str(row.get("status", "active")),
            "qualityScore": analysis["quality"],
            "flagged": analysis["flagged"],
            "improvements": analysis["recommendations"],
        })
    return ads

def get_campaign_performance_data_response(campaign_id: str, focus: str = "conversion"):
    grouped_df = get_campaign_performance_data(campaign_id)
    if grouped_df.empty:
        return {"segments": [], "bestSegment": None, "worstSegment": None}
        
    segments = []
    for _, row in grouped_df.iterrows():
        segments.append({
            "device": str(row["device"]).capitalize(),
            "time": str(row["time_of_day"]).capitalize(),
            "impressions": int(row["impressions"]),
            "clicks": int(row["clicks"]),
            "conversions": int(row["conversions"]),
            "spend": float(row["spend"]),
            "cpc": float(row["cost_per_conv"]),
        })
        
    best_row, worst_row = get_best_worst_segments(grouped_df, focus)
    
    best_seg = None
    if best_row:
        best_cvr = round((best_row["conversions"] / (best_row["clicks"] or 1) * 100), 1) if best_row["clicks"] > 0 else 0.0
        best_seg = {
            "device": str(best_row["device"]).capitalize(),
            "time": str(best_row["time_of_day"]).capitalize(),
            "impressions": int(best_row["impressions"]),
            "clicks": int(best_row["clicks"]),
            "conversions": int(best_row["conversions"]),
            "spend": float(best_row["spend"]),
            "cpc": float(best_row["cost_per_conv"]),
            "cvr": best_cvr,
            "description": f"${best_row['cost_per_conv']:.2f} per conversion at {best_cvr}% CVR. High intent, low friction conversions."
        }
        
    worst_seg = None
    if worst_row:
        worst_cvr = round((worst_row["conversions"] / (worst_row["clicks"] or 1) * 100), 1) if worst_row["clicks"] > 0 else 0.0
        mult = round(worst_row["cost_per_conv"] / (best_row["cost_per_conv"] or 1.0), 1) if best_row else 1.0
        worst_seg = {
            "device": str(worst_row["device"]).capitalize(),
            "time": str(worst_row["time_of_day"]).capitalize(),
            "impressions": int(worst_row["impressions"]),
            "clicks": int(worst_row["clicks"]),
            "conversions": int(worst_row["conversions"]),
            "spend": float(worst_row["spend"]),
            "cpc": float(worst_row["cost_per_conv"]),
            "cvr": worst_cvr,
            "multiplier": mult,
            "description": f"${worst_row['cost_per_conv']:.2f} per conversion — {mult}× the best segment. High bounce and inefficient spend."
        }
        
    return {
        "segments": segments,
        "bestSegment": best_seg,
        "worstSegment": worst_seg
    }

def optimize_campaign_data(campaign_id: str, focus: str = "conversion"):
    import asyncio
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(run_optimization_workflow(campaign_id, focus))
    except Exception as e:
        print(f"Workflow exception: {e}. Using deterministic fallback.")
        result = execute_fallback_optimization(campaign_id, focus)
        
    ads = get_campaign_ads_data(campaign_id)
    perf = get_campaign_performance_data_response(campaign_id, focus)
    
    return {
        "campaignId": campaign_id,
        "focus": focus,
        "mode": result.get("mode", "fallback"),
        "creativeAnalysis": result.get("creative_analysis", ""),
        "performanceAnalysis": result.get("performance_analysis", ""),
        "generatorSummary": result.get("generator_summary", ""),
        "analyzedAds": ads,
        "performance": perf,
        "generatedAds": result.get("generated_ads", []),
        "appliedChanges": result.get("applied_changes", []),
    }

# Standard Library HTTP Server Handler (Runs out of the box with zero pip installs)
class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class AdPilotRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path == "/api/health":
            self.send_json({"status": "ok", "service": "adpilot-backend"})
            return

        elif path == "/api/campaigns":
            self.send_json(list_campaigns_data())
            return

        elif path.startswith("/api/campaigns/") and path.endswith("/ads"):
            cid = path.split("/")[3]
            self.send_json(get_campaign_ads_data(cid))
            return

        elif path.startswith("/api/campaigns/") and path.endswith("/performance"):
            cid = path.split("/")[3]
            focus = query.get("focus", ["conversion"])[0]
            self.send_json(get_campaign_performance_data_response(cid, focus))
            return

        elif path.startswith("/api/campaigns/"):
            cid = path.split("/")[3]
            camps = [c for c in list_campaigns_data() if c["id"] == cid]
            if camps:
                self.send_json(camps[0])
            else:
                self.send_error(404, "Campaign not found")
            return

        elif path.startswith("/api/images/"):
            filename = os.path.basename(path)
            filepath = os.path.join(GENERATED_ADS_DIR, filename)
            if not os.path.exists(filepath):
                create_local_fallback_image("Fresh Performance Ad", "Optimized ad creative for display channels.", filename)
            
            try:
                with open(filepath, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                self.send_error(500, f"Error serving image: {e}")
            return

        self.send_error(404, "Endpoint not found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
        try:
            body = json.loads(post_data)
        except Exception:
            body = {}

        if path == "/api/reset":
            reset_datasets()
            self.send_json({"success": True, "message": "All campaigns, ads, targeting, and logs reset to baseline."})
            return

        elif path == "/api/optimize":
            cid = body.get("campaign_id") or body.get("campaignId", "C001")
            focus = body.get("focus", "conversion")
            res = optimize_campaign_data(cid, focus)
            self.send_json(res)
            return

        self.send_error(404, "Endpoint not found")

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

def start_server(port=8000):
    server = ThreadedHTTPServer(("0.0.0.0", port), AdPilotRequestHandler)
    print(f"⚡ AdPilot Multi-Agent Backend running at http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()

if __name__ == "__main__":
    start_server(8000)
