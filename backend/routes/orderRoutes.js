import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create new order
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod = 'standard'
    } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // Validate and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          error: `Product with ID ${item.productId} not found` 
        });
      }

      if (!product.inStock) {
        return res.status(400).json({ 
          error: `Product ${product.name} is out of stock` 
        });
      }

      const orderItem = {
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || {}
      };

      orderItems.push(orderItem);
      subtotal += product.price * item.quantity;
    }

    // Calculate shipping cost
    let shippingCost = 0;
    switch (shippingMethod) {
      case 'express':
        shippingCost = 15.99;
        break;
      case 'overnight':
        shippingCost = 29.99;
        break;
      default:
        shippingCost = 5.99;
    }

    // Calculate tax (8% for example)
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      pricing: {
        subtotal,
        shipping: shippingCost,
        tax,
        total
      },
      shipping: {
        method: shippingMethod
      }
    });

    // Add initial status to timeline
    order.addStatusUpdate('pending', 'Order created');

    await order.save();

    // Populate product details
    await order.populate('items.product', 'name image category');
    
    res.status(201).json({
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error during order creation' });
  }
});

// Get user's orders
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const sort = req.query.sort || '-createdAt';

    const skip = (page - 1) * limit;

    // Build query
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name image category')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    }).populate('items.product', 'name image category rating reviews');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel order
router.patch('/:orderId/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        error: 'Order cannot be cancelled at this stage' 
      });
    }

    order.addStatusUpdate('cancelled', req.body.reason || 'Cancelled by customer');
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (for admin use)
router.patch('/:orderId/status', authenticate, async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = [
      'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status
    order.addStatusUpdate(status, note || '');

    // Update tracking number if provided
    if (trackingNumber && status === 'shipped') {
      order.shipping.trackingNumber = trackingNumber;
    }

    // Mark payment as completed if order is confirmed
    if (status === 'confirmed' && order.payment.status === 'pending') {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order statistics for user
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalSpent = await Order.aggregate([
      { $match: { user: userId, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    res.json({
      totalOrders,
      totalSpent: totalSpent[0]?.total || 0,
      statusBreakdown: stats
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder previous order
router.post('/:orderId/reorder', authenticate, async (req, res) => {
  try {
    const originalOrder = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    }).populate('items.product');

    if (!originalOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if all products are still available
    const unavailableProducts = [];
    const orderItems = [];

    for (const item of originalOrder.items) {
      const product = await Product.findById(item.product._id);
      
      if (!product || !product.inStock) {
        unavailableProducts.push(item.name);
      } else {
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price, // Use current price
          quantity: item.quantity,
          selectedOptions: item.selectedOptions
        });
      }
    }

    if (unavailableProducts.length > 0) {
      return res.status(400).json({
        error: 'Some products are no longer available',
        unavailableProducts
      });
    }

    // Calculate new totals with current prices
    const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = originalOrder.pricing.shipping;
    const total = subtotal + shipping + tax;

    // Create new order
    const newOrder = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: originalOrder.shippingAddress,
      billingAddress: originalOrder.billingAddress,
      payment: {
        method: originalOrder.payment.method,
        status: 'pending'
      },
      pricing: {
        subtotal,
        shipping,
        tax,
        total
      },
      shipping: {
        method: originalOrder.shipping.method
      }
    });

    newOrder.addStatusUpdate('pending', `Reorder from ${originalOrder.orderNumber}`);
    await newOrder.save();

    res.status(201).json({
      message: 'Order recreated successfully',
      order: newOrder
    });

  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;