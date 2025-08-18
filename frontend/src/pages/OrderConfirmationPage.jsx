import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './OrderConfirmationPage.module.css';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { api } = useAuth();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          setError(response.data.error || 'Order not found');
        }
      } catch (err) {
        console.error('Order fetch error:', err);
        setError(err.response?.data?.error || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && api) {
      fetchOrder();
    }
  }, [orderId, api]);

  const formatPrice = (price) => {
    return `$${price?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryDate = (estimatedDelivery) => {
    if (estimatedDelivery) {
      return new Date(estimatedDelivery).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // Default to 7 days from now
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return deliveryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.orderConfirmation}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>{t('loadingOrder')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.orderConfirmation}>
        <div className={styles.container}>
          <div className={styles.error}>
            <h1>{t('orderNotFound')}</h1>
            <p>{error || t('orderNotFoundMessage')}</p>
            <Link to="/" className={styles.homeButton}>
              {t('returnHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.orderConfirmation}>
      <div className={styles.container}>
        {/* Success Header */}
        <div className={styles.successHeader}>
          <div className={styles.successIcon}>✅</div>
          <h1>{t('orderConfirmed')}</h1>
          <p>{t('thankYouForOrder')}</p>
        </div>

        {/* Order Details */}
        <div className={styles.orderDetails}>
          <div className={styles.orderInfo}>
            <div className={styles.orderNumber}>
              <h2>{t('orderNumber')}: {order.orderNumber}</h2>
              <p>{t('orderDate')}: {formatDate(order.createdAt)}</p>
            </div>

            <div className={styles.deliveryInfo}>
              <h3>{t('estimatedDelivery')}</h3>
              <p className={styles.deliveryDate}>
                {getDeliveryDate(order.shipping?.estimatedDelivery)}
              </p>
              <p className={styles.deliveryMethod}>
                {t('standardShipping')} • {t('trackingAvailable')}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className={styles.orderItems}>
            <h3>{t('orderItems')}</h3>
            <div className={styles.itemsList}>
              {order.items.map((item) => (
                <div key={item._id} className={styles.orderItem}>
                  <div className={styles.itemImage}>
                    <img 
                      src={item.image || '/placeholder-product.jpg'} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  
                  <div className={styles.itemDetails}>
                    <h4>{item.name}</h4>
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className={styles.itemOptions}>
                        {Object.entries(item.selectedOptions).map(([key, value]) => (
                          value && (
                            <span key={key} className={styles.option}>
                              {key}: {value}
                            </span>
                          )
                        ))}
                      </div>
                    )}
                    <div className={styles.itemPrice}>
                      {formatPrice(item.price)} × {item.quantity}
                    </div>
                  </div>
                  
                  <div className={styles.itemTotal}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <h3>{t('orderSummary')}</h3>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>{t('subtotal')}</span>
                <span>{formatPrice(order.pricing.subtotal)}</span>
              </div>
              
              <div className={styles.summaryRow}>
                <span>{t('shipping')}</span>
                <span>
                  {order.pricing.shipping === 0 ? (
                    <span className={styles.free}>{t('free')}</span>
                  ) : (
                    formatPrice(order.pricing.shipping)
                  )}
                </span>
              </div>
              
              <div className={styles.summaryRow}>
                <span>{t('tax')}</span>
                <span>{formatPrice(order.pricing.tax)}</span>
              </div>
              
              {order.pricing.discount > 0 && (
                <div className={styles.summaryRow}>
                  <span>{t('discount')}</span>
                  <span className={styles.discount}>-{formatPrice(order.pricing.discount)}</span>
                </div>
              )}
              
              <div className={styles.totalRow}>
                <span>{t('total')}</span>
                <span className={styles.totalAmount}>{formatPrice(order.pricing.total)}</span>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className={styles.addresses}>
            <div className={styles.addressSection}>
              <h3>{t('shippingAddress')}</h3>
              <div className={styles.address}>
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
              </div>
            </div>

            <div className={styles.addressSection}>
              <h3>{t('billingAddress')}</h3>
              <div className={styles.address}>
                <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                <p>{order.billingAddress.street}</p>
                <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}</p>
                <p>{order.billingAddress.country}</p>
                {order.billingAddress.phone && <p>{order.billingAddress.phone}</p>}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className={styles.paymentInfo}>
            <h3>{t('paymentMethod')}</h3>
            <div className={styles.paymentDetails}>
              <div className={styles.paymentMethod}>
                <span className={styles.methodIcon}>💳</span>
                <span>{t('creditCard')}</span>
                {order.payment.lastFour && (
                  <span className={styles.cardInfo}>
                    {order.payment.cardBrand} •••• {order.payment.lastFour}
                  </span>
                )}
              </div>
              <div className={styles.paymentStatus}>
                <span className={styles.statusBadge}>
                  ✅ {t('paymentConfirmed')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Link to="/orders" className={styles.viewOrdersButton}>
            {t('viewAllOrders')}
          </Link>
          <Link to="/" className={styles.continueShoppingButton}>
            {t('continueShopping')}
          </Link>
        </div>

        {/* Next Steps */}
        <div className={styles.nextSteps}>
          <h3>{t('whatHappensNext')}</h3>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>📧</div>
              <div className={styles.stepContent}>
                <h4>{t('emailConfirmation')}</h4>
                <p>{t('emailConfirmationDesc')}</p>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepIcon}>📦</div>
              <div className={styles.stepContent}>
                <h4>{t('orderProcessing')}</h4>
                <p>{t('orderProcessingDesc')}</p>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepIcon}>🚚</div>
              <div className={styles.stepContent}>
                <h4>{t('shipping')}</h4>
                <p>{t('shippingDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;