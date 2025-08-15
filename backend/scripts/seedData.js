import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Testimonial from '../models/Testimonial.js';
import Brand from '../models/Brand.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

const seedProducts = [
  {
    "name": "Product 1 - Home & Garden Item",
    "description": "A high-quality home & garden item.",
    "detailedDescription": "This is a detailed description for Product 1. It offers excellent features and durability. Perfect for all your needs.",
    "price": 10.14,
    "originalPrice": 12.9,
    "discount": 4,
    "image": "https://picsum.photos/seed/35/600/400",
    "images": [
      "https://picsum.photos/seed/35/600/400",
      "https://picsum.photos/seed/36/600/400",
      "https://picsum.photos/seed/37/600/400"
    ],
    "category": "Home & Garden",
    "rating": 3.7,
    "reviews": 159,
    "inStock": true,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "Red",
      "Weight": "1.8 kg",
      "Dimensions": "36x10x15 cm"
    }
  },
  {
    "name": "Product 2 - Automotive Item",
    "description": "A high-quality automotive item.",
    "detailedDescription": "This is a detailed description for Product 2. It offers excellent features and durability. Perfect for all your needs.",
    "price": 426.26,
    "originalPrice": 533.12,
    "discount": 12,
    "image": "https://picsum.photos/seed/53/600/400",
    "images": [
      "https://picsum.photos/seed/53/600/400",
      "https://picsum.photos/seed/54/600/400",
      "https://picsum.photos/seed/55/600/400"
    ],
    "category": "Automotive",
    "rating": 4.3,
    "reviews": 148,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "White",
      "Weight": "1.0 kg",
      "Dimensions": "24x21x3 cm"
    }
  },
  {
    "name": "Product 3 - Books Item",
    "description": "A high-quality books item.",
    "detailedDescription": "This is a detailed description for Product 3. It offers excellent features and durability. Perfect for all your needs.",
    "price": 436.81,
    "originalPrice": 521.53,
    "discount": 28,
    "image": "https://picsum.photos/seed/399/600/400",
    "images": [
      "https://picsum.photos/seed/399/600/400",
      "https://picsum.photos/seed/400/600/400",
      "https://picsum.photos/seed/401/600/400"
    ],
    "category": "Books",
    "rating": 3.2,
    "reviews": 63,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Red",
      "Weight": "1.4 kg",
      "Dimensions": "21x20x3 cm"
    }
  },
  {
    "name": "Product 4 - Sports Item",
    "description": "A high-quality sports item.",
    "detailedDescription": "This is a detailed description for Product 4. It offers excellent features and durability. Perfect for all your needs.",
    "price": 42.34,
    "originalPrice": 45.42,
    "discount": 22,
    "image": "https://picsum.photos/seed/230/600/400",
    "images": [
      "https://picsum.photos/seed/230/600/400",
      "https://picsum.photos/seed/231/600/400",
      "https://picsum.photos/seed/232/600/400"
    ],
    "category": "Sports",
    "rating": 4.6,
    "reviews": 209,
    "inStock": true,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "White",
      "Weight": "1.4 kg",
      "Dimensions": "37x11x13 cm"
    }
  },
  {
    "name": "Product 5 - Fashion Item",
    "description": "A high-quality fashion item.",
    "detailedDescription": "This is a detailed description for Product 5. It offers excellent features and durability. Perfect for all your needs.",
    "price": 106.78,
    "originalPrice": 136.48,
    "discount": 4,
    "image": "https://picsum.photos/seed/208/600/400",
    "images": [
      "https://picsum.photos/seed/208/600/400",
      "https://picsum.photos/seed/209/600/400",
      "https://picsum.photos/seed/210/600/400"
    ],
    "category": "Fashion",
    "rating": 4.8,
    "reviews": 148,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Black",
      "Weight": "2.3 kg",
      "Dimensions": "26x12x13 cm"
    }
  },
  {
    "name": "Product 6 - Sports Item",
    "description": "A high-quality sports item.",
    "detailedDescription": "This is a detailed description for Product 6. It offers excellent features and durability. Perfect for all your needs.",
    "price": 265.86,
    "originalPrice": 350.91,
    "discount": 1,
    "image": "https://picsum.photos/seed/874/600/400",
    "images": [
      "https://picsum.photos/seed/874/600/400",
      "https://picsum.photos/seed/875/600/400",
      "https://picsum.photos/seed/876/600/400"
    ],
    "category": "Sports",
    "rating": 3.3,
    "reviews": 84,
    "inStock": true,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "Red",
      "Weight": "1.3 kg",
      "Dimensions": "35x12x14 cm"
    }
  },
  {
    "name": "Product 7 - Fashion Item",
    "description": "A high-quality fashion item.",
    "detailedDescription": "This is a detailed description for Product 7. It offers excellent features and durability. Perfect for all your needs.",
    "price": 32.84,
    "originalPrice": 45,
    "discount": 2,
    "image": "https://picsum.photos/seed/876/600/400",
    "images": [
      "https://picsum.photos/seed/876/600/400",
      "https://picsum.photos/seed/877/600/400",
      "https://picsum.photos/seed/878/600/400"
    ],
    "category": "Fashion",
    "rating": 4.7,
    "reviews": 30,
    "inStock": true,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "Black",
      "Weight": "1.7 kg",
      "Dimensions": "37x17x9 cm"
    }
  },
  {
    "name": "Product 8 - Automotive Item",
    "description": "A high-quality automotive item.",
    "detailedDescription": "This is a detailed description for Product 8. It offers excellent features and durability. Perfect for all your needs.",
    "price": 294.05,
    "originalPrice": 394.18,
    "discount": 14,
    "image": "https://picsum.photos/seed/67/600/400",
    "images": [
      "https://picsum.photos/seed/67/600/400",
      "https://picsum.photos/seed/68/600/400",
      "https://picsum.photos/seed/69/600/400"
    ],
    "category": "Automotive",
    "rating": 4.7,
    "reviews": 62,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "White",
      "Weight": "2.4 kg",
      "Dimensions": "35x20x13 cm"
    }
  },
  {
    "name": "Product 9 - Automotive Item",
    "description": "A high-quality automotive item.",
    "detailedDescription": "This is a detailed description for Product 9. It offers excellent features and durability. Perfect for all your needs.",
    "price": 427.19,
    "originalPrice": 577.62,
    "discount": 29,
    "image": "https://picsum.photos/seed/584/600/400",
    "images": [
      "https://picsum.photos/seed/584/600/400",
      "https://picsum.photos/seed/585/600/400",
      "https://picsum.photos/seed/586/600/400"
    ],
    "category": "Automotive",
    "rating": 4.9,
    "reviews": 112,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Green",
      "Weight": "1.8 kg",
      "Dimensions": "36x14x17 cm"
    }
  },
  {
    "name": "Product 10 - Sports Item",
    "description": "A high-quality sports item.",
    "detailedDescription": "This is a detailed description for Product 10. It offers excellent features and durability. Perfect for all your needs.",
    "price": 470.42,
    "originalPrice": 569.65,
    "discount": 4,
    "image": "https://picsum.photos/seed/55/600/400",
    "images": [
      "https://picsum.photos/seed/55/600/400",
      "https://picsum.photos/seed/56/600/400",
      "https://picsum.photos/seed/57/600/400"
    ],
    "category": "Sports",
    "rating": 3.4,
    "reviews": 66,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Green",
      "Weight": "0.5 kg",
      "Dimensions": "10x9x3 cm"
    }
  },
  {
    "name": "Product 11 - Toys & Games Item",
    "description": "A high-quality toys & games item.",
    "detailedDescription": "This is a detailed description for Product 11. It offers excellent features and durability. Perfect for all your needs.",
    "price": 371.07,
    "originalPrice": 547.54,
    "discount": 22,
    "image": "https://picsum.photos/seed/998/600/400",
    "images": [
      "https://picsum.photos/seed/998/600/400",
      "https://picsum.photos/seed/999/600/400",
      "https://picsum.photos/seed/1000/600/400"
    ],
    "category": "Toys & Games",
    "rating": 3.5,
    "reviews": 75,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "White",
      "Weight": "1.2 kg",
      "Dimensions": "39x14x13 cm"
    }
  },
  {
    "name": "Product 12 - Health & Beauty Item",
    "description": "A high-quality health & beauty item.",
    "detailedDescription": "This is a detailed description for Product 12. It offers excellent features and durability. Perfect for all your needs.",
    "price": 80.28,
    "originalPrice": 106.44,
    "discount": 12,
    "image": "https://picsum.photos/seed/434/600/400",
    "images": [
      "https://picsum.photos/seed/434/600/400",
      "https://picsum.photos/seed/435/600/400",
      "https://picsum.photos/seed/436/600/400"
    ],
    "category": "Health & Beauty",
    "rating": 3.3,
    "reviews": 14,
    "inStock": false,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "Blue",
      "Weight": "0.8 kg",
      "Dimensions": "11x17x6 cm"
    }
  },
  {
    "name": "Product 13 - Electronics Item",
    "description": "A high-quality electronics item.",
    "detailedDescription": "This is a detailed description for Product 13. It offers excellent features and durability. Perfect for all your needs.",
    "price": 478.21,
    "originalPrice": 673.16,
    "discount": 2,
    "image": "https://picsum.photos/seed/463/600/400",
    "images": [
      "https://picsum.photos/seed/463/600/400",
      "https://picsum.photos/seed/464/600/400",
      "https://picsum.photos/seed/465/600/400"
    ],
    "category": "Electronics",
    "rating": 3.2,
    "reviews": 84,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "White",
      "Weight": "2.3 kg",
      "Dimensions": "36x5x8 cm"
    }
  },
  {
    "name": "Product 14 - Fashion Item",
    "description": "A high-quality fashion item.",
    "detailedDescription": "This is a detailed description for Product 14. It offers excellent features and durability. Perfect for all your needs.",
    "price": 79.78,
    "originalPrice": 102.99,
    "discount": 12,
    "image": "https://picsum.photos/seed/720/600/400",
    "images": [
      "https://picsum.photos/seed/720/600/400",
      "https://picsum.photos/seed/721/600/400",
      "https://picsum.photos/seed/722/600/400"
    ],
    "category": "Fashion",
    "rating": 3.1,
    "reviews": 133,
    "inStock": true,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "Green",
      "Weight": "2.2 kg",
      "Dimensions": "13x20x15 cm"
    }
  },
  {
    "name": "Product 15 - Health & Beauty Item",
    "description": "A high-quality health & beauty item.",
    "detailedDescription": "This is a detailed description for Product 15. It offers excellent features and durability. Perfect for all your needs.",
    "price": 27.45,
    "originalPrice": 39.96,
    "discount": 17,
    "image": "https://picsum.photos/seed/747/600/400",
    "images": [
      "https://picsum.photos/seed/747/600/400",
      "https://picsum.photos/seed/748/600/400",
      "https://picsum.photos/seed/749/600/400"
    ],
    "category": "Health & Beauty",
    "rating": 3.6,
    "reviews": 105,
    "inStock": true,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "Red",
      "Weight": "2.3 kg",
      "Dimensions": "20x21x12 cm"
    }
  },
  {
    "name": "Product 16 - Home & Garden Item",
    "description": "A high-quality home & garden item.",
    "detailedDescription": "This is a detailed description for Product 16. It offers excellent features and durability. Perfect for all your needs.",
    "price": 365.59,
    "originalPrice": 456.95,
    "discount": 24,
    "image": "https://picsum.photos/seed/886/600/400",
    "images": [
      "https://picsum.photos/seed/886/600/400",
      "https://picsum.photos/seed/887/600/400",
      "https://picsum.photos/seed/888/600/400"
    ],
    "category": "Home & Garden",
    "rating": 4.4,
    "reviews": 191,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Black",
      "Weight": "1.7 kg",
      "Dimensions": "29x17x14 cm"
    }
  },
  {
    "name": "Product 17 - Sports Item",
    "description": "A high-quality sports item.",
    "detailedDescription": "This is a detailed description for Product 17. It offers excellent features and durability. Perfect for all your needs.",
    "price": 84.4,
    "originalPrice": 96.05,
    "discount": 18,
    "image": "https://picsum.photos/seed/425/600/400",
    "images": [
      "https://picsum.photos/seed/425/600/400",
      "https://picsum.photos/seed/426/600/400",
      "https://picsum.photos/seed/427/600/400"
    ],
    "category": "Sports",
    "rating": 5,
    "reviews": 168,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "White",
      "Weight": "1.8 kg",
      "Dimensions": "31x15x6 cm"
    }
  },
  {
    "name": "Product 18 - Electronics Item",
    "description": "A high-quality electronics item.",
    "detailedDescription": "This is a detailed description for Product 18. It offers excellent features and durability. Perfect for all your needs.",
    "price": 161.4,
    "originalPrice": 161.92,
    "discount": 18,
    "image": "https://picsum.photos/seed/914/600/400",
    "images": [
      "https://picsum.photos/seed/914/600/400",
      "https://picsum.photos/seed/915/600/400",
      "https://picsum.photos/seed/916/600/400"
    ],
    "category": "Electronics",
    "rating": 4.3,
    "reviews": 36,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "White",
      "Weight": "2.3 kg",
      "Dimensions": "31x12x15 cm"
    }
  },
  {
    "name": "Product 19 - Fashion Item",
    "description": "A high-quality fashion item.",
    "detailedDescription": "This is a detailed description for Product 19. It offers excellent features and durability. Perfect for all your needs.",
    "price": 162.61,
    "originalPrice": 219.69,
    "discount": 15,
    "image": "https://picsum.photos/seed/426/600/400",
    "images": [
      "https://picsum.photos/seed/426/600/400",
      "https://picsum.photos/seed/427/600/400",
      "https://picsum.photos/seed/428/600/400"
    ],
    "category": "Fashion",
    "rating": 4.4,
    "reviews": 176,
    "inStock": true,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "Blue",
      "Weight": "0.9 kg",
      "Dimensions": "28x21x10 cm"
    }
  },
  {
    "name": "Product 20 - Home & Garden Item",
    "description": "A high-quality home & garden item.",
    "detailedDescription": "This is a detailed description for Product 20. It offers excellent features and durability. Perfect for all your needs.",
    "price": 149.3,
    "originalPrice": 220.39,
    "discount": 5,
    "image": "https://picsum.photos/seed/566/600/400",
    "images": [
      "https://picsum.photos/seed/566/600/400",
      "https://picsum.photos/seed/567/600/400",
      "https://picsum.photos/seed/568/600/400"
    ],
    "category": "Home & Garden",
    "rating": 4.1,
    "reviews": 13,
    "inStock": true,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "Blue",
      "Weight": "1.9 kg",
      "Dimensions": "21x22x8 cm"
    }
  },
  {
    "name": "Product 21 - Electronics Item",
    "description": "A high-quality electronics item.",
    "detailedDescription": "This is a detailed description for Product 21. It offers excellent features and durability. Perfect for all your needs.",
    "price": 93.19,
    "originalPrice": 130.66,
    "discount": 24,
    "image": "https://picsum.photos/seed/572/600/400",
    "images": [
      "https://picsum.photos/seed/572/600/400",
      "https://picsum.photos/seed/573/600/400",
      "https://picsum.photos/seed/574/600/400"
    ],
    "category": "Electronics",
    "rating": 3.3,
    "reviews": 139,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Red",
      "Weight": "1.0 kg",
      "Dimensions": "22x19x3 cm"
    }
  },
  {
    "name": "Product 22 - Books Item",
    "description": "A high-quality books item.",
    "detailedDescription": "This is a detailed description for Product 22. It offers excellent features and durability. Perfect for all your needs.",
    "price": 348.45,
    "originalPrice": 390.99,
    "discount": 3,
    "image": "https://picsum.photos/seed/829/600/400",
    "images": [
      "https://picsum.photos/seed/829/600/400",
      "https://picsum.photos/seed/830/600/400",
      "https://picsum.photos/seed/831/600/400"
    ],
    "category": "Books",
    "rating": 4.6,
    "reviews": 169,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Green",
      "Weight": "2.4 kg",
      "Dimensions": "22x5x12 cm"
    }
  },
  {
    "name": "Product 23 - Electronics Item",
    "description": "A high-quality electronics item.",
    "detailedDescription": "This is a detailed description for Product 23. It offers excellent features and durability. Perfect for all your needs.",
    "price": 58.84,
    "originalPrice": 83.22,
    "discount": 10,
    "image": "https://picsum.photos/seed/397/600/400",
    "images": [
      "https://picsum.photos/seed/397/600/400",
      "https://picsum.photos/seed/398/600/400",
      "https://picsum.photos/seed/399/600/400"
    ],
    "category": "Electronics",
    "rating": 4.2,
    "reviews": 29,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Green",
      "Weight": "0.7 kg",
      "Dimensions": "38x9x7 cm"
    }
  },
  {
    "name": "Product 24 - Electronics Item",
    "description": "A high-quality electronics item.",
    "detailedDescription": "This is a detailed description for Product 24. It offers excellent features and durability. Perfect for all your needs.",
    "price": 388.35,
    "originalPrice": 553.01,
    "discount": 24,
    "image": "https://picsum.photos/seed/124/600/400",
    "images": [
      "https://picsum.photos/seed/124/600/400",
      "https://picsum.photos/seed/125/600/400",
      "https://picsum.photos/seed/126/600/400"
    ],
    "category": "Electronics",
    "rating": 3.1,
    "reviews": 172,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "White",
      "Weight": "0.5 kg",
      "Dimensions": "16x7x14 cm"
    }
  },
  {
    "name": "Product 25 - Fashion Item",
    "description": "A high-quality fashion item.",
    "detailedDescription": "This is a detailed description for Product 25. It offers excellent features and durability. Perfect for all your needs.",
    "price": 463.21,
    "originalPrice": 654.38,
    "discount": 0,
    "image": "https://picsum.photos/seed/51/600/400",
    "images": [
      "https://picsum.photos/seed/51/600/400",
      "https://picsum.photos/seed/52/600/400",
      "https://picsum.photos/seed/53/600/400"
    ],
    "category": "Fashion",
    "rating": 3.3,
    "reviews": 64,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Red",
      "Weight": "1.9 kg",
      "Dimensions": "34x14x10 cm"
    }
  },
  {
    "name": "Product 26 - Automotive Item",
    "description": "A high-quality automotive item.",
    "detailedDescription": "This is a detailed description for Product 26. It offers excellent features and durability. Perfect for all your needs.",
    "price": 324.43,
    "originalPrice": 345.2,
    "discount": 24,
    "image": "https://picsum.photos/seed/830/600/400",
    "images": [
      "https://picsum.photos/seed/830/600/400",
      "https://picsum.photos/seed/831/600/400",
      "https://picsum.photos/seed/832/600/400"
    ],
    "category": "Automotive",
    "rating": 4.3,
    "reviews": 62,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Blue",
      "Weight": "2.1 kg",
      "Dimensions": "27x15x16 cm"
    }
  },
  {
    "name": "Product 27 - Electronics Item",
    "description": "A high-quality electronics item.",
    "detailedDescription": "This is a detailed description for Product 27. It offers excellent features and durability. Perfect for all your needs.",
    "price": 503.26,
    "originalPrice": 692.98,
    "discount": 14,
    "image": "https://picsum.photos/seed/770/600/400",
    "images": [
      "https://picsum.photos/seed/770/600/400",
      "https://picsum.photos/seed/771/600/400",
      "https://picsum.photos/seed/772/600/400"
    ],
    "category": "Electronics",
    "rating": 3.5,
    "reviews": 85,
    "inStock": true,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "White",
      "Weight": "2.1 kg",
      "Dimensions": "10x13x11 cm"
    }
  },
  {
    "name": "Product 28 - Books Item",
    "description": "A high-quality books item.",
    "detailedDescription": "This is a detailed description for Product 28. It offers excellent features and durability. Perfect for all your needs.",
    "price": 124.51,
    "originalPrice": 173.29,
    "discount": 25,
    "image": "https://picsum.photos/seed/646/600/400",
    "images": [
      "https://picsum.photos/seed/646/600/400",
      "https://picsum.photos/seed/647/600/400",
      "https://picsum.photos/seed/648/600/400"
    ],
    "category": "Books",
    "rating": 3.3,
    "reviews": 65,
    "inStock": true,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Green",
      "Weight": "2.2 kg",
      "Dimensions": "16x20x4 cm"
    }
  },
  {
    "name": "Product 29 - Home & Garden Item",
    "description": "A high-quality home & garden item.",
    "detailedDescription": "This is a detailed description for Product 29. It offers excellent features and durability. Perfect for all your needs.",
    "price": 483.2,
    "originalPrice": 496.03,
    "discount": 12,
    "image": "https://picsum.photos/seed/972/600/400",
    "images": [
      "https://picsum.photos/seed/972/600/400",
      "https://picsum.photos/seed/973/600/400",
      "https://picsum.photos/seed/974/600/400"
    ],
    "category": "Home & Garden",
    "rating": 4.6,
    "reviews": 22,
    "inStock": true,
    "featured": true,
    "specifications": {
      "Material": "Various",
      "Color": "Green",
      "Weight": "1.6 kg",
      "Dimensions": "35x11x16 cm"
    }
  },
  {
    "name": "Product 30 - Home & Garden Item",
    "description": "A high-quality home & garden item.",
    "detailedDescription": "This is a detailed description for Product 30. It offers excellent features and durability. Perfect for all your needs.",
    "price": 507.62,
    "originalPrice": 718.4,
    "discount": 15,
    "image": "https://picsum.photos/seed/137/600/400",
    "images": [
      "https://picsum.photos/seed/137/600/400",
      "https://picsum.photos/seed/138/600/400",
      "https://picsum.photos/seed/139/600/400"
    ],
    "category": "Home & Garden",
    "rating": 3.6,
    "reviews": 57,
    "inStock": false,
    "featured": false,
    "specifications": {
      "Material": "Various",
      "Color": "Black",
      "Weight": "1.1 kg",
      "Dimensions": "29x20x14 cm"
    }
  }
]

const seedCategories = [
  {
    name: "Electronics",
    description: "Latest gadgets and electronic devices",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
    count: 6,
    slug: "electronics",
    isActive: true
  },
  {
    name: "Fashion",
    description: "Trendy clothing and accessories",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80",
    count: 4,
    slug: "fashion",
    isActive: true
  },
  {
    name: "Home & Garden",
    description: "Everything for your home and garden",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
    count: 5,
    slug: "home-garden",
    isActive: true
  },
  {
    name: "Sports & Outdoors",
    description: "Sports equipment and outdoor gear",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    count: 3,
    slug: "sports-outdoors",
    isActive: true
  },
  {
    name: "Health & Beauty",
    description: "Health and beauty products",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    count: 2,
    slug: "health-beauty",
    isActive: true
  },
  {
    name: "Books & Media",
    description: "Books, movies, and entertainment",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    count: 3,
    slug: "books-media",
    isActive: true
  },
  {
    name: "Automotive",
    description: "Car parts and accessories",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80",
    count: 3,
    slug: "automotive",
    isActive: true
  },
  {
    name: "Toys & Games",
    description: "Fun for all ages",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80",
    count: 1,
    slug: "toys-games",
    isActive: true
  }
];

const seedTestimonials = [
  {
    name: "Sarah Johnson",
    role: "Verified Customer",
    content: "Amazing quality products and fast shipping! The headphones I ordered exceeded my expectations.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b002?w=150&q=80",
    isActive: true
  },
  {
    name: "Michael Chen",
    role: "Premium Member",
    content: "Great customer service and excellent product selection. Highly recommend this store!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    isActive: true
  },
  {
    name: "Emma Wilson",
    role: "VIP Customer",
    content: "The smart watch I purchased works perfectly and the price was unbeatable.",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    isActive: true
  }
];

const seedBrands = [
  {
    name: "Apple",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/505px-Apple_logo_black.svg.png",
    website: "https://apple.com",
    description: "Technology and consumer electronics",
    isActive: true,
    displayOrder: 1
  },
  {
    name: "Samsung",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png",
    website: "https://samsung.com",
    description: "Electronics and technology solutions",
    isActive: true,
    displayOrder: 2
  },
  {
    name: "Nike",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1280px-Logo_NIKE.svg.png",
    website: "https://nike.com",
    description: "Athletic footwear and apparel",
    isActive: true,
    displayOrder: 3
  },
  {
    name: "Sony",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/2560px-Sony_logo.svg.png",
    website: "https://sony.com",
    description: "Electronics and entertainment",
    isActive: true,
    displayOrder: 4
  },
  {
    name: "Adidas",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/2560px-Adidas_Logo.svg.png",
    website: "https://adidas.com",
    description: "Sports apparel and equipment",
    isActive: true,
    displayOrder: 5
  },
  {
    name: "LG",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/2560px-LG_logo_%282015%29.svg.png",
    website: "https://lg.com",
    description: "Home appliances and electronics",
    isActive: true,
    displayOrder: 6
  },
  {
    name: "HP",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/2560px-HP_logo_2012.svg.png",
    website: "https://hp.com",
    description: "Computing and printing solutions",
    isActive: true,
    displayOrder: 7
  },
  {
    name: "Canon",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Canon_logo.svg/2560px-Canon_logo.svg.png",
    website: "https://canon.com",
    description: "Imaging and optical products",
    isActive: true,
    displayOrder: 8
  },
  {
    name: "Microsoft",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2560px-Microsoft_logo.svg.png",
    website: "https://microsoft.com",
    description: "Software and cloud services",
    isActive: true,
    displayOrder: 9
  },
  {
    name: "Dell",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/2560px-Dell_Logo.svg.png",
    website: "https://dell.com",
    description: "Computer technology and services",
    isActive: true,
    displayOrder: 10
  },
  {
    name: "Intel",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/2560px-Intel_logo_%282006-2020%29.svg.png",
    website: "https://intel.com",
    description: "Semiconductor and computing",
    isActive: true,
    displayOrder: 11
  },
  {
    name: "Tesla",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tesla_T_symbol.svg/1024px-Tesla_T_symbol.svg.png",
    website: "https://tesla.com",
    description: "Electric vehicles and energy",
    isActive: true,
    displayOrder: 12
  },
  {
    name: "Puma",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/da/Puma_complete_logo.svg/2560px-Puma_complete_logo.svg.png",
    website: "https://puma.com",
    description: "Athletic wear and accessories",
    isActive: true,
    displayOrder: 13
  },
  {
    name: "Lenovo",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Lenovo_Global_Corporate_Logo.png/2560px-Lenovo_Global_Corporate_Logo.png",
    website: "https://lenovo.com",
    description: "Personal computers and technology",
    isActive: true,
    displayOrder: 14
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data (but keep users)
    console.log('Clearing existing products, categories, testimonials, and brands...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Testimonial.deleteMany({});
    await Brand.deleteMany({});

    // Create admin user if it doesn't exist
    console.log('Creating admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        permissions: [
          'manage_users',
          'manage_products', 
          'manage_categories',
          'manage_orders',
          'manage_hero',
          'manage_footer',
          'manage_pages',
          'view_analytics'
        ]
      });
      await adminUser.save();
      console.log('✅ Created admin user: admin@example.com / admin123');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Seed categories
    console.log('Seeding categories...');
    const createdCategories = await Category.insertMany(seedCategories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Seed products
    console.log('Seeding products...');
    const createdProducts = await Product.insertMany(seedProducts);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Seed testimonials
    console.log('Seeding testimonials...');
    const createdTestimonials = await Testimonial.insertMany(seedTestimonials);
    console.log(`✅ Created ${createdTestimonials.length} testimonials`);

    // Seed brands
    console.log('Seeding brands...');
    const createdBrands = await Brand.insertMany(seedBrands);
    console.log(`✅ Created ${createdBrands.length} brands`);

    // Create sample test user for orders
    console.log('Creating test user for orders...');
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        addresses: [{
          type: 'home',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          isDefault: true
        }]
      });
      await testUser.save();
      console.log('✅ Created test user for orders');
    }

    // Seed sample orders
    console.log('Seeding sample orders...');
    await Order.deleteMany({});
    
    const sampleOrders = [
      {
        user: testUser._id,
        orderNumber: 'ORD-2025-001',
        items: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            price: createdProducts[0].price,
            quantity: 2,
            image: createdProducts[0].image
          },
          {
            product: createdProducts[1]._id,
            name: createdProducts[1].name,
            price: createdProducts[1].price,
            quantity: 1,
            image: createdProducts[1].image
          }
        ],
        status: 'delivered',
        payment: {
          method: 'card',
          status: 'completed'
        },
        pricing: {
          subtotal: (createdProducts[0].price * 2) + createdProducts[1].price,
          total: (createdProducts[0].price * 2) + createdProducts[1].price
        },
        shippingAddress: {
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          street: testUser.addresses[0].street,
          city: testUser.addresses[0].city,
          state: testUser.addresses[0].state,
          zipCode: testUser.addresses[0].zipCode,
          country: testUser.addresses[0].country
        },
        timeline: [
          { status: 'pending', note: 'Order placed', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { status: 'confirmed', note: 'Payment confirmed', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
          { status: 'processing', note: 'Order is being prepared', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { status: 'shipped', note: 'Package shipped', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { status: 'delivered', note: 'Package delivered', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        user: testUser._id,
        orderNumber: 'ORD-2025-002',
        items: [
          {
            product: createdProducts[2]._id,
            name: createdProducts[2].name,
            price: createdProducts[2].price,
            quantity: 1,
            image: createdProducts[2].image
          }
        ],
        status: 'processing',
        payment: {
          method: 'paypal',
          status: 'completed'
        },
        pricing: {
          subtotal: createdProducts[2].price,
          total: createdProducts[2].price
        },
        shippingAddress: {
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          street: testUser.addresses[0].street,
          city: testUser.addresses[0].city,
          state: testUser.addresses[0].state,
          zipCode: testUser.addresses[0].zipCode,
          country: testUser.addresses[0].country
        },
        timeline: [
          { status: 'pending', note: 'Order placed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'confirmed', note: 'Payment confirmed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'processing', note: 'Order is being prepared', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: testUser._id,
        orderNumber: 'ORD-2025-003',
        items: [
          {
            product: createdProducts[3]._id,
            name: createdProducts[3].name,
            price: createdProducts[3].price,
            quantity: 3,
            image: createdProducts[3].image
          }
        ],
        status: 'pending',
        payment: {
          method: 'card',
          status: 'pending'
        },
        pricing: {
          subtotal: createdProducts[3].price * 3,
          total: createdProducts[3].price * 3
        },
        shippingAddress: {
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          street: testUser.addresses[0].street,
          city: testUser.addresses[0].city,
          state: testUser.addresses[0].state,
          zipCode: testUser.addresses[0].zipCode,
          country: testUser.addresses[0].country
        },
        timeline: [
          { status: 'pending', note: 'Order placed, awaiting payment', timestamp: new Date() }
        ],
        createdAt: new Date()
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${createdOrders.length} sample orders`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`Total categories: ${createdCategories.length}`);
    console.log(`Total products: ${createdProducts.length}`);
    console.log(`Featured products: ${createdProducts.filter(p => p.featured).length}`);
    console.log(`Total testimonials: ${createdTestimonials.length}`);
    console.log(`Total brands: ${createdBrands.length}`);
    console.log(`Total orders: ${createdOrders.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Check if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;