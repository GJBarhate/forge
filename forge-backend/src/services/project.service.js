// src/services/project.service.js
import { prisma } from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'

export async function getAllProjects(userId) {
  return prisma.project.findMany({
    where: { userId, deletedAt: null },
    include: {
      _count: { select: { iterations: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createProject(userId, { name }) {
  return prisma.project.create({
    data: { userId, name, status: 'PROCESSING' },
  })
}

export async function getProjectById(projectId, userId) {
  // FIXED: Verify user owns this project before returning
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,  // ✅ CRITICAL: Only return projects owned by this user
      deletedAt: null,  // ✅ Exclude soft-deleted projects
    },
    include: {
      iterations: {
        orderBy: { createdAt: "desc" },
        include: {
          artifacts: true,
        },
      },
    },
  });

  if (!project) {
    throw new ApiError(403, "Project not found or access denied");  // ✅ Use 403 for unauthorized access
  }

  return project;
}

export async function softDeleteProject(userId, projectId) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  })
  if (!project) throw new ApiError(404, 'Project not found')

  return prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  })
}

export async function getProjectIterations(userId, projectId) {
  // Verify ownership first
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  })
  if (!project) throw new ApiError(404, 'Project not found')

  return prisma.iteration.findMany({
    where: { projectId },
    include: {
      artifacts: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function verifyProjectOwnership(userId, projectId) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  })
  if (!project) throw new ApiError(403, 'Project not found or access denied')
  return project
}
