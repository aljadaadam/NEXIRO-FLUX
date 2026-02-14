import { useEffect, useMemo, useState } from 'react';
import { getSourceServicesGrouped } from '../../../services/sources';

export const useApiConnectionServices = (connectionId, searchTerm = '') => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!connectionId) {
        setGroups([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await getSourceServicesGrouped(connectionId);
      if (cancelled) return;

      if (result?.success) {
        const nextGroups = Array.isArray(result.data?.groups) ? result.data.groups : [];
        setGroups(nextGroups);
      } else {
        setGroups([]);
        setError(result?.error || 'Failed to load services');
      }

      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [connectionId]);

  const filteredGroups = useMemo(() => {
    const term = String(searchTerm || '').trim().toLowerCase();
    if (!term) return groups;

    return (groups || [])
      .map((group) => {
        const options = Array.isArray(group?.options) ? group.options : [];
        const filteredOptions = options.filter((opt) => String(opt?.label || '').toLowerCase().includes(term));
        return { ...group, options: filteredOptions };
      })
      .filter((group) => (group?.options?.length || 0) > 0);
  }, [groups, searchTerm]);

  const totalCount = useMemo(() => {
    return (groups || []).reduce((acc, g) => acc + (Array.isArray(g?.options) ? g.options.length : 0), 0);
  }, [groups]);

  const filteredCount = useMemo(() => {
    return (filteredGroups || []).reduce((acc, g) => acc + (Array.isArray(g?.options) ? g.options.length : 0), 0);
  }, [filteredGroups]);

  return {
    groups,
    filteredGroups,
    loading,
    error,
    totalCount,
    filteredCount,
  };
};
