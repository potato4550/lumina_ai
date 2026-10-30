// ─── Light Curve ─────────────────────────────────────────────────────────────

export interface LightCurvePoint {
  time: number;
  flux: number;
}

export interface LightCurveData {
  points: LightCurvePoint[];
  observations: number;
  noiseLevel: number;
  transitDepth: number;
  orbitalPeriod: number;
  cadence: string;
  targetName: string;
}

// ─── Candidate ───────────────────────────────────────────────────────────────

export interface CandidateInfo {
  id: string;
  name: string;
  hostStar: string;
  observations: number;
  noiseLevel: number;
  transitDepth: number;
  orbitalPeriod: number;
  magnitude: number;
  spectralType: string;
}

// ─── Spectrum ────────────────────────────────────────────────────────────────

export interface SpectrumPoint {
  wavelength: number;
  depth: number;
}

export interface DetectedGas {
  name: string;
  wavelength: number;
  confidence: number;
}

export interface SpectrumData {
  points: SpectrumPoint[];
  detectedGases: DetectedGas[];
  spectralSNR: number;
  wavelengthRange: [number, number];
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

export type PipelineStageStatus = "pending" | "running" | "complete";

export interface PipelineStage {
  id: string;
  label: string;
  description: string;
  status: PipelineStageStatus;
  durationMs: number;
}

// ─── Prediction ──────────────────────────────────────────────────────────────

export type PriorityLevel = "High" | "Medium" | "Low";

export interface PredictionResult {
  candidateId: string;
  candidateName: string;
  hostStar: string;
  classification: string;
  confidence: number;
  physicsScore: number;
  transitDepth: number;
  orbitalPeriod: number;
  habitabilityScore: number;
  priority: PriorityLevel;
  radius: string;
  equilibriumTemp: string;
}

// ─── Explainability ──────────────────────────────────────────────────────────

export interface ExplainabilityReason {
  label: string;
  passed: boolean;
  detail: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction: "positive" | "negative";
}

export interface ConfidenceBreakdown {
  label: string;
  value: number;
  color: string;
}

export interface ExplainabilityData {
  reasons: ExplainabilityReason[];
  featureImportance: FeatureImportance[];
  confidenceBreakdown: ConfidenceBreakdown[];
  attentionWeights: number[];
}

// ─── Candidate Ranking ───────────────────────────────────────────────────────

export type CandidateStatus = "Confirmed" | "Likely" | "Needs Review" | "Unlikely";

export interface CandidateRankRow {
  id: string;
  candidate: string;
  confidence: number;
  physicsScore: number;
  priority: PriorityLevel;
  status: CandidateStatus;
  chips: string[];
}

// ─── Report ──────────────────────────────────────────────────────────────────

export interface ReportSection {
  title: string;
  content: string;
}

export interface ReportData {
  title: string;
  generatedAt: string;
  candidateId: string;
  sections: ReportSection[];
  recommendation: string;
}

// ─── Analysis Wizard State ───────────────────────────────────────────────────

export interface AnalysisState {
  step: 1 | 2 | 3 | 4;
  lightCurve: LightCurveData | null;
  spectrum: SpectrumData | null;
  pipelineComplete: boolean;
  prediction: PredictionResult | null;
}
