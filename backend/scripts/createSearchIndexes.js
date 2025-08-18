import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import SearchAnalytics from '../models/SearchAnalytics.js';

dotenv.config();

const MONGODB_URI = 'mongodb://xilyor:SopI4Wj53Qic56P3aG@mongo.deeperincode.com:29930/xilyor_db_ecom?authSource=admin';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createOptimizedIndexes() {
  console.log('🚀 Creating optimized search indexes...\n');
  
  try {
    // Drop existing text index if it exists and recreate with optimized settings
    try {
      await Product.collection.dropIndex('name_text_description_text');
      console.log('🗑️  Dropped existing text index');
    } catch (error) {
      try {
        await Product.collection.dropIndex('search_text');
        console.log('🗑️  Dropped existing search_text index');
      } catch (error2) {
        console.log('ℹ️  No existing text index to drop');
      }
    }
    
    // Create comprehensive text index with proper weights
    await Product.collection.createIndex(
      { 
        name: 'text', 
        description: 'text',
        category: 'text' 
      },
      {
        weights: {
          name: 10,
          category: 5,
          description: 1
        },
        name: 'optimized_search_text',
        default_language: 'english',
        language_override: 'language'
      }
    );
    console.log('✅ Created optimized text search index');
    
    // Create single field indexes
    const singleFieldIndexes = [
      { field: { category: 1 }, name: 'category_1' },
      { field: { featured: 1 }, name: 'featured_1' },
      { field: { inStock: 1 }, name: 'inStock_1' },
      { field: { price: 1 }, name: 'price_1' },
      { field: { rating: -1 }, name: 'rating_-1' },
      { field: { reviews: -1 }, name: 'reviews_-1' },
      { field: { createdAt: -1 }, name: 'createdAt_-1' }
    ];
    
    for (const index of singleFieldIndexes) {
      try {
        await Product.collection.createIndex(index.field, { name: index.name });
        console.log(`✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) { // Index already exists
          console.log(`ℹ️  Index already exists: ${index.name}`);
        } else {
          console.error(`❌ Failed to create index ${index.name}:`, error.message);
        }
      }
    }
    
    // Create compound indexes for common query patterns
    const compoundIndexes = [
      { field: { category: 1, inStock: 1 }, name: 'category_inStock' },
      { field: { category: 1, featured: 1 }, name: 'category_featured' },
      { field: { category: 1, price: 1 }, name: 'category_price' },
      { field: { inStock: 1, featured: 1 }, name: 'inStock_featured' },
      { field: { rating: -1, reviews: -1 }, name: 'rating_reviews' },
      { field: { price: 1, inStock: 1 }, name: 'price_inStock' },
      { field: { category: 1, rating: -1, reviews: -1 }, name: 'category_rating_reviews' }
    ];
    
    for (const index of compoundIndexes) {
      try {
        await Product.collection.createIndex(index.field, { name: index.name });
        console.log(`✅ Created compound index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) { // Index already exists
          console.log(`ℹ️  Compound index already exists: ${index.name}`);
        } else {
          console.error(`❌ Failed to create compound index ${index.name}:`, error.message);
        }
      }
    }
    
    // Create indexes for SearchAnalytics
    const analyticsIndexes = [
      { field: { query: 1, createdAt: -1 }, name: 'query_createdAt' },
      { field: { userIP: 1, createdAt: -1 }, name: 'userIP_createdAt' },
      { field: { createdAt: -1 }, name: 'createdAt_-1' }
    ];
    
    for (const index of analyticsIndexes) {
      try {
        await SearchAnalytics.collection.createIndex(index.field, { name: index.name });
        console.log(`✅ Created SearchAnalytics index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`ℹ️  SearchAnalytics index already exists: ${index.name}`);
        } else {
          console.error(`❌ Failed to create SearchAnalytics index ${index.name}:`, error.message);
        }
      }
    }
    
    // Create Category indexes
    try {
      await Category.collection.createIndex({ name: 'text', description: 'text' }, { name: 'category_text_search' });
      console.log('✅ Created Category text search index');
    } catch (error) {
      if (error.code === 85) {
        console.log('ℹ️  Category text index already exists');
      } else {
        console.error('❌ Failed to create Category text index:', error.message);
      }
    }
    
    console.log('\n📊 Listing all indexes...');
    
    // List all Product indexes
    const productIndexes = await Product.collection.getIndexes();
    console.log('\n📦 Product Collection Indexes:');
    Object.keys(productIndexes).forEach(indexName => {
      const indexInfo = productIndexes[indexName];
      console.log(`  • ${indexName}: ${JSON.stringify(indexInfo.key || indexInfo)}`);
    });
    
    // List SearchAnalytics indexes
    const analyticsIndexesList = await SearchAnalytics.collection.getIndexes();
    console.log('\n📈 SearchAnalytics Collection Indexes:');
    Object.keys(analyticsIndexesList).forEach(indexName => {
      const indexInfo = analyticsIndexesList[indexName];
      console.log(`  • ${indexName}: ${JSON.stringify(indexInfo.key || indexInfo)}`);
    });
    
    // List Category indexes
    const categoryIndexes = await Category.collection.getIndexes();
    console.log('\n📁 Category Collection Indexes:');
    Object.keys(categoryIndexes).forEach(indexName => {
      const indexInfo = categoryIndexes[indexName];
      console.log(`  • ${indexName}: ${JSON.stringify(indexInfo.key || indexInfo)}`);
    });
    
    console.log('\n✅ Index optimization completed successfully!');
    
    // Provide optimization recommendations
    console.log('\n💡 Search Optimization Recommendations:');
    console.log('  1. ✅ Text search index with proper weights (name: 10, category: 5, description: 1)');
    console.log('  2. ✅ Single field indexes for common filters (category, price, rating, etc.)');
    console.log('  3. ✅ Compound indexes for multi-field queries');
    console.log('  4. ✅ Analytics indexes for performance tracking');
    console.log('  5. 💡 Monitor query performance and adjust weights as needed');
    console.log('  6. 💡 Consider adding sparse indexes for optional fields');
    console.log('  7. 💡 Use explain() to analyze query execution plans');
    
  } catch (error) {
    console.error('❌ Failed to create indexes:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await createOptimizedIndexes();
  } catch (error) {
    console.error('❌ Index creation failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the index creation
main();