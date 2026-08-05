import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  Layers, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  ShoppingBag, 
  PackageX,
  RotateCcw
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

export default function RecentOrdersTable({ orders = [], onOrderSelect, searchQuery = '' }) {
  const [statusFilter, setStatusFilter] = useState('All');

  const query = (searchQuery || '').toLowerCase();

  const searchFilteredOrders = useMemo(() => {
    return (orders || []).filter(order => {
      if (!order) return false;
      return (
        (order.id || '').toLowerCase().includes(query) ||
        (order.customer || '').toLowerCase().includes(query) ||
        (order.category || '').toLowerCase().includes(query) ||
        (order.email || '').toLowerCase().includes(query)
      );
    });
  }, [orders, query]);

  const statusCounts = useMemo(() => {
    return {
      All: searchFilteredOrders.length,
      Completed: searchFilteredOrders.filter(o => (o?.status || '').toLowerCase() === 'completed').length,
      Processing: searchFilteredOrders.filter(o => (o?.status || '').toLowerCase() === 'processing').length,
      Pending: searchFilteredOrders.filter(o => (o?.status || '').toLowerCase() === 'pending').length,
    };
  }, [searchFilteredOrders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'All') return searchFilteredOrders;
    return searchFilteredOrders.filter(
      order => (order?.status || '').toLowerCase() === statusFilter.toLowerCase()
    );
  }, [searchFilteredOrders, statusFilter]);

  const tabs = [
    { id: 'All', label: 'All', icon: Layers, count: statusCounts.All },
    { id: 'Completed', label: 'Completed', icon: CheckCircle2, count: statusCounts.Completed },
    { id: 'Processing', label: 'Processing', icon: RefreshCw, count: statusCounts.Processing },
    { id: 'Pending', label: 'Pending', icon: AlertCircle, count: statusCounts.Pending },
  ];

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'completed':
        return (
          <span className="status-badge completed">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case 'processing':
        return (
          <span className="status-badge info">
            <RefreshCw size={12} className="spin-slow" />
            Processing
          </span>
        );
      case 'pending':
        return (
          <span className="status-badge pending">
            <Clock size={12} />
            Pending
          </span>
        );
      default:
        return (
          <span className={`status-badge ${s}`}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="card-title-group">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} style={{ color: 'var(--accent-blue)' }} />
            Recent Orders & Fulfillment
          </h2>
          <span className="card-subtitle">
            Showing {filteredOrders.length} of {orders ? orders.length : 0} transactions
          </span>
        </div>

        <div className="date-filter-group">
          {tabs.map(({ id, label, icon: Icon, count }) => {
            const isActive = statusFilter === id;
            return (
              <button
                key={id}
                className={`date-btn status-${id.toLowerCase()} ${isActive ? 'active' : ''}`}
                onClick={() => setStatusFilter(id)}
              >
                <Icon size={14} />
                <span>{label}</span>
                <span className="tab-count-badge" aria-hidden="true">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Status</th>
              <th>Amount</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr key={order.id || `recent-order-${index}`}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {order.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{order.customer}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.email}</div>
                  </td>
                  <td>{formatDate(order.date)}</td>
                  <td>{order.itemsCount} items</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td style={{ fontWeight: '800', color: 'var(--text-primary)' }}>
                    {formatCurrency(order.amount || 0)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => onOrderSelect && onOrderSelect(order)}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <div className="empty-orders-state">
                    <PackageX size={36} className="empty-orders-icon" />
                    <div className="empty-orders-title">No {statusFilter === 'All' ? '' : statusFilter} orders found</div>
                    <div className="empty-orders-subtitle">
                      {statusFilter === 'All' 
                        ? 'No transactions matched your search criteria.' 
                        : `There are currently no orders with "${statusFilter}" status.`}
                    </div>
                    {statusFilter !== 'All' && (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => setStatusFilter('All')}
                      >
                        <RotateCcw size={14} />
                        View All Orders
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
