import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Testimonial from '../models/Testimonial.js';
import Brand from '../models/Brand.js';

const router = express.Router();

// Hero section data
router.get('/hero', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    
    // Get featured products from database for hero slides
    const featuredProducts = await Product.find({ featured: true, inStock: true }).limit(2);
    
    const heroData = {
      title: lang === 'fr' ? "Découvrez des Produits Incroyables" : "Discover Amazing Products",
      subtitle: lang === 'fr' ? "Achetez les dernières tendances et trouvez tout ce dont vous avez besoin en un seul endroit" : "Shop the latest trends and find everything you need in one place",
      buttonText: lang === 'fr' ? "Acheter Maintenant" : "Shop Now",
      buttonLink: "/products",
      backgroundImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
      slides: featuredProducts.map(product => ({
        id: product._id,
        title: product.name,
        subtitle: lang === 'fr' ? "Offre Spéciale" : "Special Offer",
        description: product.description,
        currentPrice: product.price,
        oldPrice: product.originalPrice,
        discount: product.discount,
        buttonText: lang === 'fr' ? "Acheter Maintenant" : "Shop Now",
        buttonLink: `/product/${product._id}`,
        backgroundImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
        productImage: product.image
      }))
    };
    
    res.json(heroData);
  } catch (error) {
    console.error('Error fetching hero data:', error);
    res.status(500).json({ error: 'Failed to fetch hero data' });
  }
});

// Categories data
router.get('/categories', async (req, res) => {
  try {
    const dbCategories = await Category.find({ isActive: true });
    
    if (dbCategories.length > 0) {
      const categoriesData = dbCategories.map(category => ({
        id: category._id,
        name: category.name,
        description: category.description,
        image: category.image,
        productCount: category.count,
        slug: category.slug,
        featured: true
      }));
      res.json(categoriesData);
    } else {
      res.status(404).json({ error: 'No categories found' });
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Most active categories (for footer)
router.get('/categories/active', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const activeCategories = await Category.find({ isActive: true })
      .sort({ count: -1 })
      .limit(limit)
      .select('name description image count slug');
    
    res.json(activeCategories.map(cat => ({
      id: cat._id,
      name: cat.name,
      description: cat.description,
      image: cat.image,
      productCount: cat.count,
      slug: cat.slug,
      featured: true
    })));
  } catch (error) {
    console.error('Error fetching active categories:', error);
    res.status(500).json({ error: 'Failed to fetch active categories' });
  }
});

// Featured products
router.get('/products/featured', async (req, res) => {
  try {
    const dbProducts = await Product.find({ featured: true, inStock: true }).limit(6);
    
    if (dbProducts.length > 0) {
      res.json(dbProducts);
    } else {
      res.status(404).json({ error: 'No featured products found' });
    }
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Products by category
router.get('/categories/:category/products', async (req, res) => {
  try {
    const categorySlug = req.params.category.toLowerCase();
    
    // Find category by slug
    const category = await Category.findOne({ slug: categorySlug, isActive: true });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Get products by category name
    const products = await Product.find({ 
      category: category.name,
      inStock: true 
    });
    
    res.json({
      category: categorySlug,
      categoryName: category.name,
      products: products,
      total: products.length
    });
  } catch (error) {
    console.error('Error fetching category products:', error);
    res.status(500).json({ error: 'Failed to fetch category products' });
  }
});

// Single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    const product = await Product.findById(productId);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true });
    
    const testimonialsData = testimonials.map(testimonial => ({
      id: testimonial._id,
      name: testimonial.name,
      title: testimonial.role,
      comment: testimonial.content,
      rating: testimonial.rating,
      image: testimonial.avatar,
      date: testimonial.createdAt
    }));
    
    res.json(testimonialsData);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Newsletter signup
router.post('/newsletter', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  console.log(`Newsletter signup: ${email}`);
  
  res.json({ 
    message: 'Successfully subscribed to newsletter!',
    email: email 
  });
});

// Contact form
router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ 
      error: 'Name, email, and message are required' 
    });
  }
  
  console.log(`Contact form submission:`, { name, email, subject, message });
  
  res.json({ 
    message: 'Thank you for your message! We will get back to you soon.',
    data: { name, email, subject } 
  });
});

// Brands endpoint
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

export default router;