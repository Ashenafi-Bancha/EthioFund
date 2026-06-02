import { useCallback, useMemo, useState } from 'react';
import { Home } from './components/Home';
import { CampaignListing } from './components/CampaignListing';
import { CampaignDetail } from './components/CampaignDetail';
import { AuthPage } from './components/AuthPage';
import { DonorDashboard } from './components/DonorDashboard';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { CreateCampaign } from './components/CreateCampaign';
import { WithdrawalRequest } from './components/WithdrawalRequest';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PaymentFailed } from './components/PaymentFailed';
import { PaymentPending } from './components/PaymentPending';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { ProfilePage } from './components/ProfilePage';
import { useAuth } from './context/AuthContext';
import type { User } from './types/auth';

export type { UserRole, User } from './types/auth';

type NavEntry = {
  page: string;
  campaignId?: string | null;
};

function getInitialNavEntry(): NavEntry {
  if (typeof window === 'undefined') {
    return { page: 'home' };
  }

  const path = window.location.pathname.toLowerCase();
  if (path === '/payment-success' || path === '/payment/success') {
    return { page: 'payment-success' };
  }

  if (path === '/payment-failed' || path === '/payment/failed') {
    return { page: 'payment-failed' };
  }

  if (path === '/payment-pending' || path === '/payment/pending') {
    return { page: 'payment-pending' };
  }

  const campaignMatch = path.match(/^\/campaigns\/(\d+)\/?$/);
  if (campaignMatch) {
    return { page: 'campaign-detail', campaignId: campaignMatch[1] };
  }

  return { page: 'home' };
}

const getDashboardPageForUser = (user: User): string => {
  if (user.role === 'admin') return 'admin-dashboard';
  if (user.role === 'organizer') return 'organizer-dashboard';
  if (user.role === 'donor') return 'donor-dashboard';
  return 'home';
};

const getBackLabel = (page: string): string => {
  switch (page) {
    case 'home':
      return 'Back to Home';
    case 'campaigns':
      return 'Back to Campaigns';
    case 'about':
      return 'Back to About';
    case 'contact':
      return 'Back to Contact';
    case 'auth':
      return 'Back';
    case 'donor-dashboard':
      return 'Back to Dashboard';
    case 'organizer-dashboard':
      return 'Back to Dashboard';
    case 'admin-dashboard':
      return 'Back to Admin Dashboard';
    case 'create-campaign':
      return 'Back to Dashboard';
    case 'withdrawal-request':
      return 'Back to Dashboard';
    case 'profile':
      return 'Back';
    case 'campaign-detail':
      return 'Back';
    default:
      return 'Back';
  }
};

function App() {
  const { user, ready, logout } = useAuth();
  const [navStack, setNavStack] = useState<NavEntry[]>([getInitialNavEntry()]);

  const currentEntry = navStack[navStack.length - 1] ?? { page: 'home' };
  const currentPage = currentEntry.page;
  const selectedCampaignId = currentEntry.campaignId ?? null;
  const previousEntry = navStack.length > 1 ? navStack[navStack.length - 2] : null;

  const isPaymentStatusPage = useMemo(
    () => currentPage === 'payment-success' || currentPage === 'payment-failed' || currentPage === 'payment-pending',
    [currentPage]
  );

  const navigateTo = useCallback((page: string, options?: { reset?: boolean; campaignId?: string | null }) => {
    setNavStack((prev) => {
      const nextEntry: NavEntry = {
        page,
        campaignId: page === 'campaign-detail' ? (options?.campaignId ?? null) : null,
      };

      if (options?.reset) {
        return [nextEntry];
      }

      const last = prev[prev.length - 1];
      if (last?.page === page && page !== 'campaign-detail') {
        return prev;
      }

      return [...prev, nextEntry];
    });
  }, []);

  const goBack = useCallback(() => {
    setNavStack((prev) => {
      if (prev.length <= 1) {
        return [{ page: 'home' }];
      }
      return prev.slice(0, -1);
    });
  }, []);

  const navigateFromMainMenu = useCallback(
    (page: string) => {
      navigateTo(page, { reset: true });
    },
    [navigateTo]
  );

  const handleLogin = (loggedInUser: User) => {
    navigateTo(getDashboardPageForUser(loggedInUser), { reset: true });
  };

  const handleLogout = () => {
    void logout();
    navigateTo('home', { reset: true });
  };

  const viewCampaignDetail = (campaignId: string) => {
    navigateTo('campaign-detail', { campaignId });
  };

  const backLabel =
    currentPage === 'campaign-detail' && navStack.length <= 1
      ? 'Leave campaign'
      : previousEntry
        ? getBackLabel(previousEntry.page)
        : 'Back';

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigateTo} onViewCampaign={viewCampaignDetail} />;
      case 'campaigns':
        return <CampaignListing onViewCampaign={viewCampaignDetail} />;
      case 'about':
        return <AboutPage onNavigate={navigateTo} onBack={goBack} backLabel={backLabel} />;
      case 'contact':
        return <ContactPage onNavigate={navigateTo} onBack={goBack} backLabel={backLabel} />;
      case 'campaign-detail':
        return <CampaignDetail campaignId={selectedCampaignId} onBack={goBack} backLabel={backLabel} />;
      case 'auth':
        return <AuthPage onLogin={handleLogin} onNavigate={navigateTo} onBack={goBack} backLabel={backLabel} />;
      case 'donor-dashboard':
        return <DonorDashboard onViewCampaign={viewCampaignDetail} />;
      case 'organizer-dashboard':
        return <OrganizerDashboard onNavigate={navigateTo} onViewCampaign={viewCampaignDetail} />;
      case 'create-campaign':
        return <CreateCampaign onNavigate={navigateTo} onBack={goBack} backLabel={backLabel} />;
      case 'withdrawal-request':
        return <WithdrawalRequest onNavigate={navigateTo} onBack={goBack} backLabel={backLabel} />;
      case 'admin-dashboard':
        return <AdminDashboard onViewCampaign={viewCampaignDetail} />;
      case 'payment-success':
        return <PaymentSuccess onNavigate={navigateTo} onBack={goBack} backLabel={backLabel} />;
      case 'payment-failed':
        return <PaymentFailed onNavigate={navigateTo} onBack={goBack} backLabel={backLabel} />;
      case 'payment-pending':
        return <PaymentPending onNavigate={navigateTo} onBack={goBack} backLabel={backLabel} />;
      case 'profile':
        return <ProfilePage onBack={goBack} backLabel={user ? `Back to ${user.role === 'admin' ? 'Admin Dashboard' : user.role === 'organizer' ? 'Dashboard' : 'Dashboard'}` : backLabel} />;
      default:
        return <Home onNavigate={navigateTo} onViewCampaign={viewCampaignDetail} />;
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Loading EthioFund...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isPaymentStatusPage ? (
        <Navigation
          currentUser={user}
          onNavigate={navigateFromMainMenu}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
      ) : null}
      <main className="flex-1">
        {renderPage()}
      </main>
      {!isPaymentStatusPage ? <Footer onNavigate={navigateFromMainMenu} currentUser={user} /> : null}
    </div>
  );
}

export default App;
