// src/controllers/project.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import * as projectService from '../services/project.service.js';
import * as forgeService from '../services/forge.service.js';

export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getAllProjects(req.user.id);
  res.status(200).json({ success: true, data: { projects } });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Project name is required' });
  }
  const project = await projectService.createProject(req.user.id, { name });
  res.status(201).json({ success: true, data: { project } });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { project } });
});

export const softDeleteProject = asyncHandler(async (req, res) => {
  await projectService.softDeleteProject(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: 'Project deleted successfully' });
});

export const getProjectIterations = asyncHandler(async (req, res) => {
  const iterations = await projectService.getProjectIterations(req.user.id, req.params.id);
  res.status(200).json(iterations);   // Return raw array (important for React Query)
});

export const reiterateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { textinput, voiceTranscript, imageBase64, iterationType } = req.body;

  let feedback = textinput || '';

  if (voiceTranscript) {
    feedback = feedback ? `${feedback}\n\n[Voice]: ${voiceTranscript}` : voiceTranscript;
  }

  if (!feedback.trim()) {
    feedback = `General refinement requested for iteration type: ${iterationType || 'general'}`;
  }

  const result = await forgeService.startGeneration({
    userId: req.user.id,
    projectId: id,
    textInput: feedback,
    voiceTranscript: voiceTranscript || undefined,
    imageBase64: imageBase64 || undefined,
  });

  res.status(201).json({
    success: true,
    data: { jobId: result.jobId, projectId: result.projectId, iterationId: result.iterationId },
  });
});