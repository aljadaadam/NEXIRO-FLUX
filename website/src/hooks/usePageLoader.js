/**
 * ─── usePageLoader Hook ───
 * Common loading/error state management for pages.
 * Reduces boilerplate in page components.
 */
import { useState, useCallback } from 'react';

export default function usePageLoader(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const withLoading = useCallback(async (asyncFn) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
    clearMessages,
    withLoading,
  };
}
