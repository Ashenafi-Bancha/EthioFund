import { CheckCircle2, Home, LayoutDashboard } from 'lucide-react';

interface PaymentSuccessProps {
  onNavigate: (page: string) => void;
}

export function PaymentSuccess({ onNavigate }: PaymentSuccessProps) {
  const txRef = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tx_ref') : null;
  const isMockPayment = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mode') === 'mock' : false;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-green-100 bg-gradient-to-b from-green-50 to-white p-8 shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">Payment Successful</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
          {isMockPayment
            ? 'This is a test donation. The campaign has been updated locally so you can verify the full donor flow.'
            : 'Thank you for supporting this campaign. Your donation has been verified and recorded.'}
        </p>

        {txRef ? (
          <div className="mx-auto mt-6 w-full max-w-xl rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">Transaction reference:</span> {txRef}
          </div>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onNavigate('donor-dashboard')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            <LayoutDashboard className="h-4 w-4" />
            View Dashboard
          </button>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>
    </section>
  );
}
