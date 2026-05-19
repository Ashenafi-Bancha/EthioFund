import { User } from '../App';
import { Menu, X, UserCircle, Heart, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  currentPage: string;
}

export function Navigation({ currentUser, onNavigate, onLogout, currentPage }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPage = () => {
    if (!currentUser) return 'home';
    if (currentUser.role === 'admin') return 'admin-dashboard';
    if (currentUser.role === 'organizer') return 'organizer-dashboard';
    if (currentUser.role === 'donor') return 'donor-dashboard';
    return 'home';
  };

  const isActive = (page: string) => currentPage === page;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          <button type="button" onClick={() => onNavigate('home')} className="flex items-center gap-3 text-left">
            <div>
              <div className="text-2xl font-black tracking-tight text-gray-900">EthioFund</div>
              <div className="hidden sm:block text-xs font-medium uppercase tracking-[0.18em] text-gray-500">Crowdfunding for Ethiopia</div>
            </div>
          </button>

          <div className="hidden items-center gap-2 md:flex">
            {[
              ['home', 'Home'],
              ['campaigns', 'Campaigns'],
              ['about', 'About'],
              ['contact', 'Contact'],
            ].map(([page, label]) => (
              <button
                key={page}
                type="button"
                onClick={() => onNavigate(page)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${isActive(page) ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate(getDashboardPage())}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                >
                  <UserCircle className="h-5 w-5" />
                  {currentUser.name}
                </button>
                <button type="button" onClick={onLogout} className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => onNavigate('auth')} className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  Login
                </button>
                <button type="button" onClick={() => onNavigate('auth')} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all hover:from-green-700 hover:to-emerald-700">
                  Start a campaign
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2.5 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-2 border-t border-gray-200 py-4">
              {[
                ['home', 'Home'],
                ['campaigns', 'Campaigns'],
                ['about', 'About'],
                ['contact', 'Contact'],
              ].map(([page, label]) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => {
                    onNavigate(page);
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <span>{label}</span>
                </button>
              ))}

              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(getDashboardPage());
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    <UserCircle className="h-5 w-5" />
                    {currentUser.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-center font-semibold text-white shadow-lg shadow-green-600/20"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}