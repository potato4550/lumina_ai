import type {
  CandidateInfo,
  LightCurveData,
  LightCurvePoint,
  SpectrumData,
  SpectrumPoint,
  DetectedGas,
  PipelineStage,
  PredictionResult,
  ExplainabilityData,
  CandidateRankRow,
  ReportData,
} from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateLightCurve(
  points: number,
  period: number,
  depth: number,
  noise: number
): LightCurvePoint[] {
  const data: LightCurvePoint[] = [];
  for (let i = 0; i < points; i++) {
    const t = (i / points) * period * 3;
    const phase = ((t % period) / period + 0.5) % 1;
    const transitWidth = 0.04;
    let flux = 1.0;
    if (Math.abs(phase - 0.5) < transitWidth) {
      const x = (phase - 0.5) / transitWidth;
      flux = 1.0 - depth * (1 - x * x);
    }
    flux += (Math.random() - 0.5) * noise * 2;
    data.push({ time: t, flux });
  }
  return data;
}

function generateSpectrum(points: number): SpectrumPoint[] {
  const data: SpectrumPoint[] = [];
  for (let i = 0; i < points; i++) {
    const wl = 0.3 + (i / points) * 4.7;
    let d = 0.001 + Math.random() * 0.0005;
    // Water absorption ~1.4 µm
    if (Math.abs(wl - 1.4) < 0.15) d += 0.002 * Math.exp(-((wl - 1.4) ** 2) / 0.01);
    // CO₂ absorption ~4.3 µm
    if (Math.abs(wl - 4.3) < 0.2) d += 0.0015 * Math.exp(-((wl - 4.3) ** 2) / 0.02);
    // O₃ ~0.6 µm
    if (Math.abs(wl - 0.6) < 0.08) d += 0.001 * Math.exp(-((wl - 0.6) ** 2) / 0.004);
    // CH₄ ~3.3 µm
    if (Math.abs(wl - 3.3) < 0.15) d += 0.0012 * Math.exp(-((wl - 3.3) ** 2) / 0.012);
    data.push({ wavelength: wl, depth: d });
  }
  return data;
}

// ─── Preloaded Candidates ────────────────────────────────────────────────────

export const PRELOADED_CANDIDATES: CandidateInfo[] = [
  {
    id: "KIC-8462852",
    name: "KIC 8462852 b",
    hostStar: "KIC 8462852",
    observations: 21500,
    noiseLevel: 0.00042,
    transitDepth: 0.000186,
    orbitalPeriod: 3.41,
    magnitude: 11.7,
    spectralType: "G2V",
  },
  {
    id: "TOI-700-d",
    name: "TOI-700 d",
    hostStar: "TOI-700",
    observations: 18400,
    noiseLevel: 0.00038,
    transitDepth: 0.000142,
    orbitalPeriod: 37.42,
    magnitude: 13.1,
    spectralType: "M2V",
  },
  {
    id: "KEP-442-b",
    name: "Kepler-442 b",
    hostStar: "Kepler-442",
    observations: 32000,
    noiseLevel: 0.00051,
    transitDepth: 0.000204,
    orbitalPeriod: 112.31,
    magnitude: 14.97,
    spectralType: "K4V",
  },
  {
    id: "KEP-186-f",
    name: "Kepler-186 f",
    hostStar: "Kepler-186",
    observations: 24800,
    noiseLevel: 0.00045,
    transitDepth: 0.000098,
    orbitalPeriod: 129.94,
    magnitude: 14.63,
    spectralType: "M1V",
  },
  {
    id: "TESS-4519-b",
    name: "TOI-4519 b",
    hostStar: "TOI-4519",
    observations: 15200,
    noiseLevel: 0.00055,
    transitDepth: 0.000312,
    orbitalPeriod: 2.18,
    magnitude: 10.4,
    spectralType: "F8V",
  },
];

// ─── Mock Light Curve ────────────────────────────────────────────────────────

export const MOCK_LIGHT_CURVE: LightCurveData = {
  points: generateLightCurve(500, 3.41, 0.000186, 0.00015),
  observations: 21500,
  noiseLevel: 0.00042,
  transitDepth: 0.000186,
  orbitalPeriod: 3.41,
  cadence: "30 min",
  targetName: "KIC 8462852",
};

// ─── Mock Spectrum ───────────────────────────────────────────────────────────

const spectrumPoints = generateSpectrum(200);

const detectedGases: DetectedGas[] = [
  { name: "H₂O", wavelength: 1.4, confidence: 0.94 },
  { name: "CO₂", wavelength: 4.3, confidence: 0.87 },
  { name: "O₃", wavelength: 0.6, confidence: 0.72 },
  { name: "CH₄", wavelength: 3.3, confidence: 0.68 },
];

export const MOCK_SPECTRUM: SpectrumData = {
  points: spectrumPoints,
  detectedGases,
  spectralSNR: 14.2,
  wavelengthRange: [0.3, 5.0],
};

// ─── Pipeline Stages ─────────────────────────────────────────────────────────

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "noise",
    label: "Noise Reduction",
    description: "Applying Savitzky-Golay filter and sigma-clipping to remove outliers",
    status: "pending",
    durationMs: 1800,
  },
  {
    id: "features",
    label: "Feature Extraction",
    description: "Extracting 47 time-domain and frequency-domain features",
    status: "pending",
    durationMs: 2200,
  },
  {
    id: "transit",
    label: "Transit Detection",
    description: "Running Box Least Squares periodogram for transit signal identification",
    status: "pending",
    durationMs: 2500,
  },
  {
    id: "cnn",
    label: "CNN Prediction",
    description: "Evaluating light curve through 6-layer convolutional neural network",
    status: "pending",
    durationMs: 3000,
  },
  {
    id: "physics",
    label: "Physics Validation",
    description: "Checking against 12 physical constraints and orbital mechanics models",
    status: "pending",
    durationMs: 2000,
  },
  {
    id: "xai",
    label: "Explainable AI",
    description: "Generating SHAP values, attention maps, and confidence breakdown",
    status: "pending",
    durationMs: 1500,
  },
  {
    id: "ranking",
    label: "Candidate Ranking",
    description: "Computing composite score and ranking against known candidates",
    status: "pending",
    durationMs: 1200,
  },
];

// ─── Mock Prediction ─────────────────────────────────────────────────────────

export const MOCK_PREDICTION: PredictionResult = {
  candidateId: "LC-2024-00847",
  candidateName: "KIC 8462852 b",
  hostStar: "KIC 8462852",
  classification: "Planet Candidate",
  confidence: 98.7,
  physicsScore: 96.2,
  transitDepth: 186,
  orbitalPeriod: 3.41,
  habitabilityScore: 0.74,
  priority: "High",
  radius: "1.2 R⊕",
  equilibriumTemp: "285 K",
};

// ─── Mock Explainability ─────────────────────────────────────────────────────

export const MOCK_EXPLAINABILITY: ExplainabilityData = {
  reasons: [
    {
      label: "Stable periodic transit",
      passed: true,
      detail: "Consistent transit timing across 47 observed epochs with TTV < 2 min",
    },
    {
      label: "Low stellar noise",
      passed: true,
      detail: "Stellar variability σ = 42 ppm, well below detection threshold",
    },
    {
      label: "Consistent transit depth",
      passed: true,
      detail: "Transit depth variation < 3% across all observed transits",
    },
    {
      label: "Physics validation passed",
      passed: true,
      detail: "All 12 physical constraints satisfied including Keplerian orbit consistency",
    },
    {
      label: "No secondary eclipse detected",
      passed: true,
      detail: "Absence of secondary eclipse rules out eclipsing binary scenario",
    },
  ],
  featureImportance: [
    { feature: "Transit depth", importance: 0.32, direction: "positive" },
    { feature: "Periodicity score", importance: 0.24, direction: "positive" },
    { feature: "Signal-to-noise ratio", importance: 0.18, direction: "positive" },
    { feature: "Stellar radius ratio", importance: 0.15, direction: "positive" },
    { feature: "Limb darkening fit", importance: 0.07, direction: "positive" },
    { feature: "Centroid offset", importance: 0.04, direction: "negative" },
  ],
  confidenceBreakdown: [
    { label: "Transit signal", value: 34, color: "#2563EB" },
    { label: "Periodicity", value: 26, color: "#3B82F6" },
    { label: "Noise analysis", value: 18, color: "#60A5FA" },
    { label: "Physics match", value: 14, color: "#93C5FD" },
    { label: "Stellar params", value: 8, color: "#BFDBFE" },
  ],
  attentionWeights: Array.from({ length: 60 }, (_, i) => {
    const inTransit = i >= 24 && i <= 36;
    return inTransit ? 0.6 + Math.random() * 0.35 : Math.random() * 0.06 + 0.01;
  }),
};

// ─── Mock Candidate Ranking ──────────────────────────────────────────────────

export const MOCK_RANKING: CandidateRankRow[] = [
  {
    id: "LC-2024-00847",
    candidate: "KIC 8462852 b",
    confidence: 98.7,
    physicsScore: 96.2,
    priority: "High",
    status: "Confirmed",
    chips: ["Stable Periodicity", "Low Noise", "Transit Symmetry", "Validated"],
  },
  {
    id: "LC-2024-00832",
    candidate: "Kepler-442 b analog",
    confidence: 96.3,
    physicsScore: 94.8,
    priority: "High",
    status: "Likely",
    chips: ["Stable Periodicity", "Habitable Zone", "Transit Symmetry"],
  },
  {
    id: "LC-2024-00819",
    candidate: "Sub-Earth candidate",
    confidence: 94.1,
    physicsScore: 88.5,
    priority: "Medium",
    status: "Needs Review",
    chips: ["Stable Periodicity", "Low Noise", "Requires Follow-up"],
  },
  {
    id: "LC-2024-00803",
    candidate: "Uncertain — possible EB",
    confidence: 62.4,
    physicsScore: 45.1,
    priority: "Low",
    status: "Unlikely",
    chips: ["Asymmetric Transit", "Secondary Eclipse", "EB Likelihood 38%"],
  },
];

// ─── Mock Report ─────────────────────────────────────────────────────────────

export const MOCK_REPORT: ReportData = {
  title: "Exoplanet Detection Report — KIC 8462852 b",
  generatedAt: new Date().toISOString(),
  candidateId: "LC-2024-00847",
  sections: [
    {
      title: "Prediction Summary",
      content:
        "Classification: Planet Candidate with 98.7% confidence. Physics validation score: 96.2/100. Priority: High. This candidate exceeds all thresholds for spectroscopic follow-up.",
    },
    {
      title: "Light Curve Analysis",
      content:
        "21,500 observations at 30-minute cadence from the Kepler mission. Transit depth: 186 ppm. Orbital period: 3.41 days. Noise level: 42 ppm (σ). 47 transit epochs detected with consistent depth and timing.",
    },
    {
      title: "Transmission Spectrum",
      content:
        "Simulated transmission spectrum analyzed across 0.3–5.0 µm. Spectral SNR: 14.2. Detected atmospheric constituents: H₂O (94% confidence), CO₂ (87%), O₃ (72%), CH₄ (68%).",
    },
    {
      title: "Transit Parameters",
      content:
        "Transit depth: 186 ± 4 ppm. Duration: 2.8 hours. Impact parameter: 0.31. Ingress/egress: 18 min. Limb darkening coefficients consistent with G2V host.",
    },
    {
      title: "Gas Detection",
      content:
        "Water vapor detected at 1.4 µm with high confidence. Carbon dioxide absorption at 4.3 µm. Tentative ozone and methane detections require JWST confirmation.",
    },
    {
      title: "Explainability",
      content:
        "Top contributing features: transit depth (32%), periodicity score (24%), SNR (18%). All 5 validation checks passed. Attention map strongly focused on transit ingress/egress regions.",
    },
    {
      title: "Recommendation",
      content:
        "This candidate is recommended for immediate spectroscopic follow-up with ground-based facilities and inclusion in the JWST Cycle 4 target list for atmospheric characterization.",
    },
  ],
  recommendation:
    "Recommended for spectroscopic follow-up and JWST atmospheric characterization.",
};
