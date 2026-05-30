import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-[#071014] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div>
              <div className="text-2xl font-black text-white">EthioFund</div>
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Crowdfunding for Ethiopia</div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-gray-400">
              A modern crowdfunding platform built for Ethiopia and the diaspora, with verified campaigns, transparent fundraising, and Chapa-powered payments.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-transform hover:-translate-y-0.5"
            >
              Start a campaign
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white">Explore</h3>
            <div className="space-y-3 text-sm">
              <button type="button" onClick={() => onNavigate('home')} className="block text-left text-gray-400 transition-colors hover:text-white">Home</button>
              <button type="button" onClick={() => onNavigate('campaigns')} className="block text-left text-gray-400 transition-colors hover:text-white">Campaigns</button>
              <button type="button" onClick={() => onNavigate('about')} className="block text-left text-gray-400 transition-colors hover:text-white">About</button>
              <button type="button" onClick={() => onNavigate('contact')} className="block text-left text-gray-400 transition-colors hover:text-white">Contact</button>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white">Support</h3>
            <p className="text-sm leading-6 text-gray-400">
              Fundraising, verification, campaign setup, and Chapa payment support for organizers and donors.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4 text-green-400" />
                <span>support@ethiofund.et</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4 text-green-400" />
                <span>+251 938103340</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4 text-green-400" />
                <span>4 kilo, Addis Ababa, Ethiopia</span>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2.5 text-white transition-colors hover:bg-green-500/20">
                <Facebook className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2.5 text-white transition-colors hover:bg-green-500/20">
                <Twitter className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2.5 text-white transition-colors hover:bg-green-500/20">
                <Instagram className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-gray-500">
          © {currentYear} EthioFund. Built for Ethiopia, trusted by the community.
        </div>
      </div>
    </footer>
  );
}
