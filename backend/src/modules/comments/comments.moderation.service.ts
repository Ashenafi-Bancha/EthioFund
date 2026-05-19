import axios from 'axios';
import env from '../../config/env';

export type CommentModerationDecision = 'approved' | 'pending_review' | 'rejected';

export type CommentModerationResult = {
  decision: CommentModerationDecision;
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

const mapDecision = (value: unknown): CommentModerationDecision => {
  const decision = String(value || '').toLowerCase().trim();

  if (decision === 'approve' || decision === 'approved' || decision === 'allow' || decision === 'allowed') {
    return 'approved';
  }

  if (decision === 'reject' || decision === 'rejected' || decision === 'block' || decision === 'blocked') {
    return 'rejected';
  }

  return 'pending_review';
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

  if (!env.GEMINI_API_KEY) {
    return {
      decision: 'pending_review',
      reason: 'Gemini API key is not configured. Comment queued for manual review.',
      score: 0.5,
      model,
    };
  }

  try {
    const prompt = [
      'You are a strict moderation classifier for campaign comments on a crowdfunding platform.',
      'Classify the comment into one of these decisions: approved, pending_review, rejected.',
      'Reject spam, scams, hateful content, harassment, explicit sexual content, threats, and obvious abuse.',
      'Use pending_review for ambiguous, suspicious, or low-confidence comments.',
      'Return JSON only with this exact shape:',
      '{"decision":"approved|pending_review|rejected","reason":"short explanation","confidence":0.0}',
      'No markdown, no code fences, and no extra keys.',
      '',
      `Comment: ${content}`,
    ].join('\n');

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

    const text = response.data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || '')
      .join('')
      .trim();

    if (!text) {
      throw new Error('Gemini moderation response was empty');
    }

    const parsed = extractJsonObject(text);

    return {
      decision: mapDecision(parsed.decision),
      reason: String(parsed.reason || 'Comment reviewed by Gemini moderation'),
      score: normalizeScore(parsed.confidence ?? parsed.score),
      model,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown Gemini moderation error';

    return {
      decision: 'pending_review',
      reason: `Moderation service unavailable: ${reason}`,
      score: 0.5,
      model,
    };
  }
};