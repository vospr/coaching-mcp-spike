/**
 * Coaching MCP Server (spike)
 *
 * Exposes a coaching product's low-risk capabilities via the Model Context Protocol.
 * Spike implementation: stub backend, real MCP primitives.
 * Domain data is illustrative placeholder content (see coaching-data.ts).
 *
 * Tools (model-controlled):
 *   - single-turn-advice: Get a coaching response for a work question
 *   - book-session: Book a coaching session
 *
 * Resources (application-driven, read-only context):
 *   - coaching://themes: List of coaching themes
 *   - coaching://themes/{themeId}: Detail for one theme (resource template)
 *   - coaching://cues: Cue types the stub detects
 *   - coaching://phases: Phases of a coaching conversation
 *   - coaching://model: Complete coaching model overview
 *
 * Prompts (user-controlled templates):
 *   - coaching-question: Structured prompt for asking a coaching question
 */

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  COACHING_PHASES,
  CUE_TYPES,
  COACHING_THEMES,
  generateCoachingResponse,
  bookSession,
} from './coaching-data.js';

export function createCoachingMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: 'coaching-mcp-spike',
      version: '0.1.0',
    },
    {
      instructions: [
        'This server exposes a coaching service for professional development.',
        'Coaching responses use open questions and reflection rather than direct advice.',
        'Use the single-turn-advice tool when users ask work or coaching questions.',
        'Use the book-session tool to schedule coaching sessions.',
        'Read coaching://model for an overview of the coaching model.',
        'Read coaching://themes to see the available coaching themes.',
      ].join(' '),
      capabilities: {
        logging: {},
      },
    }
  );

  // ─── TOOLS ──────────────────────────────────────────────────────────────────

  server.registerTool(
    'single-turn-advice',
    {
      title: 'Coaching Advice',
      description:
        'Get a single-turn coaching response for a work or professional development question. ' +
        'Returns a reflective coaching response (questions, not advice), detected cue, suggested theme, and coaching phase.',
      inputSchema: z.object({
        question: z.string().describe('The work or professional development question to think through'),
        theme: z
          .string()
          .optional()
          .describe(
            'Optional coaching theme to focus on (e.g., priorities, communication, wellbeing). ' +
            'Read coaching://themes for the full list.'
          ),
      }),
      outputSchema: z.object({
        response: z.string().describe('Coaching response using reflective questions'),
        detectedCue: z.string().nullable().describe('Detected cue, if any'),
        suggestedTheme: z.string().describe('Coaching theme this question maps to'),
        phase: z.string().describe('Current coaching phase (e.g., orient, reflect)'),
      }),
    },
    async ({ question, theme }) => {
      const result = generateCoachingResponse(question, theme);
      return {
        content: [
          {
            type: 'text',
            text: result.response,
          },
        ],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    'book-session',
    {
      title: 'Book Coaching Session',
      description: 'Book a coaching session with a specific date, time slot, and coach type.',
      inputSchema: z.object({
        date: z.string().describe('Session date in YYYY-MM-DD format'),
        timeSlot: z.string().describe('Preferred time slot (e.g., "10:00-11:00", "afternoon")'),
        coachType: z
          .enum(['ai', 'human', 'hybrid'])
          .default('ai')
          .describe('Type of coaching: ai (automated coach), human (human coach), or hybrid'),
      }),
      outputSchema: z.object({
        confirmed: z.boolean(),
        sessionId: z.string(),
        date: z.string(),
        timeSlot: z.string(),
        coachType: z.string(),
        message: z.string(),
      }),
    },
    async ({ date, timeSlot, coachType }) => {
      const result = bookSession(date, timeSlot, coachType);
      return {
        content: [{ type: 'text', text: result.message }],
        structuredContent: result,
      };
    }
  );

  // ─── RESOURCES ──────────────────────────────────────────────────────────────

  server.registerResource(
    'coaching-themes',
    'coaching://themes',
    {
      title: 'Coaching Themes',
      description:
        `The ${COACHING_THEMES.length} coaching themes (placeholder data). ` +
        'Each theme covers one area of professional development.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(COACHING_THEMES, null, 2),
        },
      ],
    })
  );

  server.registerResource(
    'coaching-cues',
    'coaching://cues',
    {
      title: 'Coaching Cue Types',
      description:
        `The ${CUE_TYPES.length} cue types the stub detects in a question (placeholder data).`,
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(CUE_TYPES, null, 2),
        },
      ],
    })
  );

  server.registerResource(
    'coaching-phases',
    'coaching://phases',
    {
      title: 'Coaching Phases',
      description:
        `The ${COACHING_PHASES.length} phases of a coaching conversation (placeholder data): ` +
        COACHING_PHASES.map((p) => p.id).join(' → ') + '.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(COACHING_PHASES, null, 2),
        },
      ],
    })
  );

  server.registerResource(
    'coaching-model',
    'coaching://model',
    {
      title: 'Coaching Model Overview',
      description:
        'Overview of the coaching model: phases, cues, themes, and interaction principles. ' +
        'Use this to understand how coaching works before using tools.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(
            {
              name: 'Example Coaching Model',
              description:
                'Illustrative placeholder model for this spike. It does not describe any real ' +
                'coaching product or methodology.',
              principles: [
                'Prefer open questions to direct advice',
                'Keep responses short',
                'Leave the decision with the user',
              ],
              phases: COACHING_PHASES,
              cues: CUE_TYPES,
              themes: COACHING_THEMES,
            },
            null,
            2
          ),
        },
      ],
    })
  );

  // Dynamic resource: theme detail by ID
  server.registerResource(
    'theme-detail',
    new ResourceTemplate('coaching://themes/{themeId}', {
      list: async () => ({
        resources: COACHING_THEMES.map((t) => ({
          uri: `coaching://themes/${t.id}`,
          name: t.name,
        })),
      }),
    }),
    {
      title: 'Theme Detail',
      description: 'Detailed information about a specific coaching theme.',
      mimeType: 'application/json',
    },
    async (uri, { themeId }) => {
      const theme = COACHING_THEMES.find((t) => t.id === themeId);
      if (!theme) {
        return {
          contents: [{ uri: uri.href, text: JSON.stringify({ error: 'Theme not found' }) }],
        };
      }
      return {
        contents: [{ uri: uri.href, text: JSON.stringify(theme, null, 2) }],
      };
    }
  );

  // ─── PROMPTS ────────────────────────────────────────────────────────────────

  server.registerPrompt(
    'coaching-question',
    {
      title: 'Ask a Coaching Question',
      description:
        'Structured prompt for thinking through a work question with the coaching service. ' +
        'Reads the coaching model for context, then uses single-turn-advice.',
      argsSchema: {
        question: z.string().describe('Your work or professional development question'),
        theme: z.string().optional().describe('Optional: specific coaching theme to focus on'),
      },
    },
    ({ question, theme }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              `I'd like coaching on this question: "${question}"`,
              theme ? `Focus area: ${theme}` : '',
              '',
              'Please:',
              '1. Read the coaching://model resource to understand the coaching model',
              '2. Use the single-turn-advice tool with my question',
              '3. Reflect the coaching response back to me naturally, as a coach would',
              '4. Ask one follow-up question to go deeper',
            ]
              .filter(Boolean)
              .join('\n'),
          },
        },
      ],
    })
  );

  return server;
}
