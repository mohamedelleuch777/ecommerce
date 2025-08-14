import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

const comprehensiveProducts = [
  // Electronics - Smartphones
  {
    "name": "iPhone 15 Pro Max 256GB",
    "description": "Latest Apple smartphone with titanium design and advanced camera system.",
    "detailedDescription": "The iPhone 15 Pro Max features a titanium design, A17 Pro chip, and advanced camera system with 5x optical zoom. Perfect for photography enthusiasts and professionals.",
    "price": 1199.99,
    "originalPrice": 1299.99,
    "discount": 8,
    "image": "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.8,
    "reviews": 1250,
    "inStock": true,
    "featured": true,
    "tags": ["iphone", "apple", "smartphone", "mobile", "15", "pro", "max", "phone"],
    "specifications": {
      "Brand": "Apple",
      "Storage": "256GB",
      "Color": "Natural Titanium",
      "Screen Size": "6.7 inch"
    }
  },
  {
    "name": "Samsung Galaxy S24 Ultra 512GB",
    "description": "Premium Android flagship with S Pen and advanced AI features.",
    "detailedDescription": "Galaxy S24 Ultra combines powerful performance with intelligent AI features, advanced camera system, and built-in S Pen for productivity.",
    "price": 1099.99,
    "originalPrice": 1199.99,
    "discount": 8,
    "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.6,
    "reviews": 890,
    "inStock": true,
    "featured": true,
    "tags": ["samsung", "galaxy", "s24", "ultra", "android", "smartphone", "s pen", "phone"],
    "specifications": {
      "Brand": "Samsung",
      "Storage": "512GB",
      "Color": "Titanium Black",
      "Screen Size": "6.8 inch"
    }
  },
  {
    "name": "Google Pixel 8 Pro 128GB",
    "description": "AI-powered smartphone with advanced computational photography.",
    "detailedDescription": "Google Pixel 8 Pro delivers exceptional camera performance with AI-enhanced features, pure Android experience, and impressive battery life.",
    "price": 899.99,
    "originalPrice": 999.99,
    "discount": 10,
    "image": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.5,
    "reviews": 654,
    "inStock": true,
    "featured": false,
    "tags": ["google", "pixel", "8", "pro", "android", "smartphone", "ai", "camera", "phone"],
    "specifications": {
      "Brand": "Google",
      "Storage": "128GB",
      "Color": "Obsidian",
      "Screen Size": "6.7 inch"
    }
  },

  // Electronics - Laptops & Computers
  {
    "name": "MacBook Air M2 13-inch",
    "description": "Ultra-thin laptop with M2 chip and all-day battery life.",
    "detailedDescription": "The MacBook Air with M2 chip delivers incredible performance and battery life in an ultra-thin design. Perfect for students and professionals.",
    "price": 1099.99,
    "originalPrice": 1199.99,
    "discount": 8,
    "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.9,
    "reviews": 2150,
    "inStock": true,
    "featured": true,
    "tags": ["macbook", "air", "apple", "laptop", "m2", "notebook", "computer"],
    "specifications": {
      "Brand": "Apple",
      "Processor": "M2 chip",
      "RAM": "8GB",
      "Storage": "256GB SSD"
    }
  },
  {
    "name": "Dell XPS 15 OLED Laptop",
    "description": "High-performance laptop with stunning OLED display for creators.",
    "detailedDescription": "Dell XPS 15 features a gorgeous 15.6-inch OLED display, powerful Intel processors, and premium build quality for professional creators.",
    "price": 1599.99,
    "originalPrice": 1799.99,
    "discount": 11,
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.7,
    "reviews": 892,
    "inStock": true,
    "featured": true,
    "tags": ["dell", "xps", "laptop", "oled", "computer", "creator", "performance"],
    "specifications": {
      "Brand": "Dell",
      "Processor": "Intel i7-13700H",
      "RAM": "16GB",
      "Storage": "512GB SSD"
    }
  },
  {
    "name": "Gaming Desktop PC RTX 4070",
    "description": "High-performance gaming desktop with RTX 4070 graphics card.",
    "detailedDescription": "Custom-built gaming PC featuring NVIDIA RTX 4070, AMD Ryzen 7 processor, and premium components for exceptional gaming performance.",
    "price": 1899.99,
    "originalPrice": 2199.99,
    "discount": 14,
    "image": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.8,
    "reviews": 445,
    "inStock": true,
    "featured": false,
    "tags": ["gaming", "desktop", "pc", "rtx", "4070", "computer", "nvidia", "amd"],
    "specifications": {
      "Processor": "AMD Ryzen 7 7700X",
      "Graphics": "RTX 4070 12GB",
      "RAM": "32GB DDR5",
      "Storage": "1TB NVMe SSD"
    }
  },

  // Electronics - Smart Watches & Wearables
  {
    "name": "Apple Watch Series 9 GPS",
    "description": "Advanced smartwatch with health monitoring and fitness tracking.",
    "detailedDescription": "Apple Watch Series 9 with S9 chip, all-day battery life, and comprehensive health features including ECG and blood oxygen monitoring.",
    "price": 399.99,
    "originalPrice": 429.99,
    "discount": 7,
    "image": "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.7,
    "reviews": 890,
    "inStock": true,
    "featured": true,
    "tags": ["apple", "watch", "smartwatch", "fitness", "health", "wearable", "series", "9"],
    "specifications": {
      "Brand": "Apple",
      "Size": "45mm",
      "Color": "Midnight",
      "Battery": "All-day"
    }
  },
  {
    "name": "Samsung Galaxy Watch6 Classic",
    "description": "Premium Android smartwatch with rotating bezel and health tracking.",
    "detailedDescription": "Samsung Galaxy Watch6 Classic features a premium stainless steel design with rotating bezel, advanced health sensors, and long battery life.",
    "price": 349.99,
    "originalPrice": 399.99,
    "discount": 13,
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.5,
    "reviews": 654,
    "inStock": true,
    "featured": true,
    "tags": ["samsung", "galaxy", "watch", "smartwatch", "android", "fitness", "classic"],
    "specifications": {
      "Brand": "Samsung",
      "Size": "43mm",
      "Color": "Black",
      "Battery": "40 hours"
    }
  },
  {
    "name": "Fitbit Versa 4 Fitness Smartwatch",
    "description": "Comprehensive fitness tracker with built-in GPS and music storage.",
    "detailedDescription": "Fitbit Versa 4 combines fitness tracking excellence with smartwatch features, offering 6+ day battery life and comprehensive health insights.",
    "price": 199.99,
    "originalPrice": 229.99,
    "discount": 13,
    "image": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.3,
    "reviews": 1205,
    "inStock": true,
    "featured": false,
    "tags": ["fitbit", "versa", "fitness", "tracker", "smartwatch", "health", "gps"],
    "specifications": {
      "Brand": "Fitbit",
      "Battery": "6+ days",
      "GPS": "Built-in",
      "Water Resistant": "50m"
    }
  },

  // Electronics - Audio & Headphones
  {
    "name": "AirPods Pro 2nd Generation",
    "description": "Wireless earbuds with active noise cancellation and spatial audio.",
    "detailedDescription": "AirPods Pro with the H2 chip deliver richer audio and smarter noise cancellation. Spatial audio makes sound feel like it's coming from all around you.",
    "price": 229.99,
    "originalPrice": 249.99,
    "discount": 8,
    "image": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.6,
    "reviews": 1890,
    "inStock": true,
    "featured": true,
    "tags": ["airpods", "pro", "apple", "wireless", "earbuds", "headphones", "noise cancellation"],
    "specifications": {
      "Brand": "Apple",
      "Battery": "6 hours",
      "Features": "ANC, Spatial Audio",
      "Color": "White"
    }
  },
  {
    "name": "Sony WH-1000XM5 Headphones",
    "description": "Premium wireless headphones with industry-leading noise cancellation.",
    "detailedDescription": "Sony WH-1000XM5 offers exceptional sound quality with advanced noise cancellation, 30-hour battery life, and premium comfort for all-day wear.",
    "price": 349.99,
    "originalPrice": 399.99,
    "discount": 13,
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.8,
    "reviews": 2340,
    "inStock": true,
    "featured": true,
    "tags": ["sony", "headphones", "wireless", "noise", "cancellation", "premium", "audio"],
    "specifications": {
      "Brand": "Sony",
      "Battery": "30 hours",
      "Type": "Over-ear",
      "Color": "Black"
    }
  },
  {
    "name": "Bose QuietComfort Earbuds",
    "description": "Premium wireless earbuds with world-class noise cancellation.",
    "detailedDescription": "Bose QuietComfort Earbuds deliver premium sound quality with adjustable noise cancellation and secure, comfortable fit for any activity.",
    "price": 279.99,
    "originalPrice": 329.99,
    "discount": 15,
    "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.5,
    "reviews": 876,
    "inStock": true,
    "featured": false,
    "tags": ["bose", "earbuds", "wireless", "quietcomfort", "noise", "cancellation", "premium"],
    "specifications": {
      "Brand": "Bose",
      "Battery": "6 hours",
      "Features": "Active ANC",
      "Color": "White"
    }
  },

  // Electronics - Gaming & Entertainment
  {
    "name": "PlayStation 5 Console",
    "description": "Next-gen gaming console with ultra-fast SSD and 4K gaming.",
    "detailedDescription": "PlayStation 5 delivers lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, and stunning 4K graphics.",
    "price": 499.99,
    "originalPrice": 499.99,
    "discount": 0,
    "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.8,
    "reviews": 3200,
    "inStock": false,
    "featured": true,
    "tags": ["playstation", "ps5", "gaming", "console", "sony", "games"],
    "specifications": {
      "Brand": "Sony",
      "Storage": "825GB SSD",
      "Resolution": "4K",
      "Controller": "DualSense"
    }
  },
  {
    "name": "Xbox Series X Console",
    "description": "Microsoft's most powerful gaming console with 4K/120fps gaming.",
    "detailedDescription": "Xbox Series X delivers 4K gaming at 120fps, ultra-fast loading times, and backward compatibility with thousands of games.",
    "price": 499.99,
    "originalPrice": 499.99,
    "discount": 0,
    "image": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.7,
    "reviews": 2890,
    "inStock": true,
    "featured": false,
    "tags": ["xbox", "series", "x", "gaming", "console", "microsoft", "4k", "120fps"],
    "specifications": {
      "Brand": "Microsoft",
      "Storage": "1TB SSD",
      "Resolution": "4K",
      "Frame Rate": "120fps"
    }
  },

  // Electronics - TV & Home Theater
  {
    "name": "Samsung 65\" QLED 4K Smart TV",
    "description": "Premium QLED TV with quantum dot technology and smart features.",
    "detailedDescription": "Experience brilliant colors and sharp details with Samsung's QLED technology. Built-in smart platform with streaming apps and voice control.",
    "price": 1299.99,
    "originalPrice": 1599.99,
    "discount": 19,
    "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.4,
    "reviews": 756,
    "inStock": true,
    "featured": true,
    "tags": ["samsung", "tv", "qled", "4k", "smart", "television", "65 inch"],
    "specifications": {
      "Brand": "Samsung",
      "Size": "65 inch",
      "Resolution": "4K UHD",
      "Smart": "Tizen OS"
    }
  },
  {
    "name": "LG 77\" OLED C3 Smart TV",
    "description": "Premium OLED TV with perfect blacks and infinite contrast ratio.",
    "detailedDescription": "LG OLED C3 delivers perfect blacks, infinite contrast, and vibrant colors. Ideal for movies, gaming, and streaming with webOS smart platform.",
    "price": 2499.99,
    "originalPrice": 2999.99,
    "discount": 17,
    "image": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.9,
    "reviews": 1234,
    "inStock": true,
    "featured": false,
    "tags": ["lg", "oled", "tv", "c3", "smart", "77 inch", "4k", "hdr"],
    "specifications": {
      "Brand": "LG",
      "Size": "77 inch",
      "Type": "OLED",
      "Resolution": "4K UHD"
    }
  },

  // Fashion - Men's Clothing
  {
    "name": "Nike Air Max 270 Running Shoes",
    "description": "Comfortable running shoes with Max Air cushioning.",
    "detailedDescription": "Nike Air Max 270 features the brand's largest heel Air unit for maximum comfort and style. Perfect for running and everyday wear.",
    "price": 149.99,
    "originalPrice": 169.99,
    "discount": 12,
    "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"],
    "category": "Sports & Outdoors",
    "rating": 4.3,
    "reviews": 892,
    "inStock": true,
    "featured": false,
    "tags": ["nike", "air max", "running", "shoes", "sneakers", "sports", "270"],
    "specifications": {
      "Brand": "Nike",
      "Type": "Running Shoes",
      "Size": "Various",
      "Color": "White/Black"
    }
  },
  {
    "name": "Adidas Ultraboost 23 Sneakers",
    "description": "Premium running shoes with responsive Boost midsole technology.",
    "detailedDescription": "Adidas Ultraboost 23 delivers energy return with every step using responsive Boost technology and Primeknit upper for adaptive fit.",
    "price": 189.99,
    "originalPrice": 219.99,
    "discount": 14,
    "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80"],
    "category": "Sports & Outdoors",
    "rating": 4.6,
    "reviews": 1456,
    "inStock": true,
    "featured": true,
    "tags": ["adidas", "ultraboost", "sneakers", "running", "boost", "primeknit", "shoes"],
    "specifications": {
      "Brand": "Adidas",
      "Technology": "Boost",
      "Upper": "Primeknit",
      "Type": "Running"
    }
  },
  {
    "name": "Levi's 501 Original Jeans",
    "description": "Classic straight-leg jeans with authentic vintage styling.",
    "detailedDescription": "The original Levi's 501 jeans with button fly, straight leg cut, and premium denim construction. A timeless wardrobe essential.",
    "price": 89.99,
    "originalPrice": 109.99,
    "discount": 18,
    "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80"],
    "category": "Fashion",
    "rating": 4.5,
    "reviews": 2341,
    "inStock": true,
    "featured": false,
    "tags": ["levis", "501", "jeans", "denim", "classic", "original", "straight"],
    "specifications": {
      "Brand": "Levi's",
      "Fit": "Straight",
      "Material": "100% Cotton",
      "Style": "501 Original"
    }
  },

  // Fashion - Women's Clothing
  {
    "name": "Zara Oversized Blazer",
    "description": "Modern oversized blazer perfect for professional and casual wear.",
    "detailedDescription": "Stylish oversized blazer with structured shoulders and classic lapels. Versatile piece that transitions from office to evening wear.",
    "price": 79.99,
    "originalPrice": 99.99,
    "discount": 20,
    "image": "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&q=80"],
    "category": "Fashion",
    "rating": 4.2,
    "reviews": 567,
    "inStock": true,
    "featured": false,
    "tags": ["zara", "blazer", "oversized", "professional", "women", "jacket", "formal"],
    "specifications": {
      "Brand": "Zara",
      "Style": "Oversized",
      "Material": "Polyester blend",
      "Color": "Beige"
    }
  },
  {
    "name": "H&M Sustainable Cotton Dress",
    "description": "Elegant midi dress made from organic cotton with floral print.",
    "detailedDescription": "Beautiful midi dress crafted from sustainable organic cotton featuring delicate floral print and comfortable A-line silhouette.",
    "price": 49.99,
    "originalPrice": 59.99,
    "discount": 17,
    "image": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80"],
    "category": "Fashion",
    "rating": 4.3,
    "reviews": 789,
    "inStock": true,
    "featured": true,
    "tags": ["hm", "dress", "sustainable", "organic", "cotton", "floral", "midi"],
    "specifications": {
      "Brand": "H&M",
      "Material": "Organic Cotton",
      "Length": "Midi",
      "Print": "Floral"
    }
  },

  // Home & Garden - Kitchen Appliances
  {
    "name": "KitchenAid Stand Mixer Artisan",
    "description": "Professional-grade stand mixer for baking and cooking enthusiasts.",
    "detailedDescription": "KitchenAid Artisan Stand Mixer with 5-quart bowl, 10 speeds, and numerous attachments for all your baking and cooking needs.",
    "price": 349.99,
    "originalPrice": 429.99,
    "discount": 19,
    "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"],
    "category": "Home & Garden",
    "rating": 4.8,
    "reviews": 3456,
    "inStock": true,
    "featured": true,
    "tags": ["kitchenaid", "mixer", "stand", "artisan", "baking", "cooking", "kitchen"],
    "specifications": {
      "Brand": "KitchenAid",
      "Capacity": "5 quart",
      "Speeds": "10",
      "Color": "Empire Red"
    }
  },
  {
    "name": "Nespresso Vertuo Plus Coffee Maker",
    "description": "Premium capsule coffee machine with centrifusion technology.",
    "detailedDescription": "Nespresso Vertuo Plus uses centrifusion technology to brew perfect coffee and espresso with rich crema from Nespresso capsules.",
    "price": 179.99,
    "originalPrice": 229.99,
    "discount": 22,
    "image": "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=600&q=80"],
    "category": "Home & Garden",
    "rating": 4.4,
    "reviews": 1987,
    "inStock": true,
    "featured": false,
    "tags": ["nespresso", "coffee", "maker", "vertuo", "capsule", "espresso", "automatic"],
    "specifications": {
      "Brand": "Nespresso",
      "Type": "Capsule",
      "Technology": "Centrifusion",
      "Capacity": "1.1L"
    }
  },
  {
    "name": "Instant Pot Duo 7-in-1 Pressure Cooker",
    "description": "Multi-functional electric pressure cooker for versatile cooking.",
    "detailedDescription": "Instant Pot Duo combines 7 kitchen appliances in one: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer.",
    "price": 99.99,
    "originalPrice": 129.99,
    "discount": 23,
    "image": "https://images.unsplash.com/photo-1585515656973-82a5faa5ba6c?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1585515656973-82a5faa5ba6c?w=600&q=80"],
    "category": "Home & Garden",
    "rating": 4.6,
    "reviews": 8934,
    "inStock": true,
    "featured": true,
    "tags": ["instant", "pot", "pressure", "cooker", "7in1", "multi", "electric"],
    "specifications": {
      "Brand": "Instant Pot",
      "Functions": "7-in-1",
      "Capacity": "6 quart",
      "Material": "Stainless Steel"
    }
  },

  // Home & Garden - Furniture
  {
    "name": "IKEA MALM Bed Frame with Storage",
    "description": "Modern bed frame with built-in storage drawers and clean lines.",
    "detailedDescription": "MALM bed frame offers practical storage solution with 4 spacious drawers underneath. Made from sustainable materials with modern Scandinavian design.",
    "price": 299.99,
    "originalPrice": 349.99,
    "discount": 14,
    "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80"],
    "category": "Home & Garden",
    "rating": 4.3,
    "reviews": 2156,
    "inStock": true,
    "featured": false,
    "tags": ["ikea", "malm", "bed", "frame", "storage", "furniture", "bedroom"],
    "specifications": {
      "Brand": "IKEA",
      "Size": "Queen",
      "Material": "Engineered Wood",
      "Storage": "4 Drawers"
    }
  },
  {
    "name": "Herman Miller Aeron Chair",
    "description": "Ergonomic office chair with advanced posturefit and mesh design.",
    "detailedDescription": "Herman Miller Aeron provides exceptional ergonomic support with breathable mesh construction, adjustable features, and 12-year warranty.",
    "price": 1299.99,
    "originalPrice": 1495.99,
    "discount": 13,
    "image": "https://images.unsplash.com/photo-1586140089030-0e256ce3b756?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1586140089030-0e256ce3b756?w=600&q=80"],
    "category": "Home & Garden",
    "rating": 4.9,
    "reviews": 567,
    "inStock": true,
    "featured": false,
    "tags": ["herman", "miller", "aeron", "chair", "office", "ergonomic", "mesh"],
    "specifications": {
      "Brand": "Herman Miller",
      "Material": "Mesh",
      "Warranty": "12 years",
      "Size": "B (Medium)"
    }
  },

  // Sports & Outdoors
  {
    "name": "Peloton Bike+ Indoor Exercise Bike",
    "description": "Premium indoor cycling bike with rotating HD touchscreen and live classes.",
    "detailedDescription": "Peloton Bike+ features a 23.8\" rotating HD touchscreen, premium sound system, and access to thousands of live and on-demand classes.",
    "price": 2495.99,
    "originalPrice": 2695.99,
    "discount": 7,
    "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"],
    "category": "Sports & Outdoors",
    "rating": 4.7,
    "reviews": 2341,
    "inStock": true,
    "featured": true,
    "tags": ["peloton", "bike", "exercise", "indoor", "cycling", "fitness", "workout"],
    "specifications": {
      "Brand": "Peloton",
      "Screen": "23.8\" HD",
      "Resistance": "Magnetic",
      "Weight": "140 lbs"
    }
  },
  {
    "name": "NordicTrack Treadmill X22i",
    "description": "Commercial-grade treadmill with incline/decline and iFit integration.",
    "detailedDescription": "NordicTrack X22i offers -6% to 40% incline range, 22\" HD touchscreen, and iFit personal training with scenic routes worldwide.",
    "price": 2999.99,
    "originalPrice": 3499.99,
    "discount": 14,
    "image": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80"],
    "category": "Sports & Outdoors",
    "rating": 4.5,
    "reviews": 876,
    "inStock": true,
    "featured": false,
    "tags": ["nordictrack", "treadmill", "x22i", "running", "incline", "ifit", "fitness"],
    "specifications": {
      "Brand": "NordicTrack",
      "Incline": "-6% to 40%",
      "Speed": "0-12 mph",
      "Screen": "22\" HD"
    }
  },
  {
    "name": "Yeti Rambler 30oz Tumbler",
    "description": "Vacuum-insulated stainless steel tumbler for hot and cold drinks.",
    "detailedDescription": "Yeti Rambler keeps drinks at perfect temperature for hours with double-wall vacuum insulation and durable stainless steel construction.",
    "price": 39.99,
    "originalPrice": 44.99,
    "discount": 11,
    "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"],
    "category": "Sports & Outdoors",
    "rating": 4.8,
    "reviews": 3245,
    "inStock": true,
    "featured": false,
    "tags": ["yeti", "rambler", "tumbler", "insulated", "stainless", "steel", "drink"],
    "specifications": {
      "Brand": "Yeti",
      "Capacity": "30 oz",
      "Material": "Stainless Steel",
      "Insulation": "Double-wall"
    }
  },

  // Health & Beauty
  {
    "name": "Dyson Airwrap Complete Hair Styler",
    "description": "Multi-styler for curling, waving, smoothing and drying hair without extreme heat.",
    "detailedDescription": "Dyson Airwrap uses air to attract and wrap hair around the barrel, creating curls and waves without extreme heat damage.",
    "price": 549.99,
    "originalPrice": 599.99,
    "discount": 8,
    "image": "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80"],
    "category": "Health & Beauty",
    "rating": 4.4,
    "reviews": 1876,
    "inStock": true,
    "featured": true,
    "tags": ["dyson", "airwrap", "hair", "styler", "curling", "beauty", "styling"],
    "specifications": {
      "Brand": "Dyson",
      "Attachments": "6 included",
      "Heat Protection": "Intelligent",
      "Cord Length": "2.6m"
    }
  },
  {
    "name": "The Ordinary Skincare Routine Set",
    "description": "Complete skincare routine with vitamin C, hyaluronic acid, and retinol.",
    "detailedDescription": "Comprehensive skincare set including vitamin C serum, hyaluronic acid, niacinamide, and retinol for complete anti-aging routine.",
    "price": 89.99,
    "originalPrice": 119.99,
    "discount": 25,
    "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80"],
    "category": "Health & Beauty",
    "rating": 4.6,
    "reviews": 2341,
    "inStock": true,
    "featured": false,
    "tags": ["ordinary", "skincare", "routine", "vitamin c", "hyaluronic", "retinol", "serum"],
    "specifications": {
      "Brand": "The Ordinary",
      "Items": "6 products",
      "Skin Type": "All types",
      "Routine": "Complete"
    }
  },

  // Books & Media
  {
    "name": "Kindle Paperwhite 11th Gen",
    "description": "Waterproof e-reader with 6.8\" display and adjustable warm light.",
    "detailedDescription": "Kindle Paperwhite offers glare-free reading with adjustable warm light, 8GB storage for thousands of books, and weeks of battery life.",
    "price": 139.99,
    "originalPrice": 159.99,
    "discount": 13,
    "image": "https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=600&q=80"],
    "category": "Books & Media",
    "rating": 4.7,
    "reviews": 8765,
    "inStock": true,
    "featured": true,
    "tags": ["kindle", "paperwhite", "ereader", "amazon", "books", "reading", "waterproof"],
    "specifications": {
      "Brand": "Amazon",
      "Screen": "6.8\" E-ink",
      "Storage": "8GB",
      "Battery": "10 weeks"
    }
  },
  {
    "name": "Apple iPad Pro 12.9\" M2",
    "description": "Professional tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support.",
    "detailedDescription": "iPad Pro 12.9\" with M2 chip delivers desktop-class performance, stunning Liquid Retina XDR display, and all-day battery life for creative professionals.",
    "price": 1099.99,
    "originalPrice": 1199.99,
    "discount": 8,
    "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
    "images": ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80"],
    "category": "Electronics",
    "rating": 4.8,
    "reviews": 1456,
    "inStock": true,
    "featured": true,
    "tags": ["apple", "ipad", "pro", "tablet", "m2", "pencil", "professional", "creative"],
    "specifications": {
      "Brand": "Apple",
      "Processor": "M2 chip",
      "Screen": "12.9\" Liquid Retina XDR",
      "Storage": "128GB"
    }
  }
];

const generateProducts = async () => {
  try {
    await connectDB();

    console.log('Clearing existing products...');
    await Product.deleteMany({});

    console.log('Inserting comprehensive product database...');
    await Product.insertMany(comprehensiveProducts);

    console.log(`✅ Products generated successfully!`);
    console.log(`Added ${comprehensiveProducts.length} realistic products across multiple categories`);

    // Show categories breakdown
    const categories = {};
    comprehensiveProducts.forEach(product => {
      if (categories[product.category]) {
        categories[product.category]++;
      } else {
        categories[product.category] = 1;
      }
    });

    console.log('\n📊 Products by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} products`);
    });

    console.log('\n🔍 Sample search terms to test:');
    console.log('Electronics: "iPhone", "Samsung", "MacBook", "PlayStation", "TV", "headphones"');
    console.log('Fashion: "Nike", "Adidas", "jeans", "dress", "blazer", "shoes"');
    console.log('Home & Garden: "KitchenAid", "coffee", "chair", "bed", "IKEA"');
    console.log('Sports & Outdoors: "Peloton", "treadmill", "Yeti", "fitness", "exercise"');
    console.log('Health & Beauty: "Dyson", "skincare", "beauty", "ordinary"');
    console.log('Books & Media: "Kindle", "iPad", "reading", "tablet"');

  } catch (error) {
    console.error('❌ Error generating products:', error);
  } finally {
    await mongoose.connection.close();
  }
};

generateProducts();