// src/controllers/audio.controller.js
import { asyncHandler } from '../utils/asyncHandler.js'
import { transcribeAudio } from '../services/audio.service.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * POST /api/v1/audio/transcribe
 * Accepts a multipart audio file, returns transcript text.
 */
export const transcribe = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Audio file is required (field name: "audio")')
  }

  const transcript = await transcribeAudio(req.file.buffer, req.file.mimetype)

  res.status(200).json({
    success: true,
    data: {
      transcript,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    },
  })
})
