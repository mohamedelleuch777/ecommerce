const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async fetchData(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
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
  async getHeroData() {
    return this.fetchData('/hero');
  }

  // Categories data
  async getCategories() {
    return this.fetchData('/categories');
  }

  // Featured products
  async getFeaturedProducts() {
    return this.fetchData('/products/featured');
  }

  // Single product by ID
  async getProductById(id) {
    return this.fetchData(`/products/${id}`);
  }

  // Products by category
  async getProductsByCategory(category) {
    return this.fetchData(`/categories/${category}/products`);
  }

  // Testimonials
  async getTestimonials() {
    return this.fetchData('/testimonials');
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