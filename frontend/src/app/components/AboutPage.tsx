import { ArrowRight, Award, Building2, HeartHandshake, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { PageBackButton } from './PageBackButton';

interface AboutPageProps {
  onNavigate: (page: string) => void;
  onBack: () => void;
  backLabel?: string;
}

export function AboutPage({ onNavigate, onBack, backLabel = 'Back' }: AboutPageProps) {
  const values = [
    { icon: ShieldCheck, title: 'Trust first', description: 'Verified campaigns, transparent progress, and visible outcomes.' },
    { icon: HeartHandshake, title: 'Community driven', description: 'Built to connect donors, organizers, and local communities.' },
    { icon: Sparkles, title: 'Modern fundraising', description: 'Simple, mobile-friendly, and focused on real impact.' },
  ];

  const milestones = [
    { label: 'Verified campaigns', value: '100%' },
    { label: 'Local payment method', value: 'Chapa' },
    { label: 'Built for', value: 'Ethiopia + diaspora' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <PageBackButton onBack={onBack} label={backLabel} />
      </div>
      <section className="bg-gradient-to-br from-green-50 via-white to-cyan-50 px-4 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-green-700">About EthioFund</p>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-6xl">A crowdfunding platform built for Ethiopia.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              EthioFund helps people raise money for medical expenses, education, emergencies, funerals, and community projects. It is designed for Ethiopia, with a donation experience that feels clear, trustworthy, and local.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => onNavigate('campaigns')} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/20 transition-all hover:from-green-700 hover:to-emerald-700">
                Browse campaigns
                <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onNavigate('auth')} className="rounded-full border border-green-200 bg-white px-6 py-3 font-semibold text-green-700 transition-colors hover:bg-green-50">
                Start fundraising
              </button>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-gray-200/60 ring-1 ring-gray-100">
            {milestones.map((item) => (
              <div key={item.label} className="rounded-2xl bg-gray-50 p-5">
                <div className="text-sm font-medium text-gray-500">{item.label}</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why EthioFund exists</h2>
            <p className="mx-auto mt-3 max-w-3xl text-gray-600">
              Many crowdfunding tools are built for other markets. EthioFund focuses on Ethiopian needs, local trust signals, and straightforward fundraising workflows.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
                <div className="mb-4 inline-flex rounded-2xl bg-green-50 p-3 text-green-700">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-3 leading-7 text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl bg-gray-900 p-8 text-white">
              <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Our mission</div>
              <h3 className="text-2xl font-bold">Make giving and fundraising simple, visible, and local.</h3>
              <p className="mt-4 text-white/80 leading-7">
                We want every Ethiopian community, business, student, family, and nonprofit to have a reliable place to launch campaigns and raise support with Chapa-powered payments.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-md ring-1 ring-gray-100">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-green-50 p-5">
                  <Building2 className="h-6 w-6 text-green-700" />
                  <div className="mt-3 text-sm text-green-700">Focus areas</div>
                  <div className="mt-1 font-semibold text-gray-900">Health, education, emergency support, community projects</div>
                </div>
                <div className="rounded-2xl bg-blue-50 p-5">
                  <Users className="h-6 w-6 text-blue-700" />
                  <div className="mt-3 text-sm text-blue-700">Audience</div>
                  <div className="mt-1 font-semibold text-gray-900">Organizers, donors, and diaspora supporters</div>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5 sm:col-span-2">
                  <Award className="h-6 w-6 text-amber-700" />
                  <div className="mt-3 text-sm text-amber-700">Platform promise</div>
                  <div className="mt-1 font-semibold text-gray-900">Verified campaigns, transparent progress, and Chapa checkout only.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}