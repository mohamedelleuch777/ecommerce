import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'shipped': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.errorState}>
          <p>Error loading dashboard: {error}</p>
          <button onClick={fetchDashboardData} className={styles.btnPrimary}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentOrders } = dashboardData;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: '#3b82f6',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Products',
      value: stats.products,
      icon: Package,
      color: '#10b981',
      change: '+3%',
      changeType: 'increase'
    },
    {
      title: 'Orders',
      value: stats.orders,
      icon: ShoppingCart,
      color: '#f59e0b',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Revenue (30d)',
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      color: '#8b5cf6',
      change: '+15%',
      changeType: 'increase'
    }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1>Dashboard</h1>
        <p>Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={styles.statInfo}>
                <h3>{stat.title}</h3>
                <p className={styles.statValue}>{stat.value}</p>
                <div className={`${styles.statChange} ${styles[stat.changeType]}`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
                <stat.icon size={24} color="white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Orders</h2>
          <button className={styles.btnSecondary}>View All</button>
        </div>
        
        <div className={styles.ordersTable}>
          <div className={styles.tableHeader}>
            <div>Order ID</div>
            <div>Customer</div>
            <div>Date</div>
            <div>Status</div>
            <div>Total</div>
            <div>Actions</div>
          </div>
          
          {recentOrders && recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order._id} className={styles.tableRow}>
                <div className={styles.orderId}>#{order._id.slice(-8)}</div>
                <div className={styles.customerInfo}>
                  <div className={styles.customerName}>
                    {order.user?.firstName} {order.user?.lastName}
                  </div>
                  <div className={styles.customerEmail}>{order.user?.email}</div>
                </div>
                <div className={styles.orderDate}>{formatDate(order.createdAt)}</div>
                <div className={styles.orderStatus}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className={styles.orderTotal}>{formatCurrency(order.total)}</div>
                <div className={styles.orderActions}>
                  <button className={styles.btnSm}>
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No recent orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
          <h2>Quick Actions</h2>
        </div>
        
        <div className={styles.quickActions}>
          <button className={styles.actionCard}>
            <Package size={24} />
            <span>Add Product</span>
          </button>
          <button className={styles.actionCard}>
            <Users size={24} />
            <span>Manage Users</span>
          </button>
          <button className={styles.actionCard}>
            <ShoppingCart size={24} />
            <span>View Orders</span>
          </button>
          <button className={styles.actionCard}>
            <TrendingUp size={24} />
            <span>Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;