import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ClassifyRequestBody {
  candidateName: string;
  hostStar?: string;
  cnnScore: number | null; // 0-100, or null if the CNN hasn't been trained yet
  features: {
    transitDepthPpm: number;
    orbitalPeriodDays: number;
    snr: number;
    durationHours: number;
    symmetryPercent: number;
    flatBottomScore: number;
    secondaryEclipseRatio: number;
    dataPointsCount: number;
  };
  gasSummary?: string; // short description of any detected gases, if spectrum step ran
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";
const FALLBACK_MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-20b"];

function buildPrompt(body: ClassifyRequestBody): string {
  const f = body.features;
  const lines = [
    `Transit depth: ${f.transitDepthPpm} ppm`,
    `Orbital period: ${f.orbitalPeriodDays} days`,
    `Signal-to-noise ratio: ${f.snr}`,
    `Transit duration: ${f.durationHours} hours`,
    `Ingress/egress symmetry: ${f.symmetryPercent}%`,
    `Flat-bottom (U-shape) score: ${f.flatBottomScore} (0-1, higher = more planet-like)`,
    `Secondary eclipse ratio: ${f.secondaryEclipseRatio} (0-1, lower = more planet-like)`,
    `Data points analyzed: ${f.dataPointsCount}`,
  ];
  if (body.cnnScore != null) lines.push(`CNN model transit probability: ${body.cnnScore}%`);
  if (body.gasSummary) lines.push(`Spectroscopic gas detections: ${body.gasSummary}`);

  return `You are an exoplanet transit classification assistant reviewing candidate "${body.candidateName}"${
    body.hostStar ? ` (host star: ${body.hostStar})` : ""
  }.

Measured features:
${lines.map((l) => "- " + l).join("\n")}

Based only on these measurements, assess how likely this is a genuine planetary transit versus a false positive (noise, stellar variability, or an eclipsing binary).

Respond with ONLY a JSON object, no other text, in exactly this form:
{
  "probability": <number 0-100>,
  "reasoning": ["<short factual observation 1>", "<short factual observation 2>", "<short factual observation 3>", "<short factual observation 4>"],
  "decisionConclusion": "<2-3 sentence overall conclusion citing the specific numbers above>",
  "recommendations": ["<concrete follow-up observation 1>", "<concrete follow-up observation 2>", "<concrete follow-up observation 3>"]
}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server. Set it in your environment and redeploy." },
      { status: 500 }
    );
  }

  let body: ClassifyRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.features) {
    return NextResponse.json({ error: "Missing 'features' in request body" }, { status: 400 });
  }

  const prompt = buildPrompt(body);
  const modelsToTry = [process.env.GROQ_MODEL || DEFAULT_MODEL, ...FALLBACK_MODELS];

  let lastError = "";
  for (const model of modelsToTry) {
    try {
      const resp = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 500,
          temperature: 0,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!resp.ok) {
        lastError = `${model}: ${resp.status} ${await resp.text()}`;
        continue; // try the next model
      }

      const data = await resp.json();
      const text: string = data.choices?.[0]?.message?.content ?? "";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return NextResponse.json({
        model,
        probability: Math.max(0, Math.min(100, Number(parsed.probability))),
        reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning : [],
        decisionConclusion: parsed.decisionConclusion || "",
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      });
    } catch (err) {
      lastError = `${model}: ${(err as Error).message}`;
    }
  }

  return NextResponse.json({ error: `All Groq models failed. Last error: ${lastError}` }, { status: 502 });
}
