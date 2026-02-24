/**
 * ─── useScrollToTop Hook ───
 * Scrolls to top on route change.
 * Extracted from App.jsx to be reusable.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
}
