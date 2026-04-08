// src/services/audio.service.js
import { geminiModel } from '../config/gemini.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Transcribe an audio buffer using Gemini's multimodal capabilities.
 * @param {Buffer} audioBuffer - The audio file buffer
 * @param {string} mimeType - e.g. 'audio/webm', 'audio/mp4', 'audio/mpeg'
 * @returns {string} transcript text
 */
export async function transcribeAudio(audioBuffer, mimeType) {
  const base64Audio = audioBuffer.toString('base64')

  const parts = [
    {
      text: 'Transcribe the following audio recording accurately. Return ONLY the transcription text — no timestamps, no speaker labels, no formatting. Just the plain text of what was said.',
    },
    {
      inlineData: {
        mimeType,
        data: base64Audio,
      },
    },
  ]

  let transcript
  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts }],
    })
    transcript = result.response.text().trim()
  } catch (err) {
    throw new ApiError(503, `Audio transcription failed: ${err.message}`)
  }

  if (!transcript) {
    throw new ApiError(422, 'Transcription returned empty result')
  }

  return transcript
}
