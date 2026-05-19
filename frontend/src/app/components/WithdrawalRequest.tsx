import { useMemo, useState } from 'react';
import { ArrowLeft, DollarSign, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useUserCampaigns } from '../hooks/useCampaigns';
import { useRequestWithdrawal } from '../hooks/useWithdrawals';
import { useAuth } from '../context/AuthContext';

interface WithdrawalRequestProps {
  onNavigate: (page: string) => void;
}

export function WithdrawalRequest({ onNavigate }: WithdrawalRequestProps) {
  const { user } = useAuth();
  const { campaigns: userCampaigns, loading: campaignsLoading } = useUserCampaigns();
  const { requestWithdrawal, loading } = useRequestWithdrawal();
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [reason, setReason] = useState('');

  const eligibleCampaigns = useMemo(
    () => userCampaigns.filter((campaign) => campaign.status === 'active' && campaign.raised_amount > 0),
    [userCampaigns]
  );

  const selectedCampaignData = eligibleCampaigns.find((campaign) => campaign.id === selectedCampaign);
  const maxWithdrawal = selectedCampaignData?.raised_amount || 0;

  if (!user) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedCampaign || !amount || !bankAccount || !reason) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const withdrawalAmount = Number.parseFloat(amount);
    if (!withdrawalAmount || withdrawalAmount <= 0 || withdrawalAmount > maxWithdrawal) {
      toast.error(`Please enter a valid amount up to ETB ${maxWithdrawal.toLocaleString()}.`);
      return;
    }

    const result = await requestWithdrawal({
      campaign_id: selectedCampaign,
      amount: withdrawalAmount,
      bank_account: bankAccount,
      reason,
    });

    if (result) {
      toast.success('Withdrawal request submitted successfully.');
      onNavigate('organizer-dashboard');
    } else {
      toast.error('Failed to submit withdrawal request.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <button type="button" onClick={() => onNavigate('organizer-dashboard')} className="mb-4 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <p className="mb-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">Funds transfer</p>
          <h1 className="text-3xl font-bold text-gray-900">Request withdrawal</h1>
          <p className="mt-2 text-gray-600">Request a bank transfer from your approved campaign funds.</p>
        </div>

        <div className="mb-6 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="mb-1 font-semibold">Withdrawal guidelines</p>
            <ul className="list-inside list-disc space-y-1 text-blue-800">
              <li>Only active campaigns with raised funds can request withdrawals.</li>
              <li>All requests are reviewed by the admin team.</li>
              <li>Use a valid bank account and a clear explanation of how funds will be used.</li>
            </ul>
          </div>
        </div>

        {campaignsLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-10 text-gray-600 shadow-md">
            <Loader className="h-5 w-5 animate-spin" />
            Loading your campaigns...
          </div>
        ) : eligibleCampaigns.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-md">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Select campaign *</label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                required
              >
                <option value="">Choose a campaign</option>
                {eligibleCampaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title} (Available: ETB {campaign.raised_amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {selectedCampaignData && (
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="grid gap-4 md:grid-cols-3 text-sm">
                  <div>
                    <span className="text-gray-600">Total raised</span>
                    <div className="font-semibold text-gray-900">ETB {selectedCampaignData.raised_amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Goal</span>
                    <div className="font-semibold text-gray-900">ETB {selectedCampaignData.goal_amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Progress</span>
                    <div className="font-semibold text-gray-900">
                      {Math.round((selectedCampaignData.raised_amount / selectedCampaignData.goal_amount) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Withdrawal amount (ETB) *</label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  placeholder="Enter amount"
                  max={maxWithdrawal}
                  required
                />
              </div>
              {selectedCampaignData && <p className="mt-1 text-xs text-gray-500">Maximum available: ETB {maxWithdrawal.toLocaleString()}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Bank account number *</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                placeholder="e.g., CBE - 1000123456789"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Reason for withdrawal *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                placeholder="Explain how the funds will be used..."
                required
              />
            </div>

            {amount && selectedCampaignData && Number.parseFloat(amount) > 0 && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                <h3 className="mb-3 font-semibold text-green-900">Withdrawal summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Campaign</span>
                    <span className="font-semibold text-green-900">{selectedCampaignData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Withdrawal amount</span>
                    <span className="font-semibold text-green-900">ETB {Number.parseFloat(amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <button type="button" onClick={() => onNavigate('organizer-dashboard')} className="flex-1 rounded-2xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/20 transition-all hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Submitting...' : 'Submit request'}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">You need an active campaign with raised funds before you can request a withdrawal.</p>
          </div>
        )}
      </div>
    </div>
  );
}
