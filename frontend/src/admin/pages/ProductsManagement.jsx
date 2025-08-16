import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  AlertCircle,
  Package,
  Image as ImageIcon,
  Tag,
  FileText,
  DollarSign,
  Star,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    category: '',
    featured: '',
    inStock: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    detailedDescription: '',
    price: '',
    originalPrice: '',
    discount: '',
    image: '',
    images: ['', '', ''],
    category: '',
    rating: 5,
    reviews: 0,
    inStock: true,
    featured: false,
    specifications: {}
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchTerm, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      const data = await adminApi.getProducts(queryParams.page, queryParams.limit, queryParams);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      detailedDescription: '',
      price: '',
      originalPrice: '',
      discount: '',
      image: '',
      images: ['', '', ''],
      category: '',
      rating: 5,
      reviews: 0,
      inStock: true,
      featured: false,
      specifications: {}
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      detailedDescription: product.detailedDescription || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      discount: product.discount || '',
      image: product.image || '',
      images: product.images?.length >= 3 ? product.images.slice(0, 3) : [...(product.images || []), '', '', ''].slice(0, 3),
      category: product.category || '',
      rating: product.rating || 5,
      reviews: product.reviews || 0,
      inStock: product.inStock !== false,
      featured: product.featured === true,
      specifications: product.specifications || {}
    });
    setErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    if (name.startsWith('images.')) {
      const index = parseInt(name.split('.')[1]);
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, i) => i === index ? value : img)
      }));
    } else if (name.startsWith('specifications.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Product image URL is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Product category is required';
    }

    const rating = parseFloat(formData.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    const reviews = parseInt(formData.reviews);
    if (isNaN(reviews) || reviews < 0) {
      newErrors.reviews = 'Reviews count must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        rating: parseFloat(formData.rating),
        reviews: parseInt(formData.reviews),
        images: formData.images.filter(img => img.trim())
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct._id, productData);
      } else {
        await adminApi.createProduct(productData);
      }

      await fetchProducts();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: error.message || 'Failed to save product' });
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await adminApi.deleteProduct(product._id);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product.');
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await adminApi.makeRequest(`/products/${product._id}/toggle-featured`, { method: 'PUT' });
      await fetchProducts();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const toggleStock = async (product) => {
    try {
      await adminApi.makeRequest(`/products/${product._id}/toggle-stock`, { method: 'PUT' });
      await fetchProducts();
    } catch (error) {
      console.error('Error toggling stock:', error);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Products Management</h1>
          <p>Manage your store products and inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select 
              value={filters.category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <select 
              value={filters.featured} 
              onChange={(e) => handleFilterChange('featured', e.target.value)}
              className="filter-select"
            >
              <option value="">All Products</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
            <select 
              value={filters.inStock} 
              onChange={(e) => handleFilterChange('inStock', e.target.value)}
              className="filter-select"
            >
              <option value="">All Stock</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>
          <div className="results-count">
            {pagination.total} products found
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="table-cell-content">
                      <div className="product-image">
                        <img src={product.image} alt={product.name} />
                      </div>
                      <div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-description">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <div className="price-info">
                      <span className="current-price">${product.price}</span>
                      {product.originalPrice && (
                        <span className="original-price">${product.originalPrice}</span>
                      )}
                      {product.discount > 0 && (
                        <span className="discount">-{product.discount}%</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="rating-info">
                      <Star size={16} fill="currentColor" className="star-icon" />
                      {product.rating} ({product.reviews})
                    </div>
                  </td>
                  <td>
                    <div className="status-badges">
                      <span className={`badge ${product.inStock ? 'badge-success' : 'badge-danger'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {product.featured && (
                        <span className="badge badge-warning">Featured</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => openEditModal(product)}
                        title="Edit Product"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className={`btn btn-sm ${product.featured ? 'btn-warning' : 'btn-outline'}`}
                        onClick={() => toggleFeatured(product)}
                        title={product.featured ? 'Remove from Featured' : 'Add to Featured'}
                      >
                        <Star size={16} />
                      </button>
                      <button 
                        className={`btn btn-sm ${product.inStock ? 'btn-success' : 'btn-outline'}`}
                        onClick={() => toggleStock(product)}
                        title={product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                      >
                        {product.inStock ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product)}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && !loading && (
            <div className="empty-state">
              <Package size={48} />
              <h3>No products found</h3>
              <p>
                {searchTerm 
                  ? `No products match your search "${searchTerm}"`
                  : "You haven't created any products yet"
                }
              </p>
              {!searchTerm && (
                <button className="btn btn-primary" onClick={openCreateModal}>
                  <Plus size={20} />
                  Create First Product
                </button>
              )}
            </div>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.current} of {pagination.pages}
            </span>
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
              disabled={currentPage === pagination.pages}
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {errors.submit && (
                  <div className="error-message">
                    <AlertCircle size={20} />
                    {errors.submit}
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Tag size={16} />
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <Package size={16} />
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={errors.category ? 'error' : ''}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && <span className="field-error">{errors.category}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <FileText size={16} />
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows={3}
                    className={errors.description ? 'error' : ''}
                  />
                  {errors.description && <span className="field-error">{errors.description}</span>}
                </div>

                <div className="form-group">
                  <label>
                    <FileText size={16} />
                    Detailed Description
                  </label>
                  <textarea
                    name="detailedDescription"
                    value={formData.detailedDescription}
                    onChange={handleInputChange}
                    placeholder="Enter detailed product description"
                    rows={4}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <DollarSign size={16} />
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className={errors.price ? 'error' : ''}
                    />
                    {errors.price && <span className="field-error">{errors.price}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <DollarSign size={16} />
                      Original Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Tag size={16} />
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <Star size={16} />
                      Rating
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      className={errors.rating ? 'error' : ''}
                    />
                    {errors.rating && <span className="field-error">{errors.rating}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <ImageIcon size={16} />
                    Main Image URL *
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className={errors.image ? 'error' : ''}
                  />
                  {errors.image && <span className="field-error">{errors.image}</span>}
                </div>

                <div className="form-group">
                  <label>
                    <ImageIcon size={16} />
                    Additional Images
                  </label>
                  {formData.images.map((image, index) => (
                    <input
                      key={index}
                      type="url"
                      name={`images.${index}`}
                      value={image}
                      onChange={handleInputChange}
                      placeholder={`Image ${index + 1} URL`}
                      style={{ marginBottom: '0.5rem' }}
                    />
                  ))}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      In Stock
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Featured Product
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;