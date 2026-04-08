// src/middleware/validate.middleware.js
import { ApiError } from '../utils/ApiError.js'

/**
 * Factory that returns Express middleware validating req.body against a Zod schema.
 * Throws ApiError(400) with formatted messages on failure.
 */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    const messages = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ')
    return next(new ApiError(400, `Validation error — ${messages}`))
  }
  req.body = result.data
  next()
}
