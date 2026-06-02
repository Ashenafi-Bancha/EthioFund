import axios from 'axios';
import env from '../../config/env';

export type CommentModerationDecision = 'approved' | 'pending_review' | 'rejected';

export type CommentModerationResult = {
  decision: CommentModerationDecision;
  geminiDecision: 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW';
  reason: string;
  score: number;
  model: string;
};

type GeminiModerationPayload = {
  decision?: string;
  reason?: string;
  confidence?: number;
  score?: number;
};

const normalizeScore = (value: unknown): number => {
  const score = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(score)) {
    return 0.5;
  }

  return Math.max(0, Math.min(1, score));
};

const extractJsonObject = (text: string): GeminiModerationPayload => {
  const match = text.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error('Gemini moderation response did not include JSON');
  }

  return JSON.parse(match[0]) as GeminiModerationPayload;
};

export const moderateCommentContent = async (content: string): Promise<CommentModerationResult> => {
  const model = env.GEMINI_MODEL || 'gemini-1.5-flash';

  // Fallback check: If the Google Gemini API key is missing from environment variables,
  // we fail-safe by placing the comment into 'pending_review' status so admins can review it manually.
  if (!env.GEMINI_API_KEY) {
    return {
      decision: 'pending_review',
      geminiDecision: 'PENDING_REVIEW',
      reason: 'Gemini API key is not configured. Comment queued for manual review.',
      score: 0.5,
      model,
    };
  }

  try {
    // Construct strict instructions for the LLM. 
    // We explicitly ask for a specific JSON shape without markdown formatting/backticks to ease parsing.
    const prompt = [
      'You are a strict moderation classifier for campaign comments on a crowdfunding platform.',
      'Return one of these decisions ONLY: APPROVED, REJECTED, PENDING_REVIEW.',
      'APPROVED: positive/supportive/encouraging/constructive feedback (including polite criticism).',
      'REJECTED: hateful/abusive/harassment/threats/violent incitement/scams/spam/doxxing/explicit sexual content.',
      'PENDING_REVIEW: ambiguous, mixed sentiment, borderline language, uncertainty, or low confidence.',
      'IMPORTANT: Do NOT reject constructive feedback or polite disagreement. If unsure, choose PENDING_REVIEW.',
      'Return JSON only with this exact shape:',
      '{"decision":"APPROVED|REJECTED|PENDING_REVIEW","reason":"short explanation","confidence":0.0}',
      'No markdown, no code fences, and no extra keys.',
      '',
      `Comment: ${content}`,
    ].join('\n');

    // Send HTTP request to Gemini API. We set temperature to 0 for maximum determinism and consistency.
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 256,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    // Extract text block returned by the LLM
    const text = response.data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || '')
      .join('')
      .trim();

    if (!text) {
      throw new Error('Gemini moderation response was empty');
    }

    // Attempt to extract the JSON block out of the generated string using regex and parse it
    const parsed = extractJsonObject(text);

    const rawDecision = String(parsed.decision || '').toUpperCase().trim();
    const geminiDecision: 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW' =
      rawDecision === 'APPROVED' ? 'APPROVED' : rawDecision === 'REJECTED' ? 'REJECTED' : 'PENDING_REVIEW';

    const confidence = normalizeScore(parsed.confidence ?? parsed.score);

    // Confidence-aware moderation guardrails:
    // - Low confidence => PENDING_REVIEW
    // - Avoid false rejections: require higher confidence to auto-reject
    const decision: CommentModerationDecision = (() => {
      if (geminiDecision === 'APPROVED') {
        return confidence >= 0.7 ? 'approved' : 'pending_review';
      }

      if (geminiDecision === 'REJECTED') {
        return confidence >= 0.85 ? 'rejected' : 'pending_review';
      }

      return 'pending_review';
    })();

    return {
      decision,
      geminiDecision,
      reason: String(parsed.reason || 'Comment reviewed by Gemini moderation'),
      score: confidence,
      model,
    };
  } catch (error) {
    // If the Gemini API is down, times out, or fails to return parsable JSON,
    // we fail-safe by setting the comment status to 'pending_review' so it is not lost but remains hidden until moderated.
    const reason = error instanceof Error ? error.message : 'Unknown Gemini moderation error';

    return {
      decision: 'pending_review',
      geminiDecision: 'PENDING_REVIEW',
      reason: `Moderation service unavailable: ${reason}`,
      score: 0.5,
      model,
    };
  }
};