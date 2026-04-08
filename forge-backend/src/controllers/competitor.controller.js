// src/controllers/competitor.controller.js
import { asyncHandler } from '../utils/asyncHandler.js'
import { analyzeCompetitor } from '../services/competitor.service.js'

/**
 * POST /api/v1/competitor/analyze
 * Fetch a competitor URL and return AI-extracted insights.
 */
export const analyze = asyncHandler(async (req, res) => {
  const { url } = req.body
  const analysis = await analyzeCompetitor(url)

  res.status(200).json({
    success: true,
    data: { analysis },
  })
})
