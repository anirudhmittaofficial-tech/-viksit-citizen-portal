import fs from 'fs';

export const verifyImage = async (filePath, mimeType) => {
  const apiKey = process.env.HIVE_API_KEY;
  const aiThreshold = parseFloat(process.env.AI_GENERATED_THRESHOLD || '0.90');
  const deepfakeThreshold = parseFloat(process.env.DEEPFAKE_THRESHOLD || '0.90');

  // If API key is missing, fail safely by throwing an error 
  // as per strict verification requirements.
  if (!apiKey) {
    console.error('HIVE_API_KEY not configured. Failing verification securely.');
    throw new Error('Image verification is temporarily unavailable (Missing API Key). Please try again.');
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');
    const mediaUrlVal = `data:${mimeType};base64,${base64Data}`;
    
    // We will try multiple request strategies, starting with the V3 API (JSON/Base64) 
    // and falling back to V2/V1 (multipart) to handle different Hive account configurations.
    const strategies = [
      // Strategy 1: V3 API JSON Payload with Base64-encoded media
      { 
        url: 'https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection', 
        auth: `Bearer ${apiKey}`,
        isJson: true,
        body: {
          input: [{ media_url: mediaUrlVal }],
          processing_mode: 'sync_with_fallback'
        }
      },
      // Strategy 2: api.hivemoderation.com v2 Multi-Model with 'media' (multipart)
      { 
        url: 'https://api.hivemoderation.com/api/v2/task/sync', 
        auth: `token ${apiKey}`,
        isJson: false,
        paramName: 'media',
        fields: { models: JSON.stringify(['ai_generated_media', 'deepfake']) }
      },
      // Strategy 3: api.hivemoderation.com v2 Multi-Model with 'image' (multipart)
      { 
        url: 'https://api.hivemoderation.com/api/v2/task/sync', 
        auth: `token ${apiKey}`,
        isJson: false,
        paramName: 'image',
        fields: { models: JSON.stringify(['ai_generated_media', 'deepfake']) }
      },
      // Strategy 4: api.thehive.ai v2 Multi-Model with 'media' (multipart)
      { 
        url: 'https://api.thehive.ai/api/v2/task/sync', 
        auth: `token ${apiKey}`,
        isJson: false,
        paramName: 'media',
        fields: { models: JSON.stringify(['ai_generated_media', 'deepfake']) }
      }
    ];

    let lastResponse = null;
    let successResponse = null;

    for (const strategy of strategies) {
      try {
        console.log(`[Hive AI] Attempting verification using endpoint: ${strategy.url} with auth scheme: ${strategy.auth.split(' ')[0]}`);

        let response;
        if (strategy.isJson) {
          response = await fetch(strategy.url, {
            method: 'POST',
            headers: {
              'Authorization': strategy.auth,
              'accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(strategy.body)
          });
        } else {
          const blob = new Blob([fileBuffer], { type: mimeType });
          const formData = new FormData();
          formData.append(strategy.paramName, blob, filePath.split('/').pop() || 'upload.jpg');

          // Add additional form fields
          for (const [key, val] of Object.entries(strategy.fields)) {
            formData.append(key, val);
          }

          response = await fetch(strategy.url, {
            method: 'POST',
            headers: {
              'Authorization': strategy.auth,
              'accept': 'application/json'
            },
            body: formData
          });
        }

        lastResponse = response;

        if (response.ok) {
          successResponse = response;
          break; // Strategy succeeded!
        } else {
          const errText = await response.text();
          console.warn(`[Hive AI] Strategy failed with status ${response.status}: ${errText}`);
        }
      } catch (err) {
        console.warn(`[Hive AI] Network error for strategy: ${err.message}`);
      }
    }

    if (!successResponse) {
      const status = lastResponse ? lastResponse.status : 'Network Error';
      const statusText = lastResponse ? lastResponse.statusText : 'No response';
      console.error(`[Hive AI] All verification strategies failed. Last status: ${status} (${statusText})`);
      throw new Error(`Hive API error: ${status}`);
    }

    const data = await successResponse.json();
    
    // Parse response based on Hive documentation
    let aiGeneratedScore = 0;
    let deepfakeScore = 0;
    let source = 'unknown';

    // The Hive API returns responses wrapped in an output array inside a status array
    const responseData = data.status?.[0]?.response || data.response || data;
    const outputList = responseData.output || [];

    for (const outputItem of outputList) {
      if (outputItem.classes) {
        // Detect AI generated score
        const aiClass = outputItem.classes.find(c => c.class === 'ai_generated' || c.class === 'yes_ai_generated');
        const notAiClass = outputItem.classes.find(c => c.class === 'not_ai_generated' || c.class === 'no_ai_generated');
        if (aiClass) {
          aiGeneratedScore = aiClass.score;
        } else if (notAiClass) {
          aiGeneratedScore = 1 - notAiClass.score;
        }

        // Detect Deepfake score
        const deepfakeClass = outputItem.classes.find(c => c.class === 'deepfake' || c.class === 'yes_deepfake');
        if (deepfakeClass) {
          deepfakeScore = deepfakeClass.score;
        }

        // Source classification if present
        const sourceClass = outputItem.classes.find(c => c.class !== 'ai_generated' && c.class !== 'not_ai_generated' && c.class !== 'deepfake' && c.score > 0.5);
        if (sourceClass) {
          source = sourceClass.class;
        }
      }
    }

    if (aiGeneratedScore >= aiThreshold) {
      return {
        status: 'rejected',
        code: 'AI_GENERATED_IMAGE',
        message: 'This image appears to be AI-generated. Please upload an original photograph of the reported issue.',
        aiGeneratedScore,
        deepfakeScore,
        source
      };
    }

    if (deepfakeScore >= deepfakeThreshold) {
      return {
        status: 'rejected',
        code: 'DEEPFAKE_IMAGE',
        message: 'This image could not be verified as authentic. Please upload an original photograph.',
        aiGeneratedScore,
        deepfakeScore,
        source
      };
    }

    return {
      status: 'verified',
      aiGeneratedScore,
      deepfakeScore,
      source,
      message: 'Image verification completed.'
    };

  } catch (error) {
    // Only log the safe error message, do NOT log the full request object which might contain the API key
    console.error('Hive AI Detection Error:', error.message);
    
    // If it's a specific HTTP error from Hive, pass it along safely
    if (error.message.startsWith('Hive API error:')) {
      throw new Error(`Image verification failed (${error.message}). Please check your service configuration.`);
    }
    
    // Fallback generic error
    throw new Error('Image verification is temporarily unavailable. Please try again.');
  }
};
