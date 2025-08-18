import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * Cart Helper Functions
 * Utility functions for cart operations, validation, and calculations
 */

/**
 * Validate cart items against current product data
 * @param {Object} cart - Cart document
 * @returns {Object} - Validation result with updated prices and availability
 */
export const validateCartItems = async (cart) => {
  const validationResults = {
    hasChanges: false,
    priceChanges: [],
    unavailableItems: [],
    updatedCart: cart
  };

  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    
    try {
      const currentProduct = await Product.findById(item.product);
      
      if (!currentProduct) {
        // Product no longer exists
        validationResults.unavailableItems.push({
          itemId: item._id,
          reason: 'Product no longer available',
          productName: 'Unknown Product'
        });
        cart.items.splice(i, 1);
        i--; // Adjust index after removal
        validationResults.hasChanges = true;
        continue;
      }

      if (!currentProduct.inStock) {
        // Product out of stock
        validationResults.unavailableItems.push({
          itemId: item._id,
          reason: 'Product out of stock',
          productName: currentProduct.name
        });
        cart.items.splice(i, 1);
        i--; // Adjust index after removal
        validationResults.hasChanges = true;
        continue;
      }

      // Check for price changes
      if (item.price !== currentProduct.price) {
        validationResults.priceChanges.push({
          itemId: item._id,
          productName: currentProduct.name,
          oldPrice: item.price,
          newPrice: currentProduct.price,
          difference: currentProduct.price - item.price
        });
        
        // Update item price
        item.price = currentProduct.price;
        item.originalPrice = currentProduct.originalPrice;
        validationResults.hasChanges = true;
      }
    } catch (error) {
      console.error(`Error validating cart item ${item._id}:`, error);
      // Remove problematic items
      validationResults.unavailableItems.push({
        itemId: item._id,
        reason: 'Validation error',
        productName: 'Unknown Product'
      });
      cart.items.splice(i, 1);
      i--; // Adjust index after removal
      validationResults.hasChanges = true;
    }
  }

  if (validationResults.hasChanges) {
    cart.calculateTotals();
    validationResults.updatedCart = cart;
  }

  return validationResults;
};

/**
 * Check inventory availability for cart items
 * @param {Object} cart - Cart document
 * @returns {Object} - Inventory check results
 */
export const checkInventoryAvailability = async (cart) => {
  const inventoryResults = {
    isAvailable: true,
    unavailableItems: [],
    lowStockWarnings: []
  };

  for (const item of cart.items) {
    try {
      const product = await Product.findById(item.product);
      
      if (!product || !product.inStock) {
        inventoryResults.isAvailable = false;
        inventoryResults.unavailableItems.push({
          itemId: item._id,
          productName: product?.name || 'Unknown Product',
          requestedQuantity: item.quantity,
          availableQuantity: 0
        });
      }
      
      // Note: Current Product model doesn't have stock quantity field
      // This is a placeholder for when inventory tracking is implemented
      /*
      if (product.stockQuantity && product.stockQuantity < item.quantity) {
        inventoryResults.isAvailable = false;
        inventoryResults.unavailableItems.push({
          itemId: item._id,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity: product.stockQuantity
        });
      } else if (product.stockQuantity && product.stockQuantity <= 5) {
        inventoryResults.lowStockWarnings.push({
          itemId: item._id,
          productName: product.name,
          stockQuantity: product.stockQuantity
        });
      }
      */
    } catch (error) {
      console.error(`Error checking inventory for item ${item._id}:`, error);
      inventoryResults.isAvailable = false;
      inventoryResults.unavailableItems.push({
        itemId: item._id,
        productName: 'Unknown Product',
        requestedQuantity: item.quantity,
        availableQuantity: 0
      });
    }
  }

  return inventoryResults;
};

/**
 * Calculate shipping cost based on cart contents and delivery address
 * @param {Object} cart - Cart document
 * @param {Object} shippingAddress - Shipping address object
 * @returns {Number} - Calculated shipping cost
 */
export const calculateShippingCost = (cart, shippingAddress = {}) => {
  const { country = 'US', state = '', city = '' } = shippingAddress;
  const subtotal = cart.subtotal;
  
  // Free shipping over $50
  if (subtotal >= 50) {
    return 0;
  }
  
  // Base shipping rates by region
  const shippingRates = {
    'US': {
      base: 10,
      expedited: 25,
      overnight: 50
    },
    'CA': {
      base: 15,
      expedited: 35,
      overnight: 75
    },
    'international': {
      base: 25,
      expedited: 60,
      overnight: 120
    }
  };
  
  const rates = shippingRates[country] || shippingRates.international;
  
  // For now, return base shipping rate
  // In the future, this could be enhanced with shipping service selection
  return rates.base;
};

/**
 * Calculate tax based on cart contents and delivery address
 * @param {Object} cart - Cart document
 * @param {Object} taxAddress - Tax calculation address
 * @returns {Number} - Calculated tax amount
 */
export const calculateTax = (cart, taxAddress = {}) => {
  const { country = 'US', state = '', zipCode = '' } = taxAddress;
  const subtotal = cart.subtotal;
  
  // US tax rates by state (simplified)
  const usTaxRates = {
    'CA': 0.0875, // California
    'NY': 0.08,   // New York
    'TX': 0.0625, // Texas
    'FL': 0.06,   // Florida
    'WA': 0.065,  // Washington
    'OR': 0,      // Oregon (no sales tax)
    'default': 0.08
  };
  
  // International tax rates
  const internationalTaxRates = {
    'CA': 0.13,   // Canada GST/HST
    'GB': 0.20,   // UK VAT
    'DE': 0.19,   // Germany VAT
    'FR': 0.20,   // France VAT
    'default': 0.10
  };
  
  let taxRate = 0;
  
  if (country === 'US') {
    taxRate = usTaxRates[state] || usTaxRates.default;
  } else {
    taxRate = internationalTaxRates[country] || internationalTaxRates.default;
  }
  
  return subtotal * taxRate;
};

/**
 * Apply discount to cart
 * @param {Object} cart - Cart document
 * @param {String} couponCode - Coupon code to apply
 * @returns {Object} - Discount application result
 */
export const applyDiscount = async (cart, couponCode) => {
  // Simple coupon system (in production, you'd have a Coupon model)
  const validCoupons = {
    'SAVE10': { 
      type: 'percentage', 
      value: 10, 
      minAmount: 0,
      maxDiscount: null,
      description: 'Save 10% on your order'
    },
    'SAVE20': { 
      type: 'percentage', 
      value: 20, 
      minAmount: 50,
      maxDiscount: 100,
      description: 'Save 20% on orders over $50'
    },
    'WELCOME15': { 
      type: 'percentage', 
      value: 15, 
      minAmount: 25,
      maxDiscount: 50,
      description: 'Welcome! Save 15% on your first order'
    },
    'NEWUSER25': { 
      type: 'percentage', 
      value: 25, 
      minAmount: 75,
      maxDiscount: 200,
      description: 'New user special: Save 25% on orders over $75'
    },
    'FLAT5': { 
      type: 'fixed', 
      value: 5, 
      minAmount: 20,
      maxDiscount: null,
      description: '$5 off orders over $20'
    }
  };
  
  const coupon = validCoupons[couponCode.toUpperCase()];
  
  if (!coupon) {
    return {
      success: false,
      error: 'Invalid coupon code'
    };
  }
  
  if (cart.subtotal < coupon.minAmount) {
    return {
      success: false,
      error: `Minimum order amount of $${coupon.minAmount} required for this coupon`
    };
  }
  
  let discountAmount = 0;
  
  if (coupon.type === 'percentage') {
    discountAmount = (cart.subtotal * coupon.value) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'fixed') {
    discountAmount = coupon.value;
  }
  
  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, cart.subtotal);
  
  return {
    success: true,
    couponCode: couponCode.toUpperCase(),
    discountType: coupon.type,
    discountValue: coupon.value,
    discountAmount,
    description: coupon.description
  };
};

/**
 * Clean up expired and abandoned carts
 * This should be run as a scheduled job
 */
export const cleanupExpiredCarts = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Mark old active carts as abandoned
    await Cart.updateMany(
      {
        status: 'active',
        updatedAt: { $lt: thirtyDaysAgo }
      },
      {
        status: 'abandoned'
      }
    );
    
    // Delete very old abandoned carts (90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const deletedCarts = await Cart.deleteMany({
      status: 'abandoned',
      updatedAt: { $lt: ninetyDaysAgo }
    });
    
    console.log(`Cleaned up ${deletedCarts.deletedCount} old abandoned carts`);
    
    return {
      success: true,
      deletedCount: deletedCarts.deletedCount
    };
  } catch (error) {
    console.error('Error cleaning up expired carts:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get cart analytics for admin dashboard
 * @returns {Object} - Cart analytics data
 */
export const getCartAnalytics = async () => {
  try {
    const [
      totalActiveCarts,
      totalAbandonedCarts,
      averageCartValue,
      topCartItems
    ] = await Promise.all([
      Cart.countDocuments({ status: 'active' }),
      Cart.countDocuments({ status: 'abandoned' }),
      Cart.aggregate([
        { $match: { status: 'active', total: { $gt: 0 } } },
        { $group: { _id: null, avgValue: { $avg: '$total' } } }
      ]),
      Cart.aggregate([
        { $match: { status: 'active' } },
        { $unwind: '$items' },
        { $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalValue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }},
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            productName: '$product.name',
            totalQuantity: 1,
            totalValue: 1
          }
        }
      ])
    ]);
    
    return {
      totalActiveCarts,
      totalAbandonedCarts,
      averageCartValue: averageCartValue[0]?.avgValue || 0,
      topCartItems,
      abandonmentRate: totalAbandonedCarts / (totalActiveCarts + totalAbandonedCarts) * 100
    };
  } catch (error) {
    console.error('Error getting cart analytics:', error);
    throw error;
  }
};

export default {
  validateCartItems,
  checkInventoryAvailability,
  calculateShippingCost,
  calculateTax,
  applyDiscount,
  cleanupExpiredCarts,
  getCartAnalytics
};