// forge-backend/src/utils/ResponseParser.js
import { z } from 'zod';
import { ApiError } from './ApiError.js';

const blueprintSchema = z.object({
  prd: z.object({
    title: z.string(),
    tagline: z.string(),
    problem: z.string(),
    users: z.array(z.object({ persona: z.string(), pain: z.string() })),
    features: z.array(z.object({
      name: z.string(),
      priority: z.enum(['P0', 'P1', 'P2']),
      description: z.string(),
      acceptance: z.array(z.string())
    })),
    positioning: z.string()
  }),
  prismaSchema: z.string().min(20),
  componentTree: z.object({
    name: z.string(),
    props: z.record(z.any()).default({}),
    children: z.array(z.any()).default([])
  }),
  taskBoard: z.object({
    sprints: z.array(z.object({
      name: z.string(),
      tasks: z.array(z.object({
        title: z.string(),
        description: z.string(),
        hours: z.number(),
        priority: z.enum(['P0', 'P1', 'P2'])
      }))
    }))
  })
});

export class ResponseParser {
  static stripFences(text) {
    return text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();
  }

  static async parse(rawText, genModel) {
    const cleaned = ResponseParser.stripFences(rawText);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.warn('[ResponseParser] JSON.parse failed — re-prompting');
      return await ResponseParser.rePrompt(rawText, genModel);
    }

    const result = blueprintSchema.safeParse(parsed);
    if (result.success) {
      console.log('✅ ResponseParser: Successfully parsed blueprint');
      return result.data;
    }

    console.warn('[ResponseParser] Zod validation failed — re-prompting');
    return await ResponseParser.rePrompt(rawText, genModel, result.error.format());
  }

  static async rePrompt(badResponse, genModel, zodErrors = null) {
    const correctionPrompt = `Your previous response was invalid.

Return ONLY valid JSON. No markdown, no explanation, no code fences.

Here is what you returned:
---
${badResponse.substring(0, 1500)}
---

${zodErrors ? `Errors: ${JSON.stringify(zodErrors)}` : ''}

Follow this exact structure and return only JSON.`;

    try {
      const retry = await genModel.generateContent(correctionPrompt);
      const text = retry.response.text();
      const cleaned = ResponseParser.stripFences(text);
      const parsed = JSON.parse(cleaned);
      return blueprintSchema.parse(parsed);
    } catch {
      throw new ApiError(422, 'Failed to generate valid blueprint after retry.');
    }
  }
}