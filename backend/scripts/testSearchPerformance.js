import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import SearchAnalytics from '../models/SearchAnalytics.js';

dotenv.config();

const MONGODB_URI = 'mongodb://xilyor:SopI4Wj53Qic56P3aG@mongo.deeperincode.com:29930/xilyor_db_ecom?authSource=admin';

// Test queries to benchmark
const testQueries = [
  'iPhone',
  'laptop gaming',
  'headphones wireless',
  'smartphone Samsung',
  'computer desktop',
  'gaming chair',
  'monitor 4K',
  'keyboard mechanical',
  'mouse gaming',
  'tablet Apple'
];

const filterCombinations = [
  { category: 'Electronics' },
  { category: 'Electronics', inStock: true },
  { category: 'Electronics', minPrice: 100, maxPrice: 1000 },
  { category: 'Electronics', minRating: 4 },
  { inStock: true, featured: true },
  { minPrice: 50, maxPrice: 500, minRating: 3 }
];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testBasicSearch(query) {
  const startTime = Date.now();
  
  try {
    // Test text search
    const results = await Product.find({
      $text: { $search: query }
    })
    .select('name description price category rating reviews inStock featured')
    .limit(20);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return {
      query,
      type: 'text_search',
      duration,
      resultCount: results.length,
      success: true
    };
  } catch (error) {
    console.error(`Text search failed for "${query}":`, error.message);
    
    // Fallback to regex search
    const fallbackStart = Date.now();
    const searchRegex = new RegExp(query, 'i');
    
    const results = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ]
    })
    .select('name description price category rating reviews inStock featured')
    .limit(20);
    
    const fallbackEnd = Date.now();
    
    return {
      query,
      type: 'regex_fallback',
      duration: fallbackEnd - fallbackStart,
      resultCount: results.length,
      success: true,
      fallback: true
    };
  }
}

async function testAdvancedSearch(query, filters) {
  const startTime = Date.now();
  
  try {
    // Build search query
    const searchQuery = {
      $text: { $search: query }
    };
    
    // Build filter query
    const filterQuery = {};
    
    if (filters.category) {
      filterQuery.category = new RegExp(filters.category, 'i');
    }
    
    if (filters.minPrice || filters.maxPrice) {
      filterQuery.price = {};
      if (filters.minPrice) filterQuery.price.$gte = filters.minPrice;
      if (filters.maxPrice) filterQuery.price.$lte = filters.maxPrice;
    }
    
    if (filters.minRating) {
      filterQuery.rating = { $gte: filters.minRating };
    }
    
    if (filters.inStock) {
      filterQuery.inStock = true;
    }
    
    if (filters.featured) {
      filterQuery.featured = true;
    }
    
    const finalQuery = { ...searchQuery, ...filterQuery };
    
    const results = await Product.find(finalQuery)
      .select('name description price category rating reviews inStock featured')
      .sort({ score: { $meta: 'textScore' }, rating: -1 })
      .limit(20);
    
    const endTime = Date.now();
    
    return {
      query,
      filters,
      type: 'advanced_search',
      duration: endTime - startTime,
      resultCount: results.length,
      success: true
    };
  } catch (error) {
    console.error(`Advanced search failed for "${query}":`, error.message);
    return {
      query,
      filters,
      type: 'advanced_search',
      duration: -1,
      resultCount: 0,
      success: false,
      error: error.message
    };
  }
}

async function testRecommendations(productId) {
  const startTime = Date.now();
  
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const recommendations = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      rating: { $gte: product.rating - 1 }
    })
    .select('name description price category rating reviews inStock featured')
    .sort({ rating: -1, reviews: -1 })
    .limit(6);
    
    const endTime = Date.now();
    
    return {
      productId,
      type: 'recommendations',
      duration: endTime - startTime,
      resultCount: recommendations.length,
      success: true
    };
  } catch (error) {
    return {
      productId,
      type: 'recommendations',
      duration: -1,
      resultCount: 0,
      success: false,
      error: error.message
    };
  }
}

async function getIndexInfo() {
  try {
    const indexes = await Product.collection.getIndexes();
    console.log('\\n📊 Current Product Indexes:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`  • ${indexName}: ${JSON.stringify(indexes[indexName])}`);
    });
    return indexes;
  } catch (error) {
    console.error('Failed to get index info:', error);
    return {};
  }
}

async function runPerformanceTests() {
  console.log('🚀 Starting Search Performance Tests\\n');
  
  // Get index information
  await getIndexInfo();
  
  const results = {
    basicSearch: [],
    advancedSearch: [],
    recommendations: [],
    summary: {}
  };
  
  console.log('\\n🔍 Testing Basic Search Performance...');
  
  // Test basic search performance
  for (const query of testQueries) {
    const result = await testBasicSearch(query);
    results.basicSearch.push(result);
    
    const status = result.success ? '✅' : '❌';
    const fallback = result.fallback ? ' (fallback)' : '';
    console.log(`  ${status} "${query}": ${result.duration}ms, ${result.resultCount} results${fallback}`);
  }
  
  console.log('\\n🔧 Testing Advanced Search Performance...');
  
  // Test advanced search with filters
  for (const query of testQueries.slice(0, 3)) {
    for (const filters of filterCombinations.slice(0, 3)) {
      const result = await testAdvancedSearch(query, filters);
      results.advancedSearch.push(result);
      
      const status = result.success ? '✅' : '❌';
      const filterDesc = Object.keys(filters).join(', ');
      console.log(`  ${status} "${query}" + [${filterDesc}]: ${result.duration}ms, ${result.resultCount} results`);
    }
  }
  
  console.log('\\n💡 Testing Recommendation Performance...');
  
  // Get some product IDs for recommendation testing
  const sampleProducts = await Product.find({}).select('_id').limit(3);
  
  for (const product of sampleProducts) {
    const result = await testRecommendations(product._id);
    results.recommendations.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} Product ${product._id}: ${result.duration}ms, ${result.resultCount} results`);
  }
  
  // Calculate summary statistics
  const basicSearchTimes = results.basicSearch.filter(r => r.success).map(r => r.duration);
  const advancedSearchTimes = results.advancedSearch.filter(r => r.success).map(r => r.duration);
  const recommendationTimes = results.recommendations.filter(r => r.success).map(r => r.duration);
  
  results.summary = {
    basicSearch: {
      averageTime: basicSearchTimes.length ? (basicSearchTimes.reduce((a, b) => a + b, 0) / basicSearchTimes.length).toFixed(2) : 0,
      minTime: basicSearchTimes.length ? Math.min(...basicSearchTimes) : 0,
      maxTime: basicSearchTimes.length ? Math.max(...basicSearchTimes) : 0,
      successRate: ((results.basicSearch.filter(r => r.success).length / results.basicSearch.length) * 100).toFixed(1)
    },
    advancedSearch: {
      averageTime: advancedSearchTimes.length ? (advancedSearchTimes.reduce((a, b) => a + b, 0) / advancedSearchTimes.length).toFixed(2) : 0,
      minTime: advancedSearchTimes.length ? Math.min(...advancedSearchTimes) : 0,
      maxTime: advancedSearchTimes.length ? Math.max(...advancedSearchTimes) : 0,
      successRate: ((results.advancedSearch.filter(r => r.success).length / results.advancedSearch.length) * 100).toFixed(1)
    },
    recommendations: {
      averageTime: recommendationTimes.length ? (recommendationTimes.reduce((a, b) => a + b, 0) / recommendationTimes.length).toFixed(2) : 0,
      minTime: recommendationTimes.length ? Math.min(...recommendationTimes) : 0,
      maxTime: recommendationTimes.length ? Math.max(...recommendationTimes) : 0,
      successRate: ((results.recommendations.filter(r => r.success).length / results.recommendations.length) * 100).toFixed(1)
    }
  };
  
  console.log('\\n📈 Performance Summary:');
  console.log('  Basic Search:');
  console.log(`    Average: ${results.summary.basicSearch.averageTime}ms`);
  console.log(`    Range: ${results.summary.basicSearch.minTime}ms - ${results.summary.basicSearch.maxTime}ms`);
  console.log(`    Success Rate: ${results.summary.basicSearch.successRate}%`);
  
  console.log('  Advanced Search:');
  console.log(`    Average: ${results.summary.advancedSearch.averageTime}ms`);
  console.log(`    Range: ${results.summary.advancedSearch.minTime}ms - ${results.summary.advancedSearch.maxTime}ms`);
  console.log(`    Success Rate: ${results.summary.advancedSearch.successRate}%`);
  
  console.log('  Recommendations:');
  console.log(`    Average: ${results.summary.recommendations.averageTime}ms`);
  console.log(`    Range: ${results.summary.recommendations.minTime}ms - ${results.summary.recommendations.maxTime}ms`);
  console.log(`    Success Rate: ${results.summary.recommendations.successRate}%`);
  
  // Performance recommendations
  console.log('\\n💡 Performance Recommendations:');
  
  if (parseFloat(results.summary.basicSearch.averageTime) > 100) {
    console.log('  ⚠️  Basic search is slow (>100ms). Consider optimizing text indexes.');
  } else {
    console.log('  ✅ Basic search performance is good (<100ms).');
  }
  
  if (parseFloat(results.summary.advancedSearch.averageTime) > 200) {
    console.log('  ⚠️  Advanced search is slow (>200ms). Consider adding compound indexes.');
  } else {
    console.log('  ✅ Advanced search performance is good (<200ms).');
  }
  
  if (parseFloat(results.summary.recommendations.averageTime) > 50) {
    console.log('  ⚠️  Recommendations are slow (>50ms). Consider optimizing category/rating indexes.');
  } else {
    console.log('  ✅ Recommendation performance is good (<50ms).');
  }
  
  const fallbackCount = results.basicSearch.filter(r => r.fallback).length;
  if (fallbackCount > 0) {
    console.log(`  ⚠️  ${fallbackCount} queries fell back to regex search. Text index may need optimization.`);
  }
  
  return results;
}

async function main() {
  try {
    await connectDB();
    
    const results = await runPerformanceTests();
    
    console.log('\\n✅ Performance testing completed successfully!');
    
    // Save results to a JSON file for analysis
    const fs = await import('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `search-performance-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`📄 Results saved to ${filename}`);
    
  } catch (error) {
    console.error('❌ Performance testing failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the performance tests
main();