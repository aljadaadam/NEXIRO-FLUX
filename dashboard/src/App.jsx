// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy loading للصفحات
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/Products/ProductsPage'));
const SourcesPage = lazy(() => import('./pages/Sources/SourcesPage'));
const UsersPage = lazy(() => import('./pages/Users/UsersPage'));
const AnalyticsPage = lazy(() => import('./pages/Analytics/AnalyticsPage'));
const OrdersPage = lazy(() => import('./pages/Orders/OrdersPage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner fullScreen={true} />}>
            <Routes>
              {/* صفحة تسجيل الدخول - عامة */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* مسارات محمية */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/products/*" element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/products/sources" element={
                <ProtectedRoute>
                  <SourcesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/users/*" element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              
              <Route path="/settings/*" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              {/* التوجيه الافتراضي */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* صفحة 404 */}
            <Route path="*" element={
              <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found</p>
                  <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Back to Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  </LanguageProvider>
  );
};

export default App;