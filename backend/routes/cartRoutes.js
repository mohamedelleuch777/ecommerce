import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper function to get cart identifier
const getCartIdentifier = (req) => {
  const userId = req.user?._id;
  const sessionId = req.headers['x-session-id'] || req.body.sessionId;
  
  if (!userId && !sessionId) {
    throw new Error('Either user authentication or session ID is required');
  }
  
  return { userId, sessionId };
};

// GET /api/cart - Get user's cart
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { userId, sessionId } = getCartIdentifier(req);
    
    const cart = await Cart.findOrCreateCart(userId, sessionId);
    await cart.populate('items.product');
    
    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          _id: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          variants: item.variants,
          addedAt: item.addedAt,
          subtotal: item.price * item.quantity
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        discount: cart.discount,
        couponCode: cart.couponCode,
        itemCount: cart.getItemCount(),
        updatedAt: cart.updatedAt
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cart'
    });
  }
});

// POST /api/cart/add - Add item to cart
router.post('/add', optionalAuth, async (req, res) => {
  try {
    const { productId, quantity = 1, variants = {} } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      });
    }

    // Check if product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        error: 'Product is out of stock'
      });
    }

    const { userId, sessionId } = getCartIdentifier(req);
    const cart = await Cart.findOrCreateCart(userId, sessionId);
    
    await cart.addItem(product, quantity, variants);
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          _id: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          variants: item.variants,
          addedAt: item.addedAt,
          subtotal: item.price * item.quantity
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        discount: cart.discount,
        couponCode: cart.couponCode,
        itemCount: cart.getItemCount(),
        updatedAt: cart.updatedAt
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
});

// PUT /api/cart/update/:itemId - Update item quantity
router.put('/update/:itemId', optionalAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity cannot be negative'
      });
    }

    const { userId, sessionId } = getCartIdentifier(req);
    
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId, status: 'active' });
    } else {
      cart = await Cart.findOne({ sessionId, status: 'active' });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    await cart.updateItemQuantity(itemId, quantity);
    await cart.populate('items.product');

    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Item quantity updated',
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          _id: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          variants: item.variants,
          addedAt: item.addedAt,
          subtotal: item.price * item.quantity
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        discount: cart.discount,
        couponCode: cart.couponCode,
        itemCount: cart.getItemCount(),
        updatedAt: cart.updatedAt
      }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update cart item'
    });
  }
});

// DELETE /api/cart/remove/:itemId - Remove item from cart
router.delete('/remove/:itemId', optionalAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId, sessionId } = getCartIdentifier(req);
    
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId, status: 'active' });
    } else {
      cart = await Cart.findOne({ sessionId, status: 'active' });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    await cart.removeItem(itemId);
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          _id: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          variants: item.variants,
          addedAt: item.addedAt,
          subtotal: item.price * item.quantity
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        discount: cart.discount,
        couponCode: cart.couponCode,
        itemCount: cart.getItemCount(),
        updatedAt: cart.updatedAt
      }
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    });
  }
});

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', optionalAuth, async (req, res) => {
  try {
    const { userId, sessionId } = getCartIdentifier(req);
    
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId, status: 'active' });
    } else {
      cart = await Cart.findOne({ sessionId, status: 'active' });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        _id: cart._id,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        discount: 0,
        couponCode: null,
        itemCount: 0,
        updatedAt: cart.updatedAt
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

// POST /api/cart/merge - Merge guest cart with user cart (on login)
router.post('/merge', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required for cart merge'
      });
    }

    const userId = req.user._id;
    const mergedCart = await Cart.mergeGuestCart(userId, sessionId);
    
    if (mergedCart) {
      await mergedCart.populate('items.product');
    }

    res.json({
      success: true,
      message: 'Cart merged successfully',
      cart: mergedCart ? {
        _id: mergedCart._id,
        items: mergedCart.items.map(item => ({
          _id: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          variants: item.variants,
          addedAt: item.addedAt,
          subtotal: item.price * item.quantity
        })),
        subtotal: mergedCart.subtotal,
        tax: mergedCart.tax,
        shipping: mergedCart.shipping,
        total: mergedCart.total,
        discount: mergedCart.discount,
        couponCode: mergedCart.couponCode,
        itemCount: mergedCart.getItemCount(),
        updatedAt: mergedCart.updatedAt
      } : null
    });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to merge cart'
    });
  }
});

// POST /api/cart/apply-coupon - Apply coupon code
router.post('/apply-coupon', optionalAuth, async (req, res) => {
  try {
    const { couponCode } = req.body;
    
    if (!couponCode) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required'
      });
    }

    const { userId, sessionId } = getCartIdentifier(req);
    
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId, status: 'active' });
    } else {
      cart = await Cart.findOne({ sessionId, status: 'active' });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    // Simple coupon validation (in a real app, you'd have a Coupon model)
    const validCoupons = {
      'SAVE10': 10,
      'SAVE20': 20,
      'WELCOME15': 15,
      'NEWUSER25': 25
    };

    const discountPercentage = validCoupons[couponCode.toUpperCase()];
    
    if (!discountPercentage) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coupon code'
      });
    }

    await cart.applyCoupon(couponCode.toUpperCase(), discountPercentage);
    await cart.populate('items.product');

    res.json({
      success: true,
      message: `Coupon applied! You saved ${discountPercentage}%`,
      cart: {
        _id: cart._id,
        items: cart.items.map(item => ({
          _id: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          variants: item.variants,
          addedAt: item.addedAt,
          subtotal: item.price * item.quantity
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        discount: cart.discount,
        couponCode: cart.couponCode,
        itemCount: cart.getItemCount(),
        updatedAt: cart.updatedAt
      }
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply coupon'
    });
  }
});

// GET /api/cart/count - Get cart item count (lightweight endpoint)
router.get('/count', optionalAuth, async (req, res) => {
  try {
    const { userId, sessionId } = getCartIdentifier(req);
    
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId, status: 'active' }).select('items');
    } else {
      cart = await Cart.findOne({ sessionId, status: 'active' }).select('items');
    }

    const itemCount = cart ? cart.getItemCount() : 0;

    res.json({
      success: true,
      itemCount
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cart count',
      itemCount: 0
    });
  }
});

export default router;