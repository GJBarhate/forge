// src/routes/project.routes.js
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { createProjectSchema } from '../validators/project.validator.js'
import {
  getAllProjects,
  createProject,
  getProjectById,
  softDeleteProject,
  getProjectIterations,
  reiterateProject,
} from '../controllers/project.controller.js'

const router = Router()

// All project routes require authentication
router.use(authenticate)

// GET  /api/v1/projects
router.get('/', getAllProjects)

// POST /api/v1/projects
router.post('/', validate(createProjectSchema), createProject)

// GET  /api/v1/projects/:id
router.get('/:id', getProjectById)

// DELETE /api/v1/projects/:id  (soft delete)
router.delete('/:id', softDeleteProject)

// GET  /api/v1/projects/:id/iterations
router.get('/:id/iterations', getProjectIterations)

// POST /api/v1/projects/:id/reiterate
// Create a new iteration of the project with refined requirements
router.post('/:id/reiterate', reiterateProject)

// GET  /api/v1/projects/:id/github-inspiration
// Returns relevant GitHub repositories for the project
router.get('/:id/github-inspiration', (req, res) => {
  // Mock data for now - can be replaced with real GitHub API calls
  res.json({
    success: true,
    repos: [
      {
        id: 1,
        name: 'Next.js Commerce',
        owner: 'vercel',
        url: 'https://github.com/vercel/commerce',
        description: 'A complete e-commerce template with AI integration, authentication, and payment processing',
        stars: 8400,
        language: 'TypeScript',
        topics: ['next.js', 'commerce', 'tailwind'],
        suggestion: 'Use their payment integration system combined with your Gemini AI to auto-generate product descriptions.',
      },
      {
        id: 2,
        name: 'React Query',
        owner: 'TanStack',
        url: 'https://github.com/TanStack/query',
        description: 'Powerful data synchronization for React applications with automatic caching',
        stars: 42300,
        language: 'TypeScript',
        topics: ['react', 'data-fetching', 'caching'],
        suggestion: 'Integrate their caching strategies to handle high-volume API calls and improve performance.',
      },
      {
        id: 3,
        name: 'Shadcn UI',
        owner: 'shadcn',
        url: 'https://github.com/shadcn-ui/ui',
        description: 'Beautiful, customizable React components built with Tailwind CSS',
        stars: 64200,
        language: 'TypeScript',
        topics: ['react', 'tailwind', 'components', 'ui'],
        suggestion: 'Adopt their component patterns and Tailwind structure for consistent, professional UI design.',
      },
      {
        id: 4,
        name: 'Prisma',
        owner: 'prisma',
        url: 'https://github.com/prisma/prisma',
        description: 'Next-generation ORM with powerful migration and query tools',
        stars: 38900,
        language: 'TypeScript',
        topics: ['orm', 'database', 'typescript', 'sql'],
        suggestion: 'Leverage their migration system and query optimization to scale your database efficiently.',
      },
      {
        id: 5,
        name: 'Socket.io',
        owner: 'socketio',
        url: 'https://github.com/socketio/socket.io',
        description: 'Bidirectional real-time communication library for web applications',
        stars: 60700,
        language: 'JavaScript',
        topics: ['websocket', 'realtime', 'nodejs'],
        suggestion: 'Add real-time collaboration features using their Socket.io implementation for multi-user editing.',
      },
    ],
  });
})

export default router
