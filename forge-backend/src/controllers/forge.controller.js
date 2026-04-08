// src/controllers/forge.controller.js
import { asyncHandler } from '../utils/asyncHandler.js'
import * as forgeService from '../services/forge.service.js'

export const generate = asyncHandler(async (req, res) => {
  const {
    voiceTranscript,
    imageBase64,
    imageType,
    textInput,
    competitorUrl,
    projectId,
    userGeminiApiKey,          // ← NEW: accept user key from frontend
  } = req.body

  const result = await forgeService.startGeneration({
    userId: req.user.id,
    voiceTranscript,
    imageBase64,
    imageType,
    textInput,
    competitorUrl,
    projectId,
    userGeminiApiKey,          // ← NEW: pass it to service
  })

  res.status(202).json({ success: true, data: result })
})

export const fork = asyncHandler(async (req, res) => {
  const { iterationId, textInput, voiceTranscript } = req.body

  const result = await forgeService.forkIteration({
    userId: req.user.id,
    parentIterationId: iterationId,
    textInput,
    voiceTranscript,
  })

  res.status(202).json({ success: true, data: result })
})

export const getJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params
  const status = await forgeService.getJobStatus(jobId)
  res.status(200).json({ success: true, data: status })
})