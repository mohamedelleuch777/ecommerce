import express from 'express';

const router = express.Router();

// Hero section data
router.get('/hero', (req, res) => {
  const heroData = {
    title: "Discover Amazing Products",
    subtitle: "Shop the latest trends and find everything you need in one place",
    buttonText: "Shop Now",
    buttonLink: "/products",
    backgroundImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
    slides: [
      {
        id: 1,
        title: "Summer Collection 2024",
        subtitle: "Get up to 50% off on summer essentials",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        buttonText: "Shop Summer"
      },
      {
        id: 2,
        title: "Electronics Sale",
        subtitle: "Latest gadgets at unbeatable prices",
        image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&q=80",
        buttonText: "Shop Electronics"
      },
      {
        id: 3,
        title: "Home & Garden",
        subtitle: "Transform your space with our home collection",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        buttonText: "Shop Home"
      }
    ]
  };
  
  res.json(heroData);
});

// Categories data
router.get('/categories', (req, res) => {
  const categoriesData = [
    {
      id: 1,
      name: "Electronics",
      description: "Latest gadgets and tech",
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80",
      productCount: 156,
      featured: true
    },
    {
      id: 2,
      name: "Fashion",
      description: "Trendy clothing and accessories",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
      productCount: 289,
      featured: true
    },
    {
      id: 3,
      name: "Home & Garden",
      description: "Everything for your home",
      image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80",
      productCount: 198,
      featured: true
    },
    {
      id: 4,
      name: "Sports & Outdoors",
      description: "Gear for active lifestyle",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
      productCount: 147,
      featured: false
    },
    {
      id: 5,
      name: "Books",
      description: "Knowledge and entertainment",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
      productCount: 532,
      featured: false
    },
    {
      id: 6,
      name: "Health & Beauty",
      description: "Care for yourself",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
      productCount: 234,
      featured: true
    }
  ];
  
  res.json(categoriesData);
});

// Featured products
router.get('/products/featured', (req, res) => {
  const featuredProducts = [
    {
      id: 1,
      name: "Wireless Headphones",
      description: "Premium noise-canceling headphones",
      price: 199.99,
      originalPrice: 249.99,
      discount: 20,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      category: "Electronics",
      rating: 4.8,
      reviews: 124,
      inStock: true,
      featured: true
    },
    {
      id: 2,
      name: "Smart Watch",
      description: "Fitness tracking and notifications",
      price: 299.99,
      originalPrice: 349.99,
      discount: 14,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      category: "Electronics",
      rating: 4.6,
      reviews: 89,
      inStock: true,
      featured: true
    },
    {
      id: 3,
      name: "Designer Jacket",
      description: "Stylish winter jacket",
      price: 159.99,
      originalPrice: 199.99,
      discount: 20,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
      category: "Fashion",
      rating: 4.5,
      reviews: 67,
      inStock: true,
      featured: true
    },
    {
      id: 4,
      name: "Coffee Maker",
      description: "Automatic drip coffee maker",
      price: 89.99,
      originalPrice: 119.99,
      discount: 25,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
      category: "Home & Garden",
      rating: 4.7,
      reviews: 203,
      inStock: false,
      featured: true
    },
    {
      id: 5,
      name: "Running Shoes",
      description: "Comfortable athletic shoes",
      price: 129.99,
      originalPrice: 159.99,
      discount: 19,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      category: "Sports & Outdoors",
      rating: 4.4,
      reviews: 156,
      inStock: true,
      featured: true
    },
    {
      id: 6,
      name: "Skincare Set",
      description: "Complete skincare routine",
      price: 79.99,
      originalPrice: 99.99,
      discount: 20,
      image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80",
      category: "Health & Beauty",
      rating: 4.9,
      reviews: 78,
      inStock: true,
      featured: true
    }
  ];
  
  res.json(featuredProducts);
});

// Testimonials
router.get('/testimonials', (req, res) => {
  const testimonialsData = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Verified Customer",
      comment: "Amazing products and fast delivery! I've been shopping here for over a year and never disappointed.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b637?w=150&q=80",
      date: "2024-07-15"
    },
    {
      id: 2,
      name: "Mike Chen",
      title: "Premium Member",
      comment: "Great customer service and quality products. The return policy is also very customer-friendly.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
      date: "2024-07-20"
    },
    {
      id: 3,
      name: "Emily Davis",
      title: "Verified Customer",
      comment: "Love the variety of products available. The website is easy to navigate and checkout is smooth.",
      rating: 4,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
      date: "2024-07-25"
    },
    {
      id: 4,
      name: "David Wilson",
      title: "VIP Customer",
      comment: "Excellent shopping experience every time. The deals and discounts are fantastic!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
      date: "2024-07-28"
    }
  ];
  
  res.json(testimonialsData);
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