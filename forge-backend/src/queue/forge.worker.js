// src/queue/forge.worker.js
import { forgeQueue } from './forge.queue.js'
import { prisma } from '../config/database.js'
import { generateBlueprint } from '../services/gemini.service.js'
import { analyzeCompetitor } from '../services/competitor.service.js'
import { searchGitHubRepos } from '../services/github.service.js'
import * as paymentService from '../services/payment.service.js'
import { ApiError } from '../utils/ApiError.js'

// io is set after socket manager initialises — see server.js
let _io = null
export function setSocketIO(io) {
  _io = io
}

function emit(jobId, event, data) {
  if (_io) {
    const roomName = `forge-job:${jobId}`;
    const room = _io.sockets.adapter.rooms.get(roomName);
    const roomSize = room?.size || 0;
    console.log(`\n✉️  [EMIT] ${event}`);
    console.log(`  Room        : ${roomName}`);
    console.log(`  Listeners   : ${roomSize}`);
    console.log(`  Data        : progress=${data.progress}%, step="${data.step}"`);
    console.log(`  Status      : Sending...\n`);
    _io.to(roomName).emit(event, data);
  } else {
    console.error('\n❌ [EMIT] Socket.io NOT INITIALIZED!');
    console.error(`  Event: ${event}`);
    console.error(`  Cannot send to room forge-job:${jobId}\n`);
  }
}

forgeQueue.process('generate', async (job) => {
  const { 
    iterationId, 
    projectId, 
    voiceTranscript, 
    imageBase64, 
    imageType, 
    textInput, 
    competitorUrl,
    userGeminiApiKey   // ← NEW: receive user personal key (if provided)
  } = job.data

  const jobId = job.id  // ← CRITICAL: Get the actual Bull job ID for socket emissions

  console.log(`\n════════════════════════════════════════════`);
  console.log(`[ForgeWorker] 🚀 JOB STARTED`);
  console.log(`  Job ID        : ${jobId}`);
  console.log(`  Project ID    : ${projectId}`);
  console.log(`  Iteration ID  : ${iterationId}`);
  console.log(`  Socket.io ready: ${_io ? '✅ YES' : '❌ NO'}`);
  console.log(`════════════════════════════════════════════\n`);

  try {
    // ── Step 1: Analyzing inputs ──────────────────────────────
    console.log(`[ForgeWorker] Step 1: Analyzing inputs...`);
    await job.progress(10)
    emit(jobId, 'job:progress', { progress: 10, step: 'Analyzing inputs...', projectId, iterationId })

    let competitorAnalysis = null

    // ── Step 2: Competitor analysis (optional) ────────────────
    if (competitorUrl) {
      await job.progress(20)
      emit(jobId, 'job:progress', { progress: 20, step: 'Fetching competitor page...', projectId, iterationId })

      try {
        competitorAnalysis = await analyzeCompetitor(competitorUrl)
        await job.progress(30)
        emit(jobId, 'job:progress', { progress: 30, step: 'Competitor analysis complete.', projectId, iterationId })
      } catch (err) {
        console.warn(`[ForgeWorker] Competitor analysis failed for job ${job.id}:`, err.message)
        emit(jobId, 'job:progress', {
          progress: 30,
          step: 'Competitor analysis skipped — continuing with generation.',
          projectId,
          iterationId,
        })
      }
    }

    // ── Step 2.5: Search GitHub for related repositories ───────
    let githubRepos = []
    try {
      const searchQuery = textInput || voiceTranscript || 'project'
      githubRepos = await searchGitHubRepos(searchQuery)
      console.log(`[ForgeWorker] Found ${githubRepos.length} related GitHub repos`)
    } catch (err) {
      console.warn(`[ForgeWorker] GitHub search failed:`, err.message)
      // GitHub search is optional — continue without it
    }

    // ── Step 3: Generate blueprint with Gemini ────────────────
    await job.progress(40)
    emit(jobId, 'job:progress', {
      progress: 40,
      step: userGeminiApiKey 
        ? 'Generating blueprint with YOUR personal Gemini key...' 
        : 'Generating blueprint with Gemini 2.5 Flash...',
      projectId,
      iterationId,
    })

    const blueprint = await generateBlueprint({
      voiceTranscript,
      imageBase64,
      imageType,
      textInput,
      competitorAnalysis,
      githubRepos,              // ← NEW: pass GitHub repos
      userGeminiApiKey,        // ← NEW: pass to gemini.service
    })

    // ── Step 3.5: Skip credit deduction here - will deduct after completion ──
    // Credit will only be deducted if generation completes successfully
    
    await job.progress(80)
    emit(jobId, 'job:progress', { progress: 80, step: 'Parsing and validating output...', projectId, iterationId })

    // ── Step 5: Save artifacts to DB ──────────────────────────
    await job.progress(90)
    emit(jobId, 'job:progress', { progress: 90, step: 'Saving artifacts to database...', projectId, iterationId })

    const artifactData = [
      { type: 'PRD', content: blueprint.prd },
      { type: 'SCHEMA', content: { schema: blueprint.prismaSchema } },
      { type: 'COMPONENT_TREE', content: blueprint.componentTree },
      { type: 'TASK_BOARD', content: blueprint.taskBoard },
      { type: 'GITHUB_REPOS', content: { repos: githubRepos } },  // ← NEW: Save GitHub repos
    ]

    await Promise.all(
      artifactData.map(({ type, content }) =>
        prisma.artifact.upsert({
          where: { iterationId_type: { iterationId, type } },
          create: { iterationId, type, content },
          update: { content },
        })
      )
    )

    // ── Step 6: Update iteration + project status ─────────────
    await prisma.iteration.update({
      where: { id: iterationId },
      data: { status: 'COMPLETE' },
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETE' },
    })

    // ── Step 6.5: Deduct credit ONLY after successful completion ─────
    // Only deduct 1 credit if using project API (not personal key)
    if (!userGeminiApiKey || !userGeminiApiKey.trim()) {
      const userId = job.data.userId
      try {
        await paymentService.deductCredit(userId, 'Forge AI generation completed')
      } catch (err) {
        console.error(`[ForgeWorker] Failed to deduct credit for user ${userId}:`, err.message)
        // Don't throw — generation already completed. Credit deduction is non-critical.
      }
    }

    // ── Step 7: Emit completion event ─────────────────────────
    await job.progress(100)
    emit(jobId, 'job:progress', { progress: 100, step: 'Blueprint generation complete!', projectId, iterationId })
    emit(jobId, 'job:complete', {
      iterationId,
      projectId,
      jobId,
      artifacts: {
        prd: blueprint.prd,
        prismaSchema: blueprint.prismaSchema,
        componentTree: blueprint.componentTree,
        taskBoard: blueprint.taskBoard,
      },
    })

    return { iterationId, projectId, success: true }
  } catch (err) {
    await prisma.iteration.update({
      where: { id: iterationId },
      data: { status: 'FAILED' },
    }).catch(() => {})

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'FAILED' },
    }).catch(() => {})

    emit(jobId, 'job:failed', {
      iterationId,
      projectId,
      jobId,
      error: err.message || 'Unknown error',
    })

    throw err
  }
})

console.log('✅ Forge worker started — listening for jobs')