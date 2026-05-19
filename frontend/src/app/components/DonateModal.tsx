import { useState } from 'react';
import { X, CreditCard, Smartphone } from 'lucide-react';
import { Campaign } from '../data/mockData';
import { User } from '../App';
import { toast } from 'sonner';

interface DonateModalProps {
  campaign: Campaign;
  onClose: () => void;
  currentUser: User | null;
}

export function DonateModal({ campaign, onClose, currentUser }: DonateModalProps) {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  const suggestedAmounts = [100, 500, 1000, 5000, 10000];

  const handleDonate = () => {
    const donationAmount = amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount);
    
    if (!donationAmount || donationAmount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (!currentUser) {
      toast.error('Please log in to donate.');
      return;
    }

    // In a real app, this would process the payment
    toast.success(`Thank you for your donation of ETB ${donationAmount.toLocaleString()}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Make a Donation</h2>
            <p className="text-sm text-gray-600">{campaign.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Amount Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Amount (ETB)
            </label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {suggestedAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setAmount(amt.toString()); setCustomAmount(''); }}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    amount === amt.toString()
                      ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  ETB {amt.toLocaleString()}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAmount('custom')}
              className={`w-full py-3 px-4 rounded-lg border-2 transition-all ${
                amount === 'custom'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-300'
              }`}
            >
              Custom Amount
            </button>
            {amount === 'custom' && (
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter custom amount"
                className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('telebirr')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'telebirr'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <Smartphone className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold">Telebirr</div>
                  <div className="text-sm text-gray-600">Pay with Telebirr mobile money</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('cbe')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'cbe'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <CreditCard className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold">CBE Birr</div>
                  <div className="text-sm text-gray-600">Pay with CBE Birr digital wallet</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('chapa')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'chapa'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <CreditCard className="w-6 h-6 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold">Chapa</div>
                  <div className="text-sm text-gray-600">Pay with Chapa payment gateway</div>
                </div>
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message of support..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Anonymous Option */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Make this donation anonymous</span>
            </label>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Donation Amount:</span>
              <span className="font-semibold text-lg">
                ETB {(amount === 'custom' ? (customAmount || '0') : (amount || '0')).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold capitalize">{paymentMethod}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDonate}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all shadow-md"
            >
              Donate Now
            </button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Your payment information is secure and encrypted. All donations are final.
          </p>
        </div>
      </div>
    </div>
  );
}
