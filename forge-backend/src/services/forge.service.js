// src/services/forge.service.js
import { prisma } from '../config/database.js';
import { forgeQueue } from '../queue/forge.queue.js';
import { verifyProjectOwnership } from './project.service.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Start a new generation (initial or iteration)
 */
export async function startGeneration({
  userId,
  projectId,
  textInput,
  voiceTranscript,
  imageBase64,
  imageType,
  competitorUrl,
  userGeminiApiKey,
}) {
  // FIXED: Allow textInput alone
  if (!textInput && !voiceTranscript && !imageBase64) {
    throw new ApiError(400, 'At least one input is required: voiceTranscript, imageBase64, or textInput');
  }

  let project;

  if (projectId) {
    project = await verifyProjectOwnership(userId, projectId);
  } else {
    const name = (textInput || voiceTranscript || 'New Project').substring(0, 60);
    project = await prisma.project.create({
      data: { userId, name, status: 'PROCESSING' },
    });
  }

  const iteration = await prisma.iteration.create({
    data: {
      projectId: project.id,
      voiceInput: voiceTranscript || null,
      textInput: textInput || null,
      status: 'PROCESSING',
    },
  });

  const job = await forgeQueue.add(
    'generate',
    {
      iterationId: iteration.id,
      projectId: project.id,
      userId,
      textInput,
      voiceTranscript,
      imageBase64,
      imageType,
      competitorUrl,
      userGeminiApiKey,
    },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
      timeout: 120000,
    }
  );

  // Store the jobId (numeric) in the iteration for later retrieval
  await prisma.iteration.update({
    where: { id: iteration.id },
    data: { jobId: parseInt(job.id, 10) },
  });

  return {
    jobId: job.id,
    iterationId: iteration.id,
    projectId: project.id,
    data: {
      jobId: job.id,
      iterationId: iteration.id,
      projectId: project.id,
    }
  };
}