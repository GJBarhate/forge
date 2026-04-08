# Forge Frontend

React + Vite frontend for the Forge blueprint generation system.

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

```bash
npm install
```

## Configuration

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## Running

**Development:**
```bash
npm run dev
```

Browser opens at `http://localhost:5173`

**Production Build:**
```bash
npm run build
```

## Project Structure

- **pages** - Page components (Dashboard, NewProjectPage, etc.)
- **components** - Reusable UI components
- **hooks** - Custom React hooks (useSocket, useAuth, etc.)
- **services** - API service calls
- **store** - State management (Zustand)
- **utils** - Helper utilities

## Key Features

- Real-time progress updates via Socket.io
- Blueprint generation with 5 artifact types
- User authentication and credits system
- Responsive design with Tailwind CSS
- Modern UI with Lucide React icons

## Build & Deploy

```bash
npm run build
# Serves from dist/ folder
```

## License

MIT
