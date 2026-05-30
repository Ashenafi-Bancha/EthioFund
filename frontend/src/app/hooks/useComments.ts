import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type CommentApiRow = {
  id?: string;
  comment_id?: string | number;
  campaign_id: string | number;
  user_id?: string | number;
  user_name?: string;
  content?: string;
  message?: string;
  created_at: string;
};

const normalizeComment = (comment: CommentApiRow): CommentResponse => ({
  id: String(comment.id ?? comment.comment_id ?? ''),
  campaign_id: String(comment.campaign_id),
  user_id: String(comment.user_id ?? ''),
  user_name: comment.user_name ?? 'Community member',
  message: comment.message ?? comment.content ?? '',
  created_at: comment.created_at,
});

export interface CommentResponse {
  id: string;
  campaign_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export interface CreateCommentInput {
  campaign_id: string;
  message: string;
}

interface UseCommentsResult {
  comments: CommentResponse[];
  loading: boolean;
  error: string | null;
}

interface UseAddCommentResult {
  loading: boolean;
  error: string | null;
  addComment: (data: CreateCommentInput) => Promise<{ comment: CommentResponse; pendingReview: boolean } | null>;
}

/**
 * Fetch comments for a campaign
 */
export const useCampaignComments = (campaignId: string | null): UseCommentsResult => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(!!campaignId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setComments([]);
      setLoading(false);
      return;
    }

    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; comments?: CommentApiRow[] } | CommentApiRow[]>(`/comments/campaign/${campaignId}`);
        const data = Array.isArray(response) ? response : response.comments ?? [];
        setComments(data.map(normalizeComment));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comments');
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [campaignId]);

  return { comments, loading, error };
};

/**
 * Add a comment to a campaign
 */
export const useAddComment = (): UseAddCommentResult => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComment = async (data: CreateCommentInput): Promise<{ comment: CommentResponse; pendingReview: boolean } | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest<{ success?: boolean; comment?: CommentApiRow; moderation?: { decision?: string } }>('/comments', {
        method: 'POST',
        authToken: token,
        body: JSON.stringify({
          campaign_id: data.campaign_id,
          content: data.message,
        }),
      });
      if (!response.comment) {
        return null;
      }

      return {
        comment: normalizeComment(response.comment),
        pendingReview: response.moderation?.decision === 'pending_review',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add comment';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, addComment };
};
