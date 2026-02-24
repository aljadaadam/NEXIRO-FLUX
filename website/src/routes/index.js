/**
 * ─── Route Configuration ───
 * Centralized lazy-loaded route definitions.
 * Separated from App.jsx for better maintainability.
 */
import { lazy } from 'react';

// ─── Main Pages (lazy-loaded) ───
export const TemplatesPage = lazy(() => import('../pages/TemplatesPage'));
export const PricingPage = lazy(() => import('../pages/PricingPage'));
export const TemplatePreviewPage = lazy(() => import('../pages/TemplatePreviewPage'));
export const LoginPage = lazy(() => import('../pages/LoginPage'));
export const RegisterPage = lazy(() => import('../pages/RegisterPage'));
export const SetupWizardPage = lazy(() => import('../pages/SetupWizardPage'));
export const MyDashboardPage = lazy(() => import('../pages/MyDashboardPage'));
export const TermsPage = lazy(() => import('../pages/TermsPage'));
export const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
export const RefundPage = lazy(() => import('../pages/RefundPage'));
export const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
export const TutorialPage = lazy(() => import('../pages/TutorialPage'));
export const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
export const CheckoutResultPage = lazy(() => import('../pages/CheckoutResultPage'));
export const TerminalSetupPage = lazy(() => import('../pages/TerminalSetupPage'));
export const TemplateBuyPage = lazy(() => import('../pages/TemplateBuyPage'));

// ─── Demo Pages ───
export const YCZStoreLiveDemo = lazy(() => import('../pages/demo/YCZStoreLiveDemo'));
export const YCZDashboardLiveDemo = lazy(() => import('../pages/demo/YCZDashboardLiveDemo'));
export const GxVaultStoreLiveDemo = lazy(() => import('../pages/demo/GxVaultStoreLiveDemo'));
export const GxVaultDashboardLiveDemo = lazy(() => import('../pages/demo/GxVaultDashboardLiveDemo'));
export const HxToolsStoreLiveDemo = lazy(() => import('../pages/demo/HxToolsStoreLiveDemo'));
export const HxToolsDashboardLiveDemo = lazy(() => import('../pages/demo/HxToolsDashboardLiveDemo'));
export const CarStoreLiveDemo = lazy(() => import('../pages/demo/CarStoreLiveDemo'));
export const CarDashboardLiveDemo = lazy(() => import('../pages/demo/CarDashboardLiveDemo'));

// ─── Admin Dashboard ───
export const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
export const AdminOverview = lazy(() => import('../pages/admin/AdminOverview'));
export const AdminTemplates = lazy(() => import('../pages/admin/AdminTemplates'));
export const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
export const AdminAnnouncements = lazy(() => import('../pages/admin/AdminAnnouncements'));
export const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
export const AdminPayments = lazy(() => import('../pages/admin/AdminPayments'));
export const AdminPaymentGateways = lazy(() => import('../pages/admin/AdminPaymentGateways'));
export const AdminPurchaseCodes = lazy(() => import('../pages/admin/AdminPurchaseCodes'));
export const AdminTickets = lazy(() => import('../pages/admin/AdminTickets'));
