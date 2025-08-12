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

// Single product by ID
router.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  
  // Extended product data with additional details for PDP
  const productsWithDetails = [
    {
      id: 1,
      name: "Wireless Headphones",
      description: "Premium noise-canceling headphones",
      detailedDescription: "Experience superior sound quality with these premium wireless headphones. Featuring advanced noise-canceling technology, 30-hour battery life, and crystal-clear audio reproduction. Perfect for music lovers, professionals, and travelers.",
      price: 199.99,
      originalPrice: 249.99,
      discount: 20,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
        "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&q=80"
      ],
      category: "Electronics",
      rating: 4.8,
      reviews: 124,
      inStock: true,
      featured: true,
      specifications: {
        "Brand": "TechAudio",
        "Model": "WH-1000XM5",
        "Color": "Black",
        "Connectivity": "Bluetooth 5.2, USB-C",
        "Battery Life": "30 hours",
        "Weight": "250g",
        "Noise Canceling": "Advanced ANC",
        "Driver Size": "40mm",
        "Warranty": "2 years"
      }
    },
    {
      id: 2,
      name: "Smart Watch",
      description: "Fitness tracking and notifications",
      detailedDescription: "Stay connected and track your health with this advanced smart watch. Features heart rate monitoring, GPS tracking, water resistance, and seamless smartphone integration.",
      price: 299.99,
      originalPrice: 349.99,
      discount: 14,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&q=80",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80"
      ],
      category: "Electronics",
      rating: 4.6,
      reviews: 89,
      inStock: true,
      featured: true,
      specifications: {
        "Brand": "SmartTech",
        "Model": "SW-Pro 7",
        "Display": "1.9 inch AMOLED",
        "Battery Life": "7 days",
        "Water Resistance": "IP68",
        "Sensors": "Heart rate, GPS, Gyroscope",
        "Compatibility": "iOS & Android",
        "Storage": "32GB",
        "Warranty": "1 year"
      }
    },
    {
      id: 3,
      name: "Designer Jacket",
      description: "Stylish winter jacket",
      detailedDescription: "Premium designer winter jacket crafted from high-quality materials. Features water-resistant fabric, thermal insulation, and modern design perfect for urban environments.",
      price: 159.99,
      originalPrice: 199.99,
      discount: 20,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
        "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&q=80"
      ],
      category: "Fashion",
      rating: 4.5,
      reviews: 67,
      inStock: true,
      featured: true,
      specifications: {
        "Brand": "UrbanStyle",
        "Material": "Polyester blend",
        "Sizes": "S, M, L, XL, XXL",
        "Color": "Black, Navy, Gray",
        "Features": "Water-resistant, Thermal lining",
        "Care": "Machine washable",
        "Season": "Fall/Winter",
        "Fit": "Regular fit",
        "Warranty": "6 months"
      }
    },
    {
      id: 4,
      name: "Coffee Maker",
      description: "Automatic drip coffee maker",
      detailedDescription: "Professional-grade automatic coffee maker with programmable settings. Brews perfect coffee every time with temperature control, timer function, and easy maintenance.",
      price: 89.99,
      originalPrice: 119.99,
      discount: 25,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
      images: [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80"
      ],
      category: "Home & Garden",
      rating: 4.7,
      reviews: 203,
      inStock: false,
      featured: true,
      specifications: {
        "Brand": "BrewMaster",
        "Capacity": "12 cups",
        "Power": "1200W",
        "Features": "Programmable, Auto shut-off",
        "Material": "Stainless steel",
        "Filter": "Permanent filter included",
        "Dimensions": "14 x 10 x 12 inches",
        "Weight": "4.5 lbs",
        "Warranty": "2 years"
      }
    },
    {
      id: 5,
      name: "Running Shoes",
      description: "Comfortable athletic shoes",
      detailedDescription: "High-performance running shoes designed for comfort and durability. Features responsive cushioning, breathable mesh upper, and superior grip for all terrains.",
      price: 129.99,
      originalPrice: 159.99,
      discount: 19,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80"
      ],
      category: "Sports & Outdoors",
      rating: 4.4,
      reviews: 156,
      inStock: true,
      featured: true,
      specifications: {
        "Brand": "RunFast",
        "Model": "Sprint Pro 2024",
        "Sizes": "US 6-13",
        "Width": "Regular, Wide",
        "Color": "Black/White, Blue/Gray",
        "Upper Material": "Breathable mesh",
        "Sole": "Rubber with grip pattern",
        "Weight": "10 oz",
        "Warranty": "1 year"
      }
    },
    {
      id: 6,
      name: "Skincare Set",
      description: "Complete skincare routine",
      detailedDescription: "Professional skincare set with cleanser, toner, serum, and moisturizer. Formulated with natural ingredients for all skin types. Achieve healthy, glowing skin.",
      price: 79.99,
      originalPrice: 99.99,
      discount: 20,
      image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80",
      images: [
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80",
        "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600&q=80",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80"
      ],
      category: "Health & Beauty",
      rating: 4.9,
      reviews: 78,
      inStock: true,
      featured: true,
      specifications: {
        "Brand": "PureSkin",
        "Set Includes": "Cleanser, Toner, Serum, Moisturizer",
        "Skin Type": "All skin types",
        "Key Ingredients": "Vitamin C, Hyaluronic Acid, Niacinamide",
        "Volume": "150ml each",
        "Packaging": "Eco-friendly",
        "Cruelty Free": "Yes",
        "Expiry": "24 months",
        "Warranty": "Satisfaction guarantee"
      }
    }
  ];

  const product = productsWithDetails.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
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