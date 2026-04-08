// src/utils/ApiError.js
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
    Error.captureStackTrace(this, this.constructor)
  }
}
