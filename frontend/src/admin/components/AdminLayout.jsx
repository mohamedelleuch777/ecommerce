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
import styles from './AdminLayout.module.css';

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
    <div className={styles.adminLayout}>
      {/* Mobile menu button */}
      <div className={styles.mobileMenuButton}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={styles.menuToggle}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/admin" className={styles.logo}>
            <Globe size={32} />
            <span>Admin Panel</span>
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          {navigation.map((item) => {
            if (!hasPermission(item.permission)) return null;
            
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.firstName} {user?.lastName}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;