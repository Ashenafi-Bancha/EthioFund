import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type DonationApiRow = {
  id?: string;
  donation_id?: string | number;
  campaign_id: string | number;
  campaign_title?: string;
  donor_id?: string | number;
  donor_name?: string;
  amount: string | number;
  status?: 'pending' | 'successful' | 'failed' | 'refunded';
  payment_status?: 'pending' | 'successful' | 'failed';
  payment_method?: string;
  anonymous?: boolean;
  is_anonymous?: boolean;
  message?: string | null;
  created_at?: string;
  donation_date?: string;
};

const normalizeDonation = (donation: DonationApiRow): DonationResponse => ({
  id: String(donation.id ?? donation.donation_id ?? ''),
  campaign_id: String(donation.campaign_id),
  campaign_title: donation.campaign_title ?? 'Campaign',
  donor_id: String(donation.donor_id ?? ''),
  donor_name: donation.donor_name ?? 'You',
  amount: Number(donation.amount) || 0,
  status: donation.status ?? (donation.payment_status || 'pending'),
  payment_method: donation.payment_method ?? 'Chapa',
  anonymous: Boolean(donation.anonymous ?? donation.is_anonymous),
  message: donation.message ?? null,
  created_at: donation.created_at ?? donation.donation_date ?? new Date().toISOString(),
});

export interface DonationResponse {
  id: string;
  campaign_id: string;
  campaign_title: string;
  donor_id: string;
  donor_name: string;
  amount: number;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  payment_method: string;
  anonymous: boolean;
  message: string | null;
  created_at: string;
}

export interface CreateDonationInput {
  campaign_id: string;
  amount: number;
  anonymous?: boolean;
  message?: string;
}

interface UseDonationsResult {
  donations: DonationResponse[];
  loading: boolean;
  error: string | null;
}

interface UseInitiateDonationResult {
  loading: boolean;
  error: string | null;
  initiateDonation: (data: CreateDonationInput) => Promise<{ donation: DonationResponse; payment: { txRef: string; checkoutUrl: string | null } } | null>;
}

/**
 * Fetch donations for current user (donor)
 */
export const useUserDonations = (): UseDonationsResult => {
  const { token } = useAuth();
  const [donations, setDonations] = useState<DonationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; data?: DonationApiRow[]; donations?: DonationApiRow[] } | DonationApiRow[]>('/donations/my-donations', {
          authToken: token,
        });
        const data = Array.isArray(response) ? response : response.data ?? response.donations ?? [];
        setDonations(data.map(normalizeDonation));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch donations');
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [token]);

  return { donations, loading, error };
};

/**
 * Fetch donations for a specific campaign
 */
export const useCampaignDonations = (campaignId: string | null): UseDonationsResult => {
  const [donations, setDonations] = useState<DonationResponse[]>([]);
  const [loading, setLoading] = useState(!!campaignId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setDonations([]);
      setLoading(false);
      return;
    }

    const fetchDonations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; data?: DonationApiRow[]; donations?: DonationApiRow[] } | DonationApiRow[]>(`/donations/campaign/${campaignId}`);
        const data = Array.isArray(response) ? response : response.data ?? response.donations ?? [];
        setDonations(data.map(normalizeDonation));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch donations');
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [campaignId]);

  return { donations, loading, error };
};

/**
 * Initiate a donation (get Chapa payment link)
 */
export const useInitiateDonation = (): UseInitiateDonationResult => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateDonation = async (data: CreateDonationInput): Promise<{ donation: DonationResponse; payment: { txRef: string; checkoutUrl: string | null } } | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest<{
        success?: boolean;
        data?: { checkout_url: string; tx_ref: string; donation_id?: number };
        donation?: DonationApiRow;
        payment?: { txRef: string; checkoutUrl: string | null };
      }>('/payments/initialize', {
        method: 'POST',
        authToken: token,
        body: JSON.stringify({
          campaign_id: data.campaign_id,
          amount: data.amount,
          is_anonymous: data.anonymous ?? false,
          message: data.message,
        }),
      });

      const checkoutUrl = response.data?.checkout_url ?? response.payment?.checkoutUrl ?? null;
      const txRef = response.data?.tx_ref ?? response.payment?.txRef ?? '';

      if (!checkoutUrl) {
        return null;
      }

      return {
        donation: normalizeDonation({
          donation_id: response.data?.donation_id ?? '',
          campaign_id: data.campaign_id,
          amount: data.amount,
          is_anonymous: data.anonymous,
        }),
        payment: { txRef, checkoutUrl },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initiate donation';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, initiateDonation };
};
