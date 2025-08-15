import React, { useState, useEffect } from 'react';
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
  Hash
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import '../components/AdminLayout.css';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: '',
    slug: '',
    order: 0,
    isActive: true,
    featuredCount: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      icon: '',
      slug: '',
      order: categories.length,
      isActive: true,
      featuredCount: 0
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: category.image || '',
      icon: category.icon || '',
      slug: category.slug || '',
      order: category.order || 0,
      isActive: category.isActive !== false,
      featuredCount: category.featuredCount || 0
    });
    setErrors({});
    setShowModal(true);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Auto-generate slug when name changes
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
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
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Category slug is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Category description is required';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Category image URL is required';
    }

    if (!formData.icon.trim()) {
      newErrors.icon = 'Category icon is required';
    }

    const order = parseInt(formData.order);
    if (isNaN(order) || order < 0) {
      newErrors.order = 'Order must be a valid number';
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
      const categoryData = {
        ...formData,
        order: parseInt(formData.order),
        featuredCount: parseInt(formData.featuredCount)
      };

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, categoryData);
      } else {
        await adminApi.createCategory(categoryData);
      }

      await fetchCategories();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ submit: error.message || 'Failed to save category' });
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      return;
    }

    try {
      await adminApi.deleteCategory(category._id);
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. It might be in use by products.');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Categories Management</h1>
          <p>Manage product categories for your store</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="results-count">
            {filteredCategories.length} of {categories.length} categories
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Order</th>
                <th>Status</th>
                <th>Featured Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <div className="table-cell-content">
                      <div className="category-image">
                        {category.image ? (
                          <img src={category.image} alt={category.name} />
                        ) : (
                          <div className="image-placeholder">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="category-name">
                          {category.icon && <span className="category-icon">{category.icon}</span>}
                          {category.name}
                        </div>
                        <div className="category-slug">{category.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="category-description">
                      {category.description}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">
                      {category.order}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${category.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                      {category.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="featured-count">
                      <Package size={16} />
                      {category.featuredCount || 0}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => openEditModal(category)}
                        title="Edit Category"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(category)}
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCategories.length === 0 && !loading && (
            <div className="empty-state">
              <Package size={48} />
              <h3>No categories found</h3>
              <p>
                {searchTerm 
                  ? `No categories match "${searchTerm}"`
                  : "You haven't created any categories yet"
                }
              </p>
              {!searchTerm && (
                <button className="btn btn-primary" onClick={openCreateModal}>
                  <Plus size={20} />
                  Create First Category
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
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
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter category name"
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <Hash size={16} />
                      Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="category-slug"
                      className={errors.slug ? 'error' : ''}
                    />
                    {errors.slug && <span className="field-error">{errors.slug}</span>}
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
                    placeholder="Enter category description"
                    rows={3}
                    className={errors.description ? 'error' : ''}
                  />
                  {errors.description && <span className="field-error">{errors.description}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <ImageIcon size={16} />
                      Image URL *
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
                      <Tag size={16} />
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      placeholder="🛍️"
                      className={errors.icon ? 'error' : ''}
                    />
                    {errors.icon && <span className="field-error">{errors.icon}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Hash size={16} />
                      Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                      className={errors.order ? 'error' : ''}
                    />
                    {errors.order && <span className="field-error">{errors.order}</span>}
                  </div>

                  <div className="form-group">
                    <label>
                      <Package size={16} />
                      Featured Count
                    </label>
                    <input
                      type="number"
                      name="featuredCount"
                      value={formData.featuredCount}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Active Category
                  </label>
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
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;