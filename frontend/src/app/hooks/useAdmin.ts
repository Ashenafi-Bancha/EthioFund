import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export interface AdminStatsResponse {
  users: number;
  campaigns: number;
  donations: number;
  withdrawals: number;
}

export interface AdminAnalyticsOverview {
  totalUsers: number;
  totalCampaigns: number;
  totalDonations: number;
  totalComments: number;
  activeCampaigns: number;
  pendingComments: number;
}

export type DonationsByMonthRow = {
  month: string;
  totalAmount: number;
};

export type CampaignStatusRow = {
  status: string;
  count: number;
};

export type CommentModerationRow = {
  status: string;
  count: number;
};

export interface PendingCampaignResponse {
  id: string;
  title: string;
  description: string;
  organizer_name: string;
  category: string;
  goal_amount: number;
  created_at: string;
}

export interface PendingWithdrawalResponse {
  id: string;
  campaign_title: string;
  organizer_name: string;
  amount: number;
  bank_account: string;
  campaign_bank_account: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  created_at: string;
  campaign_id: string;
  raised_amount: number;
}

export interface ContactMessageResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  created_at: string;
}

export interface PendingCommentResponse {
  id: string;
  campaign_id: string;
  campaign_title: string;
  user_name: string;
  message: string;
  moderation_reason: string;
  created_at: string;
}

export interface AdminCommentResponse extends PendingCommentResponse {
  moderation_status: 'approved' | 'pending_review' | 'rejected';
  moderation_score: number | null;
  moderated_at: string | null;
}

export interface AdminActivityLogResponse {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  activity: string;
  timestamp: string;
}

interface UseAdminStatsResult {
  stats: AdminStatsResponse | null;
  loading: boolean;
  error: string | null;
}

interface UseAdminAnalyticsOverviewResult {
  overview: AdminAnalyticsOverview | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UseDonationsByMonthResult {
  rows: DonationsByMonthRow[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UseCampaignStatusAnalyticsResult {
  rows: CampaignStatusRow[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UseCommentModerationAnalyticsResult {
  rows: CommentModerationRow[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UsePendingCampaignsResult {
  campaigns: PendingCampaignResponse[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UsePendingWithdrawalsResult {
  withdrawals: PendingWithdrawalResponse[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UsePendingCommentsResult {
  comments: PendingCommentResponse[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UseAdminCommentsResult {
  comments: AdminCommentResponse[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UseAdminActivityLogsResult {
  logs: AdminActivityLogResponse[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UseApproveCampaignResult {
  loading: boolean;
  error: string | null;
  approveCampaign: (campaignId: string) => Promise<boolean>;
}

interface UseRejectCampaignResult {
  loading: boolean;
  error: string | null;
  rejectCampaign: (campaignId: string, reason: string) => Promise<boolean>;
}

interface UseReviewCommentResult {
  loading: boolean;
  error: string | null;
  reviewComment: (commentId: string, decision: 'approved' | 'rejected', reason?: string) => Promise<boolean>;
}

/**
 * Fetch admin dashboard stats
 */
export const useAdminStats = (): UseAdminStatsResult => {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; data?: AdminStatsResponse; stats?: AdminStatsResponse }>('/admin/stats', {
          authToken: token,
        });
        setStats(response.data ?? response.stats ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin stats');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return { stats, loading, error };
};

export const useAdminAnalyticsOverview = (): UseAdminAnalyticsOverviewResult => {
  const { token } = useAuth();
  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; data?: AdminAnalyticsOverview }>('/admin/analytics/overview', {
          authToken: token,
        });
        setOverview(response.data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics overview');
        setOverview(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchOverview();
  }, [token, refreshIndex]);

  return { overview, loading, error, reload: () => setRefreshIndex((value) => value + 1) };
};

export const useDonationsByMonth = (): UseDonationsByMonthResult => {
  const { token } = useAuth();
  const [rows, setRows] = useState<DonationsByMonthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; data?: DonationsByMonthRow[] }>('/admin/analytics/donations-by-month', {
          authToken: token,
        });
        setRows(response.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch donation trends');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchRows();
  }, [token, refreshIndex]);

  return { rows, loading, error, reload: () => setRefreshIndex((value) => value + 1) };
};

export const useCampaignStatusAnalytics = (): UseCampaignStatusAnalyticsResult => {
  const { token } = useAuth();
  const [rows, setRows] = useState<CampaignStatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; data?: CampaignStatusRow[] }>('/admin/analytics/campaign-status', {
          authToken: token,
        });
        setRows(response.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch campaign status analytics');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchRows();
  }, [token, refreshIndex]);

  return { rows, loading, error, reload: () => setRefreshIndex((value) => value + 1) };
};

export const useCommentModerationAnalytics = (): UseCommentModerationAnalyticsResult => {
  const { token } = useAuth();
  const [rows, setRows] = useState<CommentModerationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; data?: CommentModerationRow[] }>('/admin/analytics/comment-moderation', {
          authToken: token,
        });
        setRows(response.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comment moderation analytics');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchRows();
  }, [token, refreshIndex]);

  return { rows, loading, error, reload: () => setRefreshIndex((value) => value + 1) };
};

/**
 * Fetch pending campaign approvals
 */
export const usePendingCampaigns = (): UsePendingCampaignsResult => {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState<PendingCampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; campaigns?: {
          campaign_id?: string | number;
          id?: string | number;
          title: string;
          description: string;
          organizer_name?: string;
          category: string;
          goal_amount: string | number;
          created_at: string;
        }[] }>( '/campaigns?status=pending', {
          authToken: token,
        });
        const data = response.data ?? response.campaigns ?? [];
        setCampaigns(
          data.map((campaign) => ({
            id: String(campaign.id ?? campaign.campaign_id ?? ''),
            title: campaign.title,
            description: campaign.description,
            organizer_name: campaign.organizer_name ?? 'Organizer',
            category: campaign.category,
            goal_amount: Number(campaign.goal_amount) || 0,
            created_at: campaign.created_at,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pending campaigns');
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [token, refreshIndex]);

  return { campaigns, loading, error, reload: () => setRefreshIndex((value) => value + 1) };
};

/**
 * Fetch pending withdrawal requests
 */
export const usePendingWithdrawals = (): UsePendingWithdrawalsResult => {
  const { token } = useAuth();
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; withdrawals?: {
          withdrawal_id?: string | number;
          id?: string | number;
          campaign_title?: string;
          organizer_name?: string;
          campaign_id?: string | number;
          amount: string | number;
          bank_account?: string;
          campaign_bank_account?: string;
          status: 'pending' | 'approved' | 'rejected' | 'paid';
          request_date?: string;
          raised_amount?: string | number;
        }[] }>('/admin/withdrawals', {
          authToken: token,
        });
        const data = response.data ?? response.withdrawals ?? [];
        setWithdrawals(
          data
            .filter((withdrawal) => withdrawal.status === 'pending')
            .map((withdrawal) => ({
              id: String(withdrawal.id ?? withdrawal.withdrawal_id ?? ''),
              campaign_title: withdrawal.campaign_title ?? 'Campaign',
              organizer_name: withdrawal.organizer_name ?? 'Organizer',
              campaign_id: String(withdrawal.campaign_id ?? ''),
              amount: Number(withdrawal.amount) || 0,
              raised_amount: Number(withdrawal.raised_amount) || 0,
              bank_account: withdrawal.bank_account ?? '',
              campaign_bank_account: withdrawal.campaign_bank_account ?? '',
              status: withdrawal.status,
              created_at: withdrawal.request_date ?? new Date().toISOString(),
            }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pending withdrawals');
        setWithdrawals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [token, refreshIndex]);

  return { withdrawals, loading, error, reload: () => setRefreshIndex((value) => value + 1) };
};

/**
 * Approve a campaign
 */
export const useApproveCampaign = (): UseApproveCampaignResult => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveCampaign = async (campaignId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiRequest(`/admin/campaigns/${campaignId}/approve`, {
        method: 'PATCH',
        authToken: token,
        body: JSON.stringify({ status: 'active' }),
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve campaign';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, approveCampaign };
};

/**
 * Reject a campaign
 */
export const useRejectCampaign = (): UseRejectCampaignResult => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectCampaign = async (campaignId: string, reason: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiRequest(`/admin/campaigns/${campaignId}/approve`, {
        method: 'PATCH',
        authToken: token,
        body: JSON.stringify({ status: 'rejected', reason }),
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject campaign';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, rejectCampaign };
};

/**
 * Fetch pending comments that require admin moderation
 */
export const usePendingComments = (): UsePendingCommentsResult => {
  const { token } = useAuth();
  const [comments, setComments] = useState<PendingCommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const fetchPendingComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; comments?: {
          comment_id?: string | number;
          campaign_id: string | number;
          campaign_title?: string;
          user_name?: string;
          content?: string;
          moderation_reason?: string;
          created_at: string;
        }[] }>('/comments/pending/review', {
          authToken: token,
        });

        const rows = response.data ?? response.comments ?? [];
        setComments(
          rows.map((comment) => ({
            id: String(comment.comment_id ?? ''),
            campaign_id: String(comment.campaign_id),
            campaign_title: comment.campaign_title ?? 'Campaign',
            user_name: comment.user_name ?? 'Community member',
            message: comment.content ?? '',
            moderation_reason: comment.moderation_reason ?? 'Needs admin review',
            created_at: comment.created_at,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pending comments');
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingComments();
  }, [token, refreshIndex]);

  return { comments, loading, error, reload: () => setRefreshIndex((value) => value + 1) };
};

/**
 * Fetch all comments for admin override review
 */
export const useAdminComments = (): UseAdminCommentsResult => {
  const { token } = useAuth();
  const [comments, setComments] = useState<AdminCommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; comments?: {
          comment_id?: string | number;
          campaign_id: string | number;
          campaign_title?: string;
          user_name?: string;
          content?: string;
          moderation_status: 'approved' | 'pending_review' | 'rejected';
          moderation_reason?: string | null;
          moderation_score?: string | number | null;
          moderated_at?: string | null;
          created_at: string;
        }[] }>('/admin/comments', {
          authToken: token,
        });

        const rows = response.data ?? response.comments ?? [];
        setComments(
          rows.map((comment) => ({
            id: String(comment.comment_id ?? ''),
            campaign_id: String(comment.campaign_id),
            campaign_title: comment.campaign_title ?? 'Campaign',
            user_name: comment.user_name ?? 'Community member',
            message: comment.content ?? '',
            moderation_reason: comment.moderation_reason ?? 'No reason recorded',
            moderation_status: comment.moderation_status,
            moderation_score: comment.moderation_score === null || comment.moderation_score === undefined ? null : Number(comment.moderation_score),
            moderated_at: comment.moderated_at ?? null,
            created_at: comment.created_at,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin comments');
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [token, refreshIndex]);

  return { comments, loading, error, reload: () => setRefreshIndex((value) => value + 1) };
};

/**
 * Fetch recent admin activity logs
 */
export const useAdminActivityLogs = (): UseAdminActivityLogsResult => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AdminActivityLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; logs?: {
          log_id?: string | number;
          user_id?: string | number | null;
          user_name?: string | null;
          user_role?: string | null;
          activity: string;
          timestamp: string;
        }[] }>('/admin/activity-logs', {
          authToken: token,
        });

        const rows = response.data ?? response.logs ?? [];
        setLogs(
          rows.map((log) => ({
            id: String(log.log_id ?? ''),
            user_id: log.user_id === null || log.user_id === undefined ? null : String(log.user_id),
            user_name: log.user_name ?? null,
            user_role: log.user_role ?? null,
            activity: log.activity,
            timestamp: log.timestamp,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activity logs');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token, refreshIndex]);

  return { logs, loading, error, reload: () => setRefreshIndex((value) => value + 1) };
};

/**
 * Approve or reject a pending comment
 */
export const useReviewComment = (): UseReviewCommentResult => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviewComment = async (commentId: string, decision: 'approved' | 'rejected', reason?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiRequest(`/comments/${commentId}/review`, {
        method: 'PATCH',
        authToken: token,
        body: JSON.stringify({ decision, reason }),
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to review comment';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, reviewComment };
};

/**
 * Allow admin to approve or reject a withdrawal request.
 */
export interface UseUpdateWithdrawalStatusResult {
  loading: boolean;
  error: string | null;
  updateWithdrawalStatus: (withdrawalId: string, status: 'approved' | 'rejected') => Promise<boolean>;
}

interface UseContactMessagesResult {
  messages: ContactMessageResponse[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UseUpdateContactMessageStatusResult {
  loading: boolean;
  error: string | null;
  updateContactMessageStatus: (messageId: string, status: 'new' | 'read' | 'archived') => Promise<boolean>;
}

export const useUpdateWithdrawalStatus = (): UseUpdateWithdrawalStatusResult => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWithdrawalStatus = async (withdrawalId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiRequest(`/admin/withdrawals/${withdrawalId}/status`, {
        method: 'PATCH',
        authToken: token,
        body: JSON.stringify({ status }),
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update withdrawal status';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, updateWithdrawalStatus };
};

/**
 * Fetch contact form messages for admin support inbox
 */
export const useContactMessages = (status?: 'new' | 'read' | 'archived'): UseContactMessagesResult => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const query = status ? `?status=${status}` : '';
        const response = await apiRequest<{ success?: boolean; data?: {
          message_id?: string | number;
          id?: string | number;
          name: string;
          email: string;
          message: string;
          status: 'new' | 'read' | 'archived';
          created_at: string;
        }[] }>(`/admin/contact-messages${query}`, {
          authToken: token,
        });
        const rows = response.data ?? [];
        setMessages(
          rows.map((row) => ({
            id: String(row.message_id ?? row.id ?? ''),
            name: row.name,
            email: row.email,
            message: row.message,
            status: row.status,
            created_at: row.created_at,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contact messages');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchMessages();
  }, [token, status, refreshIndex]);

  return { messages, loading, error, reload: () => setRefreshIndex((value) => value + 1) };
};

/**
 * Update contact message status (new, read, archived)
 */
export const useUpdateContactMessageStatus = (): UseUpdateContactMessageStatusResult => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateContactMessageStatus = async (
    messageId: string,
    status: 'new' | 'read' | 'archived'
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiRequest(`/admin/contact-messages/${messageId}/status`, {
        method: 'PATCH',
        authToken: token,
        body: JSON.stringify({ status }),
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update contact message';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, updateContactMessageStatus };
};
