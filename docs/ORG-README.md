# MediNet

MediNet is a privacy‑first platform for collaborative AI on medical imaging. We enable hospitals and research centers to train and evaluate models without sharing raw patient data, using Calimero private shards for secure aggregation and auditability.

This GitHub organization contains multiple repositories. Start here to understand what each repo is responsible for and how they fit together.

## Repositories at a glance

- calimero-model-training — Calimero-connected web UI and demo smart contract for privacy-first federated learning.
  - Repo: https://github.com/EthRome25/calimero-model-training
- cnn-network-poc — Brain Tumor MRI Classifier HTTP API (Flask + Keras) used by the UI for predictions.
  - Repo: https://github.com/EthRome25/cnn-network-poc

## Repositories

### 1) calimero-model-training
- Purpose: Calimero‑connected web application and demo smart contract used to showcase privacy‑first, federated learning workflows.
- Tech stack: React + Vite UI, Calimero client, sample Rust smart contract (WASM) with generated ABI client, local dev network scripts.
- Key capabilities:
  - Authenticate to a Calimero private shard and explore contexts
  - Manage demo entities (Models, Scans)
  - Trigger model prediction and view model summary pages
  - Dev tooling to build the contract and auto‑sync artifacts for a local network
- Start here if you want to run the UI or explore the Calimero integration.
- Repo: https://github.com/EthRome25/calimero-model-training

### 2) cnn-network-poc — Brain Tumor MRI Classifier (HTTP API)
- Purpose: Minimal model‑serving proof‑of‑concept used by the UI for predictions.
- Tech stack: Python, Flask, Keras, Matplotlib.
- Summary:
  - Loads a trained Keras model (trained-model.keras)
  - Exposes an unauthenticated HTTP endpoint to run predictions on uploaded images
  - Response fields:
    - `predicted_label`: the most probable class
    - `probabilities`: per‑class probabilities
    - `plot_base64_png`: base64‑encoded PNG showing the input image and a horizontal bar chart of probabilities
  - Also saves each prediction plot to a PNG for debugging: `predict_plot_YYYYmmdd-HHMMSS-ffffff_PID.png` (ignored by Git).
- Repo: https://github.com/EthRome25/cnn-network-poc

## How the pieces fit together
- The MediNet web app (calimero-model-training) demonstrates user flows and smart‑contract interaction on Calimero private shards, highlighting how federated learning orchestration could be coordinated without exposing raw data.
- The CNN Network PoC provides a simple, local prediction service the UI can call to simulate model inference. In a production setup, this would be replaced by a secure model‑serving layer and full orchestration.

## Quick start pointers
- Web UI + contract demo: see calimero-model-training/README.md for installation, environment variables, and local dev network instructions.
- CNN PoC server: see the cnn-network-poc README for installation and how to run the Flask app. By default, the UI expects the API at `http://localhost:8000` (configurable via `VITE_CNN_API_URL`).

## Audience
- Hospitals, imaging centers, research consortia, and partners exploring privacy‑preserving AI collaboration.
- Developers and contributors interested in Calimero‑based private shard apps for healthcare AI.

## High‑level principles
- Privacy by design: data stays on‑prem; only encrypted updates/metadata are shared.
- Composability: modular pieces that can be upgraded or replaced (UI, contracts, serving).
- Auditability and governance: Calimero private shards provide transparent, permissioned collaboration.

## Contributing
- Issues and pull requests are welcome in each repository.
- For changes spanning multiple repos, open issues with cross‑links and add clear reproduction steps.

## License
- See individual repositories for license terms.
