import { useMemo, useState } from 'react';
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
import { useAuth } from './context/AuthContext';
import type { User } from './types/auth';

export type { UserRole, User } from './types/auth';

function getInitialPage(): string {
  if (typeof window === 'undefined') {
    return 'home';
  }

  const path = window.location.pathname.toLowerCase();
  if (path === '/payment-success') {
    return 'payment-success';
  }

  if (path === '/payment-failed') {
    return 'payment-failed';
  }

  if (path === '/payment-pending') {
    return 'payment-pending';
  }

  return 'home';
}

function App() {
  const { user, ready, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(getInitialPage);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const isPaymentStatusPage = useMemo(() => currentPage === 'payment-success' || currentPage === 'payment-failed' || currentPage === 'payment-pending', [currentPage]);

  const handleLogin = (user: User) => {
    // Redirect based on role
    if (user.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else if (user.role === 'organizer') {
      setCurrentPage('organizer-dashboard');
    } else if (user.role === 'donor') {
      setCurrentPage('donor-dashboard');
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    void logout();
    setCurrentPage('home');
  };

  const viewCampaignDetail = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setCurrentPage('campaign-detail');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} onViewCampaign={viewCampaignDetail} />;
      case 'campaigns':
        return <CampaignListing onViewCampaign={viewCampaignDetail} />;
      case 'about':
        return <AboutPage onNavigate={setCurrentPage} />;
      case 'contact':
        return <ContactPage onNavigate={setCurrentPage} />;
      case 'campaign-detail':
        return <CampaignDetail campaignId={selectedCampaignId} onBack={() => setCurrentPage('campaigns')} />;
      case 'auth':
        return <AuthPage onLogin={handleLogin} onNavigate={setCurrentPage} />;
      case 'donor-dashboard':
        return <DonorDashboard onViewCampaign={viewCampaignDetail} />;
      case 'organizer-dashboard':
        return <OrganizerDashboard onNavigate={setCurrentPage} onViewCampaign={viewCampaignDetail} />;
      case 'create-campaign':
        return <CreateCampaign onNavigate={setCurrentPage} />;
      case 'withdrawal-request':
        return <WithdrawalRequest onNavigate={setCurrentPage} />;
      case 'admin-dashboard':
        return <AdminDashboard onViewCampaign={viewCampaignDetail} />;
      case 'payment-success':
        return <PaymentSuccess onNavigate={setCurrentPage} />;
      case 'payment-failed':
        return <PaymentFailed onNavigate={setCurrentPage} />;
      case 'payment-pending':
        return <PaymentPending onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} onViewCampaign={viewCampaignDetail} />;
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
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
      ) : null}
      <main className="flex-1">
        {renderPage()}
      </main>
      {!isPaymentStatusPage ? <Footer onNavigate={setCurrentPage} /> : null}
    </div>
  );
}

export default App;
