import { useState, useEffect } from 'react';
import { 
  Save,
  Plus, 
  Edit3,
  Trash2, 
  AlertCircle,
  Settings,
  Link as LinkIcon,
  Globe,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Palette,
  Share2,
  FileText,
  Building
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

const FooterManagement = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionFormData, setSectionFormData] = useState({
    title: '',
    links: [{ title: '', url: '', openInNewTab: false }]
  });
  const [errors, setErrors] = useState({});

  const socialPlatforms = [
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'instagram', label: 'Instagram', icon: '📷' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'youtube', label: 'YouTube', icon: '📺' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'pinterest', label: 'Pinterest', icon: '📌' }
  ];

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'sections', label: 'Link Sections', icon: LinkIcon },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'seo', label: 'SEO & Analytics', icon: Globe }
  ];

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getFooterData();
      setFooterData(data);
    } catch (error) {
      console.error('Error fetching footer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!footerData) return;
    
    try {
      setSaving(true);
      await adminApi.updateFooterData(footerData);
      setErrors({});
      alert('Footer settings saved successfully!');
    } catch (error) {
      console.error('Error saving footer:', error);
      setErrors({ submit: error.message || 'Failed to save footer settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateFooterData = (path, value) => {
    setFooterData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const openSectionModal = (section = null) => {
    setEditingSection(section);
    setSectionFormData(section ? {
      title: section.title,
      links: section.links.length > 0 ? section.links : [{ title: '', url: '', openInNewTab: false }]
    } : {
      title: '',
      links: [{ title: '', url: '', openInNewTab: false }]
    });
    setShowSectionModal(true);
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    
    if (!sectionFormData.title.trim()) {
      setErrors({ sectionTitle: 'Section title is required' });
      return;
    }

    try {
      if (editingSection) {
        // Update existing section
        const updatedSections = footerData.sections.map(s => 
          s._id === editingSection._id ? { ...s, ...sectionFormData } : s
        );
        setFooterData(prev => ({ ...prev, sections: updatedSections }));
      } else {
        // Add new section
        const newSection = {
          ...sectionFormData,
          _id: Date.now().toString(), // Temporary ID for frontend
          order: footerData.sections.length + 1
        };
        setFooterData(prev => ({
          ...prev,
          sections: [...prev.sections, newSection]
        }));
      }
      
      setShowSectionModal(false);
      setErrors({});
    } catch (error) {
      setErrors({ submit: 'Failed to save section' });
    }
  };

  const deleteSection = (sectionId) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    setFooterData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s._id !== sectionId)
    }));
  };

  const addSocialLink = () => {
    const newLink = {
      platform: 'facebook',
      url: '',
      order: footerData.socialLinks.length + 1
    };
    
    setFooterData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newLink]
    }));
  };

  const updateSocialLink = (index, field, value) => {
    const updatedLinks = [...footerData.socialLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setFooterData(prev => ({ ...prev, socialLinks: updatedLinks }));
  };

  const removeSocialLink = (index) => {
    setFooterData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const addLinkToSection = () => {
    setSectionFormData(prev => ({
      ...prev,
      links: [...prev.links, { title: '', url: '', openInNewTab: false }]
    }));
  };

  const updateSectionLink = (index, field, value) => {
    const updatedLinks = [...sectionFormData.links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setSectionFormData(prev => ({ ...prev, links: updatedLinks }));
  };

  const removeSectionLink = (index) => {
    setSectionFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading footer settings...</p>
        </div>
      </div>
    );
  }

  if (!footerData) {
    return (
      <div className="admin-page">
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>Failed to load footer data</h3>
          <p>Please refresh the page and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Footer Management</h1>
          <p>Manage your website footer content and settings</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {errors.submit && (
        <div className="error-message">
          <AlertCircle size={20} />
          {errors.submit}
        </div>
      )}

      <div className="footer-management-container">
        {/* Tabs */}
        <div className="footer-tabs">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`footer-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="footer-tab-content">
          {/* Company Info Tab */}
          {activeTab === 'company' && (
            <div className="tab-panel">
              <h3>Company Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Building size={16} />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={footerData.companyInfo?.name || ''}
                    onChange={(e) => updateFooterData('companyInfo.name', e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Globe size={16} />
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={footerData.companyInfo?.logo || ''}
                    onChange={(e) => updateFooterData('companyInfo.logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FileText size={16} />
                  Description
                </label>
                <textarea
                  value={footerData.companyInfo?.description || ''}
                  onChange={(e) => updateFooterData('companyInfo.description', e.target.value)}
                  placeholder="Brief description of your company"
                  rows={3}
                />
              </div>

              <h4>Contact Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={footerData.companyInfo?.contact?.email || ''}
                    onChange={(e) => updateFooterData('companyInfo.contact.email', e.target.value)}
                    placeholder="info@company.com"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={16} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={footerData.companyInfo?.contact?.phone || ''}
                    onChange={(e) => updateFooterData('companyInfo.contact.phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <h4>Address</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <MapPin size={16} />
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={footerData.companyInfo?.address?.street || ''}
                    onChange={(e) => updateFooterData('companyInfo.address.street', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={footerData.companyInfo?.address?.city || ''}
                    onChange={(e) => updateFooterData('companyInfo.address.city', e.target.value)}
                    placeholder="New York"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State/Province</label>
                  <input
                    type="text"
                    value={footerData.companyInfo?.address?.state || ''}
                    onChange={(e) => updateFooterData('companyInfo.address.state', e.target.value)}
                    placeholder="NY"
                  />
                </div>

                <div className="form-group">
                  <label>ZIP/Postal Code</label>
                  <input
                    type="text"
                    value={footerData.companyInfo?.address?.zipCode || ''}
                    onChange={(e) => updateFooterData('companyInfo.address.zipCode', e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={footerData.companyInfo?.address?.country || ''}
                  onChange={(e) => updateFooterData('companyInfo.address.country', e.target.value)}
                  placeholder="United States"
                />
              </div>
            </div>
          )}

          {/* Link Sections Tab */}
          {activeTab === 'sections' && (
            <div className="tab-panel">
              <div className="section-header">
                <h3>Footer Link Sections</h3>
                <button className="btn btn-primary" onClick={() => openSectionModal()}>
                  <Plus size={16} />
                  Add Section
                </button>
              </div>

              <div className="sections-grid">
                {footerData.sections?.map((section) => (
                  <div key={section._id} className="section-card">
                    <div className="section-card-header">
                      <h4>{section.title}</h4>
                      <div className="section-actions">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => openSectionModal(section)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteSection(section._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="section-links">
                      {section.links?.map((link, index) => (
                        <div key={index} className="section-link">
                          <LinkIcon size={12} />
                          <span>{link.title}</span>
                          {link.openInNewTab && <Eye size={12} className="external-icon" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="tab-panel">
              <div className="section-header">
                <h3>Social Media Links</h3>
                <button className="btn btn-primary" onClick={addSocialLink}>
                  <Plus size={16} />
                  Add Social Link
                </button>
              </div>

              <div className="social-links-list">
                {footerData.socialLinks?.map((link, index) => (
                  <div key={index} className="social-link-item">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Platform</label>
                        <select
                          value={link.platform}
                          onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        >
                          {socialPlatforms.map((platform) => (
                            <option key={platform.value} value={platform.value}>
                              {platform.icon} {platform.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>URL</label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                          placeholder={`https://${link.platform}.com/yourpage`}
                        />
                      </div>

                      <div className="form-actions">
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => removeSocialLink(index)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Tab */}
          {activeTab === 'newsletter' && (
            <div className="tab-panel">
              <h3>Newsletter Subscription</h3>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={footerData.newsletter?.enabled}
                    onChange={(e) => updateFooterData('newsletter.enabled', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Enable Newsletter Subscription
                </label>
              </div>

              {footerData.newsletter?.enabled && (
                <>
                  <div className="form-group">
                    <label>
                      <Mail size={16} />
                      Newsletter Title
                    </label>
                    <input
                      type="text"
                      value={footerData.newsletter?.title || ''}
                      onChange={(e) => updateFooterData('newsletter.title', e.target.value)}
                      placeholder="Subscribe to Our Newsletter"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FileText size={16} />
                      Description
                    </label>
                    <textarea
                      value={footerData.newsletter?.description || ''}
                      onChange={(e) => updateFooterData('newsletter.description', e.target.value)}
                      placeholder="Get the latest updates on new products and upcoming sales"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="tab-panel">
              <h3>Footer Appearance</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Palette size={16} />
                    Background Color
                  </label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={footerData.appearance?.backgroundColor || '#1f2937'}
                      onChange={(e) => updateFooterData('appearance.backgroundColor', e.target.value)}
                    />
                    <input
                      type="text"
                      value={footerData.appearance?.backgroundColor || '#1f2937'}
                      onChange={(e) => updateFooterData('appearance.backgroundColor', e.target.value)}
                      placeholder="#1f2937"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Text Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={footerData.appearance?.textColor || '#ffffff'}
                      onChange={(e) => updateFooterData('appearance.textColor', e.target.value)}
                    />
                    <input
                      type="text"
                      value={footerData.appearance?.textColor || '#ffffff'}
                      onChange={(e) => updateFooterData('appearance.textColor', e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Link Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={footerData.appearance?.linkColor || '#60a5fa'}
                    onChange={(e) => updateFooterData('appearance.linkColor', e.target.value)}
                  />
                  <input
                    type="text"
                    value={footerData.appearance?.linkColor || '#60a5fa'}
                    onChange={(e) => updateFooterData('appearance.linkColor', e.target.value)}
                    placeholder="#60a5fa"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={footerData.appearance?.showLogo}
                      onChange={(e) => updateFooterData('appearance.showLogo', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Show Company Logo
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={footerData.appearance?.showSocialLinks}
                      onChange={(e) => updateFooterData('appearance.showSocialLinks', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Show Social Links
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="tab-panel">
              <h3>SEO & Analytics</h3>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={footerData.seo?.enableSchemaMarkup}
                    onChange={(e) => updateFooterData('seo.enableSchemaMarkup', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Enable Schema Markup
                </label>
                <small>Helps search engines understand your business information</small>
              </div>

              <div className="form-group">
                <label>Copyright Text</label>
                <input
                  type="text"
                  value={footerData.copyright?.text || ''}
                  onChange={(e) => updateFooterData('copyright.text', e.target.value)}
                  placeholder="All rights reserved."
                />
              </div>

              <div className="form-group">
                <label>Copyright Year</label>
                <input
                  type="number"
                  value={footerData.copyright?.year || new Date().getFullYear()}
                  onChange={(e) => updateFooterData('copyright.year', parseInt(e.target.value))}
                  min="2000"
                  max="2099"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="modal-overlay" onClick={() => setShowSectionModal(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSection ? 'Edit Section' : 'Add New Section'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowSectionModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSectionSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    <FileText size={16} />
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={sectionFormData.title}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Quick Links, Customer Service"
                    className={errors.sectionTitle ? 'error' : ''}
                  />
                  {errors.sectionTitle && <span className="field-error">{errors.sectionTitle}</span>}
                </div>

                <div className="form-group">
                  <div className="section-header">
                    <label>Links</label>
                    <button type="button" className="btn btn-sm btn-outline" onClick={addLinkToSection}>
                      <Plus size={14} />
                      Add Link
                    </button>
                  </div>
                  
                  <div className="links-list">
                    {sectionFormData.links.map((link, index) => (
                      <div key={index} className="link-form-row">
                        <div className="form-row">
                          <div className="form-group">
                            <input
                              type="text"
                              value={link.title}
                              onChange={(e) => updateSectionLink(index, 'title', e.target.value)}
                              placeholder="Link Title"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => updateSectionLink(index, 'url', e.target.value)}
                              placeholder="Link URL"
                            />
                          </div>
                          <div className="form-actions">
                            <label className="checkbox-label small">
                              <input
                                type="checkbox"
                                checked={link.openInNewTab}
                                onChange={(e) => updateSectionLink(index, 'openInNewTab', e.target.checked)}
                              />
                              <span className="checkmark"></span>
                              New Tab
                            </label>
                            <button 
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => removeSectionLink(index)}
                              disabled={sectionFormData.links.length === 1}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowSectionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSection ? 'Update Section' : 'Add Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterManagement;