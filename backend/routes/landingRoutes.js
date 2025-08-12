import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import HeroSlide from '../models/HeroSlide.js';
import Testimonial from '../models/Testimonial.js';

const router = express.Router();

// Hero section data
router.get('/hero', async (req, res) => {
  try {
    const heroSlides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });
    
    const heroData = {
      title: "Discover Amazing Products",
      subtitle: "Shop the latest trends and find everything you need in one place",
      buttonText: "Shop Now",
      buttonLink: "/products",
      backgroundImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
      slides: heroSlides.map(slide => ({
        id: slide._id,
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        currentPrice: slide.currentPrice,
        oldPrice: slide.oldPrice,
        discount: slide.discount,
        buttonText: slide.buttonText,
        buttonLink: slide.buttonLink,
        backgroundImage: slide.backgroundImage,
        productImage: slide.productImage
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
    const categories = await Category.find({ isActive: true });
    
    const categoriesData = categories.map(category => ({
      id: category._id,
      name: category.name,
      description: category.description,
      image: category.image,
      productCount: category.count,
      slug: category.slug,
      featured: true
    }));
    
    res.json(categoriesData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Featured products
router.get('/products/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true });
    
    const productsData = featuredProducts.map(product => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      image: product.image,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      featured: product.featured
    }));
    
    res.json(productsData);
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
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Find products in this category
    const products = await Product.find({ category: category.name });
    
    const productsData = products.map(product => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      image: product.image,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      featured: product.featured
    }));
    
    res.json({
      category: categorySlug,
      categoryName: category.name,
      products: productsData,
      total: productsData.length
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
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const productData = {
      id: product._id,
      name: product.name,
      description: product.description,
      detailedDescription: product.detailedDescription,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      image: product.image,
      images: product.images || [product.image],
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      featured: product.featured,
      specifications: product.specifications ? Object.fromEntries(product.specifications) : {}
    };
    
    res.json(productData);
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
  
  // In a real app, you would save this to a database
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
  
  // In a real app, you would save this to a database or send email
  console.log(`Contact form submission:`, { name, email, subject, message });
  
  res.json({ 
    message: 'Thank you for your message! We will get back to you soon.',
    data: { name, email, subject } 
  });
});

export default router;