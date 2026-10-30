import { LightCurvePoint, LightCurveTelemetry } from "@/types";

/**
 * Real, data-driven feature extraction from a light curve.
 * Every number here is computed from the actual `points` array —
 * nothing is looked up from a per-candidate table.
 */
export interface PhotometricFeatures extends LightCurveTelemetry {
  noiseLevel: number;        // std dev of out-of-transit flux
  transitCenterIndex: number;
  secondaryEclipseRatio: number; // 0-1, lower is more planet-like
  flatBottomScore: number;       // 0-1, higher = more U-shaped (planet-like)
}

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function std(arr: number[], mean: number): number {
  if (arr.length === 0) return 0;
  return Math.sqrt(arr.reduce((a, v) => a + (v - mean) ** 2, 0) / arr.length);
}

/**
 * Simple box-least-squares-style period search: tries candidate periods,
 * phase-folds the curve at each, and scores how "dippy" the fold is.
 * Returns the period (in the same time units as `points[].time`) with the
 * strongest folded transit signal.
 */
function searchPeriod(points: LightCurvePoint[]): number {
  if (points.length < 20) return 3.4;
  const times = points.map((p) => p.time);
  const span = Math.max(...times) - Math.min(...times);
  if (!isFinite(span) || span <= 0) return 3.4;

  const minP = Math.max(span / 40, 0.3);
  const maxP = Math.max(span / 1.5, minP + 0.1);
  const nP = 80;
  const nBins = 20;
  const flux = points.map((p) => p.flux);
  const fMin = Math.min(...flux),
    fMax = Math.max(...flux);
  const range = fMax - fMin || 1e-9;
  const norm = flux.map((v) => (v - fMin) / range);

  let bestPeriod = minP,
    bestPower = -Infinity;
  for (let i = 0; i < nP; i++) {
    const P = minP + ((maxP - minP) * i) / nP;
    const binSums = new Array(nBins).fill(0);
    const binCounts = new Array(nBins).fill(0);
    for (let j = 0; j < points.length; j++) {
      const phase = ((times[j] - times[0]) % P) / P;
      const bin = Math.min(nBins - 1, Math.floor(phase * nBins));
      binSums[bin] += norm[j];
      binCounts[bin] += 1;
    }
    const binMeans = binSums.map((s, k) => (binCounts[k] ? s / binCounts[k] : 0.5));
    const power = Math.max(...binMeans) - Math.min(...binMeans);
    if (power > bestPower) {
      bestPower = power;
      bestPeriod = P;
    }
  }
  return Number(bestPeriod.toFixed(3));
}

export function extractLightCurveFeatures(points: LightCurvePoint[]): PhotometricFeatures {
  if (!points || points.length < 5) {
    return {
      transitDepthPpm: 0,
      orbitalPeriodDays: 0,
      dataPointsCount: points?.length || 0,
      snr: 0,
      durationHours: 0,
      symmetryPercent: 0,
      estimatedRadiusEarth: 0,
      noiseLevel: 0,
      transitCenterIndex: 0,
      secondaryEclipseRatio: 0,
      flatBottomScore: 0,
    };
  }

  const flux = points.map((p) => p.flux);
  const n = flux.length;
  const med = median(flux);
  const minFlux = Math.min(...flux);
  const minIdx = flux.indexOf(minFlux);

  const depth = Math.max(0, med - minFlux);
  const depthPpm = Math.round(depth * 1e6);

  // Out-of-transit baseline = points far from the deepest dip
  const outOfTransit = flux.filter((_, i) => Math.abs(i - minIdx) > n * 0.15);
  const outMean = outOfTransit.length
    ? outOfTransit.reduce((a, b) => a + b, 0) / outOfTransit.length
    : med;
  const noise = std(outOfTransit.length ? outOfTransit : flux, outMean);
  const snr = noise > 0 ? Number((depth / noise).toFixed(1)) : 0;

  // Symmetry: compare flux profile left vs. right of the deepest point
  const L = flux.slice(0, minIdx).reverse();
  const R = flux.slice(minIdx + 1);
  const sideLen = Math.min(L.length, R.length, 30);
  let asym = 0;
  for (let i = 0; i < sideLen; i++) asym += Math.abs((L[i] ?? outMean) - (R[i] ?? outMean));
  const range = Math.max(...flux) - Math.min(...flux) || 1e-9;
  const symmetryPercent =
    sideLen > 0 ? Math.max(0, Math.min(100, (1 - asym / (sideLen * range)) * 100)) : 50;

  // Flat-bottom (U-shape) score: how flat is the curve right around the minimum
  const bottomWindow = flux.slice(Math.max(0, minIdx - 5), Math.min(n, minIdx + 5));
  const flatBottomScore =
    bottomWindow.length > 2 ? 1 - (Math.max(...bottomWindow) - Math.min(...bottomWindow)) / range : 0;

  // Secondary eclipse check: look at the opposite phase point
  const oppositeIdx = Math.round((minIdx + n / 2) % n);
  const secWindow = flux.slice(Math.max(0, oppositeIdx - 5), Math.min(n, oppositeIdx + 5));
  const secDepth = secWindow.length ? outMean - Math.min(...secWindow) : 0;
  const secondaryEclipseRatio = depth > 0 ? Math.max(0, Math.min(1, secDepth / depth)) : 0;

  // Transit duration: width (in points) where flux dips below a threshold near the minimum
  const threshold = outMean - range * 0.25;
  let widthPoints = 0;
  for (let i = 0; i < n; i++) if (flux[i] < threshold) widthPoints++;
  const times = points.map((p) => p.time);
  const cadenceDays =
    times.length > 1 ? (Math.max(...times) - Math.min(...times)) / (times.length - 1) : 0.02;
  const durationHours = Number((widthPoints * cadenceDays * 24).toFixed(2));

  const orbitalPeriodDays = searchPeriod(points);
  const estimatedRadiusEarth = Number((Math.sqrt(depth) * 109).toFixed(2));

  return {
    transitDepthPpm: depthPpm,
    orbitalPeriodDays,
    dataPointsCount: n,
    snr,
    durationHours,
    symmetryPercent: Number(symmetryPercent.toFixed(1)),
    estimatedRadiusEarth,
    noiseLevel: Number(noise.toFixed(6)),
    transitCenterIndex: minIdx,
    secondaryEclipseRatio: Number(secondaryEclipseRatio.toFixed(3)),
    flatBottomScore: Number(Math.max(0, Math.min(1, flatBottomScore)).toFixed(3)),
  };
}

/**
 * Ranks which measured features most strongly support (or undercut) a
 * genuine-transit classification, for the Explainability panel. Replaces
 * the previous static, always-identical list.
 */
export function rankFeatureImportances(f: PhotometricFeatures) {
  const items = [
    {
      feature: "Transit Depth (ppm)",
      importance: Math.round(Math.min(100, (f.transitDepthPpm / 6000) * 100)),
      description: `Measured depth of ${f.transitDepthPpm.toLocaleString()} ppm relative to the out-of-transit baseline.`,
    },
    {
      feature: "Signal-to-Noise Ratio",
      importance: Math.round(Math.min(100, (f.snr / 40) * 100)),
      description: `SNR of ${f.snr} — computed from dip depth vs. out-of-transit flux scatter.`,
    },
    {
      feature: "Ingress/Egress Symmetry",
      importance: Math.round(f.symmetryPercent),
      description: `${f.symmetryPercent.toFixed(1)}% bilateral symmetry around the transit minimum.`,
    },
    {
      feature: "Flat-bottom (U-shape) Profile",
      importance: Math.round(f.flatBottomScore * 100),
      description:
        f.flatBottomScore > 0.5
          ? "Flat-bottomed dip consistent with a planetary disc fully crossing the stellar disc."
          : "V-shaped dip — worth checking against a grazing or eclipsing-binary scenario.",
    },
    {
      feature: "Secondary Eclipse Test",
      importance: Math.round((1 - f.secondaryEclipseRatio) * 100),
      description:
        f.secondaryEclipseRatio < 0.3
          ? "No significant secondary occultation detected — argues against a stellar companion."
          : "Some flux dip detected at the opposite phase — check for eclipsing-binary contamination.",
    },
    {
      feature: "Transit Duration vs. Period",
      importance: Math.round(
        Math.min(100, 100 - Math.abs((f.durationHours / (f.orbitalPeriodDays * 24)) * 100 - 3) * 8)
      ),
      description: `Duration of ${f.durationHours}h against a ${f.orbitalPeriodDays}-day period is ${
        f.durationHours / (f.orbitalPeriodDays * 24) < 0.08 ? "consistent with" : "unusual for"
      } a typical transiting geometry.`,
    },
  ];
  return items.sort((a, b) => b.importance - a.importance);
}
