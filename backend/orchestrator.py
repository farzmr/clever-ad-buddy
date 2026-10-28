import os
import sys
import asyncio
import pandas as pd
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip())
        except Exception:
            pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CAMPAIGNS_FILE = os.path.join(DATA_DIR, "campaigns.csv")
ADS_FILE = os.path.join(DATA_DIR, "ads.csv")
PERFORMANCE_FILE = os.path.join(DATA_DIR, "ad_performance.csv")
CHANGELOG_FILE = os.path.join(DATA_DIR, "change_log.csv")
GENERATED_ADS_DIR = os.path.join(BASE_DIR, "generated_ads")
os.makedirs(GENERATED_ADS_DIR, exist_ok=True)

AD_ANALYSIS_FALLBACK = {
    "A001": {"quality": 87, "flagged": [], "recommendations": ["Add price anchor in headline", "Test square 1:1 variant for Reels"]},
    "A002": {"quality": 79, "flagged": ["No price visible"], "recommendations": ["Overlay 'From $89' badge", "A/B test shorter body copy"]},
    "A003": {"quality": 38, "flagged": ["Weak CTA", "Low-res creative"], "recommendations": ["Rewrite headline with benefit + product", "Upscale to 1200x628"]},
    "A004": {"quality": 52, "flagged": ["Generic headline", "Passive CTA"], "recommendations": ["Lead with specific product name", "Replace 'Get Started' with Conversion CTA"]},
    "A005": {"quality": 85, "flagged": [], "recommendations": ["Test video version", "Add UGC carousel variant"]},
    "A006": {"quality": 78, "flagged": ["Generic headline"], "recommendations": ["Lead with specific tech product name", "Test different CTA copy"]},
    "A007": {"quality": 42, "flagged": ["Weak CTA", "Passive CTA"], "recommendations": ["Replace 'Learn More' with 'Shop Now'", "Test 1:1 image format"]},
    "A008": {"quality": 51, "flagged": ["Text heavy"], "recommendations": ["Reduce body copy size", "A/B test lifestyle image"]},
    "A009": {"quality": 81, "flagged": [], "recommendations": ["Test square 1:1 variant for Reels"]},
    "A010": {"quality": 76, "flagged": [], "recommendations": ["Add price anchor in headline"]},
    "A011": {"quality": 48, "flagged": ["Generic headline"], "recommendations": ["Lead with specific brand name"]},
    "A012": {"quality": 55, "flagged": ["Passive CTA"], "recommendations": ["Test 'Explore Now' instead of 'Learn More'"]},
    "A013": {"quality": 83, "flagged": [], "recommendations": ["Add UGC carousel variant"]},
    "A014": {"quality": 74, "flagged": ["No price visible"], "recommendations": ["A/B test shorter body copy"]},
    "A015": {"quality": 35, "flagged": ["Weak CTA", "Text heavy"], "recommendations": ["Rewrite headline with benefit + product"]},
    "A016": {"quality": 53, "flagged": ["Generic headline"], "recommendations": ["Replace 'Watch Now' with Conversion CTA"]},
    "A017": {"quality": 82, "flagged": [], "recommendations": ["Test square 1:1 variant for Reels"]},
    "A018": {"quality": 71, "flagged": ["No price visible"], "recommendations": ["Overlay 'Free Trial' badge"]},
    "A019": {"quality": 39, "flagged": ["Weak CTA", "Low-res creative"], "recommendations": ["Upscale to 1200x628"]},
    "A020": {"quality": 54, "flagged": ["Generic headline", "Passive CTA"], "recommendations": ["Replace 'Get Started' with Conversion CTA"]},
    "A021": {"quality": 84, "flagged": [], "recommendations": ["Add UGC carousel variant"]},
}

VERTICAL_AD_TEMPLATES = {
    "C001": {
        "headline": "Redefine Your Style This Season",
        "body": "Shop our latest premium spring arrivals today. Free express shipping on all orders.",
        "cta": "Shop the Drop",
        "gradient": "linear-gradient(135deg,#f97316,#ec4899)",
        "note": "Optimized copy based on top performer A001 with price anchoring."
    },
    "C002": {
        "headline": "Next-Gen Tech Deals Await",
        "body": "Upgrade your setup with top-rated gadgets. Save big with exclusive limited-time offers.",
        "cta": "Shop Now",
        "gradient": "linear-gradient(135deg,#6366f1,#a855f7)",
        "note": "Replaced generic headline with high-intent CTA based on A005."
    },
    "C003": {
        "headline": "Your Story Starts Here",
        "body": "Connect with what matters most. Discover handcrafted moments designed to inspire.",
        "cta": "Discover More",
        "gradient": "linear-gradient(135deg,#10b981,#0ea5e9)",
        "note": "Lifestyle storytelling variant optimized for visual engagement."
    },
    "C004": {
        "headline": "Big Ideas. Unstoppable Reach.",
        "body": "Amplify your message with video campaigns that resonate and convert across every screen.",
        "cta": "Watch Now",
        "gradient": "linear-gradient(135deg,#f43f5e,#fb923c)",
        "note": "High-contrast video hook replacing low-engagement text format."
    },
    "C005": {
        "headline": "Read What's Hot & Trending",
        "body": "Fresh perspectives delivered daily. Join over 50,000 readers discovering new insights.",
        "cta": "Start Reading",
        "gradient": "linear-gradient(135deg,#8b5cf6,#ec4899)",
        "note": "Social proof variant built to boost CTR across mobile night traffic."
    }
}

def reset_datasets():
    """Resets campaign and ads datasets, and change logs to their original baseline states."""
    if os.path.exists(CAMPAIGNS_FILE):
        try:
            df_camp = pd.read_csv(CAMPAIGNS_FILE)
            df_camp["device"] = "mobile, tablet, desktop"
            df_camp["time_of_day"] = "morning, afternoon, night"
            df_camp.to_csv(CAMPAIGNS_FILE, index=False)
        except Exception as e:
            print(f"Error resetting campaigns dataset: {e}")
        
    if os.path.exists(ADS_FILE):
        try:
            df_ads = pd.read_csv(ADS_FILE)
            def should_keep(ad_id):
                try:
                    if isinstance(ad_id, str) and ad_id.startswith("A"):
                        return int(ad_id[1:]) <= 21
                except (ValueError, TypeError):
                    pass
                return True
                
            df_ads = df_ads[df_ads["ad_id"].apply(should_keep)].copy()
            df_ads["status"] = "active"
            df_ads.to_csv(ADS_FILE, index=False)
        except Exception as e:
            print(f"Error resetting ads dataset: {e}")

    if os.path.exists(CHANGELOG_FILE):
        try:
            with open(CHANGELOG_FILE, "w") as f:
                f.write("log_id,timestamp,campaign_id,change_type,target_id,details\n")
        except Exception as e:
            print(f"Error clearing change log: {e}")

def get_ad_analysis(ad_id: str, headline: str = "", body: str = "") -> dict:
    if ad_id in AD_ANALYSIS_FALLBACK:
        data = AD_ANALYSIS_FALLBACK[ad_id]
        return {
            "quality": data["quality"],
            "flagged": [f for f in data["flagged"] if f.lower() != "clean"],
            "recommendations": data["recommendations"]
        }
    return {
        "quality": 88,
        "flagged": [],
        "recommendations": ["A/B test headline variants"]
    }

def get_campaign_performance_data(campaign_id: str):
    if not os.path.exists(PERFORMANCE_FILE):
        return pd.DataFrame()
    perf_df = pd.read_csv(PERFORMANCE_FILE)
    perf_df = perf_df[perf_df["campaign_id"].astype(str) == str(campaign_id)]
    if perf_df.empty:
        return pd.DataFrame()
    
    grouped = perf_df.groupby(["device", "time_of_day"]).agg({
        "impressions": "sum",
        "clicks": "sum",
        "conversions": "sum",
        "spend": "sum"
    }).reset_index()
    
    grouped["cost_per_conv"] = grouped.apply(
        lambda r: round(r["spend"] / r["conversions"], 2) if r["conversions"] > 0 else round(r["spend"], 2), 
        axis=1
    )
    return grouped

def get_best_worst_segments(grouped_df, objective="conversions"):
    if grouped_df.empty:
        return None, None
    df = grouped_df.copy()
    df["ctr"] = df.apply(lambda r: round((r["clicks"] / r["impressions"]) * 100, 2) if r["impressions"] > 0 else 0.0, axis=1)
    df["cvr"] = df.apply(lambda r: round((r["conversions"] / r["clicks"]) * 100, 2) if r["clicks"] > 0 else 0.0, axis=1)
    
    obj = str(objective).lower()
    if "conversion" in obj:
        has_conv = df[df["conversions"] > 0]
        best_row = has_conv.sort_values(by="cost_per_conv", ascending=True).iloc[0] if not has_conv.empty else df.sort_values(by="spend", ascending=True).iloc[0]
        worst_row = df.sort_values(by="cost_per_conv", ascending=False).iloc[0]
    elif "awareness" in obj:
        best_row = df.sort_values(by=["impressions", "ctr"], ascending=[False, False]).iloc[0]
        worst_row = df.sort_values(by=["impressions", "ctr"], ascending=[True, True]).iloc[0]
    else: # traffic
        best_row = df.sort_values(by=["clicks", "ctr"], ascending=[False, False]).iloc[0]
        worst_row = df.sort_values(by=["clicks", "ctr"], ascending=[True, True]).iloc[0]
        
    return best_row.to_dict(), worst_row.to_dict()

def write_changelog(campaign_id: str, change_type: str, target_id: str, details: str):
    import datetime
    os.makedirs(DATA_DIR, exist_ok=True)
    df = pd.read_csv(CHANGELOG_FILE) if os.path.exists(CHANGELOG_FILE) else pd.DataFrame(columns=["log_id", "timestamp", "campaign_id", "change_type", "target_id", "details"])
    next_id = len(df) + 1
    log_id = f"L{str(next_id).zfill(3)}"
    new_entry = {
        "log_id": log_id,
        "timestamp": datetime.datetime.now().isoformat(),
        "campaign_id": str(campaign_id),
        "change_type": change_type,
        "target_id": str(target_id),
        "details": details
    }
    df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)
    df.to_csv(CHANGELOG_FILE, index=False)

def create_local_fallback_image(headline: str, body: str, filename: str):
    from PIL import Image, ImageDraw, ImageFont
    filepath = os.path.join(GENERATED_ADS_DIR, filename)
    img = Image.new("RGB", (600, 600), "#0f172a")
    draw = ImageDraw.Draw(img, "RGBA")
    
    # Vibrant modern gradient
    for y in range(600):
        ratio = y / 600.0
        r = int(124 * (1 - ratio) + 15 * ratio)
        g = int(58 * (1 - ratio) + 23 * ratio)
        b = int(237 * (1 - ratio) + 42 * ratio)
        draw.line([(0, y), (600, y)], fill=(r, g, b, 255))
        
    draw.circle((500, 100), 180, fill=(217, 70, 239, 45))
    draw.circle((100, 300), 120, fill=(6, 182, 212, 35))
    draw.rectangle([15, 15, 585, 585], outline=(139, 92, 246, 180), width=2)
    
    # Backdrop card
    draw.rounded_rectangle([30, 260, 570, 550], radius=16, fill=(15, 23, 42, 220), outline=(124, 58, 237, 180), width=1)
    
    font_paths = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf"
    ]
    font_title, font_body, font_cta = None, None, None
    for p in font_paths:
        if os.path.exists(p):
            try:
                font_title = ImageFont.truetype(p, 22)
                font_body = ImageFont.truetype(p, 14)
                font_cta = ImageFont.truetype(p, 13)
                break
            except Exception:
                pass
    if font_title is None:
        font_title = ImageFont.load_default()
        font_body = ImageFont.load_default()
        font_cta = ImageFont.load_default()
        
    draw.text((48, 290), headline[:38], fill=(255, 255, 255, 255), font=font_title)
    draw.text((48, 330), body[:60], fill=(203, 213, 225, 255), font=font_body)
    
    # CTA pill
    draw.rounded_rectangle([48, 480, 220, 524], radius=10, fill=(124, 58, 237, 255))
    draw.text((75, 494), "Shop the Drop ➔", fill=(255, 255, 255, 255), font=font_cta)
    
    img.save(filepath)
    return filepath

def generate_ad_creative_image(prompt: str, headline: str, body: str, filename: str) -> tuple[str, str, str]:
    """
    Attempts to generate display ad creative via Google Gemini Imagen API.
    If the API key is missing, or the Gemini Imagen quota limit is reached (or fails),
    it automatically falls back to high-resolution Python PIL rendering.
    
    Returns:
        (filepath, source, notice)
        where source is 'gemini_imagen' or 'python_fallback'
    """
    output_dir = GENERATED_ADS_DIR
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, filename)

    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and api_key.strip() and api_key.strip() != "your_gemini_api_key_here":
        try:
            print("[Image Gen] Attempting Google Gemini Imagen 3 generation...")
            from google import genai
            from google.genai import types
            from io import BytesIO
            from PIL import Image

            client = genai.Client(api_key=api_key.strip())
            response = client.models.generate_images(
                model='imagen-3.0-generate-002',
                prompt=prompt or f"Display advertisement banner background for {headline}. Clean modern commercial lighting.",
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="1:1",
                    output_mime_type="image/png"
                )
            )
            if response.generated_images:
                image_bytes = response.generated_images[0].image.image_bytes
                img = Image.open(BytesIO(image_bytes)).resize((600, 600))
                img.save(filepath)
                return filepath, "gemini_imagen", "Generated using Google Gemini Imagen 3."
        except Exception as e:
            print(f"[Image Gen] Gemini Imagen quota reached or unavailable ({e}). Falling back to Python PIL.")

    # Python PIL Fallback
    create_local_fallback_image(headline, body, filename)
    notice = "You reached the maximum Gemini image generation quota (or Gemini API key was not configured). The creative engine automatically rendered this asset using Python PIL."
    return filepath, "python_fallback", notice

def execute_fallback_optimization(campaign_id: str, focus: str = "conversion") -> dict:
    """Executes deterministic optimization adhering to adtech rules when Gemini API is unavailable."""
    # 1. Load data
    c_df = pd.read_csv(CAMPAIGNS_FILE)
    camp = c_df[c_df["campaign_id"] == campaign_id].iloc[0]
    ads_df = pd.read_csv(ADS_FILE)
    camp_ads = ads_df[ads_df["campaign_id"] == campaign_id].copy()
    
    # 2. Score ads & identify lowest and highest
    scored = []
    for _, ad in camp_ads.iterrows():
        analysis = get_ad_analysis(ad["ad_id"])
        scored.append((ad, analysis["quality"]))
    scored.sort(key=lambda x: x[1])
    
    worst_ad, worst_score = scored[0]
    top_ad, top_score = scored[-1]
    
    # Pause lowest performing ad
    ads_df.loc[ads_df["ad_id"] == worst_ad["ad_id"], "status"] = "paused"
    write_changelog(campaign_id, "update_ad_status", worst_ad["ad_id"], f"Paused lowest-performing ad (Score: {worst_score})")
    
    # 3. Create new ad variant
    template = VERTICAL_AD_TEMPLATES.get(campaign_id, {
        "headline": f"Optimized {camp['name']}",
        "body": "Experience top-tier performance crafted for maximum engagement.",
        "cta": "Learn More",
        "gradient": "linear-gradient(135deg,#7c3aed,#d946ef)",
        "note": f"Enhanced variant modeled on top performer {top_ad['ad_id']}."
    })
    
    # Determine new ad ID
    numeric_ids = ads_df["ad_id"].astype(str).str.extract(r'(\d+)').dropna().astype(int)
    next_id = int(numeric_ids.max().iloc[0]) + 1 if not numeric_ids.empty else len(ads_df) + 1
    new_ad_id = f"A{str(next_id).zfill(3)}"
    image_filename = f"ad_new_{campaign_id}.png"
    
    _, img_source, img_notice = generate_ad_creative_image(
        prompt=f"Modern stylish display ad for {camp['name']}, {template['headline']}",
        headline=template["headline"],
        body=template["body"],
        filename=image_filename
    )
    
    new_ad = {
        "ad_id": new_ad_id,
        "campaign_id": campaign_id,
        "headline": template["headline"],
        "body_text": template["body"],
        "cta": template["cta"],
        "image_size": "300x250",
        "image_url": f"/api/images/{image_filename}",
        "ad_type": "display",
        "status": "active",
        "copy_tone": "conversational",
        "img_category": "lifestyle"
    }
    ads_df = pd.concat([ads_df, pd.DataFrame([new_ad])], ignore_index=True)
    ads_df.to_csv(ADS_FILE, index=False)
    write_changelog(campaign_id, "create_ad", new_ad_id, f"Created new ad with headline: '{template['headline']}'")
    
    # 4. Performance analysis & targeting optimization
    perf_df = get_campaign_performance_data(campaign_id)
    best_seg, worst_seg = get_best_worst_segments(perf_df, focus)
    
    before_device = str(camp["device"])
    before_time = str(camp["time_of_day"])
    
    if best_seg:
        best_device = str(best_seg["device"]).lower()
        best_time = str(best_seg["time_of_day"]).lower()
        c_df.loc[c_df["campaign_id"] == campaign_id, "device"] = best_device
        c_df.loc[c_df["campaign_id"] == campaign_id, "time_of_day"] = best_time
        c_df.to_csv(CAMPAIGNS_FILE, index=False)
        write_changelog(campaign_id, "update_campaign_targeting", campaign_id, f"Updated targeting to device: '{best_device}', time_of_day: '{best_time}'")
    else:
        best_device = "mobile"
        best_time = "night"
    
    return {
        "campaign_id": campaign_id,
        "mode": "deterministic_fallback",
        "creative_analysis": f"Analyzed {len(camp_ads)} ads. Top performer: {top_ad['ad_id']} (score {top_score}). Lowest performer: {worst_ad['ad_id']} (score {worst_score}).",
        "performance_analysis": f"Best segment identified: {best_device.capitalize()} - {best_time.capitalize()}.",
        "generator_summary": f"Paused {worst_ad['ad_id']}, created {new_ad_id}, and updated targeting to {best_device} / {best_time}.",
        "generated_ads": [{
            "id": new_ad_id,
            "headline": template["headline"],
            "body": template["body"],
            "cta": template["cta"],
            "imageUrl": f"/api/images/{image_filename}",
            "gradient": template["gradient"],
            "basedOn": top_ad["ad_id"],
            "note": template["note"],
            "imageSource": img_source,
            "imageNotice": img_notice
        }],
        "applied_changes": [
            {
                "label": "Primary device allocation",
                "before": before_device.title(),
                "after": best_device.capitalize(),
                "reason": f"Shifted spend to {best_device.capitalize()} based on highest conversion efficiency."
            },
            {
                "label": "Time-of-day schedule",
                "before": before_time.title(),
                "after": best_time.capitalize(),
                "reason": f"Allocated budget to {best_time.capitalize()} peak traffic, pausing low-performing windows."
            },
            {
                "label": "Active ad set",
                "before": f"{', '.join(camp_ads['ad_id'].tolist())}",
                "after": f"Paused {worst_ad['ad_id']} + Activated new variant {new_ad_id}",
                "reason": f"Paused lowest-scoring ad ({worst_ad['ad_id']}) and introduced high-intent variant {new_ad_id}."
            }
        ]
    }

async def run_optimization_workflow(campaign_id: str, focus: str = "conversion") -> dict:
    """Runs live ADK agent optimization if GEMINI_API_KEY is present; otherwise runs fallback."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key.strip() == "your_gemini_api_key_here":
        print("[Orchestrator] GEMINI_API_KEY not found or default. Running deterministic fallback optimization.")
        return execute_fallback_optimization(campaign_id, focus)
        
    try:
        from google.adk.runners import Runner
        from google.adk.sessions import InMemorySessionService
        from google.genai import types
        from agents import creative_analyzer_agent, performance_stats_agent, creative_generator_agent
        
        session_service = InMemorySessionService()
        session_id = f"opt_session_{campaign_id}"
        user_id = "adtech_user"
        await session_service.create_session(app_name="adtech", user_id=user_id, session_id=session_id)
        
        # 1. Creative Analyzer
        analyzer_runner = Runner(agent=creative_analyzer_agent, app_name="adtech", session_service=session_service)
        analyzer_prompt = f"Analyze the creative quality of all ads in campaign '{campaign_id}'."
        analyzer_response = "Analyzed creative assets."
        async for event in analyzer_runner.run_async(
            user_id=user_id, session_id=session_id,
            new_message=types.Content(role="user", parts=[types.Part.from_text(text=analyzer_prompt)])
        ):
            if event.is_final_response() and event.content and event.content.parts:
                analyzer_response = event.content.parts[0].text

        # 2. Performance Stats
        stats_runner = Runner(agent=performance_stats_agent, app_name="adtech", session_service=session_service)
        stats_prompt = f"Retrieve performance stats and determine the best device and time patterns for campaign '{campaign_id}'."
        stats_response = "Analyzed segment metrics."
        async for event in stats_runner.run_async(
            user_id=user_id, session_id=session_id,
            new_message=types.Content(role="user", parts=[types.Part.from_text(text=stats_prompt)])
        ):
            if event.is_final_response() and event.content and event.content.parts:
                stats_response = event.content.parts[0].text

        # 3. Creative Generator
        generator_runner = Runner(agent=creative_generator_agent, app_name="adtech", session_service=session_service)
        generator_prompt = f"""
Using the insights for campaign '{campaign_id}':
Creative Analysis: {analyzer_response}
Performance Analysis: {stats_response}

Please perform optimization steps:
1. Turn off (pause) lowest performing ad via update_ad_status.
2. Create a new optimized ad via create_ad.
3. Call generate_and_save_ad_image with 'ad_new_{campaign_id}.png'.
4. Call update_campaign_targeting with best segment.
"""
        generator_response = "Optimized campaign settings."
        async for event in generator_runner.run_async(
            user_id=user_id, session_id=session_id,
            new_message=types.Content(role="user", parts=[types.Part.from_text(text=generator_prompt)])
        ):
            if event.is_final_response() and event.content and event.content.parts:
                generator_response = event.content.parts[0].text

        # Merge with structured results
        fallback_data = execute_fallback_optimization(campaign_id, focus)
        fallback_data["mode"] = "gemini_adk"
        fallback_data["creative_analysis"] = analyzer_response
        fallback_data["performance_analysis"] = stats_response
        fallback_data["generator_summary"] = generator_response
        return fallback_data

    except Exception as e:
        print(f"[Orchestrator] ADK agent exception: {e}. Falling back to deterministic execution.")
        return execute_fallback_optimization(campaign_id, focus)
