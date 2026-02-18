import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import TemplatesPage from './pages/TemplatesPage';
import PricingPage from './pages/PricingPage';
import TemplatePreviewPage from './pages/TemplatePreviewPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetupWizardPage from './pages/SetupWizardPage';
import MyDashboardPage from './pages/MyDashboardPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';
import NotFoundPage from './pages/NotFoundPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutResultPage from './pages/CheckoutResultPage';
import TerminalSetupPage from './pages/TerminalSetupPage';
import TemplateBuyPage from './pages/TemplateBuyPage';
import YCZStoreLiveDemo from './pages/demo/YCZStoreLiveDemo';
import YCZDashboardLiveDemo from './pages/demo/YCZDashboardLiveDemo';
import GxVaultStoreLiveDemo from './pages/demo/GxVaultStoreLiveDemo';
import GxVaultDashboardLiveDemo from './pages/demo/GxVaultDashboardLiveDemo';
import HxToolsStoreLiveDemo from './pages/demo/HxToolsStoreLiveDemo';
import HxToolsDashboardLiveDemo from './pages/demo/HxToolsDashboardLiveDemo';
import CarStoreLiveDemo from './pages/demo/CarStoreLiveDemo';
import CarDashboardLiveDemo from './pages/demo/CarDashboardLiveDemo';

// Admin Dashboard
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminTemplates from './pages/admin/AdminTemplates';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminPaymentGateways from './pages/admin/AdminPaymentGateways';
import AdminPurchaseCodes from './pages/admin/AdminPurchaseCodes';
import AdminTickets from './pages/admin/AdminTickets';

function AppContent() {
  const location = useLocation();

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
    );
  }

  if (isBuyPage) {
    return (
      <Routes>
        <Route path="/buy" element={<TemplateBuyPage />} />
      </Routes>
    );
  }

  if (isSetupPage || isTerminalSetup) {
    return (
      <Routes>
        <Route path="/setup" element={<TerminalSetupPage />} />
        <Route path="/terminal-setup" element={<TerminalSetupPage />} />
      </Routes>
    );
  }

  if (isCheckoutPage) {
    return (
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutResultPage type="success" />} />
        <Route path="/checkout/failed" element={<CheckoutResultPage type="failed" />} />
        <Route path="/checkout/cancelled" element={<CheckoutResultPage type="cancelled" />} />
      </Routes>
    );
  }

  if (isMyDashboard) {
    return (
      <Routes>
        <Route path="/my-dashboard" element={
          <ProtectedRoute>
            <MyDashboardPage />
          </ProtectedRoute>
        } />
      </Routes>
    );
  }

  if (isAdminPage) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main>
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
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
