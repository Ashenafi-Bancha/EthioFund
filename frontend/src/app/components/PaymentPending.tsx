import { Clock3, Home, RefreshCcw } from 'lucide-react';

interface PaymentPendingProps {
  onNavigate: (page: string) => void;
}

export function PaymentPending({ onNavigate }: PaymentPendingProps) {
  const txRef = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tx_ref') : null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-lg shadow-sky-100/40">
        <div className="bg-gradient-to-r from-sky-50 via-white to-cyan-50 px-8 py-10 sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-700 shadow-sm">
            <Clock3 className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">Payment is being confirmed</h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Chapa has not returned a final result yet. If you already approved the payment on your phone, please wait a moment for confirmation.
          </p>

          {txRef ? (
            <div className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
              <span className="font-semibold text-gray-900">Transaction reference:</span> {txRef}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 border-t border-gray-100 bg-gray-50 px-8 py-6 sm:px-10">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            If your payment was approved in Telebirr, CBE Birr, or card checkout, the confirmation can take a short time to sync.
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onNavigate('campaigns')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700"
            >
              <RefreshCcw className="h-4 w-4" />
              Check campaigns
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Home className="h-4 w-4" />
              Back to home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}