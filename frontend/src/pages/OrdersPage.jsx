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
import './OrdersPage.css';

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
        return <Clock className="status-icon pending" size={20} />;
      case 'confirmed':
      case 'processing':
        return <Package className="status-icon processing" size={20} />;
      case 'shipped':
        return <Truck className="status-icon shipped" size={20} />;
      case 'delivered':
        return <CheckCircle className="status-icon delivered" size={20} />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="status-icon cancelled" size={20} />;
      default:
        return <Package className="status-icon" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'confirmed':
      case 'processing':
        return 'blue';
      case 'shipped':
        return 'purple';
      case 'delivered':
        return 'green';
      case 'cancelled':
      case 'refunded':
        return 'red';
      default:
        return 'gray';
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
    return <div className="orders-loading">{t('pleaseLogin')}</div>;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>{t('myOrders')}</h1>
          <div className="orders-filters">
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
          <div className="orders-loading">{t('loading')}</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <Package size={64} color="#cbd5e1" />
            <h3>{t('noOrdersFound')}</h3>
            <p>{t('noOrdersDescription')}</p>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>#{order.orderNumber}</h3>
                      <p className="order-date">
                        <Calendar size={16} />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className={`order-status ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {t(order.status)}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="order-item">
                        <img src={item.image} alt={item.name} />
                        <div className="item-info">
                          <h4>{item.name}</h4>
                          <p>{t('quantity')}: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="more-items">
                        +{order.items.length - 3} {t('moreItems')}
                      </p>
                    )}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <strong>{t('total')}: {formatPrice(order.pricing.total)}</strong>
                    </div>
                    <div className="order-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => fetchOrderDetails(order._id)}
                      >
                        <Eye size={16} />
                        {t('viewDetails')}
                      </button>
                      {order.status === 'delivered' && (
                        <button 
                          className="reorder-btn"
                          onClick={() => reorder(order._id)}
                        >
                          <RotateCcw size={16} />
                          {t('reorder')}
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button 
                          className="cancel-btn"
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
              <div className="pagination">
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
          <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{t('orderDetails')} #{selectedOrder.orderNumber}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="order-overview">
                  <div className="overview-item">
                    <div className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {t(selectedOrder.status)}
                    </div>
                  </div>
                  <div className="overview-item">
                    <span>{t('orderDate')}</span>
                    <strong>{formatDate(selectedOrder.createdAt)}</strong>
                  </div>
                  <div className="overview-item">
                    <span>{t('total')}</span>
                    <strong>{formatPrice(selectedOrder.pricing.total)}</strong>
                  </div>
                  {selectedOrder.shipping.trackingNumber && (
                    <div className="overview-item">
                      <span>{t('tracking')}</span>
                      <strong>{selectedOrder.shipping.trackingNumber}</strong>
                    </div>
                  )}
                </div>

                <div className="order-timeline">
                  <h3>{t('orderTimeline')}</h3>
                  <div className="timeline">
                    {selectedOrder.timeline.map((event, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <h4>{t(event.status)}</h4>
                          <p>{formatDate(event.timestamp)}</p>
                          {event.note && <p className="timeline-note">{event.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-items-detail">
                  <h3>{t('orderedItems')}</h3>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-detail">
                      <img src={item.image} alt={item.name} />
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p>{t('quantity')}: {item.quantity}</p>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="selected-options">
                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                              value && <span key={key}>{key}: {value}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="item-pricing">
                        <div className="unit-price">{formatPrice(item.price)}</div>
                        <div className="total-price">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-addresses">
                  <div className="address-section">
                    <h4><MapPin size={16} /> {t('shippingAddress')}</h4>
                    <div className="address">
                      <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                      {selectedOrder.shippingAddress.phone && <p>{selectedOrder.shippingAddress.phone}</p>}
                    </div>
                  </div>

                  <div className="address-section">
                    <h4><CreditCard size={16} /> {t('paymentMethod')}</h4>
                    <div className="payment-info">
                      <p>{t(selectedOrder.payment.method)}</p>
                      <p className={`payment-status ${selectedOrder.payment.status}`}>
                        {t(selectedOrder.payment.status)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="order-summary">
                  <h3>{t('orderSummary')}</h3>
                  <div className="summary-row">
                    <span>{t('subtotal')}</span>
                    <span>{formatPrice(selectedOrder.pricing.subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>{t('shipping')}</span>
                    <span>{formatPrice(selectedOrder.pricing.shipping)}</span>
                  </div>
                  <div className="summary-row">
                    <span>{t('tax')}</span>
                    <span>{formatPrice(selectedOrder.pricing.tax)}</span>
                  </div>
                  {selectedOrder.pricing.discount > 0 && (
                    <div className="summary-row discount">
                      <span>{t('discount')}</span>
                      <span>-{formatPrice(selectedOrder.pricing.discount)}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>{t('total')}</span>
                    <span>{formatPrice(selectedOrder.pricing.total)}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  {selectedOrder.status === 'delivered' && (
                    <button 
                      className="reorder-btn"
                      onClick={() => reorder(selectedOrder._id)}
                    >
                      <RotateCcw size={16} />
                      {t('reorder')}
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(selectedOrder.status) && (
                    <button 
                      className="cancel-btn"
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