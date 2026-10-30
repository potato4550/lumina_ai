"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useExoplanetStore } from "@/lib/store";
import { trainExoplanetCNN } from "@/lib/tfjs-model";
import { TrainingCharts } from "./TrainingCharts";
import { LLMReasoningCard } from "./LLMReasoningCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Play,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  Cpu,
  Save,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function TrainingDashboard() {
  const router = useRouter();
  const {
    selectedCandidate,
    trainingConfig,
    trainingMetrics,
    isTraining,
    isTrainingComplete,
    trainingSpeedSamplesPerSec,
    cnnModelAccuracy,
    llmReasoning,
    updateTrainingConfig,
    startTraining,
    appendTrainingMetric,
    completeTraining,
    finalizeAnalysis,
    setActiveStep,
  } = useExoplanetStore();

  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [modelSaved, setModelSaved] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleStartTrain = async () => {
    startTraining();
    setCurrentEpoch(0);
    setModelSaved(false);
    toast.info("Initializing TensorFlow.js WebGL backend & generating synthetic vectors...");

    try {
      const { finalValAccuracy } = await trainExoplanetCNN(
        trainingConfig.sampleCount,
        trainingConfig.epochs,
        trainingConfig.learningRate,
        {
          onEpochEnd: (metrics, speed) => {
            setCurrentEpoch(metrics.epoch);
            appendTrainingMetric(metrics, speed);
          },
        }
      );

      completeTraining(finalValAccuracy);
      setModelSaved(true);
      toast.success(
        `CNN Training completed with ${(finalValAccuracy * 100).toFixed(1)}% validation accuracy! Model saved in browser memory.`
      );
    } catch (err) {
      console.error("Training error:", err);
      toast.error("Error during TensorFlow.js training.");
    }
  };

  const handleBack = () => {
    setActiveStep(2);
    router.push("/analyze/spectrum");
  };

  const handleNext = async () => {
    setIsFinalizing(true);
    try {
      const analysis = await finalizeAnalysis();
      setActiveStep(4);
      router.push(`/results/${analysis.id}`);
    } catch (err) {
      console.error("Finalize analysis error:", err);
      toast.error("Error running the detection pipeline.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const progressPercent = trainingConfig.epochs > 0
    ? Math.round((currentEpoch / trainingConfig.epochs) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
            Step 3 of 4
          </span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Deep Learning Verification
          </span>
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Convolutional Neural Network (CNN) Classifier
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-3xl">
          Train an in-browser 1D Convolutional Neural Network on 600 synthetic transit and false-positive vectors using TensorFlow.js. Monitor real-time convergence before generating explainable AI attribution.
        </p>
      </div>

      {/* Hyperparameter Controls & Model Specs */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: Interactive Controls */}
        <Card className="lg:col-span-1 border-slate-200 bg-white">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Hyperparameters
              </h3>
            </div>

            {/* Learning Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Learning Rate (Adam)</span>
                <span className="font-mono font-bold text-slate-900">
                  {trainingConfig.learningRate}
                </span>
              </div>
              <input
                type="range"
                min="0.0001"
                max="0.01"
                step="0.0005"
                value={trainingConfig.learningRate}
                disabled={isTraining}
                onChange={(e) =>
                  updateTrainingConfig({ learningRate: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.0001 (Fine)</span>
                <span>0.01 (Fast)</span>
              </div>
            </div>

            {/* Epochs Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Training Epochs</span>
                <span className="font-mono font-bold text-slate-900">
                  {trainingConfig.epochs}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={trainingConfig.epochs}
                disabled={isTraining}
                onChange={(e) =>
                  updateTrainingConfig({ epochs: parseInt(e.target.value) })
                }
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>5 epochs</span>
                <span>30 epochs</span>
              </div>
            </div>

            {/* Synthetic Sample Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Synthetic Dataset Size</span>
                <span className="font-mono font-bold text-slate-900">
                  {trainingConfig.sampleCount} vectors
                </span>
              </div>
              <input
                type="range"
                min="400"
                max="1000"
                step="100"
                value={trainingConfig.sampleCount}
                disabled={isTraining}
                onChange={(e) =>
                  updateTrainingConfig({ sampleCount: parseInt(e.target.value) })
                }
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>400 samples</span>
                <span>1000 samples</span>
              </div>
            </div>

            {/* Train Button */}
            <Button
              onClick={handleStartTrain}
              disabled={isTraining}
              className="w-full h-10 gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow"
            >
              {isTraining ? (
                <>
                  <Cpu className="h-4 w-4 animate-spin" />
                  <span>Training Browser CNN...</span>
                </>
              ) : isTrainingComplete ? (
                <>
                  <RotateCcw className="h-4 w-4" />
                  <span>Retrain Model</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Train TensorFlow.js CNN</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Live Telemetry & Progress */}
        <Card className="lg:col-span-2 border-slate-200 bg-white">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  TensorFlow.js WebGL Execution Monitor
                </h3>
              </div>
              {modelSaved && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Save className="h-3 w-3" /> Model Saved to Browser
                </span>
              )}
            </div>

            {/* Telemetry Stat Badges */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[10px] text-slate-500 font-medium">Epoch Progress</span>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {currentEpoch} / {trainingConfig.epochs}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[10px] text-slate-500 font-medium">Training Speed</span>
                <p className="text-base font-bold font-mono text-purple-600 mt-0.5">
                  {trainingSpeedSamplesPerSec > 0 ? `${trainingSpeedSamplesPerSec} s/sec` : "Standby"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[10px] text-slate-500 font-medium">Validation Accuracy</span>
                <p className="text-base font-bold font-mono text-emerald-600 mt-0.5">
                  {cnnModelAccuracy > 0 ? `${cnnModelAccuracy}%` : "—"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[10px] text-slate-500 font-medium">Architecture</span>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  2x Conv1D
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Training Convergence</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2.5 bg-slate-100" />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Trains a 2-stage Conv1D network with pooling, ReLU activations, dropout regularization, and binary cross-entropy loss against {trainingConfig.sampleCount} synthetic light curve vectors directly in browser WebGL memory.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Loss and Accuracy Charts */}
      <TrainingCharts
        metrics={trainingMetrics}
        totalEpochs={trainingConfig.epochs}
      />

      {/* Simulated LLM Reasoning Card (shown upon completion or if complete) */}
      {isTrainingComplete && (
        <LLMReasoningCard
          reasoning={llmReasoning}
          candidateName={selectedCandidate.name}
        />
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          variant="outline"
          size="lg"
          onClick={handleBack}
          disabled={isTraining}
          className="h-10 px-5 gap-2 border-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back: Spectrum</span>
        </Button>

        <Button
          size="lg"
          onClick={handleNext}
          disabled={!isTrainingComplete || isTraining || isFinalizing}
          className="h-10 px-6 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          {isFinalizing ? (
            <>
              <Cpu className="h-4 w-4 animate-spin" />
              <span>Running CNN + LLM analysis...</span>
            </>
          ) : (
            <>
              <span>View Final Detection Results</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
