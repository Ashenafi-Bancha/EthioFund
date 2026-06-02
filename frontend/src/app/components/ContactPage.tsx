import { useState } from 'react';
import { ArrowRight, Mail, MapPin, Phone, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../lib/api';
import { PageBackButton } from './PageBackButton';

interface ContactPageProps {
  onNavigate: (page: string) => void;
  onBack: () => void;
  backLabel?: string;
}

export function ContactPage({ onNavigate, onBack, backLabel = 'Back' }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest<{ success?: boolean; message?: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
      });

      toast.success(response.message || 'Your message has been received. We will contact you soon.');
      setName('');
      setEmail('');
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <PageBackButton onBack={onBack} label={backLabel} />
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Contact us</p>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Talk to the EthioFund team.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
            Whether you are starting a campaign, looking for support, or want to partner with us, we are here to help.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-semibold text-gray-900">support@ethiofund.et</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-semibold text-gray-900">+251 11 234 5678</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-500">Office</div>
                <div className="font-semibold text-gray-900">Bisrat Tower, Addis Ababa, Ethiopia</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-500">Hours</div>
                <div className="font-semibold text-gray-900">Mon-Fri, 8:30 AM - 6:00 PM EAT</div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-green-50 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-green-700" />
              <div>
                <div className="font-semibold text-green-900">Need help with verification or Chapa checkout?</div>
                <p className="mt-1 text-sm leading-6 text-green-800">
                  Our support team can help organizers prepare campaign details and help donors complete payments securely.
                </p>
              </div>
            </div>
          </div>

          <button type="button" onClick={() => onNavigate('about')} className="mt-6 inline-flex items-center gap-2 font-semibold text-green-700 transition-colors hover:text-green-800">
            Learn more about EthioFund
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-gray-200/60 ring-1 ring-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Send a message</h2>
          <p className="mt-2 text-gray-600">We typically reply within one business day.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Full name <span className="text-red-500">*</span></label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Message <span className="text-red-500">*</span></label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100" />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-green-600/20 transition-all hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}