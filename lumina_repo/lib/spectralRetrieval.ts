import { SpectrumPoint, GasDetection } from "@/types";
import { ALL_8_GASES } from "./candidates";

/**
 * Fits each gas's known absorption band (as a Gaussian bump centered on its
 * absorptionPeakMicrons) against the actual observed spectrum, instead of
 * returning pre-set confidence/abundance numbers per candidate ID. Works
 * the same way for a generated demo spectrum or an uploaded one.
 */
export function retrieveGasesFromSpectrum(points: SpectrumPoint[]): GasDetection[] {
  if (!points || points.length < 5) {
    return ALL_8_GASES.map((g) => ({ ...g, confidence: 0, abundance: 0 }));
  }

  const wl = points.map((p) => p.wavelength);
  const depth = points.map((p) => p.depth);
  const n = depth.length;

  // Smooth continuum baseline via a wide moving median, so gas bumps show up
  // as the *excess* above the local baseline rather than absolute depth.
  const windowSize = Math.max(3, Math.round(n / 10));
  const continuum = depth.map((_, i) => {
    const lo = Math.max(0, i - windowSize),
      hi = Math.min(n, i + windowSize);
    const slice = [...depth.slice(lo, hi)].sort((a, b) => a - b);
    return slice[Math.floor(slice.length / 2)];
  });
  const residual = depth.map((d, i) => d - continuum[i]);
  const noiseFloor =
    Math.sqrt(residual.reduce((a, v) => a + v * v, 0) / n) || 1e-6;

  return ALL_8_GASES.map((gas) => {
    // band half-width in microns — narrower for tighter/atomic bands, wider for broad molecular bands
    const bandWidth = 0.12;
    let weightedSum = 0,
      weightTotal = 0;
    for (let i = 0; i < n; i++) {
      const dist = wl[i] - gas.absorptionPeakMicrons;
      const w = Math.exp(-(dist * dist) / (2 * bandWidth * bandWidth));
      if (w > 0.02) {
        weightedSum += residual[i] * w;
        weightTotal += w;
      }
    }
    const amplitude = weightTotal > 0 ? weightedSum / weightTotal : 0;
    const sigma = amplitude / noiseFloor; // detection significance
    const confidence = Math.round(Math.max(0, Math.min(100, (1 - Math.exp(-Math.max(sigma, 0) / 2.2)) * 100)));
    const scale = gas.abundanceUnit === "%" ? 8 : 4000;
    const abundance = Number(Math.max(0, amplitude * scale).toFixed(gas.abundanceUnit === "%" ? 3 : 1));

    return {
      ...gas,
      confidence,
      abundance,
    };
  });
}
