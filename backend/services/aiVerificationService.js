import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Helper to convert local file to inline generative part
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

export const analyzeFile = async (filePath, mimeType) => {
  if (!genAI) {
    return {
      status: 'skipped',
      message: 'GEMINI_API_KEY not configured. Skipping AI verification.',
      confidence: 0
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    if (mimeType.startsWith('image/')) {
      const prompt = "Analyze this image. Is it a genuine photograph or does it appear to be fake, AI-generated, or digitally altered? Provide a brief explanation and a conclusion of either 'Genuine' or 'Potential Fake'.";
      const imagePart = fileToGenerativePart(filePath, mimeType);
      
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      const isFake = text.toLowerCase().includes('potential fake') || text.toLowerCase().includes('ai-generated') || text.toLowerCase().includes('altered');
      
      return {
        status: isFake ? 'potential_fake' : 'verified',
        message: text,
        confidence: 0.85
      };
      
    } else if (mimeType === 'application/pdf' || mimeType.includes('word')) {
      let extractedText = '';
      
      if (mimeType === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } else {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
      }
      
      if (!extractedText.trim()) {
        return { status: 'unknown', message: 'Could not extract text from document.' };
      }
      
      // Limit text to avoid token limits
      const textSample = extractedText.substring(0, 15000);
      
      const prompt = `Analyze the following text extracted from a document. Does this document appear to be a genuine complaint/report, or does it seem fake, spam, or fraudulent? Briefly explain why, and conclude with 'Genuine' or 'Potential Fake'.\n\nDocument Text:\n${textSample}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const isFake = text.toLowerCase().includes('potential fake') || text.toLowerCase().includes('fraudulent');
      
      return {
        status: isFake ? 'potential_fake' : 'verified',
        message: text,
        confidence: 0.8
      };
    }
    
    return { status: 'unknown', message: 'Unsupported file type for AI verification.' };
    
  } catch (error) {
    console.error('AI Verification Error:', error);
    return {
      status: 'error',
      message: 'Failed to verify document due to an error.',
      error: error.message
    };
  }
};
