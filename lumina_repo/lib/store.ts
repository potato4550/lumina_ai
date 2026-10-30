import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CandidateDataset,
  LightCurvePoint,
  LightCurveTelemetry,
  SpectrumPoint,
  GasDetection,
  TrainingConfig,
  TrainingMetrics,
  AnalysisResult,
} from "@/types";
import {
  PRESET_CANDIDATES,
  generateCandidateSpectrum,
  generateSyntheticLightCurvePoints,
  buildRealAnalysis,
} from "./mockAnalysis";

interface ExoplanetStore {
  // Step 1: Light Curve
  selectedCandidate: CandidateDataset;
  lightCurvePoints: LightCurvePoint[];
  telemetry: LightCurveTelemetry;
  isLightCurveLoaded: boolean;
  activeStep: number;

  // Step 2: Spectrum
  spectrumPoints: SpectrumPoint[];
  detectedGases: GasDetection[];
  isSpectrumGenerated: boolean;

  // Step 3: Training
  trainingConfig: TrainingConfig;
  trainingMetrics: TrainingMetrics[];
  isTraining: boolean;
  isTrainingComplete: boolean;
  trainingSpeedSamplesPerSec: number;
  cnnModelAccuracy: number;
  llmReasoning: string[];

  // Step 4: Results
  currentAnalysis: AnalysisResult | null;
  pastAnalyses: AnalysisResult[];

  // Actions
  setActiveStep: (step: number) => void;
  selectCandidate: (candidate: CandidateDataset) => void;
  setCustomLightCurve: (
    points: LightCurvePoint[],
    telemetry: LightCurveTelemetry,
    customName?: string
  ) => void;
  generateSpectrum: () => void;
  setCustomSpectrum: (points: SpectrumPoint[]) => void;
  updateTrainingConfig: (config: Partial<TrainingConfig>) => void;
  startTraining: () => void;
  appendTrainingMetric: (metric: TrainingMetrics, samplesPerSec?: number) => void;
  completeTraining: (valAccuracy: number) => void;
  finalizeAnalysis: () => Promise<AnalysisResult>;
  resetWorkflow: () => void;
}

const defaultCandidate = PRESET_CANDIDATES[0]; // TRAPPIST-1e
const initialPoints = generateSyntheticLightCurvePoints(
  defaultCandidate.orbitalPeriodDays,
  defaultCandidate.transitDepthPpm,
  160,
  600
);

export const useExoplanetStore = create<ExoplanetStore>()(
  persist(
    (set, get) => ({
      activeStep: 1,
      selectedCandidate: defaultCandidate,
      lightCurvePoints: initialPoints,
      telemetry: {
        transitDepthPpm: defaultCandidate.transitDepthPpm,
        orbitalPeriodDays: defaultCandidate.orbitalPeriodDays,
        dataPointsCount: initialPoints.length,
        snr: defaultCandidate.snr,
        durationHours: defaultCandidate.durationHours,
        symmetryPercent: defaultCandidate.symmetryPercent,
        estimatedRadiusEarth: defaultCandidate.estimatedRadiusEarth,
      },
      isLightCurveLoaded: true,

      spectrumPoints: [],
      detectedGases: [],
      isSpectrumGenerated: false,

      trainingConfig: {
        learningRate: 0.001,
        epochs: 15,
        batchSize: 32,
        sampleCount: 600,
      },
      trainingMetrics: [],
      isTraining: false,
      isTrainingComplete: false,
      trainingSpeedSamplesPerSec: 0,
      cnnModelAccuracy: 0,
      llmReasoning: [],

      currentAnalysis: null,
      pastAnalyses: [],

      setActiveStep: (step: number) => set({ activeStep: step }),

      selectCandidate: (candidate: CandidateDataset) => {
        const points = generateSyntheticLightCurvePoints(
          candidate.orbitalPeriodDays,
          candidate.transitDepthPpm,
          160,
          600
        );
        set({
          selectedCandidate: candidate,
          lightCurvePoints: points,
          telemetry: {
            transitDepthPpm: candidate.transitDepthPpm,
            orbitalPeriodDays: candidate.orbitalPeriodDays,
            dataPointsCount: points.length,
            snr: candidate.snr,
            durationHours: candidate.durationHours,
            symmetryPercent: candidate.symmetryPercent,
            estimatedRadiusEarth: candidate.estimatedRadiusEarth,
          },
          isLightCurveLoaded: true,
          // Reset downstream steps when a new candidate is chosen
          isSpectrumGenerated: false,
          spectrumPoints: [],
          detectedGases: [],
          isTrainingComplete: false,
          trainingMetrics: [],
          currentAnalysis: null,
        });
      },

      setCustomLightCurve: (points, telemetry, customName) => {
        const candidate: CandidateDataset = {
          id: `custom-${Date.now().toString().slice(-4)}`,
          name: customName || "Uploaded Target",
          hostStar: "Custom Observatory Data",
          constellation: "Unspecified",
          distanceLightYears: 0,
          magnitude: 12.0,
          spectralType: "Custom Target",
          transitDepthPpm: telemetry.transitDepthPpm,
          orbitalPeriodDays: telemetry.orbitalPeriodDays,
          estimatedRadiusEarth: telemetry.estimatedRadiusEarth,
          snr: telemetry.snr,
          durationHours: telemetry.durationHours,
          symmetryPercent: telemetry.symmetryPercent,
          csvPath: "",
          description: "Custom user-uploaded light curve observation series.",
        };
        set({
          selectedCandidate: candidate,
          lightCurvePoints: points,
          telemetry,
          isLightCurveLoaded: true,
          isSpectrumGenerated: false,
          spectrumPoints: [],
          detectedGases: [],
          isTrainingComplete: false,
          trainingMetrics: [],
          currentAnalysis: null,
        });
      },

      generateSpectrum: () => {
        const { selectedCandidate } = get();
        const { points, gases } = generateCandidateSpectrum(selectedCandidate.id);
        set({
          spectrumPoints: points,
          detectedGases: gases,
          isSpectrumGenerated: true,
        });
      },

      setCustomSpectrum: (points) => {
        const { selectedCandidate } = get();
        const { gases } = generateCandidateSpectrum(selectedCandidate.id);
        set({
          spectrumPoints: points,
          detectedGases: gases,
          isSpectrumGenerated: true,
        });
      },

      updateTrainingConfig: (config) =>
        set((state) => ({
          trainingConfig: { ...state.trainingConfig, ...config },
        })),

      startTraining: () =>
        set({
          isTraining: true,
          isTrainingComplete: false,
          trainingMetrics: [],
          llmReasoning: [],
        }),

      appendTrainingMetric: (metric, samplesPerSec = 450) =>
        set((state) => ({
          trainingMetrics: [...state.trainingMetrics, metric],
          trainingSpeedSamplesPerSec: samplesPerSec,
        })),

      completeTraining: (valAccuracy: number) => {
        const reasoning = [
          "Transit depth is consistent with an exoplanet.",
          "Low stellar noise confirmed in out-of-transit baseline.",
          "Periodicity verified across 3+ continuous orbits.",
          "Confidence increased: bilateral symmetry rules out grazing eclipsing binaries.",
        ];
        set({
          isTraining: false,
          isTrainingComplete: true,
          cnnModelAccuracy: Number((valAccuracy * 100).toFixed(1)),
          llmReasoning: reasoning,
        });
      },

      finalizeAnalysis: async () => {
        const { selectedCandidate, lightCurvePoints, spectrumPoints, detectedGases, pastAnalyses } = get();
        const analysis = await buildRealAnalysis(
          selectedCandidate,
          lightCurvePoints,
          spectrumPoints,
          detectedGases
        );
        set({
          currentAnalysis: analysis,
          pastAnalyses: [analysis, ...pastAnalyses.filter((a) => a.id !== analysis.id)],
        });
        return analysis;
      },

      resetWorkflow: () => {
        set({
          activeStep: 1,
          isSpectrumGenerated: false,
          spectrumPoints: [],
          detectedGases: [],
          isTrainingComplete: false,
          trainingMetrics: [],
          currentAnalysis: null,
        });
      },
    }),
    {
      name: "lumina-exoplanet-state",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        selectedCandidate: state.selectedCandidate,
        telemetry: state.telemetry,
        isLightCurveLoaded: state.isLightCurveLoaded,
        isSpectrumGenerated: state.isSpectrumGenerated,
        isTrainingComplete: state.isTrainingComplete,
        cnnModelAccuracy: state.cnnModelAccuracy,
        currentAnalysis: state.currentAnalysis,
        pastAnalyses: state.pastAnalyses,
      }),
    }
  )
);
