// src/services/competitor.service.js
import fetch from 'node-fetch'
import { geminiModel } from '../config/gemini.js'
import { ResponseParser } from '../utils/ResponseParser.js'
import { buildCompetitorPrompt } from '../utils/promptBuilder.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Fetch a competitor URL, extract text, and analyze with Gemini.
 * Returns: { features, pricing, audience, patterns, gaps }
 */
export async function analyzeCompetitor(url) {
  // Fetch the competitor page
  let pageText
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ForgeBot/1.0)',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new ApiError(422, `Failed to fetch competitor URL: HTTP ${response.status}`)
    }

    const html = await response.text()
    pageText = stripHtml(html)
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err.name === 'AbortError') {
      throw new ApiError(408, 'Competitor URL fetch timed out (10s)')
    }
    throw new ApiError(422, `Could not fetch competitor URL: ${err.message}`)
  }

  // Truncate to first 8000 chars to fit context window
  const truncated = pageText.substring(0, 8000)

  // Send to Gemini for analysis
  const prompt = buildCompetitorPrompt(truncated)

  let rawText
  try {
    const result = await geminiModel.generateContent(prompt)
    rawText = result.response.text()
  } catch (err) {
    throw new ApiError(503, `Gemini API error during competitor analysis: ${err.message}`)
  }

  return ResponseParser.parseCompetitor(rawText)
}

/**
 * Strip HTML tags and collapse whitespace.
 * No DOM parser needed — regex is sufficient for text extraction.
 */
function stripHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
