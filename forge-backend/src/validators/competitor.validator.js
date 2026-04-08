// src/validators/competitor.validator.js
import { z } from 'zod'

export const competitorSchema = z.object({
  url: z.string().url('Must be a valid URL'),
})
