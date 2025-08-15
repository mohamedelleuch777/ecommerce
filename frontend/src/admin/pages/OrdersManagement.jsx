import { useState, useEffect } from 'react';
import { 
  Search, 
  Eye,
  Trash2, 
  AlertCircle,
  ShoppingCart,
  User,
  Calendar,
  DollarSign,
  Package,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import '../components/AdminLayout.css';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: '#f59e0b', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: '#3b82f6', icon: CheckCircle },
    { value: 'processing', label: 'Processing', color: '#8b5cf6', icon: Package },
    { value: 'shipped', label: 'Shipped', color: '#06b6d4', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: '#10b981', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444', icon: XCircle }
  ];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, filters]);

  const fetchOrders = async () => {
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

      const data = await adminApi.getOrders(queryParams.page, queryParams.limit, queryParams);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openOrderModal = async (order) => {
    try {
      const detailOrder = await adminApi.getOrder(order._id);
      setSelectedOrder(detailOrder);
      setStatusUpdate({
        status: detailOrder.status,
        notes: ''
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    
    if (!statusUpdate.status) {
      setErrors({ status: 'Please select a status' });
      return;
    }

    try {
      await adminApi.updateOrderStatus(selectedOrder._id, statusUpdate);
      await fetchOrders();
      setShowModal(false);
      setErrors({});
    } catch (error) {
      console.error('Error updating order status:', error);
      setErrors({ submit: error.message || 'Failed to update order status' });
    }
  };

  const handleDelete = async (order) => {
    if (!confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
      return;
    }

    try {
      await adminApi.deleteOrder(order._id);
      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order.');
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  const getStatusInfo = (status) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Orders Management</h1>
          <p>Manage customer orders and order status</p>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="filter-select"
              placeholder="From Date"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="filter-select"
              placeholder="To Date"
            />
          </div>
          <div className="results-count">
            {pagination.total} orders found
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={order._id}>
                    <td>
                      <div className="table-cell-content">
                        <ShoppingCart size={20} className="order-icon" />
                        <div>
                          <div className="order-number">#{order.orderNumber}</div>
                          <div className="order-items">{order.items?.length || 0} items</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">
                          {order.user?.firstName} {order.user?.lastName}
                        </div>
                        <div className="customer-email">{order.user?.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="order-date">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ 
                          backgroundColor: statusInfo.color + '20',
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}30`
                        }}
                      >
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="order-total">
                        {formatCurrency(order.pricing?.total || 0)}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => openOrderModal(order)}
                          title="View Order Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(order)}
                          title="Delete Order"
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

          {orders.length === 0 && !loading && (
            <div className="empty-state">
              <ShoppingCart size={48} />
              <h3>No orders found</h3>
              <p>
                {searchTerm 
                  ? `No orders match your search "${searchTerm}"`
                  : "No orders have been placed yet"
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

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.orderNumber}</h3>
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

              <div className="order-details-grid">
                {/* Customer Information */}
                <div className="detail-section">
                  <h4>
                    <User size={16} />
                    Customer Information
                  </h4>
                  <div className="detail-content">
                    <p><strong>Name:</strong> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                    {selectedOrder.user?.phone && (
                      <p><strong>Phone:</strong> {selectedOrder.user.phone}</p>
                    )}
                  </div>
                </div>

                {/* Order Information */}
                <div className="detail-section">
                  <h4>
                    <ShoppingCart size={16} />
                    Order Information
                  </h4>
                  <div className="detail-content">
                    <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p><strong>Payment Method:</strong> {selectedOrder.payment?.method}</p>
                    <p><strong>Total Amount:</strong> {formatCurrency(selectedOrder.pricing?.total || 0)}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="detail-section">
                    <h4>
                      <Package size={16} />
                      Shipping Address
                    </h4>
                    <div className="detail-content">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="detail-section full-width">
                  <h4>
                    <Package size={16} />
                    Order Items ({selectedOrder.items?.length || 0})
                  </h4>
                  <div className="order-items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">Qty: {item.quantity}</span>
                        </div>
                        <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="detail-section full-width">
                  <h4>
                    <Clock size={16} />
                    Update Order Status
                  </h4>
                  <form onSubmit={handleStatusUpdate}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={statusUpdate.status}
                          onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                          className={errors.status ? 'error' : ''}
                        >
                          {orderStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        {errors.status && <span className="field-error">{errors.status}</span>}
                      </div>
                      <div className="form-group">
                        <label>Notes (Optional)</label>
                        <textarea
                          value={statusUpdate.notes}
                          onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Add notes about this status change..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Update Status
                    </button>
                  </form>
                </div>

                {/* Order Timeline */}
                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                  <div className="detail-section full-width">
                    <h4>
                      <Calendar size={16} />
                      Order Timeline
                    </h4>
                    <div className="timeline">
                      {selectedOrder.timeline.map((event, index) => {
                        const eventStatusInfo = getStatusInfo(event.status);
                        const EventIcon = eventStatusInfo.icon;
                        
                        return (
                          <div key={index} className="timeline-item">
                            <div className="timeline-icon" style={{ backgroundColor: eventStatusInfo.color }}>
                              <EventIcon size={14} />
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-status">{eventStatusInfo.label}</div>
                              <div className="timeline-notes">{event.note}</div>
                              <div className="timeline-date">{formatDate(event.timestamp)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
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

export default OrdersManagement;