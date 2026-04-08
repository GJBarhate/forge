// src/utils/hashToken.js
import crypto from 'crypto'

/**
 * SHA-256 hash a token string (for refresh token storage)
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
