import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import AppLayout from '../../components/layout/AppLayout';
import { SkeletonSources } from '../../components/common/Skeleton';
import {
  Plug,
  Plus,
  Pencil,
  Trash2,
  Wifi,
  RefreshCcw,
  BadgePercent,
  Save,
  X,
  Inbox,
  Info,
  Loader2,
  Globe,
  Database,
  Shield,
  Link2,
  Zap,
  CheckCircle,
  XCircle,
  MoreVertical,
  Filter,
  Search,
  ChevronRight,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  CreditCard,
  Activity,
  BarChart3,
  Server,
  Cpu,
  Network,
  Hash
} from 'lucide-react';
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
  const { language, dir, theme } = useLanguage();
  const isRTL = dir === 'rtl';
  const isDark = theme === 'dark';

  // الترجمات
  const t = {
    title: isRTL ? 'المصادر الخارجية' : 'External Sources',
    subtitle: isRTL ? 'إدارة اتصالات API وتعديل هوامش الربح' : 'Manage API connections and profit margins',
    addSource: isRTL ? 'إضافة مصدر' : 'Add Source',
    noSources: isRTL ? 'لا توجد مصادر حالياً' : 'No sources available',
    sourceName: isRTL ? 'اسم المصدر' : 'Source Name',
    apiUrl: isRTL ? 'رابط API' : 'API URL',
    username: isRTL ? 'اسم المستخدم' : 'Username',
    apiKey: isRTL ? 'مفتاح API' : 'API Key',
    profitPercentage: isRTL ? 'نسبة الربح (%)' : 'Profit Percentage (%)',
    description: isRTL ? 'وصف المصدر' : 'Description',
    enabled: isRTL ? 'تفعيل المصدر' : 'Enable Source',
    active: isRTL ? 'نشط' : 'Active',
    inactive: isRTL ? 'معطل' : 'Inactive',
    products: isRTL ? 'المنتجات' : 'Products',
    profitMargin: isRTL ? 'هامش الربح' : 'Profit Margin',
    testConnection: isRTL ? 'اختبار الاتصال' : 'Test Connection',
    testing: isRTL ? 'جاري الاختبار...' : 'Testing...',
    sync: isRTL ? 'مزامنة' : 'Sync',
    syncing: isRTL ? 'جاري المزامنة...' : 'Syncing...',
    applyProfit: isRTL ? 'تطبيق الربح' : 'Apply Profit',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    save: isRTL ? 'حفظ' : 'Save',
    addNew: isRTL ? 'إضافة جديد' : 'Add New',
    editSource: isRTL ? 'تعديل المصدر' : 'Edit Source',
    saveChanges: isRTL ? 'حفظ التغييرات' : 'Save Changes',
    deleteConfirm: isRTL ? 'هل أنت متأكد من حذف هذا المصدر؟' : 'Are you sure you want to delete this source?',
    connectionSuccess: isRTL ? 'الاتصال ناجح!' : 'Connection successful!',
    connectionFailed: isRTL ? 'فشل الاتصال' : 'Connection failed',
    connectionStatus: isRTL ? 'حالة الاتصال' : 'Connection Status',
    connected: isRTL ? 'متصل' : 'Connected',
    disconnected: isRTL ? 'غير متصل' : 'Disconnected',
    unknown: isRTL ? 'غير معروف' : 'Unknown',
    status: isRTL ? 'الحالة' : 'Status',
    actions: isRTL ? 'الإجراءات' : 'Actions',
    lastSync: isRTL ? 'آخر مزامنة' : 'Last Sync',
    balance: isRTL ? 'الرصيد' : 'Balance',
    currency: isRTL ? 'العملة' : 'Currency',
    totalSources: isRTL ? 'إجمالي المصادر' : 'Total Sources',
    activeSources: isRTL ? 'المصادر النشطة' : 'Active Sources',
    totalProducts: isRTL ? 'إجمالي المنتجات' : 'Total Products',
    searchPlaceholder: isRTL ? 'ابحث عن مصدر...' : 'Search sources...',
    filterByStatus: isRTL ? 'تصفية حسب الحالة' : 'Filter by status',
    allStatus: isRTL ? 'جميع الحالات' : 'All Status',
    quickActions: isRTL ? 'إجراءات سريعة' : 'Quick Actions',
    viewDetails: isRTL ? 'عرض التفاصيل' : 'View Details',
    copyApiKey: isRTL ? 'نسخ مفتاح API' : 'Copy API Key',
    showApiKey: isRTL ? 'إظهار المفتاح' : 'Show Key',
    hideApiKey: isRTL ? 'إخفاء المفتاح' : 'Hide Key',
    connectionTest: isRTL ? 'فحص الاتصال' : 'Connection Test',
    syncProducts: isRTL ? 'مزامنة المنتجات' : 'Sync Products',
    updateProfit: isRTL ? 'تحديث الربح' : 'Update Profit',
    moreOptions: isRTL ? 'المزيد' : 'More',
    stats: isRTL ? 'الإحصائيات' : 'Statistics',
    performance: isRTL ? 'الأداء' : 'Performance',
    recentActivity: isRTL ? 'النشاط الأخير' : 'Recent Activity',
    addFirstSource: isRTL ? 'أضف أول مصدر' : 'Add Your First Source',
    addFirstDesc: isRTL ? 'ابدأ بربط مصادرك الخارجية لإدارة منتجاتك' : 'Start connecting external sources to manage your products',
    getStarted: isRTL ? 'ابدأ الآن' : 'Get Started',
    emptyStateTitle: isRTL ? 'لا توجد مصادر بعد' : 'No Sources Yet',
    emptyStateDesc: isRTL ? 'أضف مصادر خارجية لمزامنة المنتجات وضبط هوامش الربح' : 'Add external sources to sync products and adjust profit margins'
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
    syncBrandModel: false,
    syncCountryProvider: false,
    syncMEP: false,
    setupIMEI: false,
    setupServer: false,
    setupRemote: false,
    deleteAllBrandModel: false,
    deleteAllCountryProvider: false,
    deleteAllMEP: false,
    skipFraudCheck: false,
    slowSync: false
  });
  const [syncLogs, setSyncLogs] = useState([]);
  
  // حالة جديدة للبحث والتصفية
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showApiKey, setShowApiKey] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // بيانات النموذج
  const [formData, setFormData] = useState({
    name: '',
    apiUrl: 'https://sd-unlocker.com/api/index.php',
    username: '',
    apiKey: '',
    profitPercentage: 0,
    enabled: true,
    description: ''
  });

  // نسبة الربح
  const [profitPercentage, setProfitPercentage] = useState(0);

  // إحصائيات
  const [stats, setStats] = useState({
    totalSources: 0,
    activeSources: 0,
    totalProducts: 0,
    connectedSources: 0
  });

  const extractAccountInfo = (payload) => {
    if (!payload) return null;

    const root = payload?.data ?? payload?.result ?? payload;

    if (root?.sourceBalance || root?.sourceCurrency || root?.balance || root?.currency) {
      const balanceValue = root.sourceBalance ?? root.balance;
      const currencyValue = root.sourceCurrency ?? root.currency;
      return {
        credit: balanceValue ? `$${balanceValue}` : null,
        creditRaw: balanceValue ?? null,
        currency: currencyValue ?? null,
        apiVersion: null,
      };
    }

    const account = root?.account ?? root?.Account ?? null;
    if (account && (account.credit || account.creditraw || account.mail || account.currency)) {
      return {
        credit: account.credit ?? null,
        creditRaw: account.creditraw ?? account.creditRaw ?? null,
        mail: account.mail ?? account.email ?? null,
        currency: account.currency ?? null,
        apiVersion: root?.apiversion ?? root?.apiVersion ?? null,
      };
    }

    const successArr = root?.SUCCESS ?? root?.success ?? root?.Success;
    const first = Array.isArray(successArr) ? successArr[0] : null;
    const info = first?.AccountInfo ?? first?.accountInfo ?? root?.AccountInfo ?? root?.accountInfo ?? null;
    if (!info) return null;

    const credit = info?.credit ?? null;
    const creditRaw = info?.creditraw ?? info?.creditRaw ?? null;
    const mail = info?.mail ?? info?.email ?? null;
    const currency = info?.currency ?? null;
    const apiVersion = root?.apiversion ?? root?.apiVersion ?? null;

    return {
      credit,
      creditRaw,
      mail,
      currency,
      apiVersion,
    };
  };

  const normalizeSource = (raw) => {
    const apiUrl = raw?.apiUrl ?? raw?.url ?? raw?.api_url ?? '';
    const apiKey = raw?.apiKey ?? raw?.api_key ?? raw?.apikey ?? raw?.apiKeyValue ?? raw?.key ?? raw?.token ?? raw?.secret ?? '';
    const apiKeyLast4 = raw?.apiKeyLast4 ?? raw?.api_key_last4 ?? raw?.apiKey_last4 ?? raw?.api_key_last_4 ?? raw?.apiKeyLastFour ?? null;
    const username = raw?.username ?? raw?.user ?? raw?.email ?? raw?.login ?? raw?.userName ?? '';
    const productsCountRaw = raw?.productsCount ?? raw?.products_count ?? raw?.products?.length ?? raw?.stats?.productsCount ?? raw?.stats?.count ?? null;

    return {
      ...raw,
      id: raw?.id,
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
      lastConnectionOk: typeof raw?.lastConnectionOk === 'boolean' ? raw.lastConnectionOk : (typeof raw?.connectionOk === 'boolean' ? raw.connectionOk : null),
      connectionStatus: raw?.connectionStatus ?? raw?.connection_status ?? (typeof raw?.connectionOk === 'boolean' ? (raw.connectionOk ? 'connected' : 'disconnected') : 'unknown'),
      lastConnectionCheckedAt: raw?.lastConnectionCheckedAt ?? raw?.last_connection_checked_at ?? null,
      lastConnectionError: raw?.lastConnectionError ?? raw?.last_connection_error ?? null,
      createdAt: raw?.createdAt ?? raw?.created_at ?? null,
      updatedAt: raw?.updatedAt ?? raw?.updated_at ?? null,
      lastSyncedAt: raw?.lastSyncedAt ?? raw?.last_synced_at ?? null
    };
  };

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
          ...(connectionOk === null ? {} : {
            lastConnectionOk: connectionOk,
            connectionStatus: connectionOk ? 'connected' : 'disconnected',
          }),
        };
      })
    );
  };

  const loadSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllSources();
      console.log('📥 Sources result:', result);
      
      if (result.success) {
        const sourcesData = Array.isArray(result.data) ? result.data : (result.data?.sources || []);
        const normalized = (Array.isArray(sourcesData) ? sourcesData : []).map(normalizeSource);
        console.log('✅ Sources loaded:', normalized);
        setSources(normalized);
        refreshStats(normalized);
        
        // تحديث الإحصائيات
        updateStats(normalized);
      } else {
        const cachedData = localStorage.getItem('sources');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const normalized = (Array.isArray(parsed) ? parsed : []).map(normalizeSource);
          setSources(normalized);
          updateStats(normalized);
          setError(isRTL ? 'تم تحميل البيانات المحفوظة (لا يوجد اتصال بالسيرفر)' : 'Loaded cached data (no server connection)');
        } else {
          setSources([]);
          updateStats([]);
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
        updateStats(normalized);
        setError(isRTL ? 'تم تحميل البيانات المحفوظة (لا يوجد اتصال بالسيرفر)' : 'Loaded cached data (no server connection)');
      } else {
        setSources([]);
        updateStats([]);
        setError(isRTL ? 'فشل الاتصال بالسيرفر' : 'Server connection failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (sourcesList) => {
    const totalSources = sourcesList.length;
    const activeSources = sourcesList.filter(s => s.enabled).length;
    const connectedSources = sourcesList.filter(s => s.connectionStatus === 'connected').length;
    const totalProducts = sourcesList.reduce((sum, s) => sum + (s.productsCount || 0), 0);
    
    setStats({
      totalSources,
      activeSources,
      connectedSources,
      totalProducts
    });
  };

  useEffect(() => {
    loadSources();
  }, []);

  useEffect(() => {
    if (sources.length > 0) {
      localStorage.setItem('sources', JSON.stringify(sources));
    }
  }, [sources]);

  const handleAdd = () => {
    setEditingSource(null);
    setFormData({
      name: '',
      apiUrl: 'https://sd-unlocker.com/api/index.php',
      username: '',
      apiKey: '',
      profitPercentage: 0,
      enabled: true,
      description: ''
    });
    setShowModal(true);
  };

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

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const sourceData = {
        name: formData.name,
        type: formData.type || 'sd-unlocker',
        url: formData.apiUrl,
        apiUrl: formData.apiUrl,
        username: formData.username,
        apiKey: formData.apiKey,
        api_key: formData.apiKey,
        profitPercentage: formData.profitPercentage || 0,
        enabled: formData.enabled !== false,
        description: formData.description || '',
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
        alert(editingSource ? t.sourceUpdated : t.sourceAdded);
      } else {
        alert((isRTL ? 'خطأ: ' : 'Error: ') + result.error);
      }
    } catch (err) {
      alert(isRTL ? 'فشل حفظ المصدر' : 'Failed to save source');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sourceId) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      const result = await deleteSource(sourceId);
      if (result.success) {
        await loadSources();
        alert(t.sourceDeleted);
      } else {
        alert((isRTL ? 'خطأ: ' : 'Error: ') + result.error);
      }
    } catch (err) {
      alert(isRTL ? 'فشل حذف المصدر' : 'Failed to delete source');
    }
  };

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
      const reason = result.data?.lastConnectionError || result.data?.error || result.data?.message || '';
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
      
      await loadSources();

      if (!ok) {
        const errorMsg = reason 
          ? (isRTL 
              ? `فشل الاتصال بالمصدر:\n${reason}\n\nتحقق من:\n- اسم المستخدم\n- مفتاح API\n- رابط API`
              : `Provider connection failed:\n${reason}\n\nPlease verify:\n- Username\n- API Key\n- API URL`)
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

  const handleOpenSyncModal = (source) => {
    setSelectedSource(source);
    setShowSyncModal(true);
    setSyncLogs([]);
  };

  const handleSync = async () => {
    if (!selectedSource) return;
    
    setSyncingSource(selectedSource.id);
    setSyncLogs([
      `${isRTL ? 'بدء المزامنة...' : 'Starting synchronization...'}`,
      `${isRTL ? 'الاتصال بـ' : 'Connecting to'} ${selectedSource.apiUrl}...`
    ]);
    
    try {
      const result = await syncSourceProducts(selectedSource.id, syncOptions);
      
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

        setSources((prev) =>
          (prev || []).map((s) =>
            s.id === selectedSource.id
              ? { ...s, lastConnectionOk: true, productsCount: Number.isFinite(Number(count)) ? Number(count) : (s.productsCount || 0) }
              : s
          )
        );
        await loadSources();
      } else {
        alert((isRTL ? 'فشلت المزامنة: ' : 'Sync failed: ') + result.error);
      }
    } catch (err) {
      alert(isRTL ? 'فشلت المزامنة' : 'Sync failed');
    } finally {
      setSyncingSource(null);
    }
  };

  const handleOpenProfitModal = (source) => {
    setSelectedSource(source);
    setProfitPercentage(source.profitPercentage || 0);
    setShowProfitModal(true);
  };

  const handleApplyProfit = async () => {
    if (!selectedSource) return;

    try {
      setLoading(true);
      const result = await applyProfitMargin(selectedSource.id, profitPercentage);
      
      if (result.success) {
        const count = result.data.updatedCount || 0;
        alert(isRTL 
          ? `تم تطبيق نسبة الربح ${profitPercentage}% على ${count} منتج`
          : `Applied ${profitPercentage}% profit margin to ${count} products`);
        await loadSources();
        setShowProfitModal(false);
      } else {
        alert((isRTL ? 'فشل تطبيق نسبة الربح: ' : 'Failed to apply profit margin: ') + result.error);
      }
    } catch (err) {
      alert(isRTL ? 'فشل تطبيق نسبة الربح' : 'Failed to apply profit margin');
    } finally {
      setLoading(false);
    }
  };

  const toggleApiKeyVisibility = (sourceId) => {
    setShowApiKey(prev => ({
      ...prev,
      [sourceId]: !prev[sourceId]
    }));
  };

  const filteredSources = sources.filter(source => {
    const matchesSearch = searchQuery === '' || 
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.apiUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && source.enabled) ||
      (statusFilter === 'inactive' && !source.enabled) ||
      (statusFilter === 'connected' && source.connectionStatus === 'connected') ||
      (statusFilter === 'disconnected' && source.connectionStatus === 'disconnected');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (source) => {
    if (!source.enabled) return isDark ? 'text-gray-400' : 'text-gray-500';
    if (source.connectionStatus === 'connected') return 'text-emerald-500';
    if (source.connectionStatus === 'disconnected') return 'text-rose-500';
    return 'text-amber-500';
  };

  const getStatusBg = (source) => {
    if (!source.enabled) return isDark ? 'bg-gray-800' : 'bg-gray-100';
    if (source.connectionStatus === 'connected') return isDark ? 'bg-emerald-900/30' : 'bg-emerald-50';
    if (source.connectionStatus === 'disconnected') return isDark ? 'bg-rose-900/30' : 'bg-rose-50';
    return isDark ? 'bg-amber-900/30' : 'bg-amber-50';
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
      <div className="p-6 space-y-6 animate-fade-in" dir={dir}>
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <Plug className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {t.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.subtitle}
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleAdd}
            className="group relative px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t.addSource}</span>
            <div className="absolute inset-0 rounded-xl border border-indigo-400/30 group-hover:border-indigo-300/50 transition-colors"></div>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalSources}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalSources}</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.activeSources}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeSources}</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.connectedSources}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.connectedSources}</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalProducts}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalProducts}</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
              />
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`pl-10 pr-4 py-2.5 rounded-xl border appearance-none ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                >
                  <option value="all">{t.allStatus}</option>
                  <option value="active">{t.active}</option>
                  <option value="inactive">{t.inactive}</option>
                  <option value="connected">{t.connected}</option>
                  <option value="disconnected">{t.disconnected}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? (isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100')}`}
                >
                  <Hash className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? (isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100')}`}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sources Grid/List */}
        {filteredSources.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <Inbox className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t.emptyStateTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {t.emptyStateDesc}
            </p>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              {t.getStarted}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSources.map((source) => (
              <div
                key={source.id}
                className={`group rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              >
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${getStatusBg(source)}`}>
                        <Globe className={`w-5 h-5 ${getStatusColor(source)}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {source.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBg(source)} ${getStatusColor(source)}`}>
                            {source.enabled ? t.active : t.inactive}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBg(source)} ${getStatusColor(source)}`}>
                            {source.connectionStatus === 'connected' ? t.connected : 
                             source.connectionStatus === 'disconnected' ? t.disconnected : t.unknown}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestConnection(source.id)}
                        disabled={testingSource === source.id}
                        className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title={t.testConnection}
                      >
                        {testingSource === source.id ? (
                          <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                        ) : (
                          <Wifi className={`w-4 h-4 ${source.connectionStatus === 'connected' ? 'text-emerald-500' : 'text-rose-500'}`} />
                        )}
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => handleToggleStatus(source)}
                          className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          title={source.enabled ? t.inactive : t.active}
                        >
                          {source.enabled ? (
                            <Eye className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {source.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                      {source.description}
                    </p>
                  )}
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* API Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t.apiUrl}</span>
                    </div>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {source.apiUrl}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t.username}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {source.username}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t.apiKey}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono text-gray-900 dark:text-white">
                            {showApiKey[source.id] ? source.apiKey : '••••••••••••••••'}
                          </p>
                          <button
                            onClick={() => toggleApiKeyVisibility(source.id)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            {showApiKey[source.id] ? (
                              <EyeOff className="w-3 h-3 text-gray-400" />
                            ) : (
                              <Eye className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
                    <div className="text-center">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'} inline-block mb-2`}>
                        <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{source.productsCount || 0}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t.products}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'} inline-block mb-2`}>
                        <BadgePercent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{source.profitPercentage || 0}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t.profitMargin}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'} inline-block mb-2`}>
                        <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${source.balance || '0'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t.balance}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(source)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="text-sm">{t.edit}</span>
                      </button>
                      
                      <button
                        onClick={() => handleOpenProfitModal(source)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isDark ? 'text-amber-400 hover:bg-amber-900/30' : 'text-amber-600 hover:bg-amber-50'}`}
                      >
                        <BadgePercent className="w-4 h-4" />
                        <span className="text-sm">{t.applyProfit}</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenSyncModal(source)}
                        disabled={syncingSource === source.id}
                        className={`p-2 rounded-lg transition-all ${isDark ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'}`}
                        title={t.sync}
                      >
                        {syncingSource === source.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCcw className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(source.id)}
                        className={`p-2 rounded-lg transition-all ${isDark ? 'text-rose-400 hover:bg-rose-900/30' : 'text-rose-600 hover:bg-rose-50'}`}
                        title={t.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
            </div>
          </div>
        )}

        {/* Modal for Add/Edit Source */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className={`rounded-2xl max-w-lg w-full animate-scale-in ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                      {editingSource ? (
                        <Pencil className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingSource ? t.editSource : t.addNew}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {editingSource ? source.name : t.addFirstDesc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {t.sourceName} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isRTL ? 'مثال: SD-Unlocker' : 'Example: SD-Unlocker'}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {t.apiUrl} *
                  </label>
                  <input
                    type="url"
                    value={formData.apiUrl}
                    onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                    placeholder="https://sd-unlocker.com/api/index.php"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      {t.username} *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      {t.apiKey} *
                    </label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {t.profitPercentage}
                  </label>
                  <input
                    type="number"
                    value={formData.profitPercentage}
                    onChange={(e) => setFormData({ ...formData, profitPercentage: parseFloat(e.target.value) })}
                    min="0"
                    max="1000"
                    step="0.1"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.profitHelper}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {t.description}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="p-6 border-t dark:border-gray-700 flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-5 py-2.5 rounded-xl border transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.apiUrl || !formData.username || !formData.apiKey}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {editingSource ? (
                    <>
                      <Save className="w-4 h-4" />
                      {t.saveChanges}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {t.addNew}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sync Modal */}
        {showSyncModal && selectedSource && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                      <RefreshCcw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isRTL ? 'مزامنة المنتجات' : 'Sync Products'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedSource.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSyncModal(false)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(syncOptions).map(([key, value]) => (
                    <label key={key} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${key.includes('setup') ? (isDark ? 'bg-green-900/20' : 'bg-green-50') : key.includes('delete') ? (isDark ? 'bg-rose-900/20' : 'bg-rose-50') : (isDark ? 'bg-gray-700/50' : 'bg-gray-50')}`}>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSyncOptions({...syncOptions, [key]: e.target.checked})}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {isRTL ? 
                          (key === 'syncBrandModel' ? 'مزامنة قائمة العلامات التجارية / الموديلات' :
                           key === 'syncCountryProvider' ? 'مزامنة قائمة الدول / مزودي الشبكة' :
                           key === 'syncMEP' ? 'مزامنة قائمة MEP' :
                           key === 'setupIMEI' ? 'إعداد خدمات IMEI' :
                           key === 'setupServer' ? 'إعداد خدمات السيرفر' :
                           key === 'setupRemote' ? 'إعداد الخدمات عن بعد' :
                           key === 'deleteAllBrandModel' ? 'حذف جميع قوائم العلامات التجارية' :
                           key === 'deleteAllCountryProvider' ? 'حذف جميع قوائم الدول' :
                           key === 'deleteAllMEP' ? 'حذف جميع قوائم MEP' :
                           key === 'skipFraudCheck' ? 'تخطي فحص الاحتيال' :
                           key === 'slowSync' ? 'مزامنة بطيئة' : key)
                          :
                          key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                        }
                      </span>
                    </label>
                  ))}
                </div>

                {syncLogs.length > 0 && (
                  <div className={`rounded-xl p-4 font-mono text-sm overflow-y-auto max-h-40 ${isDark ? 'bg-gray-900 text-emerald-400' : 'bg-gray-900 text-emerald-300'}`}>
                    {syncLogs.map((log, index) => (
                      <div key={index} className="mb-1">{`> ${log}`}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t dark:border-gray-700 flex gap-3 justify-end">
                <button
                  onClick={() => setShowSyncModal(false)}
                  disabled={syncingSource}
                  className={`px-5 py-2.5 rounded-xl border transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} disabled:opacity-50`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSync}
                  disabled={syncingSource}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {syncingSource ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isRTL ? 'جاري المزامنة...' : 'Syncing...'}
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-4 h-4" />
                      {isRTL ? 'بدء المزامنة' : 'Start Sync'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SourcesPage;