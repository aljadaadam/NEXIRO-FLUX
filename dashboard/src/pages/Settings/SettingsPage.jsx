// src/pages/Settings/SettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const SettingsPage = () => {
  const { theme, dir } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [site, setSite] = useState(null);
  const [customization, setCustomization] = useState(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [siteRes, customRes] = await Promise.all([
        api.get('/setup/my-site'),
        api.get('/customization'),
      ]);
      setSite(siteRes.data?.site || siteRes.data);
      setCustomization(customRes.data?.customization || customRes.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveCustomization = async () => {
    setSaving(true);
    setSuccess('');
    try {
      await api.put('/customization', customization);
      setSuccess(dir === 'rtl' ? 'تم حفظ التخصيص بنجاح' : 'Customization saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
  }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {dir === 'rtl' ? 'الإعدادات' : 'Settings'}
            </h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {dir === 'rtl' ? 'تخصيص إعدادات الموقع والمتجر' : 'Customize your site and store settings'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error && !site ? (
          <div className={`rounded-2xl shadow-lg p-6 border text-center ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <i className={`fas fa-exclamation-triangle text-3xl mb-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}></i>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
            <button onClick={fetchSettings} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {dir === 'rtl' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* رسائل النجاح والخطأ */}
            {success && (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                <i className={`fas fa-check-circle ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>{success}
              </div>
            )}
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                <i className={`fas fa-exclamation-circle ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>{error}
              </div>
            )}

            {/* معلومات الموقع */}
            {site && (
              <div className={`rounded-2xl shadow-lg p-6 border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  <i className={`fas fa-globe ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
                  {dir === 'rtl' ? 'معلومات الموقع' : 'Site Information'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className={labelClass}>{dir === 'rtl' ? 'اسم المتجر' : 'Store Name'}</span>
                    <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      {site.store_name || site.name || '-'}
                    </p>
                  </div>
                  <div>
                    <span className={labelClass}>{dir === 'rtl' ? 'مفتاح الموقع' : 'Site Key'}</span>
                    <p className={`text-lg font-mono ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      {site.site_key || '-'}
                    </p>
                  </div>
                  <div>
                    <span className={labelClass}>{dir === 'rtl' ? 'القالب' : 'Template'}</span>
                    <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      {site.template_id || '-'}
                    </p>
                  </div>
                  <div>
                    <span className={labelClass}>{dir === 'rtl' ? 'الحالة' : 'Status'}</span>
                    <p className={`text-lg font-medium capitalize ${
                      site.status === 'active'
                        ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                        : (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600')
                    }`}>
                      {site.status || '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* تخصيص المظهر */}
            {customization && (
              <div className={`rounded-2xl shadow-lg p-6 border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  <i className={`fas fa-palette ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
                  {dir === 'rtl' ? 'تخصيص المظهر' : 'Appearance'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{dir === 'rtl' ? 'اللون الرئيسي' : 'Primary Color'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customization.primary_color || '#3B82F6'}
                        onChange={(e) => setCustomization({ ...customization, primary_color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={customization.primary_color || ''}
                        onChange={(e) => setCustomization({ ...customization, primary_color: e.target.value })}
                        className={inputClass}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{dir === 'rtl' ? 'رابط الشعار' : 'Logo URL'}</label>
                    <input
                      type="text"
                      value={customization.logo_url || ''}
                      onChange={(e) => setCustomization({ ...customization, logo_url: e.target.value })}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{dir === 'rtl' ? 'اسم المتجر (عرض)' : 'Store Display Name'}</label>
                    <input
                      type="text"
                      value={customization.store_name || ''}
                      onChange={(e) => setCustomization({ ...customization, store_name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{dir === 'rtl' ? 'وصف المتجر' : 'Store Description'}</label>
                    <input
                      type="text"
                      value={customization.store_description || ''}
                      onChange={(e) => setCustomization({ ...customization, store_description: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleSaveCustomization}
                    disabled={saving}
                    className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {saving ? (
                      <><i className={`fas fa-spinner fa-spin ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>{dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...'}</>
                    ) : (
                      <><i className={`fas fa-save ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>{dir === 'rtl' ? 'حفظ التغييرات' : 'Save Changes'}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
