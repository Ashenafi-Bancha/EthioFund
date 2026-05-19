import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

export interface AdminStatsResponse {
  users: number;
  campaigns: number;
  donations: number;
  withdrawals: number;
}

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
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  created_at: string;
}

interface UseAdminStatsResult {
  stats: AdminStatsResponse | null;
  loading: boolean;
  error: string | null;
}

interface UsePendingCampaignsResult {
  campaigns: PendingCampaignResponse[];
  loading: boolean;
  error: string | null;
}

interface UsePendingWithdrawalsResult {
  withdrawals: PendingWithdrawalResponse[];
  loading: boolean;
  error: string | null;
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

/**
 * Fetch admin dashboard stats
 */
export const useAdminStats = (): UseAdminStatsResult => {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; stats?: AdminStatsResponse }>('/admin/stats');
        setStats(response.stats ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin stats');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

/**
 * Fetch pending campaign approvals
 */
export const usePendingCampaigns = (): UsePendingCampaignsResult => {
  const [campaigns, setCampaigns] = useState<PendingCampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        }[] }>( '/campaigns?status=pending');
        const data = response.campaigns ?? [];
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
  }, []);

  return { campaigns, loading, error };
};

/**
 * Fetch pending withdrawal requests
 */
export const usePendingWithdrawals = (): UsePendingWithdrawalsResult => {
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          amount: string | number;
          bank_account?: string;
          status: 'pending' | 'approved' | 'rejected' | 'paid';
          request_date?: string;
        }[] }>('/admin/withdrawals');
        const data = response.withdrawals ?? [];
        setWithdrawals(
          data.map((withdrawal) => ({
            id: String(withdrawal.id ?? withdrawal.withdrawal_id ?? ''),
            campaign_title: withdrawal.campaign_title ?? 'Campaign',
            organizer_name: withdrawal.organizer_name ?? 'Organizer',
            amount: Number(withdrawal.amount) || 0,
            bank_account: withdrawal.bank_account ?? '',
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
  }, []);

  return { withdrawals, loading, error };
};

/**
 * Approve a campaign
 */
export const useApproveCampaign = (): UseApproveCampaignResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveCampaign = async (campaignId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiRequest(`/admin/campaigns/${campaignId}/approve`, {
        method: 'PATCH',
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectCampaign = async (campaignId: string, reason: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiRequest(`/admin/campaigns/${campaignId}/approve`, {
        method: 'PATCH',
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
