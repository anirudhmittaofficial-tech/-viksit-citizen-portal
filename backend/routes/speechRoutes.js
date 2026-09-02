import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// @desc    Transcribe recorded audio via Gemini (Backend Speech-to-Text Fallback)
// @route   POST /api/speech/transcribe
// @access  Public
router.post('/transcribe', express.json({ limit: '25mb' }), async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', language = 'en-IN' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({
        success: false,
        message: 'No audio data received'
      });
    }

    if (!genAI) {
      return res.status(503).json({
        success: false,
        message: 'Speech-to-Text service is not configured (GEMINI_API_KEY is missing).'
      });
    }

    const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const langName = language === 'hi-IN' ? 'Hindi' : language === 'te-IN' ? 'Telugu' : 'English (India)';
    const prompt = `You are a speech-to-text transcriber for a municipal civic grievance portal. Transcribe the following speech exactly as spoken by the citizen in ${langName}. 
CRITICAL RULES:
1. Do NOT translate. Return the exact spoken words in ${language === 'hi-IN' ? 'Hindi (Devanagari script)' : language === 'te-IN' ? 'Telugu (Telugu script or exact phrasing)' : 'English'}.
2. Do NOT add preamble, markdown tags, quotes, or explanations. Return ONLY the transcribed text.
3. If no intelligible speech is present or silence, return an empty string.`;

    const audioPart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType.split(';')[0] || 'audio/webm'
      }
    };

    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    const transcript = response.text().trim();

    res.status(200).json({
      success: true,
      transcript
    });
  } catch (err) {
    console.error('Backend Speech-to-Text error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to transcribe audio on server. Please try again.'
    });
  }
});

export default router;
