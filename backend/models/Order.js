import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  image: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedOptions: {
    color: String,
    size: String,
    memory: String,
    storage: String
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending'
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    refunds: [{
      refundId: String,
      amount: Number,
      reason: String,
      processedAt: {
        type: Date,
        default: Date.now
      }
    }],
    paymentIntentId: String,
    lastFour: String,
    cardBrand: String,
    currency: {
      type: String,
      default: 'usd'
    },
    fees: {
      stripe: Number,
      processing: Number
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    shipping: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  shipping: {
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard'
    },
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  notes: {
    customer: String,
    internal: String
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

// Add status to timeline
orderSchema.methods.addStatusUpdate = function(status, note = '') {
  this.status = status;
  this.timeline.push({
    status,
    note,
    timestamp: new Date()
  });
};

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.pricing.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Simple tax calculation (8% for example)
  this.pricing.tax = this.pricing.subtotal * 0.08;
  
  // Calculate total
  this.pricing.total = this.pricing.subtotal + this.pricing.shipping + this.pricing.tax - this.pricing.discount;
};

// Get current status with timestamp
orderSchema.virtual('currentStatus').get(function() {
  return this.timeline[this.timeline.length - 1] || { status: this.status, timestamp: this.createdAt };
});

// Calculate total refunded amount
orderSchema.virtual('totalRefunded').get(function() {
  return this.payment.refunds.reduce((total, refund) => total + refund.amount, 0);
});

// Check if order can be refunded
orderSchema.methods.canBeRefunded = function() {
  return this.payment.status === 'completed' && 
         this.status !== 'cancelled' &&
         this.totalRefunded < this.pricing.total;
};

// Add refund to order
orderSchema.methods.addRefund = function(refundId, amount, reason) {
  this.payment.refunds.push({
    refundId,
    amount,
    reason,
    processedAt: new Date()
  });
  
  const totalRefunded = this.totalRefunded;
  if (totalRefunded >= this.pricing.total) {
    this.payment.status = 'refunded';
    this.addStatusUpdate('refunded', 'Full refund processed');
  } else {
    this.payment.status = 'partially_refunded';
    this.addStatusUpdate('partially_refunded', `Partial refund of $${amount} processed`);
  }
};

// Get refund history
orderSchema.methods.getRefundHistory = function() {
  return this.payment.refunds.map(refund => ({
    id: refund.refundId,
    amount: refund.amount,
    reason: refund.reason,
    date: refund.processedAt
  }));
};

// Check if order is paid
orderSchema.virtual('isPaid').get(function() {
  return this.payment.status === 'completed' || this.payment.status === 'refunded' || this.payment.status === 'partially_refunded';
});

// Get remaining refundable amount
orderSchema.virtual('refundableAmount').get(function() {
  return Math.max(0, this.pricing.total - this.totalRefunded);
});

const Order = mongoose.model('Order', orderSchema);

export default Order;