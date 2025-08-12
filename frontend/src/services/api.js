const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async fetchData(endpoint, params = {}) {
    try {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      
      // Add language parameter and other query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async postData(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  }

  // Hero section data
  async getHeroData(language = 'en') {
    return this.fetchData('/hero', { lang: language });
  }

  // Categories data
  async getCategories(language = 'en') {
    return this.fetchData('/categories', { lang: language });
  }

  // Active categories (for footer)
  async getActiveCategories(language = 'en', limit = 6) {
    return this.fetchData('/categories/active', { lang: language, limit });
  }

  // Featured products
  async getFeaturedProducts(language = 'en') {
    return this.fetchData('/products/featured', { lang: language });
  }

  // Single product by ID
  async getProductById(id, language = 'en') {
    return this.fetchData(`/products/${id}`, { lang: language });
  }

  // Products by category
  async getProductsByCategory(category, language = 'en') {
    return this.fetchData(`/categories/${category}/products`, { lang: language });
  }

  // Testimonials
  async getTestimonials(language = 'en') {
    return this.fetchData('/testimonials', { lang: language });
  }

  // Newsletter signup
  async subscribeNewsletter(email) {
    return this.postData('/newsletter', { email });
  }

  // Contact form
  async submitContact(contactData) {
    return this.postData('/contact', contactData);
  }
}

export default new ApiService();