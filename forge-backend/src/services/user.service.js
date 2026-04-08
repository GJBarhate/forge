// src/services/user.service.js
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

export async function getProfile(userId) {
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        geminiApiKey: true,
        creditsBalance: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw err;
  }
}

export async function updateGeminiKey(userId, geminiApiKey) {
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  const trimmedKey = geminiApiKey ? geminiApiKey.trim() : null;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        geminiApiKey: trimmedKey,
      },
      select: {
        id: true,
        email: true,
        name: true,
        geminiApiKey: true,
        creditsBalance: true,
        createdAt: true,
      },
    });

    return user;
  } catch (err) {
    if (err.code === 'P2025') {
      throw new ApiError(404, 'User not found');
    }
    throw err;
  }
}

export async function updateProfile(userId, { name, bio }) {
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  if (name && !name.trim()) {
    throw new ApiError(400, 'Name cannot be empty');
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ? name.trim() : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        geminiApiKey: true,
        creditsBalance: true,
        createdAt: true,
      },
    });

    return user;
  } catch (err) {
    if (err.code === 'P2025') {
      throw new ApiError(404, 'User not found');
    }
    throw err;
  }
}

export async function changePassword(userId, currentPassword, newPassword) {
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Both current and new passwords are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return true;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw err;
  }
}
