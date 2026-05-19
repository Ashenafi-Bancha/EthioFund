import { useState } from 'react';
import { X, Heart, Shield, Smartphone, CheckCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Campaign } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useInitiateDonation } from '../hooks/useDonations';

interface EnhancedDonateModalProps {
  campaign: Campaign;
  onClose: () => void;
}

export function EnhancedDonateModal({ campaign, onClose }: EnhancedDonateModalProps) {
  const { user } = useAuth();
  const { initiateDonation, loading } = useInitiateDonation();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  const suggestedAmounts = [100, 500, 1000, 2500, 5000];

  const getDonationAmount = () => {
    return amount === 'custom' ? parseFloat(customAmount) || 0 : parseFloat(amount) || 0;
  };

  const handleDonate = async () => {
    const donationAmount = getDonationAmount();

    if (!donationAmount || donationAmount <= 0) {
      toast.error('Please enter a valid donation amount.');
      return;
    }

    if (!user) {
      toast.error('Please log in to donate.');
      return;
    }

    const result = await initiateDonation({
      campaign_id: campaign.id,
      amount: donationAmount,
      anonymous,
      message: message.trim() || undefined,
    });

    if (!result) {
      toast.error('Could not start the donation. Please try again.');
      return;
    }

    toast.success('Donation started successfully. Redirecting to Chapa checkout...');

    if (result.payment.checkoutUrl) {
      window.location.href = result.payment.checkoutUrl;
      return;
    }

    toast.error('Checkout link was not returned. Please try again.');

    setTimeout(() => onClose(), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
              Chapa Secure Checkout
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Support this campaign</h2>
            <p className="mt-1 text-sm text-gray-600">{campaign.title}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 overflow-y-auto px-6 py-6">
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-700">Select Amount (ETB)</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {suggestedAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(String(preset));
                      setCustomAmount('');
                    }}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${amount === String(preset) ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/60'}`}
                  >
                    ETB {preset.toLocaleString()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount('custom')}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${amount === 'custom' ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/60'}`}
                >
                  Custom
                </button>
              </div>
              {amount === 'custom' && (
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  className="mt-3 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Shield className="h-4 w-4 text-green-600" />
                    Donate anonymously
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Your name will not be shown publicly on the campaign page.</p>
                </div>
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Message for the organizer (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Leave a note of encouragement or support..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gradient-to-br from-green-50 via-white to-blue-50 px-6 py-6 lg:border-l lg:border-t-0">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Heart className="h-4 w-4 text-green-600" />
                Donation summary
              </div>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Campaign</span>
                  <span className="max-w-[160px] truncate font-medium text-gray-900">{campaign.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Amount</span>
                  <span className="font-semibold text-gray-900">ETB {getDonationAmount().toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment gateway</span>
                  <span className="font-semibold text-green-700">Chapa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment method</span>
                  <span className="font-semibold text-gray-900">Telebirr / card / wallet</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
                Chapa will open a secure checkout so you can complete the donation.
              </div>

              <button
                type="button"
                onClick={handleDonate}
                disabled={loading}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-green-600/20 transition-all hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                {loading ? 'Starting checkout...' : 'Continue to Chapa'}
              </button>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Secure payment processing for Ethiopia and diaspora supporters.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
