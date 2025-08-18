import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import styles from './CheckoutPage.module.css';

// Load Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutPage = () => {
  const { user, api } = useAuth();
  const { cart, cartTotal, cartTax, cartShipping, cartGrandTotal, clearCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: ''
  });
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [step, setStep] = useState('shipping'); // shipping, billing, payment

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect if cart is empty
    if (!cart || cart.length === 0) {
      navigate('/');
      return;
    }

    // Pre-fill addresses if user has saved addresses
    if (user.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setShippingAddress({
        firstName: defaultAddress.firstName || '',
        lastName: defaultAddress.lastName || '',
        street: defaultAddress.street || '',
        city: defaultAddress.city || '',
        state: defaultAddress.state || '',
        zipCode: defaultAddress.zipCode || '',
        country: defaultAddress.country || 'US',
        phone: defaultAddress.phone || ''
      });
    }
  }, [user, cart, navigate]);

  useEffect(() => {
    if (useSameAddress) {
      setBillingAddress(shippingAddress);
    }
  }, [shippingAddress, useSameAddress]);

  const createPaymentIntent = async () => {
    if (!shippingAddress.firstName || !shippingAddress.street || !shippingAddress.city) {
      setError('Please fill in all required shipping address fields');
      return;
    }

    const finalBillingAddress = useSameAddress ? shippingAddress : billingAddress;
    if (!finalBillingAddress.firstName || !finalBillingAddress.street || !finalBillingAddress.city) {
      setError('Please fill in all required billing address fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get cart ID - this might need adjustment based on your cart structure
      const cartId = cart._id || 'guest-cart'; // Fallback for guest carts

      const response = await api.post('/payment/create-payment-intent', {
        cartId,
        shippingAddress,
        billingAddress: finalBillingAddress
      });

      if (response.data.success) {
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
        setStep('payment');
      } else {
        setError(response.data.error || 'Failed to create payment intent');
      }
    } catch (err) {
      console.error('Payment intent creation error:', err);
      setError(err.response?.data?.error || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (orderId) => {
    // Clear cart and redirect to order confirmation
    await clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  const handleAddressChange = (addressType, field, value) => {
    if (addressType === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const renderShippingForm = () => (
    <div className={styles.addressForm}>
      <h3>{t('shippingAddress')}</h3>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>{t('firstName')} *</label>
          <input
            type="text"
            value={shippingAddress.firstName}
            onChange={(e) => handleAddressChange('shipping', 'firstName', e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('lastName')} *</label>
          <input
            type="text"
            value={shippingAddress.lastName}
            onChange={(e) => handleAddressChange('shipping', 'lastName', e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label>{t('streetAddress')} *</label>
        <input
          type="text"
          value={shippingAddress.street}
          onChange={(e) => handleAddressChange('shipping', 'street', e.target.value)}
          required
        />
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>{t('city')} *</label>
          <input
            type="text"
            value={shippingAddress.city}
            onChange={(e) => handleAddressChange('shipping', 'city', e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('state')} *</label>
          <input
            type="text"
            value={shippingAddress.state}
            onChange={(e) => handleAddressChange('shipping', 'state', e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('zipCode')} *</label>
          <input
            type="text"
            value={shippingAddress.zipCode}
            onChange={(e) => handleAddressChange('shipping', 'zipCode', e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label>{t('phone')}</label>
        <input
          type="tel"
          value={shippingAddress.phone}
          onChange={(e) => handleAddressChange('shipping', 'phone', e.target.value)}
        />
      </div>
    </div>
  );

  const renderBillingForm = () => (
    <div className={styles.addressForm}>
      <h3>{t('billingAddress')}</h3>
      
      <div className={styles.checkboxGroup}>
        <label>
          <input
            type="checkbox"
            checked={useSameAddress}
            onChange={(e) => setUseSameAddress(e.target.checked)}
          />
          {t('useSameAsShipping')}
        </label>
      </div>

      {!useSameAddress && (
        <>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>{t('firstName')} *</label>
              <input
                type="text"
                value={billingAddress.firstName}
                onChange={(e) => handleAddressChange('billing', 'firstName', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('lastName')} *</label>
              <input
                type="text"
                value={billingAddress.lastName}
                onChange={(e) => handleAddressChange('billing', 'lastName', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>{t('streetAddress')} *</label>
            <input
              type="text"
              value={billingAddress.street}
              onChange={(e) => handleAddressChange('billing', 'street', e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>{t('city')} *</label>
              <input
                type="text"
                value={billingAddress.city}
                onChange={(e) => handleAddressChange('billing', 'city', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('state')} *</label>
              <input
                type="text"
                value={billingAddress.state}
                onChange={(e) => handleAddressChange('billing', 'state', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('zipCode')} *</label>
              <input
                type="text"
                value={billingAddress.zipCode}
                onChange={(e) => handleAddressChange('billing', 'zipCode', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>{t('phone')}</label>
            <input
              type="tel"
              value={billingAddress.phone}
              onChange={(e) => handleAddressChange('billing', 'phone', e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.container}>
        <h1>{t('checkout')}</h1>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.checkoutContent}>
          <div className={styles.checkoutForms}>
            {/* Step indicator */}
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${step === 'shipping' ? styles.active : styles.completed}`}>
                <span>1</span>
                <span>{t('shipping')}</span>
              </div>
              <div className={`${styles.step} ${step === 'billing' ? styles.active : (step === 'payment' ? styles.completed : '')}`}>
                <span>2</span>
                <span>{t('billing')}</span>
              </div>
              <div className={`${styles.step} ${step === 'payment' ? styles.active : ''}`}>
                <span>3</span>
                <span>{t('payment')}</span>
              </div>
            </div>

            {/* Forms based on current step */}
            {step === 'shipping' && (
              <div className={styles.stepContent}>
                {renderShippingForm()}
                <div className={styles.stepActions}>
                  <button
                    className={styles.nextButton}
                    onClick={() => setStep('billing')}
                    disabled={!shippingAddress.firstName || !shippingAddress.street || !shippingAddress.city}
                  >
                    {t('continue')}
                  </button>
                </div>
              </div>
            )}

            {step === 'billing' && (
              <div className={styles.stepContent}>
                {renderBillingForm()}
                <div className={styles.stepActions}>
                  <button
                    className={styles.backButton}
                    onClick={() => setStep('shipping')}
                  >
                    {t('back')}
                  </button>
                  <button
                    className={styles.nextButton}
                    onClick={createPaymentIntent}
                    disabled={loading}
                  >
                    {loading ? t('processing') : t('continueToPayment')}
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId}
                  cartId="current-cart"
                  shippingAddress={shippingAddress}
                  billingAddress={useSameAddress ? shippingAddress : billingAddress}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setStep('billing')}
                />
              </Elements>
            )}
          </div>

          {/* Order summary */}
          <div className={styles.orderSummary}>
            <OrderSummary
              cart={cart}
              subtotal={cartTotal}
              tax={cartTax}
              shipping={cartShipping}
              total={cartGrandTotal}
              showEdit={step !== 'payment'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;