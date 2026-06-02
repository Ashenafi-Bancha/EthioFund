import pool from '../../config/db';
import { recordActivity } from '../../middleware/activityLogger';
import { moderateCommentContent } from './comments.moderation.service';

type ModerationStatus = 'approved' | 'pending_review' | 'rejected';

export const addComment = async (userId: string, campaignId: string, content: string) => {
  const moderation = await moderateCommentContent(content);

  // TC-13 Step 4: Save rejected comments to DB with status='rejected' — they are hidden from public
  // but logged for admin review. Do NOT throw an error; just store and notify the caller.
  const moderationStatus: ModerationStatus = moderation.decision === 'approved'
    ? 'approved'
    : moderation.decision === 'rejected'
      ? 'rejected'
      : 'pending_review';

  const result = await pool.query(
    `INSERT INTO comments (content, user_id, campaign_id, moderation_status, moderation_reason, moderation_score, moderated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING comment_id, content, user_id, campaign_id, moderation_status, moderation_reason, moderation_score, moderated_at, created_at`,
    [content, userId, campaignId, moderationStatus, moderation.reason, moderation.score]
  );

  const commentRow = result.rows[0] || null;
  let comment = commentRow;

  if (commentRow) {
    const userResult = await pool.query<{ full_name: string }>('SELECT full_name FROM users WHERE user_id = $1', [userId]);
    comment = { ...commentRow, full_name: userResult.rows[0]?.full_name ?? null };
  }

  if (comment) {
    void recordActivity(
      userId,
      `Comment ${moderationStatus} on campaign ${campaignId} (${moderation.decision}, score ${Number(moderation.score).toFixed(3)})`
    );
  }

  return {
    comment,
    moderation,
    pendingReview: moderationStatus === 'pending_review',
    rejected: moderationStatus === 'rejected',
  };
};

export const getCommentsByCampaign = async (campaignId: string) => {
  const result = await pool.query(
    `SELECT c.comment_id, c.content, c.user_id, c.campaign_id, c.moderation_status, c.moderation_reason, c.moderation_score, c.moderated_at, c.created_at, u.full_name
     FROM comments c
     LEFT JOIN users u ON u.user_id = c.user_id
     WHERE c.campaign_id = $1 AND c.moderation_status = 'approved'
     ORDER BY c.created_at DESC`,
    [campaignId]
  );

  return result.rows;
};

export const deleteComment = async (commentId: string, userId: string, role: string) => {
  const existing = await pool.query<{ user_id: number }>('SELECT user_id FROM comments WHERE comment_id = $1', [commentId]);
  if ((existing.rowCount || 0) === 0) {
    return null;
  }

  if (role !== 'admin' && existing.rows[0].user_id !== Number(userId)) {
    const error = new Error('Not authorized to delete this comment');
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  await pool.query('DELETE FROM comments WHERE comment_id = $1', [commentId]);
  void recordActivity(userId, `Deleted comment ${commentId}`);
  return true;
};

export const getPendingComments = async () => {
  const result = await pool.query(
    `SELECT c.comment_id, c.content, c.user_id, c.campaign_id, c.moderation_status, c.moderation_reason, c.moderation_score, c.moderated_at, c.created_at,
            u.full_name AS user_name, cp.title AS campaign_title
     FROM comments c
     LEFT JOIN users u ON u.user_id = c.user_id
     LEFT JOIN campaigns cp ON cp.campaign_id = c.campaign_id
     WHERE c.moderation_status = 'pending_review'
     ORDER BY c.created_at DESC`
  );

  return result.rows;
};

export const getAllCommentsForAdmin = async () => {
  const result = await pool.query(
    `SELECT c.comment_id, c.content, c.user_id, c.campaign_id, c.moderation_status, c.moderation_reason, c.moderation_score, c.moderated_at, c.created_at,
            u.full_name AS user_name, cp.title AS campaign_title
     FROM comments c
     LEFT JOIN users u ON u.user_id = c.user_id
     LEFT JOIN campaigns cp ON cp.campaign_id = c.campaign_id
     ORDER BY c.created_at DESC`
  );

  return result.rows;
};

export const reviewComment = async (
  commentId: string,
  decision: ModerationStatus,
  reason?: string,
  reviewedByUserId?: string | number | null
) => {
  const normalizedDecision: ModerationStatus = decision === 'rejected' ? 'rejected' : 'approved';
  const defaultReason = normalizedDecision === 'approved' ? 'Approved by admin moderation' : 'Rejected by admin moderation';

  const result = await pool.query(
    `UPDATE comments
     SET moderation_status = $1,
         moderation_reason = COALESCE($2, $3, moderation_reason),
         moderated_at = NOW()
     WHERE comment_id = $4
     RETURNING comment_id, content, user_id, campaign_id, moderation_status, moderation_reason, moderation_score, moderated_at, created_at`,
    [normalizedDecision, reason ?? null, defaultReason, commentId]
  );

  const comment = result.rows[0] || null;

  if (comment) {
    void recordActivity(reviewedByUserId ?? null, `Admin ${normalizedDecision} comment ${commentId} on campaign ${comment.campaign_id}`);
  }

  return comment;
};
