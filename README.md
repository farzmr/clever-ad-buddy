# AdPilot — Multi-Agent Ad Optimizer

A full-stack AdTech optimization copilot combining a modern Lovable frontend with a Python multi-agent backend powered by Google ADK and Gemini models.

You pick a campaign and an optimization focus, hit **Launch Optimization**, and three agents take over:
1. **Agent 1 · Creative Analyzer** — evaluates ad copy quality, flags weak elements, and produces actionable recommendations.
2. **Agent 2 · Performance Stats** — segments performance by device and time of day, uncovering top-converting windows and cost-inefficient waste.
3. **Agent 3 · Automation & Generation Actions** — pauses underperforming ads, creates high-intent new variants, renders display creative, and rewrites campaign targeting with before/after diffs.

---

## Architecture

```
clever-ad-buddy/
├── backend/                  # Embedded Python multi-agent backend
│   ├── agents/               # Google ADK agent definitions & rate limiters
│   ├── data/                 # Live campaign, ad, performance, & change log CSVs
│   ├── mcp_server/           # FastMCP service for campaign and ad tooling
│   ├── orchestrator.py       # Workflow runner, fallback engine, & image generator
│   ├── server.py             # FastAPI REST endpoints (/api/campaigns, /api/optimize, etc.)
│   └── requirements.txt      # Python dependencies
├── src/                      # Modern Lovable React frontend
│   ├── routes/               # TanStack Router pages (Index & Optimize)
│   ├── components/           # CreativeAnalyzer, PerformanceStats, AutomationActions
│   └── lib/api.ts            # API client connected to FastAPI backend
└── vite.config.ts            # Vite dev server with /api proxy to FastAPI
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v20+ (with `npm` or `bun`)
- **Python**: 3.10+ (recommended for full Google ADK support)

### 2. Backend Setup
From the repository root:
```bash
# Navigate to backend and install requirements
cd backend
pip install -r requirements.txt

# (Optional) Set your Gemini API key in .env for live AI agent execution
# If omitted, AdPilot automatically runs in intelligent deterministic fallback mode.
cp .env.example .env
```

Start the backend server:
```bash
python server.py
# Running on http://127.0.0.1:8000
```

### 3. Frontend Setup
In a separate terminal (or via root):
```bash
npm install
npm run dev
# Running on http://localhost:5173
```

Alternatively, to run both together:
```bash
npm run dev:all
```

---

## Features

- **Live CSV Datasets**: Backed by `campaigns.csv`, `ads.csv`, `ad_performance.csv`, and `change_log.csv`.
- **One-Click Reset**: Instant dataset restoration to clean baseline states via the UI or `POST /api/reset`.
- **Multi-Agent Orchestration**: Sequential execution through Google ADK agents using FastMCP tools.
- **Dynamic Segment Intelligence**: Real-time calculation of CTR, CVR, and cost per conversion across device × time dimensions.
- **Automated Generation & Diffing**: Generates new copy and display ad images, recording audit logs in `change_log.csv`.
- **Dual Execution Engine**: Runs live Gemini 3.1 Flash / Imagen agents when API keys are provided, with zero-crash local fallback when offline.
