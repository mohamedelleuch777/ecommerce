import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  variants: {
    size: String,
    color: String,
    material: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.sessionId; // Required if no sessionId (authenticated user)
    }
  },
  sessionId: {
    type: String,
    required: function() {
      return !this.user; // Required if no user (guest cart)
    }
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Indexes for better performance
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired carts

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

// Instance methods
cartSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate tax (8% default)
  this.tax = this.subtotal * 0.08;
  
  // Calculate shipping (free shipping over $50, otherwise $10)
  this.shipping = this.subtotal >= 50 ? 0 : 10;
  
  // Apply discount
  const discountAmount = (this.subtotal * this.discount) / 100;
  
  // Calculate total
  this.total = this.subtotal + this.tax + this.shipping - discountAmount;
  this.total = Math.max(0, this.total); // Ensure total is not negative
};

cartSchema.methods.addItem = function(productData, quantity = 1, variants = {}) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productData._id.toString() &&
    JSON.stringify(item.variants) === JSON.stringify(variants)
  );

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productData._id,
      quantity,
      price: productData.price,
      originalPrice: productData.originalPrice,
      variants
    });
  }

  this.calculateTotals();
  return this.save();
};

cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    this.items.pull(itemId);
  } else {
    item.quantity = quantity;
  }

  this.calculateTotals();
  return this.save();
};

cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId);
  this.calculateTotals();
  return this.save();
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  this.subtotal = 0;
  this.tax = 0;
  this.shipping = 0;
  this.total = 0;
  this.discount = 0;
  this.couponCode = null;
  return this.save();
};

cartSchema.methods.applyCoupon = function(couponCode, discountPercentage) {
  this.couponCode = couponCode;
  this.discount = discountPercentage;
  this.calculateTotals();
  return this.save();
};

cartSchema.methods.getItemCount = function() {
  return this.items.reduce((count, item) => count + item.quantity, 0);
};

// Static methods
cartSchema.statics.findOrCreateCart = async function(userId, sessionId) {
  let cart;
  
  if (userId) {
    cart = await this.findOne({ user: userId, status: 'active' });
  } else if (sessionId) {
    cart = await this.findOne({ sessionId, status: 'active' });
  }

  if (!cart) {
    cart = new this({
      user: userId || undefined,
      sessionId: sessionId || undefined
    });
    await cart.save();
  }

  return cart;
};

cartSchema.statics.mergeGuestCart = async function(userId, sessionId) {
  const userCart = await this.findOne({ user: userId, status: 'active' });
  const guestCart = await this.findOne({ sessionId, status: 'active' });

  if (!guestCart) {
    return userCart;
  }

  if (!userCart) {
    // Convert guest cart to user cart
    guestCart.user = userId;
    guestCart.sessionId = undefined;
    return await guestCart.save();
  }

  // Merge guest cart items into user cart
  for (const guestItem of guestCart.items) {
    const existingItem = userCart.items.find(item => 
      item.product.toString() === guestItem.product.toString() &&
      JSON.stringify(item.variants) === JSON.stringify(guestItem.variants)
    );

    if (existingItem) {
      existingItem.quantity += guestItem.quantity;
    } else {
      userCart.items.push(guestItem);
    }
  }

  userCart.calculateTotals();
  await userCart.save();

  // Remove guest cart
  await guestCart.deleteOne();

  return userCart;
};

// Virtual for populated items with product details
cartSchema.virtual('populatedItems', {
  ref: 'Product',
  localField: 'items.product',
  foreignField: '_id'
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;