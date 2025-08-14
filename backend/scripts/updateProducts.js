import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

const realisticProducts = [
  {
    "name": "iPhone 15 Pro Max 256GB",
    "description": "Latest Apple smartphone with titanium design and advanced camera system.",
    "detailedDescription": "The iPhone 15 Pro Max features a titanium design, A17 Pro chip, and advanced camera system with 5x optical zoom. Perfect for photography enthusiasts and professionals.",
    "price": 1199.99,
    "originalPrice": 1299.99,
    "discount": 8,
    "image": "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80",
    "images": [
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80",
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80",
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80"
    ],
    "category": "Electronics",
    "rating": 4.8,
    "reviews": 1250,
    "inStock": true,
    "featured": true,
    "tags": ["iphone", "apple", "smartphone", "mobile", "15", "pro", "max"],
    "specifications": {
      "Brand": "Apple",
      "Storage": "256GB",
      "Color": "Natural Titanium",
      "Screen Size": "6.7 inch"
    }
  },
  {
    "name": "Apple Watch Series 9 GPS",
    "description": "Advanced smartwatch with health monitoring and fitness tracking.",
    "detailedDescription": "Apple Watch Series 9 with S9 chip, all-day battery life, and comprehensive health features including ECG and blood oxygen monitoring.",
    "price": 399.99,
    "originalPrice": 429.99,
    "discount": 7,
    "image": "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80",
    "images": [
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80",
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80",
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80"
    ],
    "category": "Electronics",
    "rating": 4.7,
    "reviews": 890,
    "inStock": true,
    "featured": true,
    "tags": ["apple", "watch", "smartwatch", "fitness", "health", "wearable"],
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
    "images": [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
    ],
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
    "name": "MacBook Air M2 13-inch",
    "description": "Ultra-thin laptop with M2 chip and all-day battery life.",
    "detailedDescription": "The MacBook Air with M2 chip delivers incredible performance and battery life in an ultra-thin design. Perfect for students and professionals.",
    "price": 1099.99,
    "originalPrice": 1199.99,
    "discount": 8,
    "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
    "images": [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80"
    ],
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
    "name": "PlayStation 5 Console",
    "description": "Next-gen gaming console with ultra-fast SSD and 4K gaming.",
    "detailedDescription": "PlayStation 5 delivers lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, and stunning 4K graphics.",
    "price": 499.99,
    "originalPrice": 499.99,
    "discount": 0,
    "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80",
    "images": [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80",
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80",
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80"
    ],
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
    "name": "AirPods Pro 2nd Generation",
    "description": "Wireless earbuds with active noise cancellation and spatial audio.",
    "detailedDescription": "AirPods Pro with the H2 chip deliver richer audio and smarter noise cancellation. Spatial audio makes sound feel like it's coming from all around you.",
    "price": 229.99,
    "originalPrice": 249.99,
    "discount": 8,
    "image": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
    "images": [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80"
    ],
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
    "name": "Samsung 65\" QLED 4K Smart TV",
    "description": "Premium QLED TV with quantum dot technology and smart features.",
    "detailedDescription": "Experience brilliant colors and sharp details with Samsung's QLED technology. Built-in smart platform with streaming apps and voice control.",
    "price": 1299.99,
    "originalPrice": 1599.99,
    "discount": 19,
    "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80",
    "images": [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80",
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80",
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80"
    ],
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
    "name": "Nike Air Max 270 Running Shoes",
    "description": "Comfortable running shoes with Max Air cushioning.",
    "detailedDescription": "Nike Air Max 270 features the brand's largest heel Air unit for maximum comfort and style. Perfect for running and everyday wear.",
    "price": 149.99,
    "originalPrice": 169.99,
    "discount": 12,
    "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    "images": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"
    ],
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
  }
];

const updateProductData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing products...');
    await Product.deleteMany({});

    console.log('Inserting realistic products...');
    await Product.insertMany(realisticProducts);

    console.log('✅ Products updated successfully!');
    console.log(`Added ${realisticProducts.length} realistic products`);

    // Show some sample searches that should work now
    console.log('\n🔍 Test searches that should work:');
    console.log('- iPhone 15');
    console.log('- Apple Watch');
    console.log('- Samsung Watch');
    console.log('- MacBook');
    console.log('- PlayStation 5');
    console.log('- AirPods');
    console.log('- Samsung TV');
    console.log('- Nike shoes');

  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    await mongoose.connection.close();
  }
};

updateProductData();