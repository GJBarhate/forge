// forge-backend/src/utils/promptBuilder.js
export function buildBlueprintPrompt({ voiceTranscript, textInput, competitorAnalysis, githubRepos }) {
  const strictExample = {
    prd: {
      title: "TaskFlow Pro",
      tagline: "Async-first team coordination tool",
      problem: "Remote teams lose hours in status meetings.",
      users: [{ persona: "Engineering Lead", pain: "Interrupt-driven workflow" }],
      features: [{
        name: "Async Standup",
        priority: "P0",
        description: "Record voice standup, AI transcribes and structures it.",
        acceptance: ["Voice under 90s", "Auto-transcription in 5s"]
      }],
      positioning: "Cheaper than Linear, more async than Jira."
    },
    prismaSchema: "model User {\n  id String @id @default(cuid())\n  email String @unique\n}",
    componentTree: {
      name: "App",
      props: {},
      children: [{ name: "Dashboard", props: {}, children: [] }]
    },
    taskBoard: {
      sprints: [{
        name: "Sprint 1 — Foundation",
        tasks: [{
          title: "Setup auth",
          description: "JWT + refresh tokens",
          hours: 8,
          priority: "P0"
        }]
      }]
    }
  };

  let prompt = `You are a senior software architect.

RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATION. NO CODE FENCES. NO EXTRA TEXT.

Exact structure required:
${JSON.stringify(strictExample, null, 2)}

Rules:
- Every field is REQUIRED
- "prismaSchema" must be valid Prisma schema as string
- "componentTree" must be recursive object
- "taskBoard" must have at least 3 sprints with realistic tasks

Now generate blueprint for this product:

`;

  if (voiceTranscript) prompt += `VOICE INPUT:\n${voiceTranscript}\n\n`;
  if (textInput) prompt += `ADDITIONAL CONTEXT:\n${textInput}\n\n`;
  if (competitorAnalysis) prompt += `COMPETITOR DATA:\n${JSON.stringify(competitorAnalysis)}\n\n`;
  
  // ✅ NEW: Include GitHub repos as inspiration/reference
  if (githubRepos && githubRepos.length > 0) {
    prompt += `RELATED GITHUB PROJECTS (for inspiration and reference):\n`;
    githubRepos.forEach((repo, idx) => {
      prompt += `${idx + 1}. ${repo.name} (⭐ ${repo.stars})\n`;
      prompt += `   Description: ${repo.description}\n`;
      prompt += `   Language: ${repo.language}\n`;
      prompt += `   URL: ${repo.url}\n`;
    });
    prompt += `\nConsider these projects when designing your component tree and schema.\n\n`;
  }

  return prompt;
}

// Keep this for competitor route
export function buildCompetitorPrompt(pageText) {
  return `Analyze this competitor page and return ONLY valid JSON.

Required shape:
{
  "features": ["feature 1", "feature 2"],
  "pricing": "string",
  "audience": "string",
  "patterns": ["pattern 1"],
  "gaps": ["gap 1"]
}

CONTENT: ${pageText.substring(0, 6000)}`;
}