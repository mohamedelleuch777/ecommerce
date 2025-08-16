import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  RotateCcw,
  Eye,
  Calendar,
  CreditCard,
  MapPin,
  Star
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import styles from './OrdersPage.module.css';

const OrdersPage = () => {
  const { api, user } = useAuth();
  const { t } = useLanguage();

  usePageTitle('ordersPageTitle');
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit
      });
      
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await api.get(`/orders?${params}`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [api, pagination, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setSelectedOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm(t('confirmCancelOrder'))) return;

    try {
      await api.patch(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled by customer'
      });
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const reorder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/reorder`);
      fetchOrders();
      alert(t('reorderSuccessful'));
    } catch (error) {
      console.error('Error reordering:', error);
      alert(error.response?.data?.error || t('reorderFailed'));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className={styles.statusIcon} size={20} />;
      case 'confirmed':
      case 'processing':
        return <Package className={styles.statusIcon} size={20} />;
      case 'shipped':
        return <Truck className={styles.statusIcon} size={20} />;
      case 'delivered':
        return <CheckCircle className={styles.statusIcon} size={20} />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className={styles.statusIcon} size={20} />;
      default:
        return <Package className={styles.statusIcon} size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return styles.orange;
      case 'confirmed':
      case 'processing':
        return styles.blue;
      case 'shipped':
        return styles.purple;
      case 'delivered':
        return styles.green;
      case 'cancelled':
      case 'refunded':
        return styles.red;
      default:
        return styles.gray;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!user) {
    return <div className={styles.ordersLoading}>{t('pleaseLogin')}</div>;
  }

  return (
    <div className={styles.ordersPage}>
      <div className="container">
        <div className={styles.ordersHeader}>
          <h1>{t('myOrders')}</h1>
          <div className={styles.ordersFilters}>
            <select 
              value={filterStatus} 
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
            >
              <option value="all">{t('allOrders')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="confirmed">{t('confirmed')}</option>
              <option value="processing">{t('processing')}</option>
              <option value="shipped">{t('shipped')}</option>
              <option value="delivered">{t('delivered')}</option>
              <option value="cancelled">{t('cancelled')}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.ordersLoading}>{t('loading')}</div>
        ) : orders.length === 0 ? (
          <div className={styles.noOrders}>
            <Package size={64} color="#cbd5e1" />
            <h3>{t('noOrdersFound')}</h3>
            <p>{t('noOrdersDescription')}</p>
          </div>
        ) : (
          <>
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div key={order._id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <h3>#{order.orderNumber}</h3>
                      <p className={styles.orderDate}>
                        <Calendar size={16} />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className={`${styles.orderStatus} ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {t(order.status)}
                    </div>
                  </div>

                  <div className={styles.orderItems}>
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className={styles.orderItem}>
                        <img src={item.image} alt={item.name} />
                        <div className={styles.itemInfo}>
                          <h4>{item.name}</h4>
                          <p>{t('quantity')}: {item.quantity}</p>
                        </div>
                        <div className={styles.itemPrice}>
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className={styles.moreItems}>
                        +{order.items.length - 3} {t('moreItems')}
                      </p>
                    )}
                  </div>

                  <div className={styles.orderFooter}>
                    <div className={styles.orderTotal}>
                      <strong>{t('total')}: {formatPrice(order.pricing.total)}</strong>
                    </div>
                    <div className={styles.orderActions}>
                      <button 
                        className={styles.viewDetailsBtn}
                        onClick={() => fetchOrderDetails(order._id)}
                      >
                        <Eye size={16} />
                        {t('viewDetails')}
                      </button>
                      {order.status === 'delivered' && (
                        <button 
                          className={styles.reorderBtn}
                          onClick={() => reorder(order._id)}
                        >
                          <RotateCcw size={16} />
                          {t('reorder')}
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button 
                          className={styles.cancelBtn}
                          onClick={() => cancelOrder(order._id)}
                        >
                          <XCircle size={16} />
                          {t('cancel')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={pagination.current === page ? 'active' : ''}
                    onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {selectedOrder && (
          <div className={styles.orderModalOverlay} onClick={() => setSelectedOrder(null)}>
            <div className={styles.orderModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{t('orderDetails')} #{selectedOrder.orderNumber}</h2>
                <button 
                  className={styles.closeBtn}
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.orderOverview}>
                  <div className={styles.overviewItem}>
                    <div className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {t(selectedOrder.status)}
                    </div>
                  </div>
                  <div className={styles.overviewItem}>
                    <span>{t('orderDate')}</span>
                    <strong>{formatDate(selectedOrder.createdAt)}</strong>
                  </div>
                  <div className={styles.overviewItem}>
                    <span>{t('total')}</span>
                    <strong>{formatPrice(selectedOrder.pricing.total)}</strong>
                  </div>
                  {selectedOrder.shipping.trackingNumber && (
                    <div className={styles.overviewItem}>
                      <span>{t('tracking')}</span>
                      <strong>{selectedOrder.shipping.trackingNumber}</strong>
                    </div>
                  )}
                </div>

                <div className={styles.orderTimeline}>
                  <h3>{t('orderTimeline')}</h3>
                  <div className={styles.timeline}>
                    {selectedOrder.timeline.map((event, index) => (
                      <div key={index} className={styles.timelineItem}>
                        <div className={styles.timelineDot}></div>
                        <div className={styles.timelineContent}>
                          <h4>{t(event.status)}</h4>
                          <p>{formatDate(event.timestamp)}</p>
                          {event.note && <p className={styles.timelineNote}>{event.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.orderItemsDetail}>
                  <h3>{t('orderedItems')}</h3>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className={styles.itemDetail}>
                      <img src={item.image} alt={item.name} />
                      <div className={styles.itemInfo}>
                        <h4>{item.name}</h4>
                        <p>{t('quantity')}: {item.quantity}</p>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className={styles.selectedOptions}>
                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                              value && <span key={key}>{key}: {value}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={styles.itemPricing}>
                        <div className={styles.unitPrice}>{formatPrice(item.price)}</div>
                        <div className={styles.totalPrice}>{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.orderAddresses}>
                  <div className={styles.addressSection}>
                    <h4><MapPin size={16} /> {t('shippingAddress')}</h4>
                    <div className={styles.address}>
                      <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                      {selectedOrder.shippingAddress.phone && <p>{selectedOrder.shippingAddress.phone}</p>}
                    </div>
                  </div>

                  <div className={styles.addressSection}>
                    <h4><CreditCard size={16} /> {t('paymentMethod')}</h4>
                    <div className={styles.paymentInfo}>
                      <p>{t(selectedOrder.payment.method)}</p>
                      <p className={`payment-status ${selectedOrder.payment.status}`}>
                        {t(selectedOrder.payment.status)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.orderSummary}>
                  <h3>{t('orderSummary')}</h3>
                  <div className={styles.summaryRow}>
                    <span>{t('subtotal')}</span>
                    <span>{formatPrice(selectedOrder.pricing.subtotal)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>{t('shipping')}</span>
                    <span>{formatPrice(selectedOrder.pricing.shipping)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>{t('tax')}</span>
                    <span>{formatPrice(selectedOrder.pricing.tax)}</span>
                  </div>
                  {selectedOrder.pricing.discount > 0 && (
                    <div className={`${styles.summaryRow} ${styles.discount}`}>
                      <span>{t('discount')}</span>
                      <span>-{formatPrice(selectedOrder.pricing.discount)}</span>
                    </div>
                  )}
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>{t('total')}</span>
                    <span>{formatPrice(selectedOrder.pricing.total)}</span>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  {selectedOrder.status === 'delivered' && (
                    <button 
                      className={styles.reorderBtn}
                      onClick={() => reorder(selectedOrder._id)}
                    >
                      <RotateCcw size={16} />
                      {t('reorder')}
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(selectedOrder.status) && (
                    <button 
                      className={styles.cancelBtn}
                      onClick={() => cancelOrder(selectedOrder._id)}
                    >
                      <XCircle size={16} />
                      {t('cancelOrder')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;