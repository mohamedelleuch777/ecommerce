import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Move, 
  Image, 
  Save, 
  X,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import usePageTitle from '../../hooks/usePageTitle';
import styles from './HeroManagement.module.css';

const HeroManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    productImage: '',
    backgroundImage: '',
    isActive: true,
    discount: '',
    originalPrice: '',
    currentPrice: ''
  });

  usePageTitle('Hero Slider Management');

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getHeroSlides();
      setSlides(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        description: slide.description || '',
        buttonText: slide.buttonText || '',
        buttonLink: slide.buttonLink || '',
        productImage: slide.productImage || '',
        backgroundImage: slide.backgroundImage || '',
        isActive: slide.isActive !== false,
        discount: slide.discount || '',
        originalPrice: slide.originalPrice || '',
        currentPrice: slide.currentPrice || ''
      });
    } else {
      setEditingSlide(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        productImage: '',
        backgroundImage: '',
        isActive: true,
        discount: '',
        originalPrice: '',
        currentPrice: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      buttonText: '',
      buttonLink: '',
      productImage: '',
      backgroundImage: '',
      isActive: true,
      discount: '',
      originalPrice: '',
      currentPrice: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlide) {
        await adminApi.updateHeroSlide(editingSlide._id, formData);
      } else {
        await adminApi.createHeroSlide(formData);
      }
      
      await fetchSlides();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (slideId) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) {
      return;
    }

    try {
      await adminApi.deleteHeroSlide(slideId);
      await fetchSlides();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (slide) => {
    try {
      await adminApi.updateHeroSlide(slide._id, { 
        ...slide, 
        isActive: !slide.isActive 
      });
      await fetchSlides();
    } catch (err) {
      setError(err.message);
    }
  };

  const moveSlide = async (slideId, direction) => {
    const slideIndex = slides.findIndex(s => s._id === slideId);
    if (slideIndex === -1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    // Swap slides
    [newSlides[slideIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[slideIndex]];

    try {
      await adminApi.updateHeroSlideOrder(newSlides);
      setSlides(newSlides);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading hero slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.heroManagement}>
      <div className={styles.pageHeader}>
        <h1>Hero Slider Management</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus size={20} />
          Add New Slide
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className={styles.slidesGrid}>
        {slides.map((slide, index) => (
          <div key={slide._id} className={`${styles.slideCard} ${!slide.isActive ? styles.inactive : ''}`}>
            <div className={styles.slidePreview}>
              {slide.backgroundImage && (
                <img 
                  src={slide.backgroundImage} 
                  alt={slide.title}
                  className={styles.slideBg}
                />
              )}
              <div className={styles.slideContent}>
                <h3>{slide.title}</h3>
                <p>{slide.subtitle}</p>
                {slide.discount && (
                  <div className={styles.slidePricing}>
                    <span className={styles.discount}>{slide.discount}% OFF</span>
                    <span className={styles.price}>${slide.currentPrice}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.slideActions}>
              <div className={styles.slideInfo}>
                <span className={styles.slideOrder}>#{index + 1}</span>
                <span className={`${styles.slideStatus} ${slide.isActive ? styles.active : styles.inactive}`}>
                  {slide.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className={styles.actionButtons}>
                <button
                  onClick={() => moveSlide(slide._id, 'up')}
                  disabled={index === 0}
                  className={styles.btnIcon}
                  title="Move up"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => moveSlide(slide._id, 'down')}
                  disabled={index === slides.length - 1}
                  className={styles.btnIcon}
                  title="Move down"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => handleToggleActive(slide)}
                  className={styles.btnIcon}
                  title={slide.isActive ? 'Deactivate' : 'Activate'}
                >
                  {slide.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => openModal(slide)}
                  className={`${styles.btnIcon} ${styles.edit}`}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(slide._id)}
                  className={`${styles.btnIcon} ${styles.delete}`}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <Image size={64} />
          <h3>No slides found</h3>
          <p>Create your first hero slide to get started.</p>
          <button onClick={() => openModal()} className="btn-primary">
            Add First Slide
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h2>
              <button onClick={closeModal} className={styles.btnIcon}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subtitle">Subtitle</label>
                  <input
                    type="text"
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="buttonText">Button Text</label>
                  <input
                    type="text"
                    id="buttonText"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="buttonLink">Button Link</label>
                  <input
                    type="text"
                    id="buttonLink"
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="productImage">Product Image URL</label>
                  <input
                    type="url"
                    id="productImage"
                    name="productImage"
                    value={formData.productImage}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="backgroundImage">Background Image URL</label>
                  <input
                    type="url"
                    id="backgroundImage"
                    name="backgroundImage"
                    value={formData.backgroundImage}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="discount">Discount (%)</label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="originalPrice">Original Price</label>
                  <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="currentPrice">Current Price</label>
                  <input
                    type="number"
                    id="currentPrice"
                    name="currentPrice"
                    value={formData.currentPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={20} />
                  {editingSlide ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroManagement;