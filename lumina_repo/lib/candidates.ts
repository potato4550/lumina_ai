import { CandidateDataset, GasDetection } from "@/types";

export const PRESET_CANDIDATES: CandidateDataset[] = [
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    hostStar: "TRAPPIST-1",
    constellation: "Aquarius",
    distanceLightYears: 39.46,
    magnitude: 18.8,
    spectralType: "M8V Ultra-cool Dwarf",
    transitDepthPpm: 4850,
    orbitalPeriodDays: 6.1,
    estimatedRadiusEarth: 0.92,
    snr: 28.4,
    durationHours: 1.05,
    symmetryPercent: 98.2,
    csvPath: "/data/trappist-1e.csv",
    description:
      "Earth-sized exoplanet orbiting within the habitable zone of an ultra-cool red dwarf star. Prime candidate for atmospheric characterization with JWST.",
  },
  {
    id: "kepler-90h",
    name: "Kepler-90h",
    hostStar: "Kepler-90",
    constellation: "Draco",
    distanceLightYears: 2840,
    magnitude: 14.0,
    spectralType: "G0V Yellow Dwarf",
    transitDepthPpm: 6200,
    orbitalPeriodDays: 331.6,
    estimatedRadiusEarth: 14.8,
    estimatedRadiusJupiter: 1.32,
    snr: 42.1,
    durationHours: 14.2,
    symmetryPercent: 96.5,
    csvPath: "/data/kepler-90h.csv",
    description:
      "Outer gas giant of the 8-planet Kepler-90 system, demonstrating orbital resonance and deep transit ingress/egress profiles similar to Jupiter.",
  },
  {
    id: "toi-700d",
    name: "TOI-700d",
    hostStar: "TOI-700",
    constellation: "Dorado",
    distanceLightYears: 101.4,
    magnitude: 13.1,
    spectralType: "M2V Red Dwarf",
    transitDepthPpm: 1420,
    orbitalPeriodDays: 37.42,
    estimatedRadiusEarth: 1.14,
    snr: 19.6,
    durationHours: 2.8,
    symmetryPercent: 97.8,
    csvPath: "/data/toi-700d.csv",
    description:
      "First habitable-zone Earth-size planet discovered by TESS. Low stellar activity on host star improves transmission spectroscopy signal fidelity.",
  },
  {
    id: "k2-18b",
    name: "K2-18b",
    hostStar: "K2-18",
    constellation: "Leo",
    distanceLightYears: 124.0,
    magnitude: 13.5,
    spectralType: "M2.8V Red Dwarf",
    transitDepthPpm: 2980,
    orbitalPeriodDays: 32.94,
    estimatedRadiusEarth: 2.61,
    snr: 34.8,
    durationHours: 3.4,
    symmetryPercent: 99.1,
    csvPath: "/data/k2-18b.csv",
    description:
      "Hycean world candidate with verified water vapor, methane, and carbon dioxide signatures detected by Hubble and JWST transmission spectroscopy.",
  },
];

// Base reference data for each gas's known absorption band. `confidence` and
// `abundance` are intentionally omitted here — they're computed per-spectrum
// by lib/spectralRetrieval.ts rather than looked up.
export const ALL_8_GASES: Omit<GasDetection, "confidence" | "abundance">[] = [
  {
    id: "h2o",
    name: "Water Vapor",
    formula: "H₂O",
    abundanceUnit: "%",
    color: "#38bdf8",
    absorptionPeakMicrons: 1.4,
    explanation:
      "Strong vibrational absorption overtone band near 1.4 µm and 1.8 µm. Indicates hydrological cycle or steam atmosphere.",
  },
  {
    id: "co2",
    name: "Carbon Dioxide",
    formula: "CO₂",
    abundanceUnit: "%",
    color: "#f97316",
    absorptionPeakMicrons: 4.3,
    explanation:
      "Prominent fundamental asymmetric stretching band at 4.3 µm. Primary greenhouse component and proxy for atmospheric metallicity.",
  },
  {
    id: "ch4",
    name: "Methane",
    formula: "CH₄",
    abundanceUnit: "ppm",
    color: "#eab308",
    absorptionPeakMicrons: 3.3,
    explanation:
      "Pronounced fundamental C-H stretching band at 3.3 µm. Strong potential biosignature in non-equilibrium with carbon monoxide.",
  },
  {
    id: "o2",
    name: "Molecular Oxygen",
    formula: "O₂",
    abundanceUnit: "%",
    color: "#22c55e",
    absorptionPeakMicrons: 0.76,
    explanation:
      "Atmospheric A-band absorption at 0.76 µm (Fraunhofer A-band). Classical photosynthetic biomarker in terrestrial planets.",
  },
  {
    id: "o3",
    name: "Ozone",
    formula: "O₃",
    abundanceUnit: "ppm",
    color: "#06b6d4",
    absorptionPeakMicrons: 9.6,
    explanation:
      "Hartley and Chappuis ultraviolet/visible bands and 9.6 µm infrared signature produced by photochemical dissociation of oxygen.",
  },
  {
    id: "so2",
    name: "Sulfur Dioxide",
    formula: "SO₂",
    abundanceUnit: "ppm",
    color: "#a855f7",
    absorptionPeakMicrons: 4.05,
    explanation:
      "Photochemically active tracer identified at 4.05 µm, signaling intense stellar UV-driven sulfur photochemistry (as observed on WASP-39b).",
  },
  {
    id: "n2o",
    name: "Nitrous Oxide",
    formula: "N₂O",
    abundanceUnit: "ppm",
    color: "#ec4899",
    absorptionPeakMicrons: 4.5,
    explanation:
      "Atmospheric trace gas with bands at 4.5 µm and 7.8 µm, predominantly synthesized biologically via microbial denitrification.",
  },
  {
    id: "dms",
    name: "Dimethyl Sulfide",
    formula: "DMS",
    abundanceUnit: "ppm",
    color: "#14b8a6",
    absorptionPeakMicrons: 3.4,
    explanation:
      "Volatile organosulfur compound with infrared signatures at ~3.4 µm; almost exclusively produced by phytoplankton in marine environments on Earth.",
  },
];
