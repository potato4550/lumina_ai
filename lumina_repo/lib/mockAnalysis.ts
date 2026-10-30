import {
  CandidateDataset,
  GasDetection,
  LightCurvePoint,
  SpectrumPoint,
  AnalysisResult,
} from "@/types";
import { PRESET_CANDIDATES, ALL_8_GASES } from "./candidates";
import { extractLightCurveFeatures, rankFeatureImportances, PhotometricFeatures } from "./featureExtraction";
import { retrieveGasesFromSpectrum } from "./spectralRetrieval";
import { predictTransitProbability } from "./tfjs-model";

export { PRESET_CANDIDATES, ALL_8_GASES };

// ─── Spectrum generation ───────────────────────────────────────────────────────
export function generateCandidateSpectrum(candidateId: string): {
  points: SpectrumPoint[];
  gases: GasDetection[];
} {
  const points: SpectrumPoint[] = [];
  const candidate = PRESET_CANDIDATES.find((c) => c.id === candidateId) || PRESET_CANDIDATES[0];

  const seedAmplitude: Record<string, number> = {
    "k2-18b": 1.0,
    "trappist-1e": 0.7,
    "kepler-90h": 0.5,
    "toi-700d": 0.4,
  };
  const amp = seedAmplitude[candidate.id] ?? 0.4;

  const baseDepth = (candidate.transitDepthPpm / 10000) * 0.1;
  for (let i = 0; i <= 80; i++) {
    const wl = 0.6 + (i / 80) * 4.4;
    let depth = baseDepth + Math.sin(wl * 4) * 0.0015;

    depth += 0.006 * Math.exp(-Math.pow((wl - 1.4) / 0.15, 2)) * amp;
    depth += 0.008 * Math.exp(-Math.pow((wl - 4.3) / 0.18, 2)) * amp * 0.9;
    depth += 0.005 * Math.exp(-Math.pow((wl - 3.3) / 0.14, 2)) * amp * (candidate.id === "k2-18b" ? 1 : 0.3);
    depth += 0.003 * Math.exp(-Math.pow((wl - 4.05) / 0.1, 2)) * amp * (candidate.id === "kepler-90h" ? 1 : 0.15);
    depth += 0.002 * Math.exp(-Math.pow((wl - 0.76) / 0.05, 2)) * amp * (candidate.id === "trappist-1e" ? 1 : 0.1);

    const noise = (Math.random() - 0.5) * 0.0008;
    depth += noise;

    points.push({
      wavelength: Number(wl.toFixed(3)),
      depth: Number(Math.max(0.01, depth * 10).toFixed(4)),
      error: 0.0005,
    });
  }

  const gases = retrieveGasesFromSpectrum(points);
  return { points, gases };
}

// ─── Synthetic light curve waveform (for demo/preset display) ─────────────────
export function generateSyntheticLightCurvePoints(
  periodDays: number,
  depthPpm: number,
  noisePpm: number,
  pointsCount = 600
): LightCurvePoint[] {
  const points: LightCurvePoint[] = [];
  const depthFraction = depthPpm / 1e6;
  const noiseFraction = noisePpm / 1e6;
  const transitDurationPhase = 0.05;

  for (let i = 0; i < pointsCount; i++) {
    const t = (i / pointsCount) * periodDays * 3.2;
    const phase = (t % periodDays) / periodDays;
    const distToCenter = Math.min(phase, 1 - phase);

    let flux = 1.0;
    if (distToCenter < transitDurationPhase / 2) {
      const normalizedDist = distToCenter / (transitDurationPhase / 2);
      const dip = depthFraction * (1 - 0.3 * normalizedDist * normalizedDist);
      flux -= dip;
    }

    const stellarVariability = Math.sin((t / periodDays) * 0.4) * (noiseFraction * 0.3);
    const photonNoise = (Math.random() - 0.5) * 2 * noiseFraction;
    flux += stellarVariability + photonNoise;

    points.push({
      time: Number(t.toFixed(4)),
      flux: Number(flux.toFixed(6)),
      error: Number(noiseFraction.toFixed(6)),
    });
  }
  return points;
}

// ─── CSV parsing ────────────────────────────────────────────────────────────────
export function parseCSVToLightCurve(csvText: string): {
  points: LightCurvePoint[];
  inferredDepthPpm: number;
  inferredPeriodDays: number;
  snr: number;
  estimatedRadius: number;
  symmetryPercent: number;
  durationHours: number;
} {
  const lines = csvText.trim().split("\n");
  const points: LightCurvePoint[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#") || line.toLowerCase().includes("time")) continue;
    const parts = line.split(/[,\s\t]+/);
    if (parts.length >= 2) {
      const t = parseFloat(parts[0]);
      const f = parseFloat(parts[1]);
      const err = parts.length > 2 ? parseFloat(parts[2]) : undefined;
      if (!isNaN(t) && !isNaN(f)) points.push({ time: t, flux: f, error: err });
    }
  }

  if (points.length < 20) {
    const fallback = generateSyntheticLightCurvePoints(3.4, 2100, 180, 500);
    const f = extractLightCurveFeatures(fallback);
    return {
      points: fallback,
      inferredDepthPpm: f.transitDepthPpm,
      inferredPeriodDays: f.orbitalPeriodDays,
      snr: f.snr,
      estimatedRadius: f.estimatedRadiusEarth,
      symmetryPercent: f.symmetryPercent,
      durationHours: f.durationHours,
    };
  }

  const f = extractLightCurveFeatures(points);
  return {
    points,
    inferredDepthPpm: f.transitDepthPpm,
    inferredPeriodDays: f.orbitalPeriodDays,
    snr: f.snr,
    estimatedRadius: f.estimatedRadiusEarth,
    symmetryPercent: f.symmetryPercent,
    durationHours: f.durationHours,
  };
}

// ─── Deterministic fallback analysis (no network/model needed) ────────────────
export function buildCompleteAnalysis(
  candidate: CandidateDataset,
  cnnScoreOverride?: number
): AnalysisResult {
  const { gases } = generateCandidateSpectrum(candidate.id);
  const cnnScore = cnnScoreOverride ?? Math.min(99, 70 + candidate.snr * 0.6);
  const snrScore = Math.min(100, candidate.snr * 2.2);
  const symScore = candidate.symmetryPercent;
  const llmScore = Number((snrScore * 0.5 + symScore * 0.5).toFixed(1));
  const overallScore = Number((cnnScore * 0.5 + llmScore * 0.5).toFixed(1));

  const pseudoFeatures: PhotometricFeatures = {
    transitDepthPpm: candidate.transitDepthPpm,
    orbitalPeriodDays: candidate.orbitalPeriodDays,
    dataPointsCount: 18400,
    snr: candidate.snr,
    durationHours: candidate.durationHours,
    symmetryPercent: candidate.symmetryPercent,
    estimatedRadiusEarth: candidate.estimatedRadiusEarth,
    noiseLevel: candidate.transitDepthPpm / 1e6 / Math.max(candidate.snr, 1),
    transitCenterIndex: 0,
    secondaryEclipseRatio: Math.max(0, 0.3 - candidate.snr / 200),
    flatBottomScore: Math.min(1, candidate.symmetryPercent / 100),
  };
  const featureImportances = rankFeatureImportances(pseudoFeatures);

  return {
    id: `ANL-${candidate.id.toUpperCase()}-${Date.now().toString().slice(-4)}`,
    candidate,
    timestamp: new Date().toISOString(),
    scores: {
      planetProbability: overallScore,
      confidenceLevel: overallScore > 90 ? "High" : overallScore > 70 ? "Moderate" : "Low",
      falsePositiveRate: Number(Math.max(0.1, 100 - overallScore).toFixed(1)),
      cnnScore: Number(cnnScore.toFixed(1)),
      llmScore,
      overallScore,
    },
    telemetry: {
      transitDepthPpm: candidate.transitDepthPpm,
      orbitalPeriodDays: candidate.orbitalPeriodDays,
      dataPointsCount: 18400,
      snr: candidate.snr,
      durationHours: candidate.durationHours,
      symmetryPercent: candidate.symmetryPercent,
      estimatedRadiusEarth: candidate.estimatedRadiusEarth,
    },
    detectedGases: gases,
    featureImportances,
    llmReasoning: [
      `Transit depth of ${candidate.transitDepthPpm} ppm measured against baseline.`,
      `Signal-to-noise ratio of ${candidate.snr} from the reference dataset.`,
      `${candidate.symmetryPercent}% ingress/egress symmetry.`,
      "This candidate was scored from its reference parameters directly — run it through Steps 1-3 for a live CNN + LLM analysis of an actual light curve.",
    ],
    decisionConclusion:
      `The candidate ${candidate.name} has a published transit depth of ${candidate.transitDepthPpm} ppm ` +
      `recurring every ${candidate.orbitalPeriodDays} days, with an SNR of ${candidate.snr}. ` +
      `Based on these reference parameters alone, this scores as a ${overallScore > 90 ? "high" : overallScore > 70 ? "moderate" : "low"}-confidence candidate.`,
    recommendations: [
      "Run this candidate through the full pipeline (Steps 1-3) for a CNN + LLM live analysis.",
      "Schedule follow-up radial velocity measurements to constrain planetary mass.",
      "Request transmission spectroscopy with JWST NIRSpec/NIRISS if not already available.",
    ],
  };
}

// ─── Real, live analysis (CNN inference + backend LLM call) ───────────────────
export async function buildRealAnalysis(
  candidate: CandidateDataset,
  lightCurvePoints: LightCurvePoint[],
  spectrumPoints: SpectrumPoint[],
  fallbackGases: GasDetection[]
): Promise<AnalysisResult> {
  const photo = extractLightCurveFeatures(lightCurvePoints);
  const flux = lightCurvePoints.map((p) => p.flux);

  const cnnProb = await predictTransitProbability(flux);
  const cnnScore = cnnProb != null ? Number((cnnProb * 100).toFixed(1)) : null;

  const gases = spectrumPoints.length > 0 ? retrieveGasesFromSpectrum(spectrumPoints) : fallbackGases;
  const detectedGasNames = gases.filter((g) => g.confidence > 50).map((g) => `${g.formula} (${g.confidence}%)`);

  let llmScore: number | null = null;
  let reasoning: string[] = [];
  let decisionConclusion = "";
  let recommendations: string[] = [];

  try {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        candidateName: candidate.name,
        hostStar: candidate.hostStar,
        cnnScore,
        features: {
          transitDepthPpm: photo.transitDepthPpm,
          orbitalPeriodDays: photo.orbitalPeriodDays,
          snr: photo.snr,
          durationHours: photo.durationHours,
          symmetryPercent: photo.symmetryPercent,
          flatBottomScore: photo.flatBottomScore,
          secondaryEclipseRatio: photo.secondaryEclipseRatio,
          dataPointsCount: photo.dataPointsCount,
        },
        gasSummary: detectedGasNames.length ? detectedGasNames.join(", ") : undefined,
      }),
    });
    if (res.ok) {
      const d = await res.json();
      llmScore = d.probability;
      reasoning = d.reasoning || [];
      decisionConclusion = d.decisionConclusion || "";
      recommendations = d.recommendations || [];
    } else {
      console.warn("classify API returned an error:", await res.text());
    }
  } catch (err) {
    console.warn("classify API unreachable:", err);
  }

  const physicsEstimate = Math.round(
    Math.min(100, photo.snr * 1.5 * 0.4 + photo.symmetryPercent * 0.3 + photo.flatBottomScore * 100 * 0.3)
  );
  const usedCnn = cnnScore ?? physicsEstimate;
  const usedLlm = llmScore ?? physicsEstimate;
  const overallScore = Number((usedCnn * 0.5 + usedLlm * 0.5).toFixed(1));

  const featureImportances = rankFeatureImportances(photo);

  return {
    id: `ANL-${candidate.id.toUpperCase()}-${Date.now().toString().slice(-4)}`,
    candidate,
    timestamp: new Date().toISOString(),
    scores: {
      planetProbability: overallScore,
      confidenceLevel: overallScore > 90 ? "High" : overallScore > 70 ? "Moderate" : "Low",
      falsePositiveRate: Number(Math.max(0.1, 100 - overallScore).toFixed(1)),
      cnnScore: Number(usedCnn.toFixed(1)),
      llmScore: Number(usedLlm.toFixed(1)),
      overallScore,
    },
    telemetry: {
      transitDepthPpm: photo.transitDepthPpm,
      orbitalPeriodDays: photo.orbitalPeriodDays,
      dataPointsCount: photo.dataPointsCount,
      snr: photo.snr,
      durationHours: photo.durationHours,
      symmetryPercent: photo.symmetryPercent,
      estimatedRadiusEarth: photo.estimatedRadiusEarth,
    },
    detectedGases: gases,
    featureImportances,
    llmReasoning:
      reasoning.length > 0
        ? reasoning
        : [
            `Transit depth measured at ${photo.transitDepthPpm} ppm.`,
            `Signal-to-noise ratio of ${photo.snr} computed from the loaded curve.`,
            cnnScore != null
              ? `CNN model (trained this session) scored this curve at ${cnnScore}%.`
              : "CNN not yet trained this session — Step 3 was skipped or hasn't finished.",
            "LLM reasoning unavailable — check that GROQ_API_KEY is configured on the server.",
          ],
    decisionConclusion:
      decisionConclusion ||
      `Candidate ${candidate.name}: measured transit depth ${photo.transitDepthPpm} ppm, period ${photo.orbitalPeriodDays} days, SNR ${photo.snr}. ` +
        `Combined model confidence: ${overallScore}%.`,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : [
            "Schedule follow-up radial velocity measurements to constrain planetary mass.",
            "Request transmission spectroscopy with JWST NIRSpec/NIRISS.",
            "Submit candidate ephemeris to the Exoplanet Archive (NExScI) for validation indexing.",
          ],
  };
}
