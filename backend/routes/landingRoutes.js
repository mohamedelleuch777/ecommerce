import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import HeroSlide from '../models/HeroSlide.js';
import Testimonial from '../models/Testimonial.js';

const router = express.Router();

// Hero section data
router.get('/hero', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    
    // Multilingual hero content
    const heroContent = {
      en: {
        title: "Discover Amazing Products",
        subtitle: "Shop the latest trends and find everything you need in one place",
        buttonText: "Shop Now",
        slides: {
          "689b6fe252832d6cc5b9c639": {
            title: "Premium Wireless Headphones",
            subtitle: "Experience Sound Like Never Before",
            description: "Immerse yourself in crystal-clear audio with our latest noise-canceling technology",
            buttonText: "Shop Now"
          },
          "689b6fe252832d6cc5b9c63a": {
            title: "Smart Fitness Watch",
            subtitle: "Track Your Health Goals",
            description: "Monitor your fitness journey with advanced health tracking and smart notifications",
            buttonText: "Discover More"
          }
        }
      },
      fr: {
        title: "Découvrez des Produits Incroyables",
        subtitle: "Achetez les dernières tendances et trouvez tout ce dont vous avez besoin en un seul endroit",
        buttonText: "Acheter Maintenant",
        slides: {
          "689b6fe252832d6cc5b9c639": {
            title: "Casque Sans Fil Premium",
            subtitle: "Vivez le Son Comme Jamais Auparavant",
            description: "Plongez dans un son cristallin avec notre dernière technologie de suppression du bruit",
            buttonText: "Acheter Maintenant"
          },
          "689b6fe252832d6cc5b9c63a": {
            title: "Montre Fitness Intelligente",
            subtitle: "Suivez Vos Objectifs de Santé",
            description: "Surveillez votre parcours fitness avec un suivi santé avancé et des notifications intelligentes",
            buttonText: "Découvrir Plus"
          }
        }
      }
    };
    
    const content = heroContent[lang] || heroContent.en;
    
    const heroData = {
      title: content.title,
      subtitle: content.subtitle,
      buttonText: content.buttonText,
      buttonLink: "/products",
      backgroundImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
      slides: [
        {
          id: "689b6fe252832d6cc5b9c639",
          title: content.slides["689b6fe252832d6cc5b9c639"].title,
          subtitle: content.slides["689b6fe252832d6cc5b9c639"].subtitle,
          description: content.slides["689b6fe252832d6cc5b9c639"].description,
          currentPrice: 199.99,
          oldPrice: 249.99,
          discount: 20,
          buttonText: content.slides["689b6fe252832d6cc5b9c639"].buttonText,
          buttonLink: "/product/prod1",
          backgroundImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
          productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
        },
        {
          id: "689b6fe252832d6cc5b9c63a",
          title: content.slides["689b6fe252832d6cc5b9c63a"].title,
          subtitle: content.slides["689b6fe252832d6cc5b9c63a"].subtitle,
          description: content.slides["689b6fe252832d6cc5b9c63a"].description,
          currentPrice: 299.99,
          oldPrice: 349.99,
          discount: 14,
          buttonText: content.slides["689b6fe252832d6cc5b9c63a"].buttonText,
          buttonLink: "/product/prod2",
          backgroundImage: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&q=80",
          productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
        }
      ]
    };
    
    res.json(heroData);
  } catch (error) {
    console.error('Error fetching hero data:', error);
    res.status(500).json({ error: 'Failed to fetch hero data' });
  }
});

// Most active categories (for footer)
router.get('/categories/active', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const limit = parseInt(req.query.limit) || 6;
    
    // Get all categories and sort by product count for most active
    const categoriesData = await getCategoriesData(lang);
    const activeCategories = categoriesData
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, limit);
    
    res.json(activeCategories);
  } catch (error) {
    console.error('Error fetching active categories:', error);
    res.status(500).json({ error: 'Failed to fetch active categories' });
  }
});

// Helper function to get categories data
const getCategoriesData = (lang) => {
  // Multilingual categories content
  const categoriesContent = {
    en: {
      electronics: {
        name: "Electronics",
        description: "Latest gadgets and electronic devices"
      },
      fashion: {
        name: "Fashion",
        description: "Trendy clothing and accessories"
      },
      homeGarden: {
        name: "Home & Garden",
        description: "Everything for your home and garden"
      },
      sportsOutdoors: {
        name: "Sports & Outdoors",
        description: "Sports equipment and outdoor gear"
      },
      healthBeauty: {
        name: "Health & Beauty",
        description: "Health and beauty products"
      },
      booksMedia: {
        name: "Books & Media",
        description: "Books, movies, and entertainment"
      }
    },
    fr: {
      electronics: {
        name: "Électronique",
        description: "Derniers gadgets et appareils électroniques"
      },
      fashion: {
        name: "Mode",
        description: "Vêtements tendance et accessoires"
      },
      homeGarden: {
        name: "Maison et Jardin",
        description: "Tout pour votre maison et jardin"
      },
      sportsOutdoors: {
        name: "Sports et Plein Air",
        description: "Équipements de sport et matériel de plein air"
      },
      healthBeauty: {
        name: "Santé et Beauté",
        description: "Produits de santé et de beauté"
      },
      booksMedia: {
        name: "Livres et Médias",
        description: "Livres, films et divertissement"
      }
    }
  };
  
  const content = categoriesContent[lang] || categoriesContent.en;
  
  return [
    {
      id: "cat1",
      name: content.electronics.name,
      description: content.electronics.description,
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
      productCount: 156,
      slug: "electronics",
      featured: true
    },
    {
      id: "cat2", 
      name: content.fashion.name,
      description: content.fashion.description,
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80",
      productCount: 89,
      slug: "fashion",
      featured: true
    },
    {
      id: "cat3",
      name: content.homeGarden.name,
      description: content.homeGarden.description,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
      productCount: 67,
      slug: "home-garden",
      featured: true
    },
    {
      id: "cat4",
      name: content.sportsOutdoors.name,
      description: content.sportsOutdoors.description,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
      productCount: 45,
      slug: "sports-outdoors", 
      featured: true
    },
    {
      id: "cat5",
      name: content.healthBeauty.name,
      description: content.healthBeauty.description,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
      productCount: 78,
      slug: "health-beauty",
      featured: true
    },
    {
      id: "cat6",
      name: content.booksMedia.name,
      description: content.booksMedia.description,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      productCount: 23,
      slug: "books-media",
      featured: true
    }
  ];
};

// Helper function to get products data  
const getProductsData = (lang) => {
  // Multilingual products content
  const productsContent = {
    en: {
      "prod1": {
        name: "Premium Wireless Headphones",
        description: "High-quality noise-canceling headphones with premium audio",
        category: "Electronics"
      },
      "prod2": {
        name: "Smart Fitness Watch",
        description: "Advanced fitness tracking with heart rate monitoring",
        category: "Electronics" 
      },
      "prod3": {
        name: "4K Ultra HD Smart TV",
        description: "75-inch 4K Smart TV with HDR and streaming apps",
        category: "Electronics"
      },
      "prod4": {
        name: "Gaming Laptop Pro",
        description: "High-performance laptop for gaming and productivity",
        category: "Electronics"
      },
      "prod5": {
        name: "Designer Running Shoes",
        description: "Comfortable and stylish running shoes for athletes",
        category: "Fashion"
      },
      "prod6": {
        name: "Wireless Bluetooth Speaker",
        description: "Portable speaker with exceptional sound quality",
        category: "Electronics"
      }
    },
    fr: {
      "prod1": {
        name: "Casque Sans Fil Premium",
        description: "Casque haute qualité avec réduction de bruit et audio premium",
        category: "Électronique"
      },
      "prod2": {
        name: "Montre Fitness Intelligente",
        description: "Suivi fitness avancé avec surveillance du rythme cardiaque",
        category: "Électronique"
      },
      "prod3": {
        name: "Téléviseur Intelligent 4K Ultra HD",
        description: "Téléviseur intelligent 4K 75 pouces avec HDR et applications de streaming",
        category: "Électronique"
      },
      "prod4": {
        name: "Ordinateur Portable Gaming Pro",
        description: "Ordinateur portable haute performance pour jeux et productivité",
        category: "Électronique"
      },
      "prod5": {
        name: "Chaussures de Course Design",
        description: "Chaussures de course confortables et élégantes pour athlètes",
        category: "Mode"
      },
      "prod6": {
        name: "Haut-parleur Bluetooth Sans Fil",
        description: "Haut-parleur portable avec qualité sonore exceptionnelle",
        category: "Électronique"
      }
    }
  };
  
  const content = productsContent[lang] || productsContent.en;
  
  return [
    {
      id: "prod1",
      name: content.prod1.name,
      description: content.prod1.description,
      price: 199.99,
      originalPrice: 249.99,
      discount: 20,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      category: content.prod1.category,
      rating: 4.5,
      reviews: 128,
      inStock: true,
      featured: true
    },
    {
      id: "prod2", 
      name: content.prod2.name,
      description: content.prod2.description,
      price: 299.99,
      originalPrice: 349.99,
      discount: 14,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      category: content.prod2.category,
      rating: 4.3,
      reviews: 89,
      inStock: true,
      featured: true
    },
    {
      id: "prod3",
      name: content.prod3.name,
      description: content.prod3.description,
      price: 899.99,
      originalPrice: 1099.99,
      discount: 18,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80",
      category: content.prod3.category,
      rating: 4.7,
      reviews: 203,
      inStock: true,
      featured: true
    },
    {
      id: "prod4",
      name: content.prod4.name,
      description: content.prod4.description,
      price: 1299.99,
      originalPrice: 1499.99,
      discount: 13,
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
      category: content.prod4.category,
      rating: 4.6,
      reviews: 156,
      inStock: true,
      featured: true
    },
    {
      id: "prod5",
      name: content.prod5.name,
      description: content.prod5.description,
      price: 129.99,
      originalPrice: 159.99,
      discount: 19,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      category: content.prod5.category,
      rating: 4.4,
      reviews: 167,
      inStock: true,
      featured: true
    },
    {
      id: "prod6",
      name: content.prod6.name,
      description: content.prod6.description,
      price: 89.99,
      originalPrice: 119.99,
      discount: 25,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
      category: content.prod6.category,
      rating: 4.2,
      reviews: 94,
      inStock: true,
      featured: true
    }
  ];
};

// Categories data
router.get('/categories', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const categoriesData = getCategoriesData(lang);
    res.json(categoriesData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Featured products
router.get('/products/featured', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const productsData = getProductsData(lang);
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
    const lang = req.query.lang || 'en';
    
    // Map slugs to category names for both languages
    const slugToCategoryMap = {
      'electronics': { en: 'Electronics', fr: 'Électronique' },
      'fashion': { en: 'Fashion', fr: 'Mode' },
      'home-garden': { en: 'Home & Garden', fr: 'Maison et Jardin' },
      'sports-outdoors': { en: 'Sports & Outdoors', fr: 'Sports et Plein Air' },
      'health-beauty': { en: 'Health & Beauty', fr: 'Santé et Beauté' },
      'books-media': { en: 'Books & Media', fr: 'Livres et Médias' }
    };
    
    const categoryInfo = slugToCategoryMap[categorySlug];
    if (!categoryInfo) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const categoryName = categoryInfo[lang] || categoryInfo.en;
    
    // Get all featured products and filter by category
    const allProducts = await getProductsData(lang);
    const categoryProducts = allProducts.filter(product => 
      product.category === categoryName
    );
    
    res.json({
      category: categorySlug,
      categoryName: categoryName,
      products: categoryProducts,
      total: categoryProducts.length
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
    const lang = req.query.lang || 'en';
    
    // Use the same multilingual product content as featured products
    const productsContent = {
      en: {
        "prod1": {
          name: "Premium Wireless Headphones",
          description: "High-quality noise-canceling headphones with premium audio",
          detailedDescription: "Experience superior audio quality with these premium wireless headphones featuring active noise cancellation, 30-hour battery life, and premium comfort padding. Perfect for music lovers, professionals, and anyone seeking the best audio experience.",
          category: "Electronics",
          specifications: {
            "Battery Life": "30 hours",
            "Driver Size": "40mm",
            "Frequency Response": "20Hz - 20kHz",
            "Connectivity": "Bluetooth 5.0, USB-C",
            "Weight": "250g",
            "Noise Cancellation": "Active ANC"
          }
        },
        "prod2": {
          name: "Smart Fitness Watch",
          description: "Advanced fitness tracking with heart rate monitoring",
          detailedDescription: "Track your fitness journey with precision using this advanced smartwatch. Features include continuous heart rate monitoring, GPS tracking, sleep analysis, and 50+ workout modes.",
          category: "Electronics",
          specifications: {
            "Display": "1.4 inch AMOLED",
            "Battery Life": "7 days",
            "Water Resistance": "5ATM",
            "Sensors": "Heart Rate, GPS, Accelerometer",
            "Compatibility": "iOS, Android",
            "Storage": "4GB"
          }
        },
        "prod3": {
          name: "4K Ultra HD Smart TV",
          description: "75-inch 4K Smart TV with HDR and streaming apps",
          detailedDescription: "Immerse yourself in stunning 4K Ultra HD picture quality with HDR support, built-in streaming apps, and smart features for the ultimate entertainment experience.",
          category: "Electronics",
          specifications: {
            "Screen Size": "75 inches",
            "Resolution": "4K Ultra HD (3840 x 2160)",
            "HDR": "HDR10, Dolby Vision",
            "Smart Platform": "Android TV",
            "Connectivity": "WiFi, Bluetooth, 4x HDMI",
            "Audio": "Dolby Atmos"
          }
        },
        "prod4": {
          name: "Gaming Laptop Pro",
          description: "High-performance laptop for gaming and productivity",
          detailedDescription: "Power through demanding games and professional workloads with this high-performance gaming laptop featuring the latest GPU, fast refresh display, and advanced cooling.",
          category: "Electronics",
          specifications: {
            "Processor": "Intel Core i7-12700H",
            "Graphics": "NVIDIA RTX 4060",
            "RAM": "16GB DDR5",
            "Storage": "1TB SSD",
            "Display": "15.6'' 144Hz QHD",
            "Weight": "2.3kg"
          }
        },
        "prod5": {
          name: "Designer Running Shoes",
          description: "Comfortable and stylish running shoes for athletes",
          detailedDescription: "Run in style and comfort with these premium designer running shoes featuring advanced cushioning technology, breathable materials, and lightweight construction.",
          category: "Fashion",
          specifications: {
            "Materials": "Mesh upper, EVA midsole",
            "Weight": "280g per shoe",
            "Drop": "10mm heel-to-toe drop",
            "Sizes": "US 6-13",
            "Colors": "5 colorways available",
            "Technology": "Air cushioning"
          }
        },
        "prod6": {
          name: "Wireless Bluetooth Speaker",
          description: "Portable speaker with exceptional sound quality",
          detailedDescription: "Enjoy premium sound quality anywhere with this portable Bluetooth speaker featuring 360-degree audio, waterproof design, and long-lasting battery.",
          category: "Electronics",
          specifications: {
            "Battery Life": "12 hours",
            "Connectivity": "Bluetooth 5.0",
            "Water Rating": "IPX7",
            "Power": "20W output",
            "Range": "30 feet",
            "Weight": "650g"
          }
        }
      },
      fr: {
        "prod1": {
          name: "Casque Sans Fil Premium",
          description: "Casque haute qualité avec réduction de bruit et audio premium",
          detailedDescription: "Découvrez une qualité audio supérieure avec ces casques sans fil premium dotés d'une réduction active du bruit, d'une autonomie de 30 heures et d'un rembourrage confortable premium. Parfait pour les mélomanes, les professionnels et tous ceux qui recherchent la meilleure expérience audio.",
          category: "Électronique",
          specifications: {
            "Autonomie": "30 heures",
            "Taille du Driver": "40mm",
            "Réponse en Fréquence": "20Hz - 20kHz",
            "Connectivité": "Bluetooth 5.0, USB-C",
            "Poids": "250g",
            "Réduction du Bruit": "ANC Actif"
          }
        },
        "prod2": {
          name: "Montre Fitness Intelligente",
          description: "Suivi fitness avancé avec surveillance du rythme cardiaque",
          detailedDescription: "Suivez votre parcours fitness avec précision grâce à cette montre intelligente avancée. Comprend la surveillance continue du rythme cardiaque, le suivi GPS, l'analyse du sommeil et plus de 50 modes d'entraînement.",
          category: "Électronique",
          specifications: {
            "Écran": "1,4 pouce AMOLED",
            "Autonomie": "7 jours",
            "Résistance à l'Eau": "5ATM",
            "Capteurs": "Rythme Cardiaque, GPS, Accéléromètre",
            "Compatibilité": "iOS, Android",
            "Stockage": "4GB"
          }
        },
        "prod3": {
          name: "Téléviseur Intelligent 4K Ultra HD",
          description: "Téléviseur intelligent 4K 75 pouces avec HDR et applications de streaming",
          detailedDescription: "Plongez-vous dans une qualité d'image 4K Ultra HD époustouflante avec support HDR, applications de streaming intégrées et fonctionnalités intelligentes pour une expérience de divertissement ultime.",
          category: "Électronique",
          specifications: {
            "Taille d'Écran": "75 pouces",
            "Résolution": "4K Ultra HD (3840 x 2160)",
            "HDR": "HDR10, Dolby Vision",
            "Plateforme Intelligente": "Android TV",
            "Connectivité": "WiFi, Bluetooth, 4x HDMI",
            "Audio": "Dolby Atmos"
          }
        },
        "prod4": {
          name: "Ordinateur Portable Gaming Pro",
          description: "Ordinateur portable haute performance pour jeux et productivité",
          detailedDescription: "Maîtrisez les jeux exigeants et les charges de travail professionnelles avec cet ordinateur portable de gaming haute performance doté du dernier GPU, d'un écran à taux de rafraîchissement rapide et d'un refroidissement avancé.",
          category: "Électronique",
          specifications: {
            "Processeur": "Intel Core i7-12700H",
            "Graphiques": "NVIDIA RTX 4060",
            "RAM": "16GB DDR5",
            "Stockage": "1TB SSD",
            "Écran": "15,6'' 144Hz QHD",
            "Poids": "2,3kg"
          }
        },
        "prod5": {
          name: "Chaussures de Course Design",
          description: "Chaussures de course confortables et élégantes pour athlètes",
          detailedDescription: "Courez avec style et confort grâce à ces chaussures de course design premium dotées d'une technologie d'amortissement avancée, de matériaux respirants et d'une construction légère.",
          category: "Mode",
          specifications: {
            "Matériaux": "Tige en mesh, semelle intercalaire EVA",
            "Poids": "280g par chaussure",
            "Drop": "Drop talon-orteil de 10mm",
            "Tailles": "US 6-13",
            "Couleurs": "5 coloris disponibles",
            "Technologie": "Amorti à air"
          }
        },
        "prod6": {
          name: "Haut-parleur Bluetooth Sans Fil",
          description: "Haut-parleur portable avec qualité sonore exceptionnelle",
          detailedDescription: "Profitez d'une qualité sonore premium partout avec ce haut-parleur Bluetooth portable doté d'un audio 360 degrés, d'une conception étanche et d'une batterie longue durée.",
          category: "Électronique",
          specifications: {
            "Autonomie": "12 heures",
            "Connectivité": "Bluetooth 5.0",
            "Indice d'Eau": "IPX7",
            "Puissance": "Sortie 20W",
            "Portée": "30 pieds",
            "Poids": "650g"
          }
        }
      }
    };
    
    const content = productsContent[lang] || productsContent.en;
    const productContent = content[productId];
    
    if (!productContent) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Map product content to match featured products structure
    const productPrices = {
      "prod1": { price: 199.99, originalPrice: 249.99, discount: 20 },
      "prod2": { price: 299.99, originalPrice: 349.99, discount: 14 },
      "prod3": { price: 899.99, originalPrice: 1099.99, discount: 18 },
      "prod4": { price: 1299.99, originalPrice: 1499.99, discount: 13 },
      "prod5": { price: 129.99, originalPrice: 159.99, discount: 19 },
      "prod6": { price: 89.99, originalPrice: 119.99, discount: 25 }
    };
    
    const productImages = {
      "prod1": [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80"
      ],
      "prod2": [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80",
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&q=80"
      ],
      "prod3": [
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80",
        "https://images.unsplash.com/photo-1571210862729-78a52d3779a2?w=600&q=80"
      ],
      "prod4": [
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80"
      ],
      "prod5": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80"
      ],
      "prod6": [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80"
      ]
    };
    
    const productRatings = {
      "prod1": { rating: 4.5, reviews: 128 },
      "prod2": { rating: 4.3, reviews: 89 },
      "prod3": { rating: 4.7, reviews: 203 },
      "prod4": { rating: 4.6, reviews: 156 },
      "prod5": { rating: 4.4, reviews: 167 },
      "prod6": { rating: 4.2, reviews: 94 }
    };
    
    const pricing = productPrices[productId] || { price: 99.99, originalPrice: 129.99, discount: 23 };
    const images = productImages[productId] || ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"];
    const ratings = productRatings[productId] || { rating: 4.5, reviews: 100 };
    
    const productData = {
      id: productId,
      name: productContent.name,
      description: productContent.description,
      detailedDescription: productContent.detailedDescription,
      price: pricing.price,
      originalPrice: pricing.originalPrice,
      discount: pricing.discount,
      image: images[0],
      images: images,
      category: productContent.category,
      rating: ratings.rating,
      reviews: ratings.reviews,
      inStock: true,
      featured: true,
      specifications: productContent.specifications
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