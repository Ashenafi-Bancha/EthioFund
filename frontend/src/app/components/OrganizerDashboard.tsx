import { useMemo } from 'react';
import { Plus, TrendingUp, Users, DollarSign, Eye, Edit, Clock, Loader } from 'lucide-react';
import { useUserCampaigns } from '../hooks/useCampaigns';
import { useUserWithdrawals } from '../hooks/useWithdrawals';
import { useAuth } from '../context/AuthContext';

interface OrganizerDashboardProps {
  onNavigate: (page: string) => void;
  onViewCampaign: (campaignId: string) => void;
}

export function OrganizerDashboard({ onNavigate, onViewCampaign }: OrganizerDashboardProps) {
  const { user: currentUser } = useAuth();
  const { campaigns: userCampaigns, loading: campaignsLoading } = useUserCampaigns();
  const { withdrawals: userWithdrawals, loading: withdrawalsLoading } = useUserWithdrawals();

  const totalRaised = useMemo(() => userCampaigns.reduce((sum, campaign) => sum + campaign.raised_amount, 0), [userCampaigns]);
  const totalDonors = useMemo(() => userCampaigns.reduce((sum, campaign) => sum + campaign.donor_count, 0), [userCampaigns]);
  const activeCampaigns = useMemo(() => userCampaigns.filter((campaign) => campaign.status === 'active').length, [userCampaigns]);

  if (!currentUser) {
    return null;
  }

  const stats = [
    { label: 'Total Raised', value: `ETB ${totalRaised.toLocaleString()}`, icon: DollarSign, tone: 'green' },
    { label: 'Active Campaigns', value: activeCampaigns.toString(), icon: TrendingUp, tone: 'blue' },
    { label: 'Total Donors', value: totalDonors.toString(), icon: Users, tone: 'purple' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">Organizer workspace</p>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser.name}</h1>
            <p className="mt-2 text-lg text-gray-600">Manage your campaigns, withdrawals, and donor activity from one place.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('create-campaign')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-green-600/20 transition-all hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="h-5 w-5" />
            Create campaign
          </button>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-gray-50 p-3">
                  <stat.icon className={`h-6 w-6 ${stat.tone === 'green' ? 'text-green-600' : stat.tone === 'blue' ? 'text-blue-600' : 'text-purple-600'}`} />
                </div>
              </div>
              <div className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">My campaigns</h2>
            {campaignsLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader className="h-4 w-4 animate-spin" />
                Loading campaigns...
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Goal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Raised</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Donors</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userCampaigns.length > 0 ? (
                  userCampaigns.map((campaign) => {
                    const progress = campaign.goal_amount > 0 ? (campaign.raised_amount / campaign.goal_amount) * 100 : 0;
                    return (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={campaign.image_url} alt={campaign.title} className="h-12 w-12 rounded-xl object-cover" />
                            <div>
                              <div className="font-semibold text-gray-900">{campaign.title}</div>
                              <div className="text-sm text-gray-500">{campaign.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">ETB {campaign.goal_amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">ETB {campaign.raised_amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{Math.round(progress)}%</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{campaign.donor_count}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-sm font-medium ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => onViewCampaign(campaign.id)} className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button type="button" className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100" title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      <Plus className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                      <p className="mb-2">No campaigns yet.</p>
                      <button type="button" onClick={() => onNavigate('create-campaign')} className="font-medium text-green-600 hover:text-green-700">
                        Create your first campaign
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Withdrawal requests</h2>
            <button type="button" onClick={() => onNavigate('withdrawal-request')} className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700">
              Request withdrawal
            </button>
          </div>
          {withdrawalsLoading ? (
            <div className="flex items-center justify-center gap-2 px-6 py-8 text-gray-600">
              <Loader className="h-5 w-5 animate-spin" />
              Loading withdrawals...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Bank Account</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userWithdrawals.length > 0 ? (
                    userWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{withdrawal.campaign_title}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">ETB {withdrawal.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{withdrawal.bank_account || 'Not provided'}</td>
                        <td className="px-6 py-4 text-gray-700">{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-sm font-medium ${withdrawal.status === 'approved' ? 'bg-green-100 text-green-700' : withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No withdrawal requests yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
