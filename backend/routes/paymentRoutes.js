import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// Use test Stripe key for development
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not found in environment variables. Using placeholder.');
} else {
  console.log('Stripe initialized with key:', stripeSecretKey.substring(0, 12) + '...');
}

const stripe = new Stripe(stripeSecretKey);

// POST /api/payment/create-payment-intent - Create payment intent
router.post('/create-payment-intent', authenticate, async (req, res) => {
  try {
    const { cartId, shippingAddress, billingAddress } = req.body;
    const userId = req.user._id;

    // Validate required data
    if (!cartId || !shippingAddress || !billingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Cart ID, shipping address, and billing address are required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ 
      _id: cartId, 
      user: userId, 
      status: 'active' 
    }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart not found or is empty'
      });
    }

    // Validate all products are still in stock and prices haven't changed
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.product.name} no longer exists`
        });
      }
      if (!product.inStock) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.product.name} is out of stock`
        });
      }
      // Check if price has changed (allowing for small floating point differences)
      if (Math.abs(product.price - item.price) > 0.01) {
        return res.status(400).json({
          success: false,
          error: `Price for ${item.product.name} has changed. Please refresh your cart.`
        });
      }
    }

    // Recalculate totals to ensure accuracy
    cart.calculateTotals();
    await cart.save();

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(cart.total * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        cartId: cart._id.toString(),
        userId: userId.toString(),
        orderNumber: `PENDING-${Date.now()}`
      },
      description: `Order for ${cart.items.length} items - ${req.user.email}`,
      shipping: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        address: {
          line1: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zipCode,
          country: shippingAddress.country || 'US',
        },
        phone: shippingAddress.phone,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          _id: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        discount: cart.discount,
        couponCode: cart.couponCode
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

// POST /api/payment/confirm - Confirm payment and create order
router.post('/confirm', authenticate, async (req, res) => {
  try {
    const { paymentIntentId, cartId, shippingAddress, billingAddress, paymentMethod } = req.body;
    const userId = req.user._id;

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment has not been completed successfully'
      });
    }

    // Verify the payment intent belongs to this user and cart
    if (paymentIntent.metadata.userId !== userId.toString() || 
        paymentIntent.metadata.cartId !== cartId) {
      return res.status(403).json({
        success: false,
        error: 'Payment intent does not match user or cart'
      });
    }

    // Get the cart
    const cart = await Cart.findOne({ 
      _id: cartId, 
      user: userId, 
      status: 'active' 
    }).populate('items.product');

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    // Create order from cart
    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || item.product.image,
        price: item.price,
        quantity: item.quantity,
        selectedOptions: item.variants || {}
      })),
      status: 'confirmed',
      shippingAddress,
      billingAddress,
      payment: {
        method: paymentMethod || 'card',
        status: 'completed',
        transactionId: paymentIntent.id,
        paidAt: new Date()
      },
      pricing: {
        subtotal: cart.subtotal,
        shipping: cart.shipping,
        tax: cart.tax,
        discount: cart.discount,
        total: cart.total
      },
      shipping: {
        method: cart.shipping === 0 ? 'standard' : 'standard',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });

    // Add initial status to timeline
    order.addStatusUpdate('confirmed', 'Order confirmed and payment processed');

    await order.save();

    // Mark cart as converted and clear it
    cart.status = 'converted';
    await cart.save();

    // Update product stock (if you have stock tracking)
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product && product.stock !== undefined) {
        product.stock = Math.max(0, product.stock - item.quantity);
        if (product.stock === 0) {
          product.inStock = false;
        }
        await product.save();
      }
    }

    res.json({
      success: true,
      message: 'Payment confirmed and order created successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.pricing.total,
        estimatedDelivery: order.shipping.estimatedDelivery,
        items: order.items,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment and create order'
    });
  }
});

// GET /api/payment/config - Get Stripe public configuration
router.get('/config', (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// POST /api/payment/webhook - Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update order status if needed
        const order = await Order.findOne({
          'payment.transactionId': paymentIntent.id
        });
        
        if (order && order.payment.status !== 'completed') {
          order.payment.status = 'completed';
          order.payment.paidAt = new Date();
          order.addStatusUpdate('processing', 'Payment confirmed via webhook');
          await order.save();
          console.log('Order updated via webhook:', order.orderNumber);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Update order status
        const failedOrder = await Order.findOne({
          'payment.transactionId': failedPayment.id
        });
        
        if (failedOrder) {
          failedOrder.payment.status = 'failed';
          failedOrder.addStatusUpdate('cancelled', 'Payment failed');
          await failedOrder.save();
          console.log('Order marked as failed via webhook:', failedOrder.orderNumber);
        }
        break;

      case 'charge.dispute.created':
        const dispute = event.data.object;
        console.log('Chargeback created:', dispute.id);
        // Handle chargeback logic here
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// GET /api/payment/methods - Get available payment methods
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        enabled: true
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        description: 'Pay with Apple Pay',
        enabled: true
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        description: 'Pay with Google Pay',
        enabled: true
      }
    ]
  });
});

// POST /api/payment/refund - Process refund
router.post('/refund', authenticate, async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;
    const userId = req.user._id;

    // Find the order
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot refund an order that was not successfully paid'
      });
    }

    const refundAmount = amount || order.pricing.total;

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.payment.transactionId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: reason || 'requested_by_customer',
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString()
      }
    });

    // Update order status
    order.payment.status = 'refunded';
    order.addStatusUpdate('refunded', `Refund processed: $${refundAmount}`);
    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refundAmount,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund'
    });
  }
});

export default router;