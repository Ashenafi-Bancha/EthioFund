import { useState } from "react";
import { X, Loader, Heart } from "lucide-react";
import { toast } from "sonner";
import { Campaign } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { useInitiateDonation } from "../hooks/useDonations";

interface DonateModalProps {
  campaign: Campaign;
  onClose: () => void;
}

export function DonateModal({
  campaign,
  onClose,
}: DonateModalProps) {
  const { user } = useAuth();
  const { initiateDonation, loading } = useInitiateDonation();

  const [amount, setAmount] = useState("");

  const handleDonate = async () => {
    const donationAmount = Number(amount);

    if (!donationAmount || donationAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!user) {
      toast.error("Please sign in to donate");
      return;
    }

    const result = await initiateDonation({
      campaign_id: campaign.id,
      amount: donationAmount,
    });

    if (!result?.payment?.checkoutUrl) {
      toast.error("Unable to start payment");
      return;
    }

    toast.success("Redirecting to payment...");
    window.location.href = result.payment.checkoutUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <Heart className="h-7 w-7 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Support This Campaign
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {campaign.title}
          </p>
        </div>

        {/* Amount Input */}
        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Donation Amount (ETB)
          </label>

          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full rounded-2xl border border-gray-300 px-4 py-4 text-lg outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />
        </div>

        {/* Login Warning */}
        {!user && (
          <p className="mt-3 text-center text-sm text-amber-600">
            Please sign in before donating.
          </p>
        )}

        {/* Donate Button */}
        <button
          onClick={handleDonate}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-green-600 py-4 font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Donate Now"
          )}
        </button>
      </div>
    </div>
  );
}