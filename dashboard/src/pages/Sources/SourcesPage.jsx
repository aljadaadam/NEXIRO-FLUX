import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import AppLayout from '../../components/layout/AppLayout';
import { SkeletonSources } from '../../components/common/Skeleton';
import SourcesHeader from './components/SourcesHeader';
import SourceStats from './components/SourceStats';
import SearchFilters from './components/SearchFilters';
import SourceCard from './components/SourceCard';
import EmptySourcesState from './components/EmptySourcesState';
import SourceFormModal from './components/SourceFormModal';
import ProfitModal from './components/ProfitModal';
import SyncModal from './components/SyncModal';
import {
  getAllSources,
  createSource,
  updateSource,
  deleteSource,
  toggleSourceStatus,
  testSourceConnection,
  syncSourceProducts,
  getSourceStats,
  applyProfitMargin
} from '../../services/sources';

const SourcesPage = () => {
  const { language, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  // الترجمات
  const t = {
    title: isRTL ? 'إدارة المصادر الخارجية' : 'External Sources Management',
    subtitle: isRTL ? 'إدارة اتصالات API وضبط الأرباح' : 'Manage API connections and profit margins',
    addSource: isRTL ? 'إضافة مصدر جديد' : 'Add New Source',
    noSources: isRTL ? 'لا توجد مصادر حالياً' : 'No sources currently',
    sourceName: isRTL ? 'اسم المصدر' : 'Source Name',
    apiUrl: isRTL ? 'رابط API' : 'API URL',
    username: isRTL ? 'اسم المستخدم' : 'Username',
    apiKey: isRTL ? 'مفتاح API' : 'API Key',
    profitPercentage: isRTL ? 'نسبة الربح الافتراضية (%)' : 'Default Profit Percentage (%)',
    description: isRTL ? 'الوصف' : 'Description',
    enabled: isRTL ? 'تفعيل المصدر' : 'Enable Source',
    active: isRTL ? 'نشط' : 'Active',
    inactive: isRTL ? 'معطل' : 'Inactive',
    products: isRTL ? 'عدد المنتجات' : 'Products Count',
    profitMargin: isRTL ? 'نسبة الربح' : 'Profit Margin',
    testConnection: isRTL ? 'اختبار الاتصال' : 'Test Connection',
    testing: isRTL ? 'جاري الاختبار...' : 'Testing...',
    sync: isRTL ? 'مزامنة المنتجات' : 'Sync Products',
    syncing: isRTL ? 'جاري المزامنة...' : 'Syncing...',
    applyProfit: isRTL ? 'تطبيق نسبة الربح' : 'Apply Profit Margin',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    save: isRTL ? 'حفظ' : 'Save',
    addNew: isRTL ? 'إضافة المصدر' : 'Add Source',
    editSource: isRTL ? 'تعديل المصدر' : 'Edit Source',
    saveChanges: isRTL ? 'حفظ التعديلات' : 'Save Changes',
    deleteConfirm: isRTL ? 'هل أنت متأكد من حذف هذا المصدر؟' : 'Are you sure you want to delete this source?',
    connectionSuccess: isRTL ? 'الاتصال ناجح!' : 'Connection successful!',
    connectionFailed: isRTL ? 'فشل الاتصال' : 'Connection failed',
    connectionStatus: isRTL ? 'حالة الاتصال' : 'Connection Status',
    connected: isRTL ? 'متصل' : 'Connected',
    disconnected: isRTL ? 'غير متصل' : 'Disconnected',
    unknown: isRTL ? 'غير معروف' : 'Unknown',
    sourceAdded: isRTL ? 'تم إضافة المصدر بنجاح' : 'Source added successfully',
    sourceUpdated: isRTL ? 'تم تحديث المصدر بنجاح' : 'Source updated successfully',
    sourceDeleted: isRTL ? 'تم حذف المصدر بنجاح' : 'Source deleted successfully',
    syncSuccess: isRTL ? 'تم مزامنة ${count} منتج بنجاح!' : 'Successfully synced ${count} products!',
    profitApplied: isRTL ? 'تم تطبيق نسبة الربح ${percent}% على ${count} منتج' : 'Applied ${percent}% profit margin to ${count} products',
    applyProfitTitle: isRTL ? 'تطبيق نسبة الربح' : 'Apply Profit Margin',
    profitWarning: isRTL ? 'سيتم تطبيق نسبة الربح على جميع المنتجات المرتبطة بهذا المصدر' : 'The profit margin will be applied to all products linked to this source',
    profitExample: isRTL ? 'مثال: سعر المصدر $1.00 + ربح ${percent}% = $${result}' : 'Example: Source price $1.00 + ${percent}% profit = $${result}',
    serverError: isRTL ? 'تحذير: فشل الاتصال بالسيرفر' : 'Warning: Server Connection Failed',
    cachedData: isRTL ? 'يتم عرض البيانات المحفوظة محلياً. قد لا تكون محدثة.' : 'Displaying cached data. May not be up to date.',
    retry: isRTL ? 'إعادة المحاولة' : 'Retry',
    profitHelper: isRTL ? 'سيتم تطبيق هذه النسبة على جميع المنتجات المستوردة من هذا المصدر' : 'This percentage will be applied to all products imported from this source',
    sourceIdentifier: isRTL ? 'اسم تعريفي للمصدر (مثل: sd-unlocker)' : 'Identifier for the source (e.g., sd-unlocker)',
    accountInfo: isRTL ? 'بيانات الحساب' : 'Account Info',
    apiVersion: isRTL ? 'إصدار API' : 'API Version',
    credit: isRTL ? 'الرصيد' : 'Credit',
    currency: isRTL ? 'العملة' : 'Currency',
    email: isRTL ? 'البريد' : 'Email',
    close: isRTL ? 'إغلاق' : 'Close'
    ,
    // New design keys
    totalSources: isRTL ? 'إجمالي المصادر' : 'Total Sources',
    activeSources: isRTL ? 'المصادر النشطة' : 'Active Sources',
    connectedSources: isRTL ? 'المصادر المتصلة' : 'Connected Sources',
    totalProducts: isRTL ? 'إجمالي المنتجات' : 'Total Products',
    searchPlaceholder: isRTL ? 'ابحث عن مصدر...' : 'Search sources...',
    allStatus: isRTL ? 'جميع الحالات' : 'All Status'
  };

  // الحالة
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [testingSource, setTestingSource] = useState(null);
  const [syncingSource, setSyncingSource] = useState(null);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [statsSupported, setStatsSupported] = useState(true);
  const [syncOptions, setSyncOptions] = useState({
    setupIMEI: false,
    setupServer: false,
    setupRemote: false,
    deleteAllBrandModel: false
  });
  const [syncLogs, setSyncLogs] = useState([]);

  // New design: search/filter/view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // بيانات النموذج
  const [formData, setFormData] = useState({
    name: '',
    apiUrl: '',
    username: '',
    apiKey: '',
    profitPercentage: 0,
    enabled: true,
    description: ''
  });

  // نسبة الربح
  const [profitPercentage, setProfitPercentage] = useState(0);

  const normalizeSource = (raw) => {
    const sourceId = raw?.id ?? raw?._id ?? raw?.sourceId ?? raw?.source_id ?? raw?.sourceID ?? null;
    const apiUrl = raw?.apiUrl ?? raw?.url ?? raw?.api_url ?? '';
    const apiKey =
      raw?.apiKey ??
      raw?.api_key ??
      raw?.apikey ??
      raw?.apiKeyValue ??
      raw?.key ??
      raw?.token ??
      raw?.secret ??
      '';
    const apiKeyLast4 =
      raw?.apiKeyLast4 ??
      raw?.api_key_last4 ??
      raw?.apiKey_last4 ??
      raw?.api_key_last_4 ??
      raw?.apiKeyLastFour ??
      null;
    const username =
      raw?.username ??
      raw?.user ??
      raw?.email ??
      raw?.login ??
      raw?.userName ??
      '';
    const productsCountRaw =
      raw?.productsCount ??
      raw?.products_count ??
      raw?.products?.length ??
      raw?.stats?.productsCount ??
      raw?.stats?.count ??
      null;

    return {
      ...raw,
      id: sourceId,
      name: raw?.name ?? raw?.sourceName ?? '',
      apiUrl,
      username,
      apiKey,
      apiKeyLast4: (typeof apiKeyLast4 === 'string' || typeof apiKeyLast4 === 'number') ? String(apiKeyLast4) : null,
      profitPercentage: raw?.profitPercentage ?? raw?.profit_percentage ?? 0,
      enabled: raw?.enabled !== false,
      description: raw?.description ?? '',
      productsCount: typeof productsCountRaw === 'number' ? productsCountRaw : (productsCountRaw ? Number(productsCountRaw) : 0),
      balance: raw?.sourceBalance ?? raw?.balance ?? raw?.last_account_balance ?? raw?.lastAccountBalance ?? null,
      currency: raw?.sourceCurrency ?? raw?.currency ?? raw?.last_account_currency ?? raw?.lastAccountCurrency ?? null,
      lastConnectionOk:
        typeof raw?.lastConnectionOk === 'boolean'
          ? raw.lastConnectionOk
          : (typeof raw?.connectionOk === 'boolean' ? raw.connectionOk : null),
      connectionStatus:
        raw?.connectionStatus ??
        raw?.connection_status ??
        (typeof raw?.connectionOk === 'boolean'
          ? (raw.connectionOk ? 'connected' : 'disconnected')
          : 'unknown'),
      lastConnectionCheckedAt:
        raw?.lastConnectionCheckedAt ??
        raw?.last_connection_checked_at ??
        null,
      lastConnectionError:
        raw?.lastConnectionError ??
        raw?.last_connection_error ??
        null,
    };
  };

  const stats = useMemo(() => {
    const list = Array.isArray(sources) ? sources : [];
    const totalSources = list.length;
    const activeSources = list.filter((s) => s?.enabled !== false).length;
    const connectedSources = list.filter((s) => (s?.enabled !== false) && (s?.connectionStatus === 'connected')).length;
    const totalProducts = list.reduce((sum, s) => sum + (Number(s?.productsCount) || 0), 0);
    return { totalSources, activeSources, connectedSources, totalProducts };
  }, [sources]);

  const filteredSources = useMemo(() => {
    const list = Array.isArray(sources) ? sources : [];
    const q = (searchQuery || '').trim().toLowerCase();
    return list.filter((s) => {
      const enabled = s?.enabled !== false;
      const connectionStatus = (s?.connectionStatus || 'unknown');

      const statusOk =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? enabled
            : statusFilter === 'inactive'
              ? !enabled
              : statusFilter === 'connected'
                ? connectionStatus === 'connected'
                : statusFilter === 'disconnected'
                  ? connectionStatus === 'disconnected'
                  : true;

      if (!statusOk) return false;
      if (!q) return true;

      const hay = [s?.name, s?.apiUrl, s?.username]
        .filter(Boolean)
        .map(String)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [sources, searchQuery, statusFilter]);

  const refreshStats = async (list) => {
    if (!statsSupported) return;
    const safeList = Array.isArray(list) ? list : [];
    if (safeList.length === 0) return;

    const results = await Promise.all(
      safeList.map(async (s) => {
        if (!s?.id) return { id: null, success: false };
        try {
          const res = await getSourceStats(s.id);
          return { id: s.id, ...res };
        } catch (e) {
          return { id: s.id, success: false };
        }
      })
    );

    // If backend doesn't support /stats, stop calling it.
    if (results.some(r => r && r.success === false && r.status === 404)) {
      setStatsSupported(false);
      return;
    }

    const byId = new Map(results.filter(r => r.id != null).map(r => [String(r.id), r]));
    setSources((prev) =>
      (prev || []).map((s) => {
        const hit = byId.get(String(s.id));
        if (!hit?.success) return s;
        const countRaw = hit.data?.productsCount ?? hit.data?.count ?? hit.data?.products_count ?? hit.data?.products?.length;
        const nextCount = typeof countRaw === 'number' ? countRaw : (countRaw ? Number(countRaw) : s.productsCount || 0);
        const connectionOk = typeof hit.data?.connectionOk === 'boolean' ? hit.data.connectionOk : null;
        return {
          ...s,
          productsCount: Number.isFinite(nextCount) ? nextCount : (s.productsCount || 0),
          ...(connectionOk === null
            ? {}
            : {
                lastConnectionOk: connectionOk,
                connectionStatus: connectionOk ? 'connected' : 'disconnected',
              }),
        };
      })
    );
  };

  // تحميل المصادر
  const loadSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllSources();
      console.log('📥 Sources result:', result);
      
      if (result.success) {
        // التأكد من أن البيانات array
        const sourcesData = Array.isArray(result.data) 
          ? result.data 
          : (result.data?.sources || []);
        const normalized = (Array.isArray(sourcesData) ? sourcesData : []).map(normalizeSource);
        console.log('✅ Sources loaded:', normalized);
        setSources(normalized);
        refreshStats(normalized);
      } else {
        // محاولة استخدام البيانات المحفوظة محلياً
        const cachedData = localStorage.getItem('sources');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const normalized = (Array.isArray(parsed) ? parsed : []).map(normalizeSource);
          setSources(normalized);
          setError(isRTL ? 'تم تحميل البيانات المحفوظة (لا يوجد اتصال بالسيرفر)' : 'Loaded cached data (no server connection)');
        } else {
          setSources([]);
          setError(result.error || (isRTL ? 'فشل تحميل المصادر' : 'Failed to load sources'));
        }
      }
    } catch (err) {
      console.error('❌ Error loading sources:', err);
      const cachedData = localStorage.getItem('sources');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const normalized = (Array.isArray(parsed) ? parsed : []).map(normalizeSource);
        setSources(normalized);
        setError(isRTL ? 'تم تحميل البيانات المحفوظة (لا يوجد اتصال بالسيرفر)' : 'Loaded cached data (no server connection)');
      } else {
        setSources([]);
        setError(isRTL ? 'فشل الاتصال بالسيرفر' : 'Server connection failed');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  // حفظ البيانات محلياً عند التحديث
  useEffect(() => {
    if (sources.length > 0) {
      localStorage.setItem('sources', JSON.stringify(sources));
    }
  }, [sources]);

  // فتح نموذج الإضافة
  const handleAdd = () => {
    setEditingSource(null);
    setFormData({
      name: '',
      apiUrl: '',
      username: '',
      apiKey: '',
      profitPercentage: 0,
      enabled: true,
      description: ''
    });
    setShowModal(true);
  };

  // فتح نموذج التعديل
  const handleEdit = (source) => {
    const normalized = normalizeSource(source);
    setEditingSource(source);
    setFormData({
      name: normalized.name,
      apiUrl: normalized.apiUrl,
      username: normalized.username,
      apiKey: normalized.apiKey,
      profitPercentage: normalized.profitPercentage || 0,
      enabled: normalized.enabled !== false,
      description: normalized.description || ''
    });
    setShowModal(true);
  };

  // حفظ المصدر
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // تحويل البيانات للصيغة التي يتوقعها Backend
      const sourceData = {
        name: formData.name,
        type: formData.type || 'sd-unlocker', // نوع المصدر
        url: formData.apiUrl, // backend قد يتوقع url
        apiUrl: formData.apiUrl, // وبعض النسخ تتوقع apiUrl
        username: formData.username,
        apiKey: formData.apiKey,
        api_key: formData.apiKey,
        profitPercentage: Number.isFinite(Number(formData.profitPercentage)) ? Number(formData.profitPercentage) : 0,
        enabled: formData.enabled !== false, // التأكد من القيمة boolean
        description: (typeof formData.description === 'string' ? formData.description : ''),
        productsCount: editingSource?.productsCount || 0
      };
      
      console.log('📤 Saving source:', sourceData);
      
      let result;
      if (editingSource) {
        result = await updateSource(editingSource.id, sourceData);
      } else {
        result = await createSource(sourceData);
      }

      if (result.success) {
        await loadSources();
        setShowModal(false);
      } else {
        alert((isRTL ? 'خطأ: ' : 'Error: ') + result.error);
      }
    } catch (err) {
      alert(isRTL ? 'فشل حفظ المصدر' : 'Failed to save source');
    } finally {
      setLoading(false);
    }
  };

  // حذف المصدر
  const handleDelete = async (sourceId) => {
    if (!sourceId) {
      alert(isRTL ? 'تعذر حذف المصدر: معرّف غير صالح' : 'Cannot delete source: invalid id');
      return;
    }
    if (!confirm(t.deleteConfirm)) return;

    try {
      const result = await deleteSource(sourceId);
      if (result.success) {
        await loadSources();
      } else {
        alert((isRTL ? 'خطأ: ' : 'Error: ') + result.error);
      }
    } catch (err) {
      alert(isRTL ? 'فشل حذف المصدر' : 'Failed to delete source');
    }
  };

  // تفعيل/تعطيل المصدر
  const handleToggleStatus = async (source) => {
    try {
      const result = await toggleSourceStatus(source.id, !source.enabled);
      if (result.success) {
        await loadSources();
      } else {
        alert((isRTL ? 'خطأ: ' : 'Error: ') + result.error);
      }
    } catch (err) {
      alert(isRTL ? 'فشل تغيير حالة المصدر' : 'Failed to change source status');
    }
  };

  // اختبار الاتصال
  const handleTestConnection = async (sourceId) => {
    setTestingSource(sourceId);
    try {
      const result = await testSourceConnection(sourceId);
      if (!result.success) {
        setSources((prev) =>
          (prev || []).map((s) => (s.id === sourceId ? { ...s, lastConnectionOk: false, connectionStatus: 'disconnected' } : s))
        );
        alert(t.connectionFailed + ': ' + result.error);
        return;
      }

      const ok = typeof result.data?.connectionOk === 'boolean' ? result.data.connectionOk : true;
      const reason =
        result.data?.lastConnectionError ||
        result.data?.error ||
        result.data?.message ||
        '';
      
      // Extract balance and currency from new backend format
      const balance = result.data?.sourceBalance ?? result.data?.balance ?? null;
      const currency = result.data?.sourceCurrency ?? result.data?.currency ?? null;

      setSources((prev) =>
        (prev || []).map((s) =>
          s.id === sourceId
            ? { 
                ...s, 
                lastConnectionOk: ok, 
                connectionStatus: ok ? 'connected' : 'disconnected',
                lastConnectionError: reason || s.lastConnectionError,
                balance: balance ?? s.balance,
                currency: currency ?? s.currency
              }
            : s
        )
      );
      
      // Pull the latest persisted status/details from backend
      await loadSources();

      // Show error message only on failure
      if (!ok) {
        // Connection test completed but provider returned error
        const errorMsg = reason 
          ? (isRTL 
              ? `فشل الاتصال بالمصدر:\n${reason}\n\nتحقق من:\n- اسم المستخدم (username بدون @gmail.com)\n- مفتاح API صحيح\n- رابط API صحيح`
              : `Provider connection failed:\n${reason}\n\nPlease verify:\n- Username (without @gmail.com)\n- API Key is correct\n- API URL is correct`)
          : t.disconnected;
        alert(errorMsg);
      }
    } catch (err) {
      setSources((prev) => (prev || []).map((s) => (s.id === sourceId ? { ...s, lastConnectionOk: false } : s)));
      alert(isRTL ? 'فشل اختبار الاتصال' : 'Connection test failed');
    } finally {
      setTestingSource(null);
    }
  };

  // فتح modal المزامنة
  const handleOpenSyncModal = (source) => {
    setSelectedSource(source);
    setShowSyncModal(true);
    setSyncLogs([]);
  };

  // مزامنة المنتجات
  const handleSync = async () => {
    if (!selectedSource) return;
    
    setSyncingSource(selectedSource.id);
    setSyncLogs([
      `${isRTL ? 'بدء المزامنة...' : 'Starting synchronization...'}`,
      `${isRTL ? 'الاتصال بـ' : 'Connecting to'} ${selectedSource.apiUrl}...`
    ]);
    
    try {
      const setupIMEI = !!syncOptions?.setupIMEI;
      const setupServer = !!syncOptions?.setupServer;
      const setupRemote = !!syncOptions?.setupRemote;
      const deleteAllBrandModel = !!syncOptions?.deleteAllBrandModel;

      // Send only the important flags. Keep legacy key names, and also include hints
      // that the backend can use to control frontend visibility.
      const payloadOptions = {
        setupIMEI,
        setupServer,
        setupRemote,
        deleteAllBrandModel,
        publishFrontend: setupIMEI || setupServer || setupRemote,
        syncMode: deleteAllBrandModel ? 'delete_then_sync' : 'sync',
      };

      console.log('📤 Sync options:', payloadOptions);

      const result = await syncSourceProducts(selectedSource.id, payloadOptions);
      
      if (result.success) {
        const backendLogsRaw = result.data?.logs ?? result.data?.syncLogs ?? result.data?.log;
        const backendLogs = Array.isArray(backendLogsRaw)
          ? backendLogsRaw
          : (typeof backendLogsRaw === 'string' ? backendLogsRaw.split(/\r?\n/).filter(Boolean) : []);

        if (backendLogs.length > 0) {
          setSyncLogs(prev => [...prev, ...backendLogs]);
        }

        const count = result.data?.count || 0;
        setSyncLogs(prev => [...prev, 
          `${isRTL ? `تم مزامنة ${count} منتج بنجاح!` : `Successfully synced ${count} products!`}`
        ]);

        // تحديث حالة الاتصال/عدد المنتجات فوراً
        setSources((prev) =>
          (prev || []).map((s) =>
            s.id === selectedSource.id
              ? { ...s, lastConnectionOk: true, productsCount: Number.isFinite(Number(count)) ? Number(count) : (s.productsCount || 0) }
              : s
          )
        );
        await loadSources();

        // تطبيق نسبة الربح تلقائياً بعد المزامنة
        const percent = Number(selectedSource.profitPercentage);
        if (Number.isFinite(percent) && percent >= 0) {
          await applyProfitMargin(selectedSource.id, percent);
        }
        setShowSyncModal(false);
      } else {
        alert((isRTL ? 'فشلت المزامنة: ' : 'Sync failed: ') + result.error);
      }
    } catch (err) {
      alert(isRTL ? 'فشلت المزامنة' : 'Sync failed');
    } finally {
      setSyncingSource(null);
    }
  };

  // فتح نافذة تطبيق الربح
  const handleOpenProfitModal = (source) => {
    setSelectedSource(source);
    setProfitPercentage(source.profitPercentage || 0);
    setShowProfitModal(true);
  };

  // تطبيق نسبة الربح
  const handleApplyProfit = async () => {
    if (!selectedSource) return;

    const percent = Number(profitPercentage);
    if (!Number.isFinite(percent) || percent < 0) {
      alert(isRTL ? 'أدخل نسبة ربح صحيحة' : 'Please enter a valid profit percentage');
      return;
    }

    try {
      setLoading(true);
      const result = await applyProfitMargin(selectedSource.id, percent);
      
      if (result.success) {
        await loadSources();
        setShowProfitModal(false);
      } else {
        const extra = result.details?.details || result.details?.reason || result.details?.errors;
        const extraText = extra ? `\n${typeof extra === 'string' ? extra : JSON.stringify(extra)}` : '';
        alert((isRTL ? 'فشل تطبيق نسبة الربح: ' : 'Failed to apply profit margin: ') + result.error + extraText);
      }
    } catch (err) {
      alert(isRTL ? 'فشل تطبيق نسبة الربح' : 'Failed to apply profit margin');
    } finally {
      setLoading(false);
    }
  };

  if (loading && sources.length === 0) {
    return (
      <AppLayout>
        <div className="p-6">
          <SkeletonSources />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in" dir={dir}>
        <SourcesHeader dir={dir} t={t} onAdd={handleAdd} />

        <SourceStats stats={stats} t={t} />

        <SearchFilters
          dir={dir}
          isRTL={isRTL}
          t={t}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {error && (
          <div
            className="rounded-2xl border-2 p-4 shadow-lg"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <div className="text-sm" style={{ color: '#FDE68A' }}>{error}</div>
          </div>
        )}

        {filteredSources.length === 0 ? (
          <EmptySourcesState dir={dir} t={t} onAdd={handleAdd} />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'grid grid-cols-1 gap-6'}>
            {filteredSources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                dir={dir}
                isRTL={isRTL}
                t={t}
                testing={testingSource === source.id}
                syncing={syncingSource === source.id}
                onEdit={() => handleEdit(source)}
                onDelete={() => handleDelete(source.id)}
                onTestConnection={() => handleTestConnection(source.id)}
                onSync={() => handleOpenSyncModal(source)}
                onApplyProfit={() => handleOpenProfitModal(source)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <SourceFormModal
          dir={dir}
          t={t}
          isRTL={isRTL}
          editingSource={editingSource}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {showProfitModal && (
        <ProfitModal
          dir={dir}
          isRTL={isRTL}
          t={t}
          selectedSource={selectedSource}
          profitPercentage={profitPercentage}
          setProfitPercentage={setProfitPercentage}
          onClose={() => setShowProfitModal(false)}
          onApply={handleApplyProfit}
        />
      )}

      {showSyncModal && selectedSource && (
        <SyncModal
          dir={dir}
          isRTL={isRTL}
          t={t}
          selectedSource={selectedSource}
          syncingSource={syncingSource}
          syncOptions={syncOptions}
          setSyncOptions={setSyncOptions}
          syncLogs={syncLogs}
          onClose={() => setShowSyncModal(false)}
          onSync={handleSync}
        />
      )}
    </AppLayout>
  );
};

export default SourcesPage;
