import fs from 'fs';
import path from 'path';

/**
 * Verifies an image file with Hive's V3 AI-Generated Image & Deepfake Detection API.
 * Uses Base64-encoded media in a JSON payload or falls back to multipart form-data.
 * 
 * @param {string} filePath - Absolute path to the file on local disk
 * @returns {Promise<object>} The parsed verification details
 */
export const verifyImageWithHive = async (filePath) => {
  const apiKey = process.env.HIVE_API_KEY;
  const threshold = parseFloat(process.env.HIVE_AI_THRESHOLD || '0.90');

  // 1. Validate HIVE_API_KEY
  if (!apiKey) {
    console.error('HIVE_API_KEY is not configured in backend environment variables.');
    const err = new Error('Image verification service is not configured (HIVE_API_KEY is missing). Please contact the administrator.');
    err.status = 500;
    throw err;
  }

  // 2. Validate file existence
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    const err = new Error('File not found for verification.');
    err.status = 400;
    throw err;
  }

  // 3. Determine MIME type
  const ext = path.extname(filePath).toLowerCase();
  let mimeType = 'image/jpeg';
  if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.webp') mimeType = 'image/webp';
  else if (ext === '.gif') mimeType = 'image/gif';

  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  const mediaUrlVal = `data:${mimeType};base64,${base64Data}`;

  // We will try multiple V3 strategies sequentially (Multipart, JSON Base64)
  // to ensure maximum compatibility with the user's API Key scope.
  const strategies = [
    // Strategy 1: V3 Multipart upload with 'media' parameter (Standard binary method)
    {
      name: 'V3 Multipart (media)',
      url: 'https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection',
      auth: `Bearer ${apiKey}`,
      isJson: false,
      paramName: 'media',
      headers: {
        'accept': 'application/json'
      }
    },
    // Strategy 2: V3 JSON payload with raw Base64 data (Hive V3 standard)
    {
      name: 'V3 JSON Raw Base64',
      url: 'https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection',
      auth: `Bearer ${apiKey}`,
      isJson: true,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: {
        input: [{ media_url: base64Data }],
        processing_mode: 'sync_with_fallback'
      }
    },
    // Strategy 3: V3 JSON payload with formatted Data URI Base64
    {
      name: 'V3 JSON Data-URI Base64',
      url: 'https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection',
      auth: `Bearer ${apiKey}`,
      isJson: true,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: {
        input: [{ media_url: mediaUrlVal }],
        processing_mode: 'sync_with_fallback'
      }
    },
    // Strategy 4: V3 Multipart upload with 'image' parameter
    {
      name: 'V3 Multipart (image)',
      url: 'https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection',
      auth: `Bearer ${apiKey}`,
      isJson: false,
      paramName: 'image',
      headers: {
        'accept': 'application/json'
      }
    }
  ];

  let lastResponse = null;
  let successResponse = null;
  let successData = null;

  for (const strategy of strategies) {
    try {
      console.log(`[Hive AI] Attempting V3 strategy: ${strategy.name}`);
      
      let response;
      if (strategy.isJson) {
        response = await fetch(strategy.url, {
          method: 'POST',
          headers: {
            ...strategy.headers,
            'Authorization': strategy.auth
          },
          body: JSON.stringify(strategy.body)
        });
      } else {
        const blob = new Blob([fileBuffer], { type: mimeType });
        const formData = new FormData();
        formData.append(strategy.paramName, blob, path.basename(filePath));

        response = await fetch(strategy.url, {
          method: 'POST',
          headers: {
            ...strategy.headers,
            'Authorization': strategy.auth
          },
          body: formData
        });
      }

      lastResponse = response;

      if (response.ok) {
        successData = await response.json();
        successResponse = response;
        console.log(`[Hive AI] Strategy ${strategy.name} succeeded!`);
        break; // Strategy succeeded, stop loop
      } else {
        const responseText = await response.text();
        console.warn(`[Hive AI] Strategy ${strategy.name} returned HTTP ${response.status}: ${responseText}`);
      }
    } catch (err) {
      console.error(`[Hive AI] Strategy ${strategy.name} failed with error:`, err.message);
    }
  }

  // If all strategies failed, throw mapped error
  if (!successResponse) {
    const status = lastResponse ? lastResponse.status : 503;
    const err = new Error('Hive API Error');
    
    if (status === 401 || status === 403) {
      err.status = 502;
      err.message = 'Image verification service authentication failed.';
    } else if (status === 429) {
      err.status = 503;
      err.message = 'Image verification service is temporarily busy. Please try again.';
    } else if (status >= 500) {
      err.status = 503;
      err.message = 'Image verification service is temporarily unavailable.';
    } else {
      err.status = 503;
      err.message = 'Image verification is temporarily unavailable. Please try again.';
    }
    throw err;
  }

  // 7. Parse response
  let aiGeneratedScore = 0;
  let notAiGeneratedScore = 0;
  let deepfakeScore = 0;
  let source = 'unknown';

  let outputList = [];
  if (successData.output) {
    outputList = successData.output;
  } else if (successData.status?.[0]?.response?.output) {
    outputList = successData.status[0].response.output;
  }

  for (const outputItem of outputList) {
    if (outputItem.classes) {
      // Find ai_generated & not_ai_generated
      const aiClass = outputItem.classes.find(c => c.class === 'ai_generated');
      const notAiClass = outputItem.classes.find(c => c.class === 'not_ai_generated');
      const deepfakeClass = outputItem.classes.find(c => c.class === 'deepfake');

      if (aiClass) aiGeneratedScore = aiClass.value !== undefined ? aiClass.value : (aiClass.score || 0);
      if (notAiClass) notAiGeneratedScore = notAiClass.value !== undefined ? notAiClass.value : (notAiClass.score || 0);
      if (deepfakeClass) deepfakeScore = deepfakeClass.value !== undefined ? deepfakeClass.value : (deepfakeClass.score || 0);

      // Try to identify source generator if score > 0.5
      const sourceClass = outputItem.classes.find(c => {
        const val = c.value !== undefined ? c.value : (c.score || 0);
        return c.class !== 'ai_generated' && 
          c.class !== 'not_ai_generated' && 
          c.class !== 'deepfake' && 
          c.class !== 'inconclusive' && 
          c.class !== 'inconclusive_video' && 
          c.class !== 'none' && 
          val > 0.5;
      });
      if (sourceClass) {
        source = sourceClass.class;
      }
    }
  }

  const aiGenerated = aiGeneratedScore >= threshold;
  const deepfake = deepfakeScore >= threshold;
  const accepted = !aiGenerated && !deepfake;

  return {
    aiGenerated,
    aiGeneratedScore,
    notAiGeneratedScore,
    deepfake,
    deepfakeScore,
    source,
    accepted
  };
};
