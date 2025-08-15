import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Image, 
  Settings, 
  LogOut,
  Menu,
  X,
  BarChart3,
  Layers,
  FileText,
  Globe
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      permission: null
    },
    {
      name: 'Hero Slider',
      href: '/admin/hero',
      icon: Image,
      permission: 'manage_hero'
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: Layers,
      permission: 'manage_categories'
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: Package,
      permission: 'manage_products'
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      permission: 'manage_orders'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      permission: 'manage_users'
    },
    {
      name: 'Footer',
      href: '/admin/footer',
      icon: Settings,
      permission: 'manage_footer'
    },
    {
      name: 'Page Builder',
      href: '/admin/pages',
      icon: FileText,
      permission: 'manage_pages'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      permission: 'view_analytics'
    }
  ];

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (user?.role === 'superadmin') return true;
    return user?.permissions?.includes(permission);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-layout">
      {/* Mobile menu button */}
      <div className="mobile-menu-button">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="menu-toggle"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="logo">
            <Globe size={32} />
            <span>Admin Panel</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            if (!hasPermission(item.permission)) return null;
            
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;