import express from 'express';
import { requireAdmin, requirePermission, requireSuperAdmin } from '../middleware/adminAuth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticate);
router.use(requireAdmin);

// Admin Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Import models here to avoid circular dependencies
    const { default: User } = await import('../models/User.js');
    const { default: Product } = await import('../models/Product.js');
    const { default: Order } = await import('../models/Order.js');
    const { default: Category } = await import('../models/Category.js');

    // Get basic stats
    const [userCount, productCount, orderCount, categoryCount] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments()
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get revenue data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, orderCount: 0 };

    res.json({
      stats: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        categories: categoryCount,
        revenue: revenue.totalRevenue,
        revenueOrders: revenue.orderCount
      },
      recentOrders
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Management Routes
router.get('/users', requirePermission('manage_users'), async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id', requirePermission('manage_users'), async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const { role, permissions, isActive } = req.body;

    // Prevent non-superadmin from modifying superadmin users
    if (req.user.role !== 'superadmin') {
      const targetUser = await User.findById(req.params.id);
      if (targetUser?.role === 'superadmin') {
        return res.status(403).json({ message: 'Cannot modify superadmin users' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, permissions, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Hero Slider Management Routes
router.get('/hero', requirePermission('manage_hero'), async (req, res) => {
  try {
    const { default: HeroSlide } = await import('../models/HeroSlide.js');
    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    console.error('Get hero slides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/hero', requirePermission('manage_hero'), async (req, res) => {
  try {
    const { default: HeroSlide } = await import('../models/HeroSlide.js');
    
    // Get the next order number
    const lastSlide = await HeroSlide.findOne().sort({ order: -1 });
    const order = lastSlide ? lastSlide.order + 1 : 1;
    
    const slideData = { ...req.body, order };
    const slide = new HeroSlide(slideData);
    await slide.save();
    
    res.status(201).json(slide);
  } catch (error) {
    console.error('Create hero slide error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/hero/reorder', requirePermission('manage_hero'), async (req, res) => {
  try {
    const { default: HeroSlide } = await import('../models/HeroSlide.js');
    const { slides } = req.body;
    
    // Update order for each slide
    const updatePromises = slides.map((slide, index) => 
      HeroSlide.findByIdAndUpdate(slide._id, { order: index + 1 })
    );
    
    await Promise.all(updatePromises);
    
    const updatedSlides = await HeroSlide.find().sort({ order: 1 });
    res.json(updatedSlides);
  } catch (error) {
    console.error('Reorder hero slides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/hero/:id', requirePermission('manage_hero'), async (req, res) => {
  try {
    const { default: HeroSlide } = await import('../models/HeroSlide.js');
    
    const slide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!slide) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    res.json(slide);
  } catch (error) {
    console.error('Update hero slide error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/hero/:id', requirePermission('manage_hero'), async (req, res) => {
  try {
    const { default: HeroSlide } = await import('../models/HeroSlide.js');
    
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    res.json({ message: 'Hero slide deleted successfully' });
  } catch (error) {
    console.error('Delete hero slide error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Categories Management Routes
router.get('/categories', requirePermission('manage_categories'), async (req, res) => {
  try {
    const { default: Category } = await import('../models/Category.js');
    const categories = await Category.find().sort({ order: 1, createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/categories', requirePermission('manage_categories'), async (req, res) => {
  try {
    const { default: Category } = await import('../models/Category.js');
    
    const category = new Category(req.body);
    await category.save();
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

router.put('/categories/:id', requirePermission('manage_categories'), async (req, res) => {
  try {
    const { default: Category } = await import('../models/Category.js');
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

router.delete('/categories/:id', requirePermission('manage_categories'), async (req, res) => {
  try {
    const { default: Category } = await import('../models/Category.js');
    
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Products Management Routes
router.get('/products', requirePermission('manage_products'), async (req, res) => {
  try {
    const { default: Product } = await import('../models/Product.js');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const featured = req.query.featured;
    const inStock = req.query.inStock;

    // Build filter query
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      filter.category = category;
    }
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }
    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/products/:id', requirePermission('manage_products'), async (req, res) => {
  try {
    const { default: Product } = await import('../models/Product.js');
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/products', requirePermission('manage_products'), async (req, res) => {
  try {
    const { default: Product } = await import('../models/Product.js');
    
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

router.put('/products/:id', requirePermission('manage_products'), async (req, res) => {
  try {
    const { default: Product } = await import('../models/Product.js');
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

router.delete('/products/:id', requirePermission('manage_products'), async (req, res) => {
  try {
    const { default: Product } = await import('../models/Product.js');
    
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/products/:id/toggle-featured', requirePermission('manage_products'), async (req, res) => {
  try {
    const { default: Product } = await import('../models/Product.js');
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.featured = !product.featured;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/products/:id/toggle-stock', requirePermission('manage_products'), async (req, res) => {
  try {
    const { default: Product } = await import('../models/Product.js');
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.inStock = !product.inStock;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Toggle stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export the router
export default router;