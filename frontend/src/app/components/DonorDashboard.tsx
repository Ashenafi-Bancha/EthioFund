import { useMemo } from 'react';
import { Heart, TrendingUp, Calendar, MessageCircle, Loader } from 'lucide-react';
import { useUserDonations } from '../hooks/useDonations';
import { useCampaigns } from '../hooks/useCampaigns';
import { useAuth } from '../context/AuthContext';

interface DonorDashboardProps {
  onViewCampaign: (campaignId: string) => void;
}

export function DonorDashboard({ onViewCampaign }: DonorDashboardProps) {
  const { user: currentUser } = useAuth();
  const { donations: userDonations, loading: donationsLoading } = useUserDonations();
  const { campaigns, loading: campaignsLoading } = useCampaigns({ status: 'active' });

  const supportedCampaignIds = useMemo(() => new Set(userDonations.map((donation) => donation.campaign_id)), [userDonations]);
  const supportedCampaigns = useMemo(
    () => campaigns.filter((campaign) => supportedCampaignIds.has(campaign.id)),
    [campaigns, supportedCampaignIds]
  );

  const totalDonated = userDonations.reduce((sum, donation) => sum + donation.amount, 0);

  const stats = [
    { label: 'Total Donated', value: `ETB ${totalDonated.toLocaleString()}`, icon: Heart, color: 'green' },
    { label: 'Campaigns Supported', value: supportedCampaignIds.size.toString(), icon: TrendingUp, color: 'blue' },
    { label: 'Total Donations', value: userDonations.length.toString(), icon: Calendar, color: 'purple' },
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome back, {currentUser.name}!</p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={index} className="rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-xl bg-${stat.color}-50 p-3`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Donation History</h2>
          </div>
          {donationsLoading ? (
            <div className="flex items-center justify-center gap-2 px-6 py-8 text-gray-600">
              <Loader className="h-5 w-5 animate-spin" />
              Loading your donations...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userDonations.length > 0 ? (
                    userDonations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <button onClick={() => onViewCampaign(donation.campaign_id)} className="font-medium text-green-600 hover:text-green-700">
                            {donation.campaign_title}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">ETB {donation.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-700">{donation.payment_method || 'Chapa'}</td>
                        <td className="px-6 py-4 text-gray-700">{new Date(donation.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                              donation.status === 'successful'
                                ? 'bg-green-100 text-green-700'
                                : donation.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No donations yet. Start supporting campaigns today!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your Supported Campaigns</h2>
            {campaignsLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader className="h-4 w-4 animate-spin" />
                Loading campaigns...
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {supportedCampaigns.length > 0 ? (
              supportedCampaigns.map((campaign) => {
                const progress = (campaign.raised_amount / campaign.goal_amount) * 100;
                const userContribution = userDonations
                  .filter((donation) => donation.campaign_id === campaign.id)
                  .reduce((sum, donation) => sum + donation.amount, 0);
                const daysLeft = Math.max(
                  0,
                  Math.ceil((new Date(campaign.created_at).getTime() + campaign.duration_days * 86400000 - Date.now()) / 86400000)
                );

                return (
                  <button
                    key={campaign.id}
                    type="button"
                    onClick={() => onViewCampaign(campaign.id)}
                    className="overflow-hidden rounded-2xl border border-gray-200 text-left transition-shadow hover:shadow-lg"
                  >
                    <img src={campaign.image_url} alt={campaign.title} className="h-36 w-full object-cover" />
                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">{campaign.title}</h3>
                      <div className="mb-3 text-sm text-gray-600">
                        Your contribution: <span className="font-semibold text-green-600">ETB {userContribution.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-600" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{Math.round(progress)}% funded</span>
                        <span>{daysLeft} days left</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full py-10 text-center text-gray-500">
                <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p>You haven't supported any campaigns yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
