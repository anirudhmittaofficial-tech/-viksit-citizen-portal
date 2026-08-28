import fs from 'fs';
import path from 'path';

const apiKey = 'H322azXZRkUzIzju+6KbZQ==';
const filePath = 'c:/Users/neela/OneDrive/Desktop/viksit project/backend/uploads/file-1787593706232.png';
const mimeType = 'image/jpeg';

async function run() {
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  const mediaUrlVal = `data:${mimeType};base64,${base64Data}`;

  const strategies = [
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

  for (const strategy of strategies) {
    try {
      console.log(`\n--- Running Strategy: ${strategy.name} ---`);
      
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

      console.log('Status:', response.status);
      console.log('Body:', await response.text());
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}

run();
