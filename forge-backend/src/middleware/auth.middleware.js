// src/middleware/auth.middleware.js
import { prisma } from '../config/database.js'
import { verifyAccessToken } from '../utils/jwtUtils.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Unauthorized — missing token')
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyAccessToken(token)

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, name: true, createdAt: true },
  })

  if (!user) {
    throw new ApiError(401, 'Unauthorized — user not found')
  }

  req.user = user
  next()
})
