// src/pages/Orders/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { SkeletonOrders } from '../../components/common/Skeleton';
import { useLanguage } from '../../context/LanguageContext';
import { getAllOrders, refundOrder, getOrdersStats } from '../../services/orders';

const OrdersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { theme, dir } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const isRTL = dir === 'rtl';

  useEffect(() => {
    loadOrders();
    loadStats();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchQuery]);

  const loadOrders = async () => {
    setIsLoading(true);
    const result = await getAllOrders();
    if (result.success) {
      const ordersData = Array.isArray(result.data) ? result.data : (result.data?.orders || []);
      setOrders(ordersData);
    }
    setIsLoading(false);
  };

  const loadStats = async () => {
    const result = await getOrdersStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number?.toLowerCase().includes(query) ||
        order.user_email?.toLowerCase().includes(query) ||
        order.product_name?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleRefund = async (order) => {
    setSelectedOrder(order);
    setShowRefundModal(true);
  };

  const confirmRefund = async () => {
    if (!selectedOrder) return;

    const result = await refundOrder(selectedOrder.id);
    if (result.success) {
      alert(isRTL ? 'تم إرجاع الرصيد بنجاح' : 'Refund successful');
      loadOrders();
      loadStats();
    } else {
      alert(isRTL ? `فشل إرجاع الرصيد: ${result.error}` : `Refund failed: ${result.error}`);
    }
    setShowRefundModal(false);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: '#10B981', text: isRTL ? 'مكتمل' : 'Completed', icon: '✓' },
      failed: { bg: '#EF4444', text: isRTL ? 'فشل' : 'Failed', icon: '✕' },
      pending: { bg: '#F59E0B', text: isRTL ? 'قيد الانتظار' : 'Pending', icon: '⏳' },
      processing: { bg: '#3B82F6', text: isRTL ? 'جاري المعالجة' : 'Processing', icon: '⟳' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
        style={{ backgroundColor: `${config.bg}20`, color: config.bg }}
      >
        <span>{config.icon}</span>
        <span>{config.text}</span>
      </span>
    );
  };

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const failedOrders = orders.filter(o => o.status === 'failed').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        {isLoading ? (
          <SkeletonOrders />
        ) : (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {isRTL ? 'إدارة الطلبات' : 'Orders Management'}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isRTL ? 'عرض وتتبع جميع طلبات العملاء' : 'View and track all customer orders'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6366F120' }}>
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {isRTL ? 'مكتملة' : 'Completed'}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#10B981' }}>{completedOrders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B98120' }}>
                    <span className="text-2xl">✓</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {isRTL ? 'فاشلة' : 'Failed'}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#EF4444' }}>{failedOrders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EF444420' }}>
                    <span className="text-2xl">✕</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {isRTL ? 'قيد الانتظار' : 'Pending'}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#F59E0B' }}>{pendingOrders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F59E0B20' }}>
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={isRTL ? 'ابحث برقم الطلب، البريد الإلكتروني، أو اسم المنتج...' : 'Search by order number, email, or product name...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--page-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--page-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                  <option value="completed">{isRTL ? 'مكتملة' : 'Completed'}</option>
                  <option value="failed">{isRTL ? 'فاشلة' : 'Failed'}</option>
                  <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                  <option value="processing">{isRTL ? 'جاري المعالجة' : 'Processing'}</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)' }}>
                      <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {isRTL ? 'رقم الطلب' : 'Order #'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {isRTL ? 'المنتج' : 'Product'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {isRTL ? 'العميل' : 'Customer'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {isRTL ? 'المبلغ' : 'Amount'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {isRTL ? 'التاريخ' : 'Date'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {isRTL ? 'إجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-4xl mb-3">📦</span>
                            <p style={{ color: 'var(--text-secondary)' }}>
                              {isRTL ? 'لا توجد طلبات' : 'No orders found'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr 
                          key={order.id}
                          className="transition-colors duration-200"
                          style={{ borderBottom: '1px solid var(--border-color)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                              #{order.order_number || order.id}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                {order.product_name || 'N/A'}
                              </p>
                              {order.error_message && (
                                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                                  {order.error_message}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {order.user_email || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                              ${order.amount || '0.00'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {order.status === 'failed' && (
                              <button
                                onClick={() => handleRefund(order)}
                                className="px-3 py-1 rounded text-xs font-medium transition-all duration-200 hover:opacity-80"
                                style={{ backgroundColor: '#10B981', color: 'white' }}
                              >
                                {isRTL ? 'إرجاع الرصيد' : 'Refund'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowRefundModal(false)}>
          <div 
            className="rounded-lg p-6 max-w-md w-full mx-4" 
            style={{ backgroundColor: 'var(--card-bg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {isRTL ? 'تأكيد إرجاع الرصيد' : 'Confirm Refund'}
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {isRTL 
                ? `هل أنت متأكد من إرجاع الرصيد ${selectedOrder?.amount} دولار للطلب #${selectedOrder?.order_number}؟`
                : `Are you sure you want to refund $${selectedOrder?.amount} for order #${selectedOrder?.order_number}?`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmRefund}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: '#10B981' }}
              >
                {isRTL ? 'تأكيد' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
                style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-primary)' }}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default OrdersPage;