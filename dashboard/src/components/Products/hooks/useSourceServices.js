import { useEffect, useState } from 'react';
import { getSourceServices } from '../../../services/products';

/**
 * Custom hook to load services from a specific source
 * @param {number|null} sourceId - The ID of the source to load services from
 * @returns {Object} - { sourceServices, loadingServices, filteredServices }
 */
export const useSourceServices = (sourceId, searchTerm = '') => {
  const [sourceServices, setSourceServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!sourceId) {
        setSourceServices([]);
        setLoadingServices(false);
        return;
      }

      setLoadingServices(true);
      const result = await getSourceServices(sourceId);
      if (cancelled) return;

      if (result?.success) {
        const list = result.data?.services ?? result.data ?? [];
        const servicesArray = Array.isArray(list) ? list : [];
        setSourceServices(servicesArray);
        console.log(`✅ Loaded ${servicesArray.length} services from source ${sourceId}`, servicesArray);
      } else {
        setSourceServices([]);
        console.warn('⚠️ No services data in response');
      }
      setLoadingServices(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [sourceId]);

  // Filter services based on search term
  const filteredServices = (() => {
    const term = String(searchTerm || '').toLowerCase();
    const filtered = !term 
      ? sourceServices 
      : sourceServices.filter((svc) => {
          const name = String(svc?.SERVICENAME ?? svc?.name ?? '');
          const id = String(svc?.SERVICEID ?? svc?.id ?? '');
          return name.toLowerCase().includes(term) || id.toLowerCase().includes(term);
        });
    
    console.log(`🔍 Filtered services: ${filtered.length} of ${sourceServices.length} total (search: "${term}")`);
    return filtered;
  })();

  return { 
    sourceServices, 
    loadingServices, 
    filteredServices 
  };
};
