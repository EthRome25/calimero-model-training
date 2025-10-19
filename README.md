# MediNet — Calimero dApp (Web UI + Smart‑Contract Demo)

This repository provides the MediNet web application and a sample smart contract to demonstrate privacy‑first, federated learning workflows on Calimero private shards.

What this repo is responsible for

- Frontend app (app/): React + Vite UI that connects to a Calimero node, authenticates users, and surfaces MediNet features such as Models, Scans, AI Prediction, Retraining, and Model Summary.
- Contract and ABI (logic/): Minimal Rust smart contract compiled to WASM, plus ABI generation for a typed client used by the UI.
- Local developer network: Scripts and workflows to run a local Calimero setup and auto‑sync contract artifacts into the sample nodes under data/.

What this repo is not

- It does not run the federated training orchestration or secure aggregation service.
- It does not host production Calimero infrastructure.
- It does not include ML pipelines or model serving systems. Those live in other MediNet repositories.

If you are exploring MediNet across multiple repos, this repository is the entry point for the UI and example contract integration.

Prerequisites

- pnpm (or npm) for JavaScript tooling
- Rust toolchain + wasm target: rustup target add wasm32-unknown-unknown
- Optional: wasm-opt for WASM size optimization

Quick start

1) Install dependencies for the web app

```
cd app && pnpm install
```

2) Build the example contract (generates WASM and ABI)

```
pnpm run logic:build
```

3) Start the local dev experience (web + watchers)

```
pnpm run app:dev
```

- The watcher observes logic/res/**/* and will:
  - regenerate the ABI client into app/src/api when logic/res/abi.json changes
  - copy updated WASM into local node data dirs via scripts/sync-wasm.sh

4) Open the app in a browser, connect to your Calimero node, and sign in.

Environment variables (web app)

Create app/.env and set values appropriate to your setup:

```
# Calimero client configuration
VITE_APPLICATION_ID=<your_app_id>
VITE_CONTEXT_ID=<optional_specific_context_id>
VITE_CALIMERO_NODE_URL=http://node1.127.0.0.1.nip.io

# Optional demo CNN API used by Predict/Retrain routes
VITE_CNN_API_URL=http://localhost:8000
```

Directory overview

- app/ — React app, routes and UI (Home, Models, Scans, Predicting, Zip Predicting, Model Summary)
- logic/ — Rust contract, compiled to WASM, ABI emitted to logic/res
- data/ — Local Calimero node data used in dev workflows
- scripts/ — Helpers for syncing WASM to local nodes and reacting to ABI changes
- workflows/ — Merobox workflow to bootstrap a local network
- docs/project-overview.md — Business overview of MediNet

Common scripts

- Build contract: pnpm run logic:build
- Clean contract build: pnpm run logic:clean
- Generate ABI client (from logic/res/abi.json): pnpm run app:generate-client
- Run web + watchers: pnpm run app:dev
- Bootstrap local network (Merobox): pnpm run network:bootstrap

Notes and scope

- This repository focuses on developer experience and UI for demonstrating MediNet concepts: privacy‑first collaboration on medical imaging models where data stays on‑prem and only encrypted updates are shared via Calimero private shards.
- For production orchestration, secure aggregation, and ML pipelines, refer to the other MediNet repositories that handle those responsibilities.

Troubleshooting

- If concurrently or chokidar are missing, install at the repo root: pnpm add -D concurrently chokidar-cli
- If ABI codegen fails, ensure @calimero-network/abi-codegen@0.1.1 is available (root script pins this version).
- Connection issues to a node will surface as timeouts in the UI; verify your Calimero nodes are running and VITE_CALIMERO_NODE_URL is reachable.

