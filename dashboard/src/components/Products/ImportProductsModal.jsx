import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { importFromExternalSource } from '../../services/products';
import { getAllSources } from '../../services/sources';

const ImportProductsModal = ({ isOpen, onClose, onImport }) => {
  const { theme, dir } = useLanguage();
  const [importMethod, setImportMethod] = useState('api'); // 'api' | 'manual'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Sources
  const [sources, setSources] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState('');

  // API Import States
  const [apiConfig, setApiConfig] = useState({
    sourceName: 'sd-unlocker',
    url: 'https://sd-unlocker.com/api/index.php',
    username: '',
    apikey: ''
  });

  const sourcesById = useMemo(() => {
    const map = new Map();
    (sources || []).forEach((s) => {
      if (s && (s.id !== undefined && s.id !== null)) map.set(String(s.id), s);
    });
    return map;
  }, [sources]);

  useEffect(() => {
    if (!isOpen) return;

    // Reset only transient UI state on open
    setError(null);
    setSuccess(null);

    const loadSources = async () => {
      setSourcesLoading(true);

      // Fast path: cached sources from SourcesPage
      try {
        const cached = localStorage.getItem('sources');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) setSources(parsed);
        }
      } catch {
        // ignore
      }

      try {
        const res = await getAllSources();
        if (res.success) {
          const data = Array.isArray(res.data) ? res.data : (res.data?.sources || []);
          setSources(Array.isArray(data) ? data : []);
        }
      } finally {
        setSourcesLoading(false);
      }
    };

    loadSources();
  }, [isOpen]);

  // Manual Import States
  const [manualProduct, setManualProduct] = useState({
    groupName: '',
    groupType: 'SERVER',
    serviceName: '',
    serviceId: '',
    credit: '',
    time: '',
    info: '',
    customFields: []
  });

  if (!isOpen) return null;

  const handleApiImport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // التحقق من البيانات المطلوبة
      if (!apiConfig.username || !apiConfig.apikey) {
        throw new Error(dir === 'rtl' 
          ? '⚠️ يرجى إدخال اسم المستخدم ومفتاح API' 
          : '⚠️ Please enter username and API key');
      }

      console.log('📤 Importing from external source:', {
        sourceUrl: apiConfig.url,
        username: apiConfig.username,
        hasApiKey: !!apiConfig.apikey,
        sourcePicked: !!selectedSourceId
      });

      // استيراد من مصدر خارجي عبر Backend
      const result = await importFromExternalSource(apiConfig);
      console.log('✅ Import result:', result);
      
      // فحص النتيجة
      if (!result.success) {
        console.error('❌ Sync failed:', result.error);
        throw new Error(result.error || (dir === 'rtl' 
          ? '❌ فشل في استيراد المنتجات' 
          : '❌ Failed to import products'));
      }

      const backendLogsRaw = result.data?.logs ?? result.data?.syncLogs ?? result.data?.log;
      const backendLogs = Array.isArray(backendLogsRaw)
        ? backendLogsRaw
        : (typeof backendLogsRaw === 'string' ? backendLogsRaw.split(/\r?\n/).filter(Boolean) : []);

      if (backendLogs.length > 0) {
        console.log('📜 Backend logs:', backendLogs);
      }

      const importedCount = result.data?.imported ?? result.data?.count ?? 0;
      console.log(`✓ Successfully imported ${importedCount} products`);
      
      setSuccess(dir === 'rtl' 
        ? `✅ تم استيراد ${importedCount} منتج بنجاح!` 
        : `✅ Successfully imported ${importedCount} products!`);
      
      // إعادة تحميل المنتجات
      setTimeout(() => {
        onClose();
        setSuccess(null);
        window.location.reload(); // إعادة تحميل الصفحة لعرض المنتجات الجديدة
      }, 2000);
    } catch (err) {
      setError(err.message || (dir === 'rtl' 
        ? '❌ حدث خطأ أثناء الاستيراد' 
        : '❌ Error occurred during import'));
      console.error('Import Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processExternalProducts = (data) => {
    const products = [];
    
    // تصنيف المنتجات حسب النوع
    Object.entries(data).forEach(([groupKey, group]) => {
      if (group.SERVICES) {
        Object.entries(group.SERVICES).forEach(([serviceKey, service]) => {
          const productType = service.SERVICETYPE || 'SERVER';
          
          products.push({
            sourceName: apiConfig.sourceName, // ربط بالمصدر
            sourceUrl: apiConfig.url,
            groupKey: groupKey,
            groupName: group.GROUPNAME,
            groupType: productType,
            serviceKey: serviceKey,
            serviceId: service.SERVICEID,
            serviceName: service.SERVICENAME,
            serviceType: productType,
            credit: service.CREDIT,
            time: service.TIME,
            info: service.INFO || '',
            minQnt: service.MINQNT || '0',
            maxQnt: service.MAXQNT || '0',
            customFields: service['Requires.Custom'] || [],
            enabled: true
          });
        });
      }
    });

    return products;
  };

  const handleManualAdd = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!manualProduct.groupName || !manualProduct.serviceName || !manualProduct.credit) {
        throw new Error(dir === 'rtl' 
          ? 'يرجى ملء جميع الحقول المطلوبة' 
          : 'Please fill all required fields');
      }

      const product = {
        groupKey: manualProduct.groupName.replace(/\s+/g, '_'),
        groupName: manualProduct.groupName,
        groupType: manualProduct.groupType,
        serviceKey: Date.now().toString(),
        serviceId: manualProduct.serviceId || Date.now(),
        serviceName: manualProduct.serviceName,
        serviceType: manualProduct.groupType,
        credit: manualProduct.credit,
        time: manualProduct.time || 'Instant',
        info: manualProduct.info || '',
        customFields: manualProduct.customFields,
        enabled: true
      };

      await onImport([product]);
      
      setSuccess(dir === 'rtl' 
        ? '✅ تم إضافة المنتج بنجاح!' 
        : '✅ Product added successfully!');
      
      // إعادة تعيين النموذج
      setManualProduct({
        groupName: '',
        groupType: 'SERVER',
        serviceName: '',
        serviceId: '',
        credit: '',
        time: '',
        info: '',
        customFields: []
      });
      
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCustomField = () => {
    setManualProduct(prev => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        {
          fieldname: '',
          fieldtype: 'text',
          required: 'on'
        }
      ]
    }));
  };

  const removeCustomField = (index) => {
    setManualProduct(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const updateCustomField = (index, field, value) => {
    setManualProduct(prev => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) => 
        i === index ? { ...cf, [field]: value } : cf
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir={dir}>
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border-2 animate-fadeIn"
        style={{ backgroundColor: '#363740', borderColor: '#3A3A3E' }}
      >
        {/* رأس النافذة */}
        <div
          className="sticky top-0 z-10 px-5 py-4 border-b-2 flex items-center justify-between"
          style={{ backgroundColor: '#363740', borderColor: '#3A3A3E' }}
        >
          <h2 className="text-xl font-bold" style={{ color: '#ECECEC' }}>
            {dir === 'rtl' ? '📥 استيراد منتجات' : '📥 Import Products'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10 active:scale-95"
          >
            <svg className="w-6 h-6" style={{ color: '#A0A0A5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* محتوى النافذة */}
        <div className="p-6 space-y-6">
          
          {/* اختيار طريقة الاستيراد */}
          <div className="flex gap-3">
            <button
              onClick={() => setImportMethod('api')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 border-2 transform active:scale-[0.98] ${
                importMethod === 'api'
                  ? 'text-white'
                  : 'text-gray-200 hover:bg-white/5'
              }`}
              style={{
                backgroundColor: importMethod === 'api' ? '#6366F1' : '#242529',
                borderColor: importMethod === 'api' ? '#6366F1' : '#3A3A3E'
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>{dir === 'rtl' ? 'استيراد من API' : 'Import from API'}</span>
              </div>
            </button>
            
            <button
              onClick={() => setImportMethod('manual')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 border-2 transform active:scale-[0.98] ${
                importMethod === 'manual'
                  ? 'text-white'
                  : 'text-gray-200 hover:bg-white/5'
              }`}
              style={{
                backgroundColor: importMethod === 'manual' ? '#6366F1' : '#242529',
                borderColor: importMethod === 'manual' ? '#6366F1' : '#3A3A3E'
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{dir === 'rtl' ? 'إضافة يدوية' : 'Manual Add'}</span>
              </div>
            </button>
          </div>

          {/* رسائل النجاح والخطأ */}
          {success && (
            <div className="p-4 rounded-xl border-2" style={{ backgroundColor: 'rgba(34,197,94,0.10)', borderColor: 'rgba(34,197,94,0.35)' }}>
              <p className="text-sm font-semibold" style={{ color: '#86EFAC' }}>{success}</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border-2" style={{ backgroundColor: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.35)' }}>
              <p className="text-sm font-semibold" style={{ color: '#FCA5A5' }}>❌ {error}</p>
            </div>
          )}

          {/* نموذج API */}
          {importMethod === 'api' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                  {dir === 'rtl' ? 'اختيار مصدر جاهز' : 'Pick an existing source'}
                </label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedSourceId(nextId);
                    const src = nextId ? sourcesById.get(String(nextId)) : null;
                    if (src) {
                      const srcUrl = src.apiUrl || src.url || '';
                      const srcUser = src.username || '';
                      const srcKey = src.apiKey || src.apikey || src.api_key || '';
                      const srcName = src.name || apiConfig.sourceName;
                      setApiConfig((prev) => ({
                        ...prev,
                        sourceName: srcName,
                        url: srcUrl || prev.url,
                        username: srcUser,
                        apikey: srcKey,
                      }));
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none focus:border-[#6366F1] transition-all"
                  style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                >
                  <option value="">{dir === 'rtl' ? '— إدخال يدوي —' : '— Manual entry —'}</option>
                  {(sources || []).map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name || (dir === 'rtl' ? 'مصدر' : 'Source')}#{s.id}
                    </option>
                  ))}
                </select>
                <p className="text-xs mt-1" style={{ color: '#A0A0A5' }}>
                  {sourcesLoading
                    ? (dir === 'rtl' ? 'جاري تحميل المصادر...' : 'Loading sources...')
                    : (dir === 'rtl'
                      ? 'اختر مصدر من شاشة المصادر لتعبئة البيانات تلقائياً، أو اتركه للإدخال اليدوي.'
                      : 'Choose a source from Sources screen to auto-fill, or keep manual entry.')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                  {dir === 'rtl' ? 'اسم المصدر' : 'Source Name'}
                </label>
                <input
                  type="text"
                  value={apiConfig.sourceName}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, sourceName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                  style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                  placeholder="sd-unlocker"
                />
                <p className="text-xs mt-1" style={{ color: '#A0A0A5' }}>
                  {dir === 'rtl' ? 'اسم تعريفي للمصدر (مثل: sd-unlocker)' : 'Identifier for the source (e.g., sd-unlocker)'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                  {dir === 'rtl' ? 'رابط API' : 'API URL'}
                </label>
                <input
                  type="text"
                  value={apiConfig.url}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                  style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                  placeholder="https://example.com/api/index.php"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                  {dir === 'rtl' ? 'اسم المستخدم' : 'Username'}
                </label>
                <input
                  type="text"
                  value={apiConfig.username}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                  style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                  {dir === 'rtl' ? 'مفتاح API' : 'API Key'}
                </label>
                <input
                  type="password"
                  value={apiConfig.apikey}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, apikey: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                  style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                  placeholder="Z4U-MIH-600-V7V-JNQ-ZTP-W3B-A7W"
                />
              </div>

              <button
                onClick={handleApiImport}
                disabled={loading || !apiConfig.username || !apiConfig.apikey}
                className={`w-full px-5 py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.98] ${
                  loading || !apiConfig.username || !apiConfig.apikey
                    ? 'cursor-not-allowed'
                    : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: (loading || !apiConfig.username || !apiConfig.apikey) ? '#3A3A3E' : '#6366F1',
                  color: '#FFFFFF'
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{dir === 'rtl' ? 'جاري الاستيراد...' : 'Importing...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span>{dir === 'rtl' ? '📥 استيراد المنتجات' : '📥 Import Products'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* نموذج الإضافة اليدوية */}
          {importMethod === 'manual' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                    {dir === 'rtl' ? 'اسم المجموعة *' : 'Group Name *'}
                  </label>
                  <input
                    type="text"
                    value={manualProduct.groupName}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, groupName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                    style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                    placeholder={dir === 'rtl' ? 'مثال: Dragon Frp Tool' : 'e.g. Dragon Frp Tool'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                    {dir === 'rtl' ? 'نوع الخدمة *' : 'Service Type *'}
                  </label>
                  <select
                    value={manualProduct.groupType}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, groupType: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                    style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                  >
                    <option value="SERVER">🖥️ Server Service</option>
                    <option value="IMEI">📱 IMEI Service</option>
                    <option value="REMOTE">🌐 Remote Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                  {dir === 'rtl' ? 'اسم الخدمة *' : 'Service Name *'}
                </label>
                <input
                  type="text"
                  value={manualProduct.serviceName}
                  onChange={(e) => setManualProduct(prev => ({ ...prev, serviceName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                  style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                  placeholder={dir === 'rtl' ? 'مثال: Samsung FRP Unlock' : 'e.g. Samsung FRP Unlock'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                    {dir === 'rtl' ? 'السعر ($) *' : 'Price ($) *'}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={manualProduct.credit}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, credit: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                    style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                    placeholder="1.500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                    {dir === 'rtl' ? 'الوقت' : 'Time'}
                  </label>
                  <input
                    type="text"
                    value={manualProduct.time}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                    style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                    placeholder={dir === 'rtl' ? '1-5 دقائق' : '1-5 Minutes'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ECECEC' }}>
                  {dir === 'rtl' ? 'معلومات إضافية' : 'Additional Info'}
                </label>
                <textarea
                  value={manualProduct.info}
                  onChange={(e) => setManualProduct(prev => ({ ...prev, info: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                  style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                  placeholder={dir === 'rtl' ? 'وصف الخدمة...' : 'Service description...'}
                />
              </div>

              {/* حقول مخصصة */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold" style={{ color: '#ECECEC' }}>
                    {dir === 'rtl' ? 'حقول مخصصة' : 'Custom Fields'}
                  </label>
                  <button
                    onClick={addCustomField}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 transform active:scale-[0.98] hover:brightness-110"
                    style={{ backgroundColor: '#6366F1', color: '#FFFFFF' }}
                  >
                    + {dir === 'rtl' ? 'إضافة حقل' : 'Add Field'}
                  </button>
                </div>

                {manualProduct.customFields.map((field, index) => (
                  <div key={index} className="flex gap-2 mb-2 p-3 rounded-lg border-2" style={{ backgroundColor: '#242529', borderColor: '#3A3A3E' }}>
                    <input
                      type="text"
                      value={field.fieldname}
                      onChange={(e) => updateCustomField(index, 'fieldname', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border-2 focus:outline-none focus:border-[#6366F1] transition-all"
                      style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                      placeholder={dir === 'rtl' ? 'اسم الحقل' : 'Field Name'}
                    />
                    <select
                      value={field.fieldtype}
                      onChange={(e) => updateCustomField(index, 'fieldtype', e.target.value)}
                      className="px-3 py-2 rounded-lg border-2 transition-all"
                      style={{ backgroundColor: '#242529', borderColor: '#3A3A3E', color: '#ECECEC' }}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                    </select>
                    <button
                      onClick={() => removeCustomField(index)}
                      className="px-3 py-2 rounded-lg text-white transition-all duration-200 transform active:scale-[0.98] hover:brightness-110"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleManualAdd}
                disabled={loading || !manualProduct.groupName || !manualProduct.serviceName || !manualProduct.credit}
                className={`w-full px-5 py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.98] ${
                  loading || !manualProduct.groupName || !manualProduct.serviceName || !manualProduct.credit
                    ? 'cursor-not-allowed'
                    : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: (loading || !manualProduct.groupName || !manualProduct.serviceName || !manualProduct.credit) ? '#3A3A3E' : '#6366F1',
                  color: '#FFFFFF'
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{dir === 'rtl' ? 'جاري الإضافة...' : 'Adding...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{dir === 'rtl' ? '✅ إضافة المنتج' : '✅ Add Product'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportProductsModal;
