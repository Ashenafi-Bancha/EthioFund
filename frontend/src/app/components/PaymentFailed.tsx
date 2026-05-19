import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

interface PaymentFailedProps {
  onNavigate: (page: string) => void;
}

export function PaymentFailed({ onNavigate }: PaymentFailedProps) {
  const txRef = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tx_ref') : null;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-amber-100 bg-gradient-to-b from-amber-50 to-white p-8 shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertCircle className="h-8 w-8" />
        </div>

        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">Payment Not Completed</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
          The donation could not be verified as successful. This may happen if payment failed, was cancelled, or timed out.
        </p>

        {txRef ? (
          <div className="mx-auto mt-6 w-full max-w-xl rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">Transaction reference:</span> {txRef}
          </div>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onNavigate('campaigns')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white transition hover:bg-amber-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
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
