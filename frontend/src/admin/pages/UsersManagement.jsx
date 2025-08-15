import { useState, useEffect } from 'react';
import { 
  Search, 
  Edit3,
  Trash2, 
  AlertCircle,
  User,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ShieldCheck,
  Crown,
  ChevronLeft,
  ChevronRight,
  Settings,
  Eye
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import '../components/AdminLayout.css';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    role: '',
    isActive: ''
  });
  const [formData, setFormData] = useState({
    role: 'user',
    permissions: [],
    isActive: true
  });
  const [errors, setErrors] = useState({});

  const userRoles = [
    { value: 'user', label: 'User', color: '#6b7280', icon: User },
    { value: 'admin', label: 'Admin', color: '#3b82f6', icon: Shield },
    { value: 'superadmin', label: 'Super Admin', color: '#8b5cf6', icon: Crown }
  ];

  const availablePermissions = [
    'manage_users',
    'manage_products', 
    'manage_categories',
    'manage_orders',
    'manage_hero',
    'manage_footer',
    'manage_pages',
    'view_analytics'
  ];

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filters]);

  const fetchUsers = async () => {
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

      const data = await adminApi.getUsers(queryParams.page, queryParams.limit);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = (user, mode = 'view') => {
    setSelectedUser(user);
    setEditingUser(mode === 'edit' ? user : null);
    setFormData({
      role: user.role || 'user',
      permissions: user.permissions || [],
      isActive: user.isActive !== false
    });
    setErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'permissions') {
      const permission = value;
      setFormData(prev => ({
        ...prev,
        permissions: checked 
          ? [...prev.permissions, permission]
          : prev.permissions.filter(p => p !== permission)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
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

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!formData.role) {
      setErrors({ role: 'Please select a role' });
      return;
    }

    try {
      await adminApi.updateUser(selectedUser.id, formData);
      await fetchUsers();
      setShowModal(false);
      setErrors({});
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ submit: error.message || 'Failed to update user' });
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`)) {
      return;
    }

    try {
      await adminApi.deleteUser(user.id);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user.');
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  const getRoleInfo = (role) => {
    return userRoles.find(r => r.value === role) || userRoles[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Users Management</h1>
          <p>Manage user accounts, roles, and permissions</p>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select 
              value={filters.role} 
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="filter-select"
            >
              <option value="">All Roles</option>
              {userRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <select 
              value={filters.isActive} 
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="results-count">
            {pagination.total} users found
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;
                
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="table-cell-content">
                        <div className="user-avatar">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <div className="user-name">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.phone && (
                            <div className="user-phone">
                              <Phone size={12} />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-email">
                        <Mail size={14} />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="role-badge"
                        style={{ 
                          backgroundColor: roleInfo.color + '20',
                          color: roleInfo.color,
                          border: `1px solid ${roleInfo.color}30`
                        }}
                      >
                        <RoleIcon size={14} />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive !== false ? (
                          <>
                            <UserCheck size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX size={12} />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <div className="user-joined">
                        <Calendar size={14} />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => openUserModal(user, 'view')}
                          title="View User Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => openUserModal(user, 'edit')}
                          title="Edit User"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user)}
                          title="Delete User"
                          disabled={user.role === 'superadmin'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && !loading && (
            <div className="empty-state">
              <User size={48} />
              <h3>No users found</h3>
              <p>
                {searchTerm 
                  ? `No users match your search "${searchTerm}"`
                  : "No users found"
                }
              </p>
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

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingUser ? 'Edit User' : 'User Details'} - {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {errors.submit && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  {errors.submit}
                </div>
              )}

              <div className="user-details-grid">
                {/* Personal Information */}
                <div className="detail-section">
                  <h4>
                    <User size={16} />
                    Personal Information
                  </h4>
                  <div className="detail-content">
                    <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    {selectedUser.phone && (
                      <p><strong>Phone:</strong> {selectedUser.phone}</p>
                    )}
                    {selectedUser.dateOfBirth && (
                      <p><strong>Date of Birth:</strong> {formatDate(selectedUser.dateOfBirth)}</p>
                    )}
                    {selectedUser.gender && (
                      <p><strong>Gender:</strong> {selectedUser.gender}</p>
                    )}
                    <p><strong>Member Since:</strong> {formatDate(selectedUser.createdAt)}</p>
                    {selectedUser.lastLogin && (
                      <p><strong>Last Login:</strong> {formatDate(selectedUser.lastLogin)}</p>
                    )}
                  </div>
                </div>

                {/* Account Settings */}
                <div className="detail-section">
                  <h4>
                    <Settings size={16} />
                    Account Settings
                  </h4>
                  {editingUser ? (
                    <form onSubmit={handleUpdateUser}>
                      <div className="form-group">
                        <label>Role</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className={errors.role ? 'error' : ''}
                        >
                          {userRoles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        {errors.role && <span className="field-error">{errors.role}</span>}
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                          />
                          <span className="checkmark"></span>
                          Active User
                        </label>
                      </div>

                      <button type="submit" className="btn btn-primary">
                        Update User
                      </button>
                    </form>
                  ) : (
                    <div className="detail-content">
                      <p><strong>Role:</strong> {getRoleInfo(selectedUser.role).label}</p>
                      <p><strong>Status:</strong> {selectedUser.isActive !== false ? 'Active' : 'Inactive'}</p>
                      <p><strong>Permissions:</strong></p>
                      <div className="permissions-list">
                        {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                          selectedUser.permissions.map((permission) => (
                            <span key={permission} className="permission-badge">
                              <ShieldCheck size={12} />
                              {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))
                        ) : (
                          <span className="no-permissions">No specific permissions</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Permissions (Edit Mode) */}
                {editingUser && (
                  <div className="detail-section full-width">
                    <h4>
                      <Shield size={16} />
                      Permissions
                    </h4>
                    <div className="permissions-grid">
                      {availablePermissions.map((permission) => (
                        <label key={permission} className="checkbox-label permission-checkbox">
                          <input
                            type="checkbox"
                            name="permissions"
                            value={permission}
                            checked={formData.permissions.includes(permission)}
                            onChange={handleInputChange}
                          />
                          <span className="checkmark"></span>
                          {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addresses */}
                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                  <div className="detail-section full-width">
                    <h4>
                      <MapPin size={16} />
                      Addresses ({selectedUser.addresses.length})
                    </h4>
                    <div className="addresses-list">
                      {selectedUser.addresses.map((address, index) => (
                        <div key={index} className="address-item">
                          <div className="address-type">
                            <strong>{address.type || 'Address'}</strong>
                            {address.isDefault && <span className="default-badge">Default</span>}
                          </div>
                          <div className="address-details">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              {!editingUser && (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingUser(selectedUser);
                    setFormData({
                      role: selectedUser.role || 'user',
                      permissions: selectedUser.permissions || [],
                      isActive: selectedUser.isActive !== false
                    });
                  }}
                >
                  Edit User
                </button>
              )}
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;