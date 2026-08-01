import { analyzeTextWithGemini } from './services/geminiService.js';
import dotenv from 'dotenv';
dotenv.config();

const topic = { title: 'The Impact of Artificial Intelligence' };
const transcript = 'I think artificial intelligence is changing our world in many ways. It helps us automate tasks and make better decisions.';

console.log('Testing Gemini analysis with fallback chain...\n');
try {
  const result = await analyzeTextWithGemini(transcript, topic);
  console.log('\n✅ Analysis succeeded!');
  console.log('Overall Score:', result.overallScore);
  console.log('Grammar Score:', result.grammarScore);
  console.log('Fluency Score:', result.fluencyScore);
  console.log('Transcript:', result.transcript?.slice(0, 80));
} catch(e) {
  console.error('\n❌ All models failed:', e?.message?.slice(0, 200));
}
