// src/config/gemini.js

import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from './env.js'

// FIXED: multi-key rotation now working — properly loads GEMINI_API_KEYS
const apiKeys = (() => {
  // Try GEMINI_API_KEYS (comma-separated) first, fall back to single GEMINI_API_KEY
  const keysString = config.GEMINI_API_KEYS || config.GEMINI_API_KEY
  if (!keysString) {
    console.warn('⚠️  No Gemini API keys found in .env')
    return []
  }
  
  const keys = keysString
    .split(',')
    .map(k => k.trim())
    .filter(Boolean)
  
  if (keys.length === 0) {
    console.warn('⚠️  Gemini API keys array is empty')
  } else {
    console.log(`✅ Loaded ${keys.length} Gemini API key(s) for rotation`)
  }
  
  return keys
})()

let currentKeyIndex = 0

// FIXED: Tracks which keys have quota exceeded to avoid retrying them
const exhaustedKeys = new Set()

function getNextClient() {
  if (apiKeys.length === 0) throw new Error('No GEMINI_API_KEYS found in .env')
  
  // FIXED: Skip exhausted keys, rotate to next available key
  let attempts = 0
  while (attempts < apiKeys.length) {
    const key = apiKeys[currentKeyIndex]
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length
    
    if (!exhaustedKeys.has(currentKeyIndex - 1)) {
      return new GoogleGenerativeAI(key)
    }
    attempts++
  }
  
  throw new Error('All Gemini API keys exceeded daily quota')
}

export const geminiModel = {
  generateContent: async (params) => {
    let lastError
    let keysAttempted = 0

    // FIXED: Try each key in rotation until one succeeds
    while (keysAttempted < apiKeys.length) {
      try {
        const genAI = getNextClient()
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            temperature: 0.4,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        })
        const result = await model.generateContent(params)
        
        // Reset exhausted keys tracking on successful request
        if (exhaustedKeys.size > 0) {
          console.log(`🔄 [Gemini] Key rotation successful, exhausted keys reset`)
          exhaustedKeys.clear()
        }
        
        return result
      } catch (err) {
        lastError = err
        
        // FIXED: Detect 429/quota errors and mark key as exhausted
        if (err.message.includes('429') || err.message.includes('quota')) {
          const failedKeyIndex = (currentKeyIndex - 1 + apiKeys.length) % apiKeys.length
          exhaustedKeys.add(failedKeyIndex)
          
          console.warn(
            `⚠️  [Gemini] Key ${failedKeyIndex} quota exceeded. ` +
            `Switching to next key... (${apiKeys.length - exhaustedKeys.size} keys remaining)`
          )
          
          keysAttempted++
          // Don't throw yet — try next key
          continue
        }
        
        // For non-quota errors, throw immediately
        throw err
      }
    }

    // FIXED: All keys exhausted — throw error with clear message
    console.error(
      `❌ [Gemini] All ${apiKeys.length} keys exceeded daily quota. ` +
      `Please wait until tomorrow or upgrade to a paid plan.`
    )
    throw lastError || new Error('All Gemini API keys exceeded daily quota')
  },
}

export { getNextClient }
