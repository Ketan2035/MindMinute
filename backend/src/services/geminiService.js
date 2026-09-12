import { GoogleGenAI } from '@google/genai';

// Safely parse JSON from Gemini — strips markdown code fences if present
const parseGeminiJSON = (rawText) => {
  let text = (rawText || '').trim();
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(text);
};

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

// Models to try in order — fallback chain based on API key availability
const MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash'
];

// Retry a generate call across the model fallback chain
const generateWithFallback = async (buildContents, config = {}) => {
  let lastError;
  for (const model of MODELS) {
    try {
      const ai = getClient();
      console.log(`Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: buildContents(),
        config: { responseMimeType: 'application/json', ...config },
      });
      console.log(`✅ ${model} responded OK`);
      return response.text;
    } catch (err) {
      const msg = err?.message || '';
      const status = (() => { try { return JSON.parse(msg)?.error?.code; } catch(_) { return null; } })();
      console.warn(`❌ ${model} failed (${status || 'unknown'}):`, msg.slice(0, 120));
      lastError = err;
      // Only continue to next model on quota (429) or not-found (404) errors
      if (status !== 429 && status !== 404 && status !== 503) break;
    }
  }
  throw lastError;
};

const ANALYSIS_SCHEMA = `{
  "transcript": "the exact speech text provided",
  "grammarScore": 75,
  "fluencyScore": 70,
  "criticalThinkingScore": 65,
  "overallScore": 70,
  "fillerWords": ["um", "uh"],
  "grammarFeedback": [
    { "type": "positive", "text": "Good use of past tense" },
    { "type": "improvement", "text": "Watch subject-verb agreement" }
  ],
  "fluencyFeedback": [
    { "type": "positive", "text": "Ideas flowed logically" },
    { "type": "improvement", "text": "Avoid run-on sentences" }
  ],
  "criticalThinkingFeedback": [
    { "type": "positive", "text": "Strong central argument" },
    { "type": "improvement", "text": "Consider the opposing viewpoint" }
  ],
  "thoughtAnalysis": {
    "userCoreArgument": "Summary of main argument",
    "missingCounterargument": "What perspective was missed"
  },
  "proRewrite": {
    "title": "Inspiring Title for the Speech",
    "speechText": "A 45-60 second polished TED-style version of the speaker's core message using elevated vocabulary and persuasive rhetorical framing.",
    "keyUpgrades": [
      { "technique": "Rhetorical Hook", "explanation": "Opened with a thought-provoking question instead of a generic intro." },
      { "technique": "Elevated Vocabulary", "explanation": "Replaced everyday words with high-impact precision terms." },
      { "technique": "Rule of Three", "explanation": "Structured key arguments into three balanced clauses for memorable impact." }
    ],
    "deliveryTips": [
      "Pause for 2 full seconds after the opening hook to let it resonate.",
      "Vary your vocal pitch when transitioning to the final takeaway."
    ]
  }
}`;

// @desc  Analyze a video/audio buffer via Gemini multimodal
export const analyzeVideoWithGemini = async (videoBuffer, topic, mimeType = 'video/webm') => {
  const prompt = `You are a world-class executive speaking coach, TED-talk speechwriter, and critical thinking evaluator.
Analyze this speech recording. The speaker's topic is: "${topic.title}".

1. Transcribe the speech accurately.
2. Rigorously score grammar, fluency, and critical thinking (0-100).
3. Identify strengths, areas for improvement, and filler words.
4. Craft a "Pro Speaker Rewrite" (TED-talk / Executive style) delivering the speaker's exact core thesis in 45-60 seconds with captivating rhetoric, punchy vocabulary, and delivery tips.

Return ONLY a valid JSON object — no markdown, no code fences, just raw JSON — matching this schema:
${ANALYSIS_SCHEMA}`;

  try {
    console.log(`Sending ${mimeType} to Gemini...`);
    const rawText = await generateWithFallback(() => ([
      {
        parts: [
          { inlineData: { mimeType, data: videoBuffer.toString('base64') } },
          { text: prompt },
        ],
      },
    ]));

    console.log('Video analysis response (first 150 chars):', rawText?.slice(0, 150));
    return parseGeminiJSON(rawText);
  } catch (error) {
    console.error('Gemini Video Analysis Error:', error?.message?.slice(0, 200) || error);
    throw error;
  }
};

// @desc  Analyze a text transcript via Gemini
export const analyzeTextWithGemini = async (transcriptText, topic) => {
  const prompt = `You are a world-class executive speaking coach, TED-talk speechwriter, and critical thinking evaluator.
The speaker's topic is: "${topic.title}".

Their transcript:
"${transcriptText}"

1. Rigorously evaluate their speech based on this text. Base fluency on sentence structure, flow, and coherence.
2. Provide precise feedback on grammar, fluency, critical thinking, and filler words.
3. Craft a "Pro Speaker Rewrite" (TED-talk / Executive style) delivering the speaker's exact core thesis in 45-60 seconds with captivating rhetoric, elevated vocabulary, and vocal delivery tips.

Return ONLY a valid JSON object — no markdown, no code fences, just raw JSON — matching this schema:
${ANALYSIS_SCHEMA}`;

  try {
    console.log('Sending transcript to Gemini...');
    const rawText = await generateWithFallback(() => ([
      { parts: [{ text: prompt }] },
    ]));

    console.log('Text analysis response (first 150 chars):', rawText?.slice(0, 150));
    return parseGeminiJSON(rawText);
  } catch (error) {
    console.error('Gemini Text Analysis Error:', error?.message?.slice(0, 200) || error);
    throw error;
  }
};

// @desc  Generate a Pro Speaker Rewrite on-demand for existing transcript
export const generateProRewriteOnly = async (transcriptText, topic) => {
  const schema = `{
    "title": "Title of the speech",
    "speechText": "A 45-60 second refined TED-style delivery of the user's argument...",
    "keyUpgrades": [
      { "technique": "Technique Name", "explanation": "Why this upgrade improves the delivery" }
    ],
    "deliveryTips": [
      "Vocal tip 1",
      "Vocal tip 2"
    ]
  }`;

  const prompt = `You are a world-class executive speechwriter and TED-talk coach.
The topic is: "${topic.title}".
The user's original speech transcript is:
"${transcriptText}"

Reframe and rewrite the user's core message as a powerful, inspiring, 45-60 second TED-style delivery.
Include key rhetorical upgrades applied and 2-3 specific vocal delivery tips.
Return ONLY valid raw JSON matching this schema:
${schema}`;

  try {
    const rawText = await generateWithFallback(() => ([
      { parts: [{ text: prompt }] },
    ]));
    return parseGeminiJSON(rawText);
  } catch (error) {
    console.error('Gemini Pro Rewrite Error:', error?.message?.slice(0, 200) || error);
    throw error;
  }
};
