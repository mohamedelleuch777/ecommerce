import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { User, Mail, Phone, Calendar, MapPin, Settings, Save, Plus, Edit2, Trash2 } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile, addAddress, updateAddress, deleteAddress } = useAuth();
  const { t, changeLanguage } = useLanguage();

  usePageTitle('profilePageTitle');
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    preferences: {
      language: 'en',
      newsletter: true,
      notifications: {
        email: true,
        sms: false
      }
    }
  });
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressData, setAddressData] = useState({
    type: 'home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Helper function to get address type translation
  const getAddressTypeTranslation = (type) => {
    switch(type) {
      case 'home': return t('homeAddress');
      case 'work': return t('work');
      case 'other': return t('other');
      default: return type;
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        preferences: {
          language: user.preferences?.language || 'en',
          newsletter: user.preferences?.newsletter ?? true,
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            sms: user.preferences?.notifications?.sms ?? false
          }
        }
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateProfile(profileData);
    
    if (result.success) {
      // Sync the language preference with the global language context
      if (profileData.preferences.language) {
        changeLanguage(profileData.preferences.language);
      }
      setMessage(t('profileUpdatedSuccessfully'));
    } else {
      setMessage(result.error);
    }
    
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (editingAddress) {
      result = await updateAddress(editingAddress._id, addressData);
    } else {
      result = await addAddress(addressData);
    }

    if (result.success) {
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressData({
        type: 'home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false
      });
    }

    setLoading(false);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressData({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm(t('confirmDeleteAddress'))) {
      await deleteAddress(addressId);
    }
  };

  if (!user) {
    return <div className="profile-loading">{t('loading')}</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.fullName} />
            ) : (
              <div className="avatar-placeholder">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{user.fullName}</h1>
            <p>{user.email}</p>
            <span className="member-since">
              {t('memberSince')} {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-tabs">
            <button 
              className={activeTab === 'profile' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              {t('personalInfo')}
            </button>
            <button 
              className={activeTab === 'addresses' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={20} />
              {t('addresses')}
            </button>
            <button 
              className={activeTab === 'preferences' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('preferences')}
            >
              <Settings size={20} />
              {t('preferences')}
            </button>
          </div>

          <div className="profile-tab-content">
            {message && (
              <div className={`message ${message.includes(t('successfully')) ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {activeTab === 'profile' && (
              <form className="profile-form" onSubmit={handleProfileUpdate}>
                <h3>{t('personalInformation')}</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('firstName')}</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('lastName')}</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('email')}</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="disabled"
                  />
                  <small>{t('emailCannotBeChanged')}</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('phone')}</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('dateOfBirth')}</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('gender')}</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">{t('selectGender')}</option>
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>

                <button type="submit" className="save-btn" disabled={loading}>
                  <Save size={20} />
                  {loading ? t('saving') : t('saveChanges')}
                </button>
              </form>
            )}

            {activeTab === 'addresses' && (
              <div className="addresses-section">
                <div className="section-header">
                  <h3>{t('shippingAddresses')}</h3>
                  <button 
                    className="add-address-btn"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <Plus size={20} />
                    {t('addAddress')}
                  </button>
                </div>

                {showAddressForm && (
                  <form className="address-form" onSubmit={handleAddressSubmit}>
                    <h4>{editingAddress ? t('editAddress') : t('addNewAddress')}</h4>
                    
                    <div className="form-group">
                      <label>{t('addressType')}</label>
                      <select
                        value={addressData.type}
                        onChange={(e) => setAddressData(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="home">{t('homeAddress')}</option>
                        <option value="work">{t('work')}</option>
                        <option value="other">{t('other')}</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{t('streetAddress')}</label>
                      <input
                        type="text"
                        value={addressData.street}
                        onChange={(e) => setAddressData(prev => ({ ...prev, street: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('city')}</label>
                        <input
                          type="text"
                          value={addressData.city}
                          onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('state')}</label>
                        <input
                          type="text"
                          value={addressData.state}
                          onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('zipCode')}</label>
                        <input
                          type="text"
                          value={addressData.zipCode}
                          onChange={(e) => setAddressData(prev => ({ ...prev, zipCode: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('country')}</label>
                        <input
                          type="text"
                          value={addressData.country}
                          onChange={(e) => setAddressData(prev => ({ ...prev, country: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={addressData.isDefault}
                          onChange={(e) => setAddressData(prev => ({ ...prev, isDefault: e.target.checked }))}
                        />
                        {t('setAsDefaultAddress')}
                      </label>
                    </div>

                    <div className="form-actions">
                      <button type="submit" disabled={loading}>
                        {loading ? t('saving') : t('saveAddress')}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                        }}
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </form>
                )}

                <div className="addresses-list">
                  {user.addresses && user.addresses.map((address) => (
                    <div key={address._id} className="address-card">
                      <div className="address-header">
                        <span className="address-type">{getAddressTypeTranslation(address.type)}</span>
                        {address.isDefault && <span className="default-badge">{t('default')}</span>}
                      </div>
                      <div className="address-details">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                      </div>
                      <div className="address-actions">
                        <button onClick={() => handleEditAddress(address)}>
                          <Edit2 size={16} />
                          {t('edit')}
                        </button>
                        <button onClick={() => handleDeleteAddress(address._id)}>
                          <Trash2 size={16} />
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <form className="preferences-form" onSubmit={handleProfileUpdate}>
                <h3>{t('accountPreferences')}</h3>
                
                <div className="form-group">
                  <label>{t('language')}</label>
                  <select
                    value={profileData.preferences.language}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      preferences: { ...prev.preferences, language: e.target.value }
                    }))}
                  >
                    <option value="en">{t('english')}</option>
                    <option value="fr">{t('french')}</option>
                  </select>
                </div>

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={profileData.preferences.newsletter}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, newsletter: e.target.checked }
                      }))}
                    />
                    {t('subscribeToNewsletter')}
                  </label>
                </div>

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={profileData.preferences.notifications.email}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        preferences: { 
                          ...prev.preferences, 
                          notifications: { 
                            ...prev.preferences.notifications, 
                            email: e.target.checked 
                          }
                        }
                      }))}
                    />
                    {t('emailNotifications')}
                  </label>
                </div>

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={profileData.preferences.notifications.sms}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        preferences: { 
                          ...prev.preferences, 
                          notifications: { 
                            ...prev.preferences.notifications, 
                            sms: e.target.checked 
                          }
                        }
                      }))}
                    />
                    {t('smsNotifications')}
                  </label>
                </div>

                <button type="submit" className="save-btn" disabled={loading}>
                  <Save size={20} />
                  {loading ? t('saving') : t('saveChanges')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;