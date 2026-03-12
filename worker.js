/**
 * Flashcard Generator — Cloudflare Worker
 *
 * Uses Groq (FREE: 14,400 req/day, no credit card required).
 * Get a free key at: https://console.groq.com/keys
 *
 * Endpoints (all via POST to /):
 *   { mode: "generate", text, numCards, difficulty }  → flashcard JSON array
 *   { mode: "evaluate", question, correctAnswer, userAnswer } → verdict object
 *
 * Deploy:
 *   1. wrangler secret put GROQ_API_KEY   (paste your key when prompted)
 *   2. wrangler deploy
 */

const SYSTEM_PROMPT_GENERATE = `You are a flashcard generation expert. When given any text, extract the most important concepts and generate study flashcards.
STRICT OUTPUT FORMAT — return ONLY a raw JSON array. No preamble, no explanation, no markdown code blocks, no backticks. Just the JSON array itself.
Format:
[
  {
    "question": "Clear, specific question testing one concept",
    "answer": "Concise, accurate answer (1-3 sentences max)",
    "difficulty": "easy | medium | hard",
    "topic": "Short topic label (2-4 words)"
  }
]
Rules:
- Generate exactly {NUM} flashcards
- Difficulty {DIFF}: easy=definitions/facts, medium=concepts/relationships, hard=application/analysis
- Questions must be standalone (no "in the above text" references)
- Answers must be self-contained and accurate
- Cover diverse aspects of the text, not just the first paragraph
- For hard cards, ask "why", "how", or "what would happen if" questions
- topic field should categorize the card (e.g. "Neural Networks", "Cell Biology")`;

const SYSTEM_PROMPT_EVALUATE = `You evaluate quiz answers. Compare the user's answer to the correct answer and return ONLY a JSON object, no markdown, no backticks:
{"correct": true/false, "partial": true/false, "explanation": "Brief 1-sentence explanation of why the answer is right, wrong, or partially correct"}
Rules:
- "correct": true if the user's answer captures the key concepts, even if wording differs
- "partial": true if the answer is on the right track but missing key details (set correct to false)
- Be fair — accept paraphrased or simplified versions of the correct answer
- explanation should be concise and helpful`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function callGroq(apiKey, systemPrompt, userContent, maxTokens) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API returned ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq API.');

  // Return in the same shape the client expects: { content: [{ text }] }
  return { content: [{ text }] };
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Only POST requests are accepted.' }, 405);
    }

    if (!env.GROQ_API_KEY) {
      return json({ error: 'GROQ_API_KEY secret is not configured on this worker.' }, 500);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Request body must be valid JSON.' }, 400);
    }

    const { mode } = body;

    try {
      if (mode === 'generate') {
        const { text, numCards = 10, difficulty = 'medium' } = body;
        if (!text || typeof text !== 'string' || text.trim().length < 10) {
          return json({ error: 'Provide a non-empty "text" field (at least 10 characters).' }, 400);
        }
        const diffLabel = difficulty === 'mixed' ? 'mixed (include easy, medium, and hard)' : difficulty;
        const system = SYSTEM_PROMPT_GENERATE
          .replace('{NUM}', Number(numCards))
          .replace('{DIFF}', diffLabel);
        const data = await callGroq(
          env.GROQ_API_KEY,
          system,
          `Generate ${numCards} flashcards from the following text:\n\n${text}`,
          4096
        );
        return json(data);

      } else if (mode === 'evaluate') {
        const { question, correctAnswer, userAnswer } = body;
        if (!question || !correctAnswer || !userAnswer) {
          return json({ error: 'Provide "question", "correctAnswer", and "userAnswer".' }, 400);
        }
        const data = await callGroq(
          env.GROQ_API_KEY,
          SYSTEM_PROMPT_EVALUATE,
          `Question: ${question}\nCorrect Answer: ${correctAnswer}\nUser's Answer: ${userAnswer}`,
          256
        );
        return json(data);

      } else {
        return json({ error: 'Invalid mode. Use "generate" or "evaluate".' }, 400);
      }
    } catch (err) {
      return json({ error: err.message }, 502);
    }
  },
};
