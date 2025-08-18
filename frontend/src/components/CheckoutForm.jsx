import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import styles from './CheckoutForm.module.css';

const CheckoutForm = ({ 
  clientSecret, 
  paymentIntentId, 
  cartId,
  shippingAddress, 
  billingAddress, 
  onSuccess, 
  onBack 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { api } = useAuth();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setMessage(submitError.message);
      setIsLoading(false);
      return;
    }

    // Confirm the payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/complete`,
        payment_method_data: {
          billing_details: {
            name: `${billingAddress.firstName} ${billingAddress.lastName}`,
            email: api.user?.email,
            phone: billingAddress.phone,
            address: {
              line1: billingAddress.street,
              city: billingAddress.city,
              state: billingAddress.state,
              postal_code: billingAddress.zipCode,
              country: billingAddress.country,
            },
          },
        },
      },
      redirect: 'if_required'
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      console.error('Payment confirmation error:', error);
      setMessage(error.message);
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded, confirm on backend and create order
      try {
        const response = await api.post('/payment/confirm', {
          paymentIntentId: paymentIntent.id,
          cartId: cartId,
          shippingAddress,
          billingAddress,
          paymentMethod
        });

        if (response.data.success) {
          // Payment successful, redirect to order confirmation
          onSuccess(response.data.order._id);
        } else {
          setMessage(response.data.error || 'Payment confirmation failed');
        }
      } catch (confirmError) {
        console.error('Payment confirmation error:', confirmError);
        setMessage(confirmError.response?.data?.error || 'Failed to confirm payment');
      }
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: "tabs",
    defaultValues: {
      billingDetails: {
        name: `${billingAddress.firstName} ${billingAddress.lastName}`,
        email: api.user?.email,
        phone: billingAddress.phone,
        address: {
          line1: billingAddress.street,
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.zipCode,
          country: billingAddress.country,
        },
      },
    },
  };

  return (
    <div className={styles.checkoutForm}>
      <h3>{t('paymentInformation')}</h3>
      
      {/* Security badges */}
      <div className={styles.securityBadges}>
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>🔒</span>
          <span>{t('securePayment')}</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>🛡️</span>
          <span>{t('sslEncrypted')}</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>💳</span>
          <span>{t('stripeSecured')}</span>
        </div>
      </div>

      <form id="payment-form" onSubmit={handleSubmit} className={styles.paymentForm}>
        <PaymentElement 
          id="payment-element" 
          options={paymentElementOptions}
          onChange={(event) => {
            if (event.value.type) {
              setPaymentMethod(event.value.type);
            }
          }}
        />
        
        {/* Show any error or success messages */}
        {message && (
          <div className={styles.paymentMessage}>
            {message}
          </div>
        )}

        <div className={styles.paymentActions}>
          <button
            type="button"
            className={styles.backButton}
            onClick={onBack}
            disabled={isLoading}
          >
            {t('back')}
          </button>
          
          <button 
            disabled={isLoading || !stripe || !elements} 
            id="submit"
            className={styles.submitButton}
            type="submit"
          >
            <span id="button-text">
              {isLoading ? (
                <div className={styles.spinner}></div>
              ) : (
                t('completeOrder')
              )}
            </span>
          </button>
        </div>
      </form>

      {/* Payment method info */}
      <div className={styles.paymentInfo}>
        <p className={styles.infoText}>
          {t('paymentSecurityInfo')}
        </p>
        
        <div className={styles.acceptedCards}>
          <span>{t('acceptedPayments')}:</span>
          <div className={styles.cardLogos}>
            <span className={styles.cardLogo}>💳 Visa</span>
            <span className={styles.cardLogo}>💳 Mastercard</span>
            <span className={styles.cardLogo}>💳 Amex</span>
            <span className={styles.cardLogo}>📱 Apple Pay</span>
            <span className={styles.cardLogo}>📱 Google Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;