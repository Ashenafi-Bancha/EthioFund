import { useState } from 'react';
import { X, Loader, Heart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { CampaignResponse } from '../hooks/useCampaigns';
import { useAuth } from '../context/AuthContext';
import { useInitiateDonation } from '../hooks/useDonations';

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000, 2500];

interface DonateModalProps {
  campaign: CampaignResponse;
  onClose: () => void;
}

export function DonateModal({ campaign, onClose }: DonateModalProps) {
  const { user } = useAuth();
  const { initiateDonation, loading } = useInitiateDonation();
  const [amount, setAmount] = useState('');

  const progress =
    campaign.goal_amount > 0
      ? Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)
      : 0;

  const handleDonate = async () => {
    const donationAmount = Number(amount);

    if (!donationAmount || donationAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!user) {
      toast.error('Please sign in to donate');
      return;
    }

    const result = await initiateDonation({
      campaign_id: campaign.id,
      amount: donationAmount,
    });

    if (!result?.payment?.checkoutUrl) {
      toast.error('Unable to start payment');
      return;
    }

    toast.success('Redirecting to payment...');
    window.location.href = result.payment.checkoutUrl;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donate-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(92dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h2 id="donate-modal-title" className="text-base font-semibold text-gray-900">
            Donate
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="mb-4 flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Heart className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-gray-900">{campaign.title}</p>
              <p className="mt-1 text-xs text-gray-500">
                ETB {campaign.raised_amount.toLocaleString()} raised · {Math.round(progress)}% of goal
              </p>
            </div>
          </div>

          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <label className="mb-2 block text-sm font-medium text-gray-700">Choose amount (ETB)</label>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(String(value))}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                  amount === String(value)
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-green-300 hover:bg-green-50/50'
                }`}
              >
                {value.toLocaleString()}
              </button>
            ))}
          </div>

          <label htmlFor="donate-custom-amount" className="mb-1.5 block text-sm font-medium text-gray-700">
            Or enter custom amount
          </label>
          <input
            id="donate-custom-amount"
            type="number"
            min={1}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ETB"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />

          {!user && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-800">
              Sign in to complete your donation securely via Chapa.
            </p>
          )}

          <p className="mt-3 text-center text-xs text-gray-500">
            You will be redirected to Chapa to pay safely.
          </p>
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => void handleDonate()}
            disabled={loading || !amount}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4" />
                Donate {amount ? `ETB ${Number(amount).toLocaleString()}` : 'now'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
