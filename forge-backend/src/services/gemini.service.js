// src/services/gemini.service.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiModel } from '../config/gemini.js';
import { ResponseParser } from '../utils/ResponseParser.js';
import { buildBlueprintPrompt } from '../utils/promptBuilder.js';
import { ApiError } from '../utils/ApiError.js';

export async function generateBlueprint({
  voiceTranscript,
  imageBase64,
  imageType,
  textInput,
  competitorAnalysis,
  githubRepos,                 // ← NEW: GitHub repos for inspiration
  userGeminiApiKey,            // ← User's personal key (highest priority)
}) {
  const fullPrompt = buildBlueprintPrompt({
    voiceTranscript,
    textInput,
    competitorAnalysis,
    githubRepos,                // ← NEW: pass to prompt builder
  });

  const parts = [{ text: fullPrompt }];

  if (imageBase64 && imageType) {
    parts.push({ inlineData: { mimeType: imageType, data: imageBase64 } });
  }

  let rawText;
  let usedKeyType = 'server';
  let selectedModel = geminiModel;

  try {
    if (userGeminiApiKey && userGeminiApiKey.trim()) {
      // ── Use USER'S personal key first (highest priority) ──
      usedKeyType = 'user';
      const genAI = new GoogleGenerativeAI(userGeminiApiKey.trim());
      selectedModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
    }

    const result = await selectedModel.generateContent({
      contents: [{ role: 'user', parts }],
    });
    rawText = result.response.text();

    const msg = 'Gemini raw response received with ' + usedKeyType + ' key (first 300 chars)';
    console.log(msg, rawText.substring(0, 300));
  } catch (err) {
    console.error('Gemini API error:', err.message);

    if (err.message.includes('429') || err.message.includes('quota')) {
      if (usedKeyType === 'user') {
        throw new ApiError(429, 'Your personal Gemini API key has exceeded quota. Remove it or wait 24h.');
      } else {
        throw new ApiError(429, 'All server Gemini keys exceeded quota. Try adding your own key.');
      }
    }

    throw new ApiError(503, 'Gemini API error: ' + err.message);
  }

  try {
    const blueprint = await ResponseParser.parse(rawText, selectedModel);
    return blueprint;
  } catch (err) {
    console.error('Final parse failed after retry');
    throw new ApiError(422, 'Failed to generate valid blueprint. Please try again.');
  }
}
