import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

interface PaymentFailedProps {
  onNavigate: (page: string) => void;
}

export function PaymentFailed({ onNavigate }: PaymentFailedProps) {
  const txRef = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tx_ref') : null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg shadow-amber-100/40">
        <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 px-8 py-10 sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-sm">
            <AlertCircle className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">Payment not completed</h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            The donation was not confirmed as successful. You can try again or return to the campaign page.
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
