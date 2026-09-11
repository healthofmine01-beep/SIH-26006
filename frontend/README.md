# CargoPredict — Frontend

The user-facing client application for CargoPredict, built with **React 19**, **TypeScript**, and **TailwindCSS**.

---

## Key Features
- **DashboardView**: High-level KPIs, route spot benchmarks, and quick shipment analysis.
- **NewAnalysisPage & PredictionResultPage**: Multi-step fixture decision tool calculating landed freight costs and under-keel draft clearance.
- **FreightForecastChart**: Interactive Recharts visualization displaying historical spot prices, XGBoost predicted trajectories, and P10–P90 confidence fans.
- **VesselPortView & TrackingView**: AIS fleet monitoring, port bathymetry constraints, and berth queue status.
- **WhatIfView**: Real-time stress simulator allowing users to shift bunker prices, congestion, and laycan windows.
- **AdminView**: Data and model management console for verifying database tables and ML metrics.
- **Session & Routing**: Persistent authentication session with instant URL route synchronization and an `ErrorBoundary` wrapper.

---

## Directory Structure
```
frontend/
├── src/
│   ├── api/
│   │   └── freightApi.ts        # REST API client connecting to FastAPI
│   ├── components/              # 26 focused React UI components
│   ├── data/
│   │   └── mockData.ts          # Seed constants and fallback benchmarks
│   ├── types.ts                 # TypeScript type definitions
│   ├── App.tsx                  # Main layout, URL sync, and router
│   ├── main.tsx                 # React DOM entrypoint
│   └── index.css                # Tailwind design system tokens
├── dist/                        # Production build bundle served by FastAPI
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Running Locally

### Development Server
```bash
bun run dev
# Or: npm run dev
```
Starts Vite dev server on `http://localhost:5173`.

### Production Build
```bash
bun run build
# Or: npm run build
```
Generates the minified production bundle in `dist/` which is served by FastAPI on port 8000.
