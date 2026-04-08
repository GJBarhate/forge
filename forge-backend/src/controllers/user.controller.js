// src/controllers/user.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import * as userService from '../services/user.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await userService.getProfile(userId);

  res.status(200).json({
    success: true,
    user,
  });
});

export const updateGeminiKey = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { geminiApiKey } = req.body;

  const user = await userService.updateGeminiKey(userId, geminiApiKey);

  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, bio } = req.body;

  const user = await userService.updateProfile(userId, { name, bio });

  res.status(200).json({
    success: true,
    user,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  await userService.changePassword(userId, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    data: { message: 'Password changed successfully' },
  });
});
