import { CheckCircle2, Home, LayoutDashboard } from 'lucide-react';

interface PaymentSuccessProps {
  onNavigate: (page: string) => void;
}

export function PaymentSuccess({ onNavigate }: PaymentSuccessProps) {
  const txRef = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tx_ref') : null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-lg shadow-green-100/40">
        <div className="bg-gradient-to-r from-green-50 via-white to-emerald-50 px-8 py-10 sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">Payment successful</h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Your donation has been verified and recorded. You can safely close this page or continue to your dashboard.
          </p>

          {txRef ? (
            <div className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
              <span className="font-semibold text-gray-900">Transaction reference:</span> {txRef}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 border-t border-gray-100 bg-gray-50 px-8 py-6 sm:grid-cols-2 sm:px-10">
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
