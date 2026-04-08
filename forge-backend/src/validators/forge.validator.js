// src/validators/forge.validator.js
import { z } from 'zod'

export const generateSchema = z
  .object({
    voiceTranscript: z.string().min(1).optional(),
    imageBase64: z.string().optional(),
    imageType: z.string().optional(),
    textInput: z.string().min(1).optional(),
    competitorUrl: z.string().url().optional(),
    projectId: z.string().optional(),
    userGeminiApiKey: z.string().optional(),
  })
  .refine(
    (data) => data.voiceTranscript || data.imageBase64 || data.textInput,
    { message: 'At least one of voiceTranscript, imageBase64, or textInput is required' }
  )

export const forkSchema = z.object({
  iterationId: z.string().min(1, 'iterationId is required'),
  textInput: z.string().min(1).optional(),
  voiceTranscript: z.string().min(1).optional(),
})
