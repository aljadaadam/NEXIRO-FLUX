import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useLanguage } from '../../context/LanguageContext';
import ImportProductsModal from '../../components/Products/ImportProductsModal';
import { SkeletonProducts } from '../../components/common/Skeleton';
import ProductsSidebar from '../../components/Products/ProductsSidebar';
import GroupSelector from '../../components/Products/GroupSelector';
import ProductsList from '../../components/Products/ProductsList';
import ProductEditor from '../../components/Products/ProductEditor';
import ProductEditPanel from '../../components/Products/ProductEditPanel';
import {
  getAllProducts,
  syncProducts,
  updateProduct,
  toggleProductStatus,
  getProductsStats,
  importProducts
} from '../../services/products';
import { getAllSources } from '../../services/sources';

const ProductsPage = () => {
  const { theme, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('SERVER');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState('overview'); // الخيار المختار في القائمة
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sources, setSources] = useState([]);
  const [stats, setStats] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const tabs = [
    { id: 'SERVER', label: dir === 'rtl' ? 'خدمات السيرفر' : 'Server Service', icon: '🖥️' },
    { id: 'IMEI', label: dir === 'rtl' ? 'خدمات IMEI' : 'IMEI Service', icon: '📱' },
    { id: 'REMOTE', label: dir === 'rtl' ? 'خدمات عن بعد' : 'Remote Service', icon: '🌐' }
  ];

  // جلب المنتجات عند التحميل
  useEffect(() => {
    loadProducts();
    loadStats();
    loadConnections();
  }, []);

  // جلب المصادر (Sources)
  const loadConnections = async () => {
    try {
      const result = await getAllSources();
      console.log('🔍 Sources Result:', result);
      if (result.success) {
        // التأكد من أن البيانات array
        const sourcesData = Array.isArray(result.data) 
          ? result.data 
          : (result.data?.sources || []);
        console.log('✅ Loaded Sources:', sourcesData);
        setSources(sourcesData);
      }
    } catch (error) {
      console.error('❌ Error loading sources:', error);
    }
  };

  // فلترة المنتجات حسب النوع والبحث
  useEffect(() => {
    let filtered = products;

    // فلترة حسب النوع
    if (activeTab) {
      filtered = filtered.filter(group => group.GROUPTYPE === activeTab);
    }

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(group => {
        const groupMatch = group.GROUPNAME?.toLowerCase().includes(searchTerm.toLowerCase());
        const serviceMatch = Object.values(group.SERVICES || {}).some(service =>
          service.SERVICENAME?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return groupMatch || serviceMatch;
      });
    }

    setFilteredProducts(filtered);
  }, [activeTab, searchTerm, products]);

  const loadProducts = async () => {
    setLoading(true);
    setConnectionError(false);
    
    // حذف الـ cache للحصول على بيانات جديدة من الباك إند
    console.log('🗑️ Clearing cache and loading fresh data from backend...');
    localStorage.removeItem('products_cache');
    localStorage.removeItem('products_cache_time');
    
    try {
      const result = await getAllProducts();
      console.log('🔍 API Response:', result);
      
      if (result.success) {
        const payload = result.data?.products ?? result.data ?? [];

        const normalizeServices = (servicesObj, groupMeta) => {
          const out = {};
          Object.entries(servicesObj || {}).forEach(([serviceKey, service]) => {
            const serviceType = service.SERVICETYPE || service.SERVICE_TYPE || groupMeta.GROUPTYPE || groupMeta.groupType || 'SERVER';
            const serviceId = service.SERVICEID || service.id || service.external_service_id || serviceKey;
            const customFields =
              service.customFields ||
              service['Requires.Custom'] ||
              service.requires_custom_json ||
              service.requiresCustom ||
              [];

            out[serviceKey] = {
              ...service,
              id: service.id ?? serviceId,
              SERVICEID: serviceId,
              SERVICENAME: service.SERVICENAME ?? service.serviceName ?? service.name ?? '',
              SERVICETYPE: serviceType,
              CREDIT: service.CREDIT ?? service.credit ?? service.price ?? '',
              TIME: service.TIME ?? service.service_time ?? service.time ?? '',
              INFO: service.INFO ?? service.service_info ?? service.info ?? '',
              MINQNT: service.MINQNT ?? service.minqnt ?? service.minQnt ?? '',
              MAXQNT: service.MAXQNT ?? service.maxqnt ?? service.maxQnt ?? '',
              QNT: service.QNT ?? service.qnt ?? '',
              SERVER: service.SERVER ?? service.server_flag ?? '',
              customFields,
              enabled: service.enabled !== false,
              // التأكد من أن GROUPNAME و GROUPTYPE صحيحين من المجموعة وليس من المنتج
              GROUPNAME: groupMeta.GROUPNAME || groupMeta.groupName || service.GROUPNAME,
              GROUPTYPE: groupMeta.GROUPTYPE || groupMeta.groupType || serviceType
            };
          });
          return out;
        };

        // 1) Backend already grouped (array)
        let groupsArray = [];
        if (Array.isArray(payload) && payload.length > 0 && payload[0]?.SERVICES && payload[0]?.GROUPNAME) {
          groupsArray = payload;
        }
        // 2) Backend grouped (object keyed by group)
        else if (!Array.isArray(payload) && payload && typeof payload === 'object') {
          const values = Object.values(payload);
          if (values.length > 0 && values[0]?.SERVICES && values[0]?.GROUPNAME) {
            groupsArray = values;
          }
        }

        // 3) Flat products list (current backend)
        if (groupsArray.length === 0) {
          const apiProducts = Array.isArray(payload) ? payload : [];
          console.log('📦 Total Products from API:', apiProducts.length);

          const resolveGroupName = (product) => {
            const explicit =
              product.group_name ||
              product.groupName ||
              product.GROUPNAME ||
              product.group ||
              product.groupNameAr ||
              '';
            if (String(explicit).trim()) {
              const resolved = String(explicit).trim();
              console.log(`✅ Group from backend field: "${resolved}" for product: ${product.name}`);
              return resolved;
            }

            // Fallback: extract group from description
            if (product.description && String(product.description).includes('المجموعة:')) {
              const groupMatch = String(product.description).match(/المجموعة:\s*([^\n]+)/);
              if (groupMatch && groupMatch[1]) {
                const resolved = String(groupMatch[1]).trim();
                console.log(`⚠️ Group from description: "${resolved}" for product: ${product.name}`);
                return resolved;
              }
            }

            // Last resort: derive from name
            const name = String(product.name || '').trim();
            if (!name) return dir === 'rtl' ? 'غير مصنف' : 'Ungrouped';
            if (name.includes(' - ')) return name.split(' - ')[0].trim();
            if (name.includes('(')) return name.split('(')[0].trim();
            console.log(`❌ Group fallback to name: "${name}" for product: ${product.name}`);
            return name;
          };

          const groupedProducts = {};
          apiProducts.forEach(product => {
            // طباعة أول منتج لرؤية الشكل الفعلي
            if (apiProducts.indexOf(product) === 0) {
              console.log('🔍 Sample Product:', {
                name: product.name,
                price: product.price,
                source_price: product.source_price,
                final_price: product.final_price,
                is_custom_price: product.is_custom_price,
                group_name: product.group_name,
                groupName: product.groupName,
                GROUPNAME: product.GROUPNAME,
                description: product.description,
                service_type: product.service_type,
                source_id: product.source_id,
                external_service_id: product.external_service_id,
                external_service_name: product.external_service_name
              });
            }
            
            // إذا كان المنتج له سعر مخصص، نطبعه
            if (product.is_custom_price === 1 || product.is_custom_price === true) {
              console.log(`💰 Custom Price Product: ${product.name}`, {
                customPrice: product.price,
                sourcePrice: product.source_price,
                finalPrice: product.final_price
              });
            }

            // استخراج اسم المجموعة: prefer explicit backend field over description parsing
            const groupName = resolveGroupName(product);

            const serviceType = product.service_type || 'SERVER';
            const groupKey = `${serviceType}_${groupName.replace(/\s+/g, '_')}`;

            if (!groupedProducts[groupKey]) {
              groupedProducts[groupKey] = {
                groupKey,
                GROUPNAME: groupName,
                GROUPTYPE: serviceType,
                SERVICES: {}
              };
            }

            // استخراج الوقت من description
            let timeValue = '0';
            if (product.description) {
              const timeMatch = product.description.match(/الوقت:\s*([^\n]+)/);
              if (timeMatch && timeMatch[1]) {
                timeValue = timeMatch[1].trim();
              } else {
                const generalTimeMatch = product.description.match(/(\d+[-\s]*\d*)\s*(year|month|day|hour|Hours)/i);
                if (generalTimeMatch) {
                  timeValue = generalTimeMatch[0];
                }
              }
            }

            groupedProducts[groupKey].SERVICES[product.id] = {
              id: product.id,
              SERVICEID: product.id,
              SERVICENAME: product.name,
              CREDIT: product.price,
              TIME: timeValue,
              INFO: '',
              MINQNT: '',
              MAXQNT: '',
              QNT: '',
              SERVER: '',
              customFields: product.customFields || product.requires_custom_json || [],
              'Requires.Custom': product.customFields || product.requires_custom_json || [],
              enabled: true,
              GROUPNAME: groupName,
              GROUPTYPE: serviceType,
              description: product.description || '',
              service_type: serviceType,
              created_at: product.created_at,
              // Support both formats: source_id field or source.id object
              source_id: product.source_id ?? product.sourceId ?? product.source?.id ?? null,
              source: product.source ?? null,
              external_service_id: product.external_service_id ?? product.externalServiceId ?? null,
              external_service_name: product.external_service_name ?? product.externalServiceName ?? null
            };
            
            // Log للمنتجات ذات السعر المخصص
            if (product.is_custom_price === 1 || product.is_custom_price === true) {
              console.log(`✅ Added custom price service to group:`, {
                serviceName: product.name,
                groupName: groupName,
                creditSet: product.price,
                serviceId: product.id
              });
            }
          });

          groupsArray = Object.values(groupedProducts);
        }

        const normalizedGroups = groupsArray.map((group) => {
          const groupType = group.GROUPTYPE || group.groupType || group.GROUPTYPE;
          const groupName = group.GROUPNAME || group.groupName || '';
          const groupKey = group.groupKey || `${groupType || 'SERVER'}_${String(groupName).replace(/\s+/g, '_')}`;
          return {
            ...group,
            groupKey,
            GROUPNAME: groupName,
            GROUPTYPE: groupType || 'SERVER',
            SERVICES: normalizeServices(group.SERVICES, group),
          };
        });

        console.log('📊 Grouped Products:', normalizedGroups.length, 'groups');
        console.log('🔍 Sample Groups:', normalizedGroups.slice(0, 3).map(g => ({ name: g.GROUPNAME, type: g.GROUPTYPE, count: Object.keys(g.SERVICES).length })));
        
        setProducts(normalizedGroups);
        // حفظ البيانات محلياً
        localStorage.setItem('products_cache', JSON.stringify(normalizedGroups));
        localStorage.setItem('products_cache_time', Date.now().toString());
        return normalizedGroups;
      } else {
        console.warn('⚠️ API returned success=false');
        // محاولة تحميل البيانات المحفوظة
        const cachedData = localStorage.getItem('products_cache');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setProducts(parsed);
          setConnectionError(true);
          return parsed;
        }
      }
    } catch (error) {
      // محاولة تحميل البيانات المحفوظة عند فشل الاتصال
      const cachedData = localStorage.getItem('products_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setProducts(parsed);
        setConnectionError(true);
        return parsed;
      }
    } finally {
      setLoading(false);
    }

    return null;
  };

  const loadStats = async () => {
    try {
      const result = await getProductsStats();
      if (result.success) {
        setStats(result.data);
        localStorage.setItem('stats_cache', JSON.stringify(result.data));
      } else {
        const cachedStats = localStorage.getItem('stats_cache');
        if (cachedStats) {
          setStats(JSON.parse(cachedStats));
        }
      }
    } catch (error) {
      const cachedStats = localStorage.getItem('stats_cache');
      if (cachedStats) {
        setStats(JSON.parse(cachedStats));
      }
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    // إعادة تحميل المنتجات من السيرفر مباشرة
    await loadProducts();
    await loadStats();
    setSyncing(false);
  };

  const handleImport = async (productsToImport) => {
    const result = await importProducts(productsToImport);
    if (result.success) {
      await loadProducts();
      await loadStats();
      return result;
    }
    throw new Error(result.error);
  };

  const toggleGroup = (group) => {
    console.log('🔄 Selected Group:', group);
    console.log('📦 Services in Group:', Object.keys(group?.SERVICES || {}).length);
    setSelectedGroup(group);
    setSelectedProduct(null);
    setEditValues({});
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    
    // Extract source_id from multiple possible formats
    const sourceId = product.source_id 
      ?? product.sourceId 
      ?? product.source?.id 
      ?? null;
    
    const externalServiceId = product.external_service_id 
      ?? product.externalServiceId 
      ?? null;
    
    console.log('📦 Product selected:', {
      name: product.SERVICENAME,
      sourceId,
      externalServiceId,
      rawProduct: { source_id: product.source_id, source: product.source }
    });
    
    setEditValues({
      CREDIT: product.CREDIT,
      TIME: product.TIME,
      INFO: product.INFO,
      SERVICENAME: product.SERVICENAME,
      enabled: product.enabled !== false,
      source_id: sourceId,
      external_service_id: externalServiceId
    });
  };

  const handleEdit = (serviceId, service) => {
    setSelectedProduct(service);
    
    // Extract source_id from multiple possible formats
    const sourceId = service.source_id 
      ?? service.sourceId 
      ?? service.source?.id 
      ?? null;
    
    const externalServiceId = service.external_service_id 
      ?? service.externalServiceId 
      ?? null;
    
    setEditValues({
      CREDIT: service.CREDIT,
      TIME: service.TIME,
      INFO: service.INFO,
      SERVICENAME: service.SERVICENAME,
      enabled: service.enabled !== false,
      source_id: sourceId,
      external_service_id: externalServiceId
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;
    
    console.log('🔄 Saving product...', {
      productId: selectedProduct.id,
      productServiceId: selectedProduct.SERVICEID,
      editValues: editValues,
      selectedProduct: selectedProduct
    });
    
    // حفظ الاختيارات الحالية
    const currentProductId = selectedProduct.id || selectedProduct.SERVICEID;
    const currentGroupKey = selectedGroup?.groupKey;
    
    // استخدام SERVICEID كمعرّف
    const productId = selectedProduct.id || selectedProduct.SERVICEID;
    
    // التأكد من أن GROUPNAME و GROUPTYPE يأتيان من المجموعة المحددة وليس من المنتج
    const groupName = selectedGroup?.GROUPNAME || selectedProduct.GROUPNAME;
    const groupType = selectedGroup?.GROUPTYPE || selectedProduct.GROUPTYPE || 'SERVER';
    
    // أضف GROUPNAME و GROUPTYPE دائماً للـ payload من المجموعة المحددة
    const payload = {
      CREDIT: editValues.CREDIT,
      TIME: editValues.TIME,
      INFO: editValues.INFO,
      SERVICENAME: editValues.SERVICENAME,
      enabled: editValues.enabled,
      source_id: editValues.source_id,
      external_service_id: editValues.external_service_id,
      GROUPNAME: groupName,  // من المجموعة المحددة
      GROUPTYPE: groupType   // من المجموعة المحددة
    };
    
    console.log('📤 Payload being sent to backend:', {
      payload,
      fromGroup: { name: groupName, type: groupType },
      selectedGroup: selectedGroup?.GROUPNAME,
      selectedProduct: selectedProduct?.SERVICENAME
    });
    
    const result = await updateProduct(productId, payload);
    
    console.log('✅ Save result:', result);
    
    if (result.success) {
      console.log('� Reloading all products from backend after update...');
      
      // إعادة تحميل جميع المنتجات من الباك إند لضمان الحصول على البيانات الكاملة
      const reloadedProducts = await loadProducts();
      
      if (reloadedProducts && reloadedProducts.length > 0) {
        // البحث عن المنتج والمجموعة في البيانات المحدثة
        let foundGroup = null;
        let foundProduct = null;
        
        for (const group of reloadedProducts) {
          const service = Object.values(group.SERVICES || {}).find(s => 
            s.id === currentProductId || s.SERVICEID === currentProductId
          );
          if (service) {
            foundGroup = group;
            foundProduct = service;
            console.log('✅ Found updated product in group:', group.GROUPNAME, 'with', Object.keys(group.SERVICES).length, 'services');
            break;
          }
        }
        
        if (foundGroup && foundProduct) {
          setSelectedGroup(foundGroup);
          setSelectedProduct(foundProduct);
          console.log('✓ Product and group updated successfully');
        }
      }

      console.log('✓ Product updated successfully');
      alert(dir === 'rtl' ? '✓ تم حفظ التعديلات بنجاح' : '✓ Changes saved successfully');
    } else {
      console.error('❌ Failed to update product:', result.error);
      alert(dir === 'rtl' ? `❌ فشل في حفظ التعديلات: ${result.error}` : `❌ Failed to save changes: ${result.error}`);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedProduct) return;
    
    const currentStatus = selectedProduct.enabled !== false;
    const result = await toggleProductStatus(selectedProduct.id, !currentStatus);
    if (result.success) {
      await loadProducts();
      setSelectedProduct({ ...selectedProduct, enabled: !currentStatus });
      setEditValues(prev => ({ ...prev, enabled: !currentStatus }));
    }
  };

  const getServiceCount = (type) => {
    return products.filter(g => g.GROUPTYPE === type).reduce((acc, group) => {
      return acc + Object.keys(group.SERVICES || {}).length;
    }, 0);
  };

  // عرض شاشة التحميل
  if (loading && products.length === 0) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6" dir={dir}>
          <div className="max-w-7xl mx-auto">
            <SkeletonProducts />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col overflow-hidden" dir={dir} style={{ backgroundColor: 'var(--page-bg)' }}>
        {/* رأس الصفحة */}
        <div className="p-4 border-b-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>{dir === 'rtl' ? 'إدارة المنتجات' : 'Products Management'}</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {dir === 'rtl' 
              ? 'إدارة وتعديل أسعار وأوقات المنتجات'
              : 'Manage and edit product prices and times'}
          </p>
        </div>

        {/* تحذير عدم الاتصال */}
        {connectionError && (
          <div className={`p-3 border-b-2 ${
            theme === 'dark'
              ? 'bg-yellow-900/20 border-yellow-600 text-yellow-200'
              : 'bg-yellow-50 border-yellow-400 text-yellow-800'
          }`}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {dir === 'rtl' ? '⚠️ فشل الاتصال' : '⚠️ Connection Failed'}
                </p>
              </div>
              <button
                onClick={loadProducts}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {dir === 'rtl' ? '🔄 إعادة' : '🔄 Retry'}
              </button>
            </div>
          </div>
        )}

        {/* 3 أعمدة عمودية متجاورة */}
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
          {/* العموح الأول: الفئات والإجراءات */}
          <div className={`w-full md:w-56 lg:w-64 flex-shrink-0 overflow-y-auto ${
            dir === 'rtl' ? 'border-l-2' : 'border-r-2'
          }`}
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <ProductsSidebar
              theme={theme}
              dir={dir}
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                // إعادة تعيين جميع الحالات عند تغيير النوع
                setSelectedGroup(null);
                setSelectedProduct(null);
                setSelectedOption('overview');
                setEditValues({});
              }}
              onImport={() => setShowImportModal(true)}
              onSync={handleSync}
              syncing={syncing}
              getServiceCount={getServiceCount}
            />
          </div>

          {/* العمود الثاني: اختيار المجموعة وقائمة المنتجات */}
          <div key={activeTab} className={`w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col overflow-hidden ${
            dir === 'rtl' ? 'border-l-2' : 'border-r-2'
          } transition-all duration-500`}
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            {/* اختيار المجموعة */}
            <div className="p-4 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
              <GroupSelector
                theme={theme}
                dir={dir}
                groups={filteredProducts}
                selectedGroup={selectedGroup}
                onSelectGroup={toggleGroup}
                loading={loading}
              />
            </div>
            
            {/* قائمة المنتجات */}
            <div className="flex-1 overflow-y-auto p-4">
              <ProductsList
                theme={theme}
                dir={dir}
                group={selectedGroup}
                selectedProduct={selectedProduct}
                onSelectProduct={handleSelectProduct}
              />
            </div>
          </div>

          {/* العمود الثالث: لوحة تعديل المنتج */}
          <div key={selectedProduct?.SERVICEID} className={`w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col overflow-hidden ${
            dir === 'rtl' ? 'border-l-2' : 'border-r-2'
          } transition-all duration-500`}
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <ProductEditPanel
              theme={theme}
              dir={dir}
              product={selectedProduct}
              onOptionSelect={(optionId) => setSelectedOption(optionId)}
            />
          </div>

          {/* العمود الرابع: منطقة التفاصيل حسب الخيار المختار */}
          <div key={`${selectedProduct?.SERVICEID}-${selectedOption}`} className="flex-1 overflow-y-auto min-w-0 p-4 transition-all duration-500"
          style={{ backgroundColor: 'var(--page-bg)' }}
          >
            <ProductEditor
              theme={theme}
              dir={dir}
              product={selectedProduct}
              selectedOption={selectedOption}
              editValues={editValues}
              onEditChange={(field, value) => setEditValues(prev => ({ ...prev, [field]: value }))}
              onSave={handleSaveEdit}
              onToggleStatus={handleToggleStatus}
              connectionError={false}
              onRetry={loadProducts}
              selectedGroup={selectedGroup}
              sources={sources}
              allProducts={filteredProducts}
            />
          </div>
        </div>
      </div>

      {/* Modal الاستيراد */}
      <ImportProductsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </AppLayout>
  );
};

export default ProductsPage;