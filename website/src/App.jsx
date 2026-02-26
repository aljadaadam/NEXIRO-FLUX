import { useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatWidget from './components/chat/ChatWidget';

// Critical page - loaded eagerly
import HomePage from './pages/HomePage';

// Lazy-loaded pages from route config
import {
  TemplatesPage, PricingPage, TemplatePreviewPage,
  LoginPage, RegisterPage, MyDashboardPage,
  TermsPage, PrivacyPage, RefundPage, NotFoundPage,
  TutorialPage, CheckoutPage, CheckoutResultPage,
  TerminalSetupPage, TemplateBuyPage,
  // Demo pages
  YCZStoreLiveDemo, YCZDashboardLiveDemo,
  GxVaultStoreLiveDemo, GxVaultDashboardLiveDemo,
  HxToolsStoreLiveDemo, HxToolsDashboardLiveDemo,
  CarStoreLiveDemo, CarDashboardLiveDemo,
  // Admin
  AdminLayout, AdminOverview, AdminTemplates, AdminUsers,
  AdminAnnouncements, AdminSettings, AdminPayments,
  AdminPaymentGateways, AdminPurchaseCodes, AdminTickets, AdminChat,
  AdminReservations,
} from './routes';

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const { isRTL } = useLanguage();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isDemoPage = location.pathname.startsWith('/demo/');
  const isAdminPage = location.pathname.startsWith('/aljadadm654');
  const isSetupPage = location.pathname === '/setup';
  const isTerminalSetup = location.pathname === '/terminal-setup';
  const isBuyPage = location.pathname === '/buy';
  const isMyDashboard = location.pathname === '/my-dashboard';
  const isCheckoutPage = location.pathname.startsWith('/checkout');

  // dash.nexiroflux.com should ONLY show /aljadadm654 routes
  // Redirect any non-admin route on dash subdomain to nexiroflux.com
  const isDashSubdomain = typeof window !== 'undefined' && window.location.hostname === 'dash.nexiroflux.com';
  useEffect(() => {
    if (isDashSubdomain && !isAdminPage) {
      window.location.href = `https://nexiroflux.com${location.pathname}${location.search}`;
    }
  }, [isDashSubdomain, isAdminPage, location.pathname, location.search]);

  if (isDashSubdomain && !isAdminPage) {
    return <PageLoader />;
  }

  if (isDemoPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/demo/ycz-store" element={<YCZStoreLiveDemo />} />
          <Route path="/demo/ycz-dashboard" element={<YCZDashboardLiveDemo />} />
          <Route path="/demo/gxv-store" element={<GxVaultStoreLiveDemo />} />
          <Route path="/demo/gxv-dashboard" element={<GxVaultDashboardLiveDemo />} />
          <Route path="/demo/hx-store" element={<HxToolsStoreLiveDemo />} />
          <Route path="/demo/hx-dashboard" element={<HxToolsDashboardLiveDemo />} />
          <Route path="/demo/car-store" element={<CarStoreLiveDemo />} />
          <Route path="/demo/car-dashboard" element={<CarDashboardLiveDemo />} />
        </Routes>
      </Suspense>
    );
  }

  if (isBuyPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/buy" element={<TemplateBuyPage />} />
        </Routes>
      </Suspense>
    );
  }

  if (isSetupPage || isTerminalSetup) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/setup" element={<TerminalSetupPage />} />
          <Route path="/terminal-setup" element={<TerminalSetupPage />} />
        </Routes>
      </Suspense>
    );
  }

  if (isCheckoutPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutResultPage type="success" />} />
          <Route path="/checkout/failed" element={<CheckoutResultPage type="failed" />} />
          <Route path="/checkout/cancelled" element={<CheckoutResultPage type="cancelled" />} />
        </Routes>
      </Suspense>
    );
  }

  if (isMyDashboard) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/my-dashboard" element={
            <ProtectedRoute>
              <MyDashboardPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    );
  }

  if (isAdminPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/aljadadm654" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminOverview />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="templates" element={<AdminTemplates />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="purchase-codes" element={<AdminPurchaseCodes />} />
            <Route path="payment-gateways" element={<AdminPaymentGateways />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-dark-950">
      <Navbar />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/template/:id" element={<TemplatePreviewPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/refund" element={<RefundPage />} />
            <Route path="/tutorials/:slug" element={<TutorialPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
