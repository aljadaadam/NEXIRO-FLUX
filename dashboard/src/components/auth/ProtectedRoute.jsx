// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // عرض مؤشر التحميل أثناء التحقق من المصادقة
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // إذا لم يكن المستخدم مسجل الدخول، إعادة توجيهه لصفحة تسجيل الدخول
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // إذا كان مسجل الدخول، عرض المحتوى المحمي
  return children;
};

export default ProtectedRoute;