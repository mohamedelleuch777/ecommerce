import { API_BASE_URL } from '../../config/api';

class AdminApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/admin`;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Create headers with auth token
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Make API request
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Dashboard
  async getDashboard() {
    return this.makeRequest('/dashboard');
  }

  // Users Management
  async getUsers(page = 1, limit = 20) {
    return this.makeRequest(`/users?page=${page}&limit=${limit}`);
  }

  async updateUser(userId, userData) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Products Management
  async getProducts(page = 1, limit = 20, filters = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return this.makeRequest(`/products?${queryParams}`);
  }

  async getProduct(productId) {
    return this.makeRequest(`/products/${productId}`);
  }

  async createProduct(productData) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId, productData) {
    return this.makeRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId) {
    return this.makeRequest(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Categories Management
  async getCategories() {
    return this.makeRequest('/categories');
  }

  async createCategory(categoryData) {
    return this.makeRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(categoryId, categoryData) {
    return this.makeRequest(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(categoryId) {
    return this.makeRequest(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Orders Management
  async getOrders(page = 1, limit = 20, filters = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return this.makeRequest(`/orders?${queryParams}`);
  }

  async getOrder(orderId) {
    return this.makeRequest(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.makeRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Hero Slider Management
  async getHeroSlides() {
    return this.makeRequest('/hero');
  }

  async createHeroSlide(slideData) {
    return this.makeRequest('/hero', {
      method: 'POST',
      body: JSON.stringify(slideData),
    });
  }

  async updateHeroSlide(slideId, slideData) {
    return this.makeRequest(`/hero/${slideId}`, {
      method: 'PUT',
      body: JSON.stringify(slideData),
    });
  }

  async deleteHeroSlide(slideId) {
    return this.makeRequest(`/hero/${slideId}`, {
      method: 'DELETE',
    });
  }

  async updateHeroSlideOrder(slides) {
    return this.makeRequest('/hero/reorder', {
      method: 'PUT',
      body: JSON.stringify({ slides }),
    });
  }

  // Footer Management
  async getFooterData() {
    return this.makeRequest('/footer');
  }

  async updateFooterData(footerData) {
    return this.makeRequest('/footer', {
      method: 'PUT',
      body: JSON.stringify(footerData),
    });
  }

  // Analytics
  async getAnalytics(timeRange = '30d') {
    return this.makeRequest(`/analytics?range=${timeRange}`);
  }

  async getSalesData(timeRange = '30d') {
    return this.makeRequest(`/analytics/sales?range=${timeRange}`);
  }

  async getUserAnalytics(timeRange = '30d') {
    return this.makeRequest(`/analytics/users?range=${timeRange}`);
  }

  // File Upload
  async uploadFile(file, type = 'image') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.makeRequest('/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: formData,
    });
  }

  // Bulk Operations
  async bulkDeleteProducts(productIds) {
    return this.makeRequest('/products/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ productIds }),
    });
  }

  async bulkUpdateProducts(updates) {
    return this.makeRequest('/products/bulk-update', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Export Data
  async exportUsers(format = 'csv') {
    const response = await fetch(`${this.baseURL}/export/users?format=${format}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }

  async exportOrders(format = 'csv', filters = {}) {
    const queryParams = new URLSearchParams({ format, ...filters });
    const response = await fetch(`${this.baseURL}/export/orders?${queryParams}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }
}

export const adminApi = new AdminApiService();