import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

type CampaignApiRow = {
  id?: string;
  campaign_id?: string | number;
  title: string;
  description: string;
  story?: string;
  category: string;
  location?: string;
  goal_amount: string | number;
  raised_amount: string | number;
  image_url?: string;
  status: 'pending' | 'approved' | 'active' | 'closed' | 'rejected' | 'suspended';
  organizer_id: string | number;
  organizer_name?: string;
  created_at: string;
  duration_days?: string | number;
  verified?: boolean;
  donor_count?: string | number;
};

const defaultCampaignImage = 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80';

const normalizeCampaign = (campaign: CampaignApiRow): CampaignResponse => {
  const statusMap: Record<CampaignApiRow['status'], CampaignResponse['status']> = {
    pending: 'pending',
    approved: 'active',
    active: 'active',
    closed: 'completed',
    rejected: 'cancelled',
    suspended: 'cancelled',
  };

  return {
    id: String(campaign.id ?? campaign.campaign_id ?? ''),
    title: campaign.title,
    description: campaign.description,
    story: campaign.story ?? campaign.description,
    category: campaign.category,
    location: campaign.location ?? 'Ethiopia',
    goal_amount: Number(campaign.goal_amount) || 0,
    raised_amount: Number(campaign.raised_amount) || 0,
    image_url: campaign.image_url || defaultCampaignImage,
    status: statusMap[campaign.status] ?? 'active',
    organizer_id: String(campaign.organizer_id),
    organizer_name: campaign.organizer_name ?? 'Organizer',
    created_at: campaign.created_at,
    duration_days: Number(campaign.duration_days) || 30,
    verified: Boolean(campaign.verified),
    donor_count: Number(campaign.donor_count) || 0,
    share_count: Number((campaign as any).share_count) || 0,
  };
};

export interface CampaignResponse {
  id: string;
  title: string;
  description: string;
  story: string;
  category: string;
  location: string;
  goal_amount: number;
  raised_amount: number;
  image_url: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  organizer_id: string;
  organizer_name: string;
  created_at: string;
  duration_days: number;
  verified: boolean;
  donor_count: number;
  share_count: number;
}

export interface CreateCampaignInput {
  title: string;
  description: string;
  story: string;
  category: string;
  location: string;
  goal_amount: number;
  duration_days: number;
  image_url?: string;
}

interface UseCampaignsResult {
  campaigns: CampaignResponse[];
  loading: boolean;
  error: string | null;
}

interface UseCampaignDetailResult {
  campaign: CampaignResponse | null;
  loading: boolean;
  error: string | null;
}

interface UseCreateCampaignResult {
  loading: boolean;
  error: string | null;
  createCampaign: (data: CreateCampaignInput) => Promise<CampaignResponse | null>;
}

/**
 * Fetch all campaigns with optional filters
 */
export const useCampaigns = (
  filters?: {
    status?: string;
    category?: string;
    search?: string;
  }
): UseCampaignsResult => {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const query = new URLSearchParams();
        if (filters?.status) query.append('status', filters.status);
        if (filters?.category) query.append('category', filters.category);
        if (filters?.search) query.append('search', filters.search);
        
        const url = `/campaigns${query.toString() ? '?' + query.toString() : ''}`;
        const response = await apiRequest<{ success?: boolean; campaigns?: CampaignApiRow[] } | CampaignApiRow[]>(url);
        const data = Array.isArray(response) ? response : response.campaigns ?? [];
        setCampaigns(data.map(normalizeCampaign));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [filters?.status, filters?.category, filters?.search]);

  return { campaigns, loading, error };
};

/**
 * Fetch a single campaign by ID
 */
export const useCampaignDetail = (campaignId: string | null): UseCampaignDetailResult => {
  const [campaign, setCampaign] = useState<CampaignResponse | null>(null);
  const [loading, setLoading] = useState(!!campaignId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setCampaign(null);
      setLoading(false);
      return;
    }

    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; campaign?: CampaignApiRow } | CampaignApiRow>(`/campaigns/${campaignId}`);
        const data = Array.isArray(response) ? response[0] : 'campaign' in response ? response.campaign : response;
        setCampaign(normalizeCampaign(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch campaign');
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  return { campaign, loading, error };
};

/**
 * Create a new campaign
 */
export const useCreateCampaign = (): UseCreateCampaignResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCampaign = async (data: CreateCampaignInput): Promise<CampaignResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest<{ success?: boolean; campaign?: CampaignApiRow }>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return normalizeCampaign(response.campaign as CampaignApiRow);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create campaign';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createCampaign };
};

/**
 * Get campaigns created by current user (organizer)
 */
export const useUserCampaigns = (): UseCampaignsResult => {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<{ success?: boolean; campaigns?: CampaignApiRow[] } | CampaignApiRow[]>('/campaigns/my');
        const data = Array.isArray(response) ? response : response.campaigns ?? [];
        setCampaigns(data.map(normalizeCampaign));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCampaigns();
  }, []);

  return { campaigns, loading, error };
};
