import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Critical page - loaded eagerly
import HomePage from './pages/HomePage';

// Lazy-loaded pages for code splitting
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const TemplatePreviewPage = lazy(() => import('./pages/TemplatePreviewPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SetupWizardPage = lazy(() => import('./pages/SetupWizardPage'));
const MyDashboardPage = lazy(() => import('./pages/MyDashboardPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const RefundPage = lazy(() => import('./pages/RefundPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const TutorialPage = lazy(() => import('./pages/TutorialPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutResultPage = lazy(() => import('./pages/CheckoutResultPage'));
const TerminalSetupPage = lazy(() => import('./pages/TerminalSetupPage'));
const TemplateBuyPage = lazy(() => import('./pages/TemplateBuyPage'));

// Demo pages - lazy loaded
const YCZStoreLiveDemo = lazy(() => import('./pages/demo/YCZStoreLiveDemo'));
const YCZDashboardLiveDemo = lazy(() => import('./pages/demo/YCZDashboardLiveDemo'));
const GxVaultStoreLiveDemo = lazy(() => import('./pages/demo/GxVaultStoreLiveDemo'));
const GxVaultDashboardLiveDemo = lazy(() => import('./pages/demo/GxVaultDashboardLiveDemo'));
const HxToolsStoreLiveDemo = lazy(() => import('./pages/demo/HxToolsStoreLiveDemo'));
const HxToolsDashboardLiveDemo = lazy(() => import('./pages/demo/HxToolsDashboardLiveDemo'));
const CarStoreLiveDemo = lazy(() => import('./pages/demo/CarStoreLiveDemo'));
const CarDashboardLiveDemo = lazy(() => import('./pages/demo/CarDashboardLiveDemo'));

// Admin Dashboard - lazy loaded
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminTemplates = lazy(() => import('./pages/admin/AdminTemplates'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminPaymentGateways = lazy(() => import('./pages/admin/AdminPaymentGateways'));
const AdminPurchaseCodes = lazy(() => import('./pages/admin/AdminPurchaseCodes'));
const AdminTickets = lazy(() => import('./pages/admin/AdminTickets'));

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
  const isAdminPage = location.pathname.startsWith('/admin');
  const isSetupPage = location.pathname === '/setup';
  const isTerminalSetup = location.pathname === '/terminal-setup';
  const isBuyPage = location.pathname === '/buy';
  const isMyDashboard = location.pathname === '/my-dashboard';
  const isCheckoutPage = location.pathname.startsWith('/checkout');

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
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminOverview />} />
            <Route path="tickets" element={<AdminTickets />} />
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
