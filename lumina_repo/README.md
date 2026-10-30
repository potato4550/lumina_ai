#  Lumina

> Explainable AI for Trustworthy Exoplanet Discovery

Lumina is an AI-assisted exoplanet detection platform developed for the ISRO BAH 2026 Hackathon.

It analyzes astronomical light curves, detects potential exoplanet transit signals, explains every prediction using Explainable AI, and prioritizes candidates for scientific validation.

---

## Features

- Light Curve CSV Upload
- AI-based Transit Detection
- Physics-based Validation
- Explainable AI
- Candidate Ranking
- Interactive Dashboard
- Scientific Report Generation (WIP)

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

### Backend (WIP)

- Python
- FastAPI
- PyTorch
- NumPy
- Pandas

### AI

- CNN / Transformer
- Transit Detection
- Explainable AI
- Physics-based Validation

---

## Project Structure

```
lumina/
│
├── src/
├── public/
├── components/
├── pages/
├── assets/
├── backend/ (future)
├── model/ (future)
└── README.md
```

---

## Backend

The "backend" runs as Next.js API routes inside this same app (no separate
Python service needed):

- **CNN inference** — trained live in the browser (TensorFlow.js) in Step 3,
  then actually run against the loaded light curve at detection time
  (`lib/tfjs-model.ts`).
- **Feature extraction** — transit depth, SNR, symmetry, duration, and period
  are computed for real from the light curve points (`lib/featureExtraction.ts`),
  not looked up from a table.
- **Atmospheric retrieval** — gas detections are fit against the actual
  spectrum via Gaussian-template matching (`lib/spectralRetrieval.ts`).
- **LLM reasoning** — `app/api/classify/route.ts` is a real server-side route
  that calls the Groq API with the measured features and returns a
  probability + reasoning. This keeps your API key server-side only.

To enable the LLM step:

```bash
cp .env.local.example .env.local
# then edit .env.local and paste your Groq key (https://console.groq.com/keys)
```

Without a key set, the app still runs end-to-end — it just falls back to a
physics-based confidence estimate instead of LLM reasoning, and says so in
the results.

## Getting Started

Clone the repository

```bash
git clone https://github.com/Tanushree-RD/lumina.git
```

Move into the project

```bash
cd lumina
```

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

Open

```
http://localhost:5173
```

---

## Git Workflow

Never push directly to `main`.

Create your own branch.

```bash
git checkout -b feature/your-feature-name
```

Examples

```
feature/dashboard
feature/csv-upload
feature/backend
feature/explainability
```

Commit changes

```bash
git add .
git commit -m "feat: add explainability section"
```

Push

```bash
git push origin feature/your-feature-name
```

Open a Pull Request.

---

## Current Progress

- [x] Landing Page
- [x] Pipeline Section
- [x] Dashboard UI
- [x] Explainability UI
- [x] Candidate Ranking
- [ ] CSV Upload
- [ ] Backend Integration
- [ ] AI Model Connection
- [ ] Scientific Report
- [ ] Deployment

---

## Team

OUTLIERS
