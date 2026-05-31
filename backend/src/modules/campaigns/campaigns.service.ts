// Service layer for campaign-related database operations. Prefer prepared SQL
// and centralized queries here; controllers should only call these functions.
import pool from '../../config/db';

export type CampaignStatus = 'pending' | 'approved' | 'active' | 'closed' | 'rejected' | 'suspended';

export type CampaignFilters = {
  status?: string;
  category?: string;
  search?: string;
  organizerId?: string;
};

export type CampaignInput = {
  title: string;
  description: string;
  story?: string;
  location?: string;
  goal_amount: number;
  category: string;
  duration_days?: number;
  image_url?: string;
  supporting_documents?: string[];
  verified?: boolean;
};

export type CampaignUpdateInput = Partial<CampaignInput> & {
  status?: CampaignStatus;
};

export type CampaignUpdatePayload = {
  campaign_id: string;
  content: string;
};

export type MilestonePayload = {
  campaign_id: string;
  title: string;
  description?: string;
  target_amount: number;
};

type CampaignRow = {
  campaign_id: number;
  title: string;
  description: string;
  story?: string;
  location?: string;
  goal_amount: string;
  raised_amount: string;
  duration_days?: number;
  image_url?: string | null;
  supporting_documents?: string[] | string | null;
  verified?: boolean;
  status: CampaignStatus;
  category: string;
  organizer_id: number;
  organizer_name?: string;
  created_at: string;
  donor_count?: string;
  share_count?: string;
  update_count?: string;
  milestone_count?: string;
};

type ServiceError = Error & { statusCode?: number };

// Normalize supporting document payloads coming from forms or uploaded
// artifacts. Returns a clean string[] of URLs.
const normalizeDocuments = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((document) => {
        if (typeof document === 'string') {
          return document.trim();
        }

        if (document && typeof document === 'object' && 'url' in document) {
          return String((document as { url?: unknown }).url ?? '').trim();
        }

        return '';
      })
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return normalizeDocuments(parsed);
      }
    } catch {
      return [value.trim()];
    }
  }

  return [];
};

// Ensure uploaded document urls are trimmed and non-empty.
const normalizeUploadedDocumentUrls = (value: string[] | undefined): string[] =>
  (value ?? []).map((document) => String(document).trim()).filter(Boolean);

const buildCampaignSelect = () => `
  SELECT c.*,
         u.full_name AS organizer_name,
         (
           SELECT COUNT(*)
           FROM donations d
           WHERE d.campaign_id = c.campaign_id AND d.payment_status = 'successful'
         ) AS donor_count,
         (
           SELECT COUNT(*)
           FROM campaign_updates cu
           WHERE cu.campaign_id = c.campaign_id
         ) AS update_count,
         (
           SELECT COUNT(*)
           FROM milestones m
           WHERE m.campaign_id = c.campaign_id
         ) AS milestone_count
  FROM campaigns c
  LEFT JOIN users u ON u.user_id = c.organizer_id
`;

export const createCampaign = async (
  organizerId: string,
  input: CampaignInput,
  uploadedImageUrl?: string,
  uploadedDocumentUrls: string[] = []
): Promise<CampaignRow> => {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const story = typeof input.story === 'string' ? input.story.trim() : null;
  const location = typeof input.location === 'string' && input.location.trim() ? input.location.trim() : 'Ethiopia';
  const category = typeof input.category === 'string' ? input.category.trim() : '';
  const goalAmount = Number(input.goal_amount);
  const durationDays = input.duration_days ? Number(input.duration_days) : 30;
  const imageUrl =
    (typeof uploadedImageUrl === 'string' && uploadedImageUrl.length > 0 && uploadedImageUrl.length <= 255
      ? uploadedImageUrl
      : typeof input.image_url === 'string' && input.image_url.length > 0 && input.image_url.length <= 255
        ? input.image_url
        : null);
  const supportingDocuments = [...normalizeDocuments(input.supporting_documents), ...normalizeUploadedDocumentUrls(uploadedDocumentUrls)];

  if (!title || !description || !category || !Number.isFinite(goalAmount) || goalAmount <= 0) {
    const error: ServiceError = new Error('Invalid campaign payload');
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query<CampaignRow>(
    `INSERT INTO campaigns (title, description, story, location, goal_amount, raised_amount, duration_days, image_url, supporting_documents, verified, status, category, organizer_id)
     VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8::jsonb, $9, 'pending', $10, $11)
     RETURNING *`,
    [
      title,
      description,
      story,
      location,
      goalAmount,
      durationDays,
      imageUrl,
      JSON.stringify(supportingDocuments),
      input.verified ?? false,
      category,
      organizerId,
    ]
  );

  return result.rows[0];
};

export const getCampaigns = async (filters: CampaignFilters = {}): Promise<CampaignRow[]> => {
  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (filters.status) {
    params.push(filters.status);
    clauses.push(`c.status = $${params.length}`);
  } else {
    clauses.push(`c.status IN ('approved', 'active')`);
  }

  if (filters.category) {
    params.push(filters.category);
    clauses.push(`c.category = $${params.length}`);
  }

  if (filters.organizerId) {
    params.push(filters.organizerId);
    clauses.push(`c.organizer_id = $${params.length}`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    clauses.push(`(c.title ILIKE $${params.length} OR c.description ILIKE $${params.length})`);
  }

  const query = `
    ${buildCampaignSelect()}
    ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
    ORDER BY c.created_at DESC
  `;

  const result = await pool.query<CampaignRow>(query, params);
  return result.rows;
};

export const getMyCampaigns = async (organizerId: string): Promise<CampaignRow[]> => {
  const result = await pool.query<CampaignRow>(
    `
    ${buildCampaignSelect()}
    WHERE c.organizer_id = $1
    ORDER BY c.created_at DESC
    `,
    [organizerId]
  );

  return result.rows;
};

export const getCampaignById = async (campaignId: string): Promise<CampaignRow | null> => {
  const result = await pool.query<CampaignRow>(
    `
    ${buildCampaignSelect()}
    WHERE c.campaign_id = $1
    LIMIT 1
    `,
    [campaignId]
  );

  return result.rows[0] || null;
};

export const updateCampaign = async (
  campaignId: string,
  userId: string,
  role: string,
  input: CampaignUpdateInput
): Promise<CampaignRow | null> => {
  const current = await pool.query<{ organizer_id: number; status: CampaignStatus }>(
    'SELECT organizer_id, status FROM campaigns WHERE campaign_id = $1',
    [campaignId]
  );

  if ((current.rowCount || 0) === 0) {
    return null;
  }

  if (role !== 'admin' && current.rows[0].organizer_id !== Number(userId)) {
    const error: ServiceError = new Error('Not authorized to update this campaign');
    error.statusCode = 403;
    throw error;
  }

  const result = await pool.query<CampaignRow>(
    `UPDATE campaigns
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         goal_amount = COALESCE($3, goal_amount),
         category = COALESCE($4, category),
         status = COALESCE($5, status)
     WHERE campaign_id = $6
     RETURNING *`,
    [input.title ?? null, input.description ?? null, input.goal_amount ?? null, input.category ?? null, input.status ?? null, campaignId]
  );

  return result.rows[0] || null;
};

export const deleteCampaign = async (campaignId: string, userId: string, role: string): Promise<boolean> => {
  const current = await pool.query<{ organizer_id: number }>('SELECT organizer_id FROM campaigns WHERE campaign_id = $1', [campaignId]);
  if ((current.rowCount || 0) === 0) {
    return false;
  }

  if (role !== 'admin' && current.rows[0].organizer_id !== Number(userId)) {
    const error: ServiceError = new Error('Not authorized to delete this campaign');
    error.statusCode = 403;
    throw error;
  }

  await pool.query('DELETE FROM campaigns WHERE campaign_id = $1', [campaignId]);
  return true;
};

export const addCampaignUpdate = async (payload: CampaignUpdatePayload): Promise<{ update_id: number } | null> => {
  const result = await pool.query<{ update_id: number }>(
    'INSERT INTO campaign_updates (campaign_id, content) VALUES ($1, $2) RETURNING update_id',
    [payload.campaign_id, payload.content]
  );
  return result.rows[0] || null;
};

export const getCampaignUpdates = async (campaignId: string) => {
  const result = await pool.query(
    'SELECT update_id, campaign_id, content, posted_at FROM campaign_updates WHERE campaign_id = $1 ORDER BY posted_at DESC',
    [campaignId]
  );
  return result.rows;
};

export const addMilestone = async (payload: MilestonePayload) => {
  const result = await pool.query(
    `INSERT INTO milestones (campaign_id, title, description, target_amount)
     VALUES ($1, $2, $3, $4)
     RETURNING milestone_id, campaign_id, title, description, target_amount, is_completed, completed_at, created_at`,
    [payload.campaign_id, payload.title, payload.description || null, payload.target_amount]
  );
  return result.rows[0] || null;
};

export const getMilestones = async (campaignId: string) => {
  const result = await pool.query(
    'SELECT milestone_id, campaign_id, title, description, target_amount, is_completed, completed_at, created_at FROM milestones WHERE campaign_id = $1 ORDER BY created_at DESC',
    [campaignId]
  );
  return result.rows;
};

export const adminReviewCampaign = async (campaignId: string, status: CampaignStatus) => {
  const result = await pool.query<CampaignRow>(
    'UPDATE campaigns SET status = $1 WHERE campaign_id = $2 RETURNING *',
    [status, campaignId]
  );
  return result.rows[0] || null;
};

export const featureCampaign = async (campaignId: string) => {
  const result = await pool.query<CampaignRow>(
    "UPDATE campaigns SET status = 'active' WHERE campaign_id = $1 RETURNING *",
    [campaignId]
  );
  return result.rows[0] || null;
};

export const incrementShareCount = async (campaignId: string): Promise<number | null> => {
  const result = await pool.query<{ share_count: string | number }>(
    `UPDATE campaigns
     SET share_count = COALESCE(share_count, 0) + 1
     WHERE campaign_id = $1
     RETURNING share_count`,
    [campaignId]
  );

  if ((result.rowCount || 0) === 0) {
    return null;
  }

  return Number(result.rows[0].share_count) || 0;
};
