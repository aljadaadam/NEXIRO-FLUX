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
import YCZStoreLiveDemo from './pages/demo/YCZStoreLiveDemo';
import YCZDashboardLiveDemo from './pages/demo/YCZDashboardLiveDemo';

// Admin Dashboard
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminTemplates from './pages/admin/AdminTemplates';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminPaymentGateways from './pages/admin/AdminPaymentGateways';

function AppContent() {
  const location = useLocation();
  const isDemoPage = location.pathname.startsWith('/demo/');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isSetupPage = location.pathname === '/setup';
  const isMyDashboard = location.pathname === '/my-dashboard';

  if (isDemoPage) {
    return (
      <Routes>
        <Route path="/demo/ycz-store" element={<YCZStoreLiveDemo />} />
        <Route path="/demo/ycz-dashboard" element={<YCZDashboardLiveDemo />} />
      </Routes>
    );
  }

  if (isSetupPage) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupWizardPage />} />
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
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="payments" element={<AdminPayments />} />
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
