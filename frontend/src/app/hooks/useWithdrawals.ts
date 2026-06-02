import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

type WithdrawalApiRow = {
  id?: string;
  withdrawal_id?: string | number;
  organizer_id?: string | number;
  campaign_id: string | number;
  campaign_title?: string;
  organizer_name?: string;
  amount: string | number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  bank_account?: string | null;
  reason?: string | null;
  request_date?: string;
  updated_at?: string;
};

const normalizeWithdrawal = (withdrawal: WithdrawalApiRow): WithdrawalResponse => ({
  id: String(withdrawal.id ?? withdrawal.withdrawal_id ?? ''),
  organizer_id: String(withdrawal.organizer_id ?? ''),
  campaign_id: String(withdrawal.campaign_id),
  campaign_title: withdrawal.campaign_title ?? 'Campaign',
  amount: Number(withdrawal.amount) || 0,
  status: withdrawal.status,
  bank_account: withdrawal.bank_account ?? '',
  reason: withdrawal.reason ?? '',
  created_at: withdrawal.request_date ?? new Date().toISOString(),
  updated_at: withdrawal.updated_at ?? withdrawal.request_date ?? new Date().toISOString(),
});

export interface WithdrawalResponse {
  id: string;
  organizer_id: string;
  campaign_id: string;
  campaign_title: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  bank_account: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWithdrawalInput {
  campaign_id: string;
  amount: number;
  bank_account: string;
  reason: string;
}

interface UseWithdrawalsResult {
  withdrawals: WithdrawalResponse[];
  loading: boolean;
  error: string | null;
}

interface UseRequestWithdrawalResult {
  loading: boolean;
  error: string | null;
  requestWithdrawal: (data: CreateWithdrawalInput) => Promise<WithdrawalResponse | null>;
}

/**
 * Fetch withdrawals for current organizer
 */
export const useUserWithdrawals = (): UseWithdrawalsResult => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        if (!token) {
          setWithdrawals([]);
          setError(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; withdrawals?: WithdrawalApiRow[] } | WithdrawalApiRow[]>('/withdrawals/my', {
          authToken: token,
        });
        const data = Array.isArray(response) ? response : response.data ?? response.withdrawals ?? [];
        setWithdrawals(data.map(normalizeWithdrawal));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch withdrawals');
        setWithdrawals([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchWithdrawals();
  }, [token]);

  return { withdrawals, loading, error };
};

/**
 * Request a withdrawal
 */
export const useRequestWithdrawal = (): UseRequestWithdrawalResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const requestWithdrawal = async (data: CreateWithdrawalInput): Promise<WithdrawalResponse | null> => {
    try {
      if (!token) {
        setError('Please sign in again to request a withdrawal.');
        return null;
      }

      setLoading(true);
      setError(null);
      const response = await apiRequest<{ success?: boolean; data?: WithdrawalApiRow; withdrawal?: WithdrawalApiRow }>('/withdrawals', {
        method: 'POST',
        body: JSON.stringify(data),
        authToken: token,
      });
      const withdrawal = response.data ?? response.withdrawal;
      if (!withdrawal) {
        return null;
      }

      return normalizeWithdrawal(withdrawal);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request withdrawal';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, requestWithdrawal };
};
