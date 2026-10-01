/**
 * Coaching domain data (ILLUSTRATIVE PLACEHOLDER)
 *
 * Static data exposed as MCP resources and used by the stub tools.
 * The phases, cues and themes below are invented, generic placeholder content
 * for demonstrating the MCP structure. They do not describe any real coaching
 * product or methodology.
 */

export const COACHING_PHASES = [
  { id: 'orient', description: 'Understand the situation the user describes' },
  { id: 'reflect', description: 'Mirror back what was heard and ask an open question' },
  { id: 'plan', description: 'Agree on one small next step' },
  { id: 'review', description: 'Look back at how the next step went' },
] as const;

export const CUE_TYPES = [
  { id: 'explicit_request', description: 'The user directly asks for input' },
  { id: 'obstacle', description: 'The user describes something blocking progress' },
  { id: 'strong_feeling', description: 'The user expresses a strong emotion about the situation' },
] as const;

export const COACHING_THEMES = [
  { id: 'priorities', name: 'Priorities', description: 'Deciding what matters most when there is too much to do' },
  { id: 'communication', name: 'Communication', description: 'Saying clearly what you need and listening to others' },
  { id: 'career_growth', name: 'Career Growth', description: 'Thinking about the next step in your career' },
  { id: 'teamwork', name: 'Teamwork', description: 'Working well with the people around you' },
  { id: 'wellbeing', name: 'Wellbeing', description: 'Keeping a sustainable pace' },
] as const;

/**
 * Stub coaching response generator.
 *
 * PRODUCTION DESIGN: this would call the coaching service's backend API over
 * HTTP and map its result onto the same output shape.
 *
 * SPIKE: returns hardcoded coaching-style questions that demonstrate the MCP
 * interface shape (structured output with phase / cue / theme).
 */
export function generateCoachingResponse(question: string, theme?: string): {
  response: string;
  detectedCue: string | null;
  suggestedTheme: string;
  phase: string;
} {
  const q = question.toLowerCase();
  const matchedTheme = theme
    ? COACHING_THEMES.find(t => t.id === theme)
    : COACHING_THEMES.find(t =>
        q.includes(t.id.replace('_', ' ')) || q.includes(t.name.toLowerCase())
      );

  const suggestedTheme = matchedTheme?.id ?? 'priorities';

  // Detect a cue from question keywords (simplified stub logic)
  let detectedCue: string | null = null;
  if (q.includes('blocked') || q.includes("can't move")) {
    detectedCue = 'obstacle';
  } else if (q.includes('what should i') || q.includes('advice')) {
    detectedCue = 'explicit_request';
  } else if (q.includes('frustrated') || q.includes('overwhelmed')) {
    detectedCue = 'strong_feeling';
  }

  // Coaching-style response: open questions, not advice
  const responses: Record<string, string> = {
    priorities: "If you could only finish one thing this week, which would it be, and what makes that one matter most?",
    communication: "What do you want the other person to understand after this conversation, in one sentence?",
    career_growth: "Picture yourself a year from now, happy with the move you made. What did you choose?",
    teamwork: "What does a good week with this team look like, and what was different about it?",
    wellbeing: "What is one thing you could stop doing this week without anything important breaking?",
  };

  return {
    response: responses[suggestedTheme] ?? responses.priorities,
    detectedCue,
    suggestedTheme,
    phase: detectedCue ? 'reflect' : 'orient',
  };
}

/** Stub session booking */
export function bookSession(date: string, timeSlot: string, coachType: string): {
  confirmed: boolean;
  sessionId: string;
  date: string;
  timeSlot: string;
  coachType: string;
  message: string;
} {
  const sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  return {
    confirmed: true,
    sessionId,
    date,
    timeSlot,
    coachType,
    message: `Session booked: ${coachType} coaching on ${date} at ${timeSlot}. Session ID: ${sessionId}`,
  };
}
