import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Eye, 
  Plus, 
  Receipt, 
  Layers, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  PackageX, 
  RotateCcw 
} from 'lucide-react';
import { formatDate } from '../../utils/date';

export default function SalesOrderList({ 
  salesOrders = [], 
  onNewOrderClick, 
  onViewOrderDetails, 
  onGenerateInvoiceForOrder,
  searchQuery = '' 
}) {
  const [statusFilter, setStatusFilter] = useState('All');

  const query = (searchQuery || '').toLowerCase();

  const searchFilteredOrders = useMemo(() => {
    return (salesOrders || []).filter(o => {
      if (!o) return false;
      return (
        (o.id || '').toLowerCase().includes(query) ||
        (o.customer || '').toLowerCase().includes(query) ||
        (o.email || '').toLowerCase().includes(query)
      );
    });
  }, [salesOrders, query]);

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
      o => (o?.status || '').toLowerCase() === statusFilter.toLowerCase()
    );
  }, [searchFilteredOrders, statusFilter]);

  const tabs = [
    { id: 'All', label: 'All', icon: Layers, count: statusCounts.All },
    { id: 'Completed', label: 'Completed', icon: CheckCircle2, count: statusCounts.Completed },
    { id: 'Processing', label: 'Processing', icon: RefreshCw, count: statusCounts.Processing },
    { id: 'Pending', label: 'Pending', icon: AlertCircle, count: statusCounts.Pending },
  ];

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
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
            {status || 'Pending'}
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
            Sales Orders & Fulfillment
          </h2>
          <span className="card-subtitle">Showing {filteredOrders.length} customer sales orders</span>
        </div>

        <button className="btn-primary" onClick={onNewOrderClick}>
          <Plus size={16} />
          Create Sales Order
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
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
              <th>Order ID</th>
              <th>Customer</th>
              <th>Order Date</th>
              <th>Line Items</th>
              <th>Total Amount</th>
              <th>Fulfillment Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o, index) => (
                <tr key={o.id || `sales-order-${index}`}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {o.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{o.customer}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.email}</div>
                  </td>
                  <td>{formatDate(o.date)}</td>
                  <td>{o.itemsCount} items</td>
                  <td style={{ fontWeight: '800', color: 'var(--text-primary)' }}>
                    ₹{(o.amount || 0).toFixed(2)}
                  </td>
                  <td>{getStatusBadge(o.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => onViewOrderDetails && onViewOrderDetails(o)}
                      >
                        <Eye size={14} />
                        View
                      </button>

                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#3b82f650', color: '#3b82f6' }}
                        onClick={() => onGenerateInvoiceForOrder && onGenerateInvoiceForOrder(o)}
                      >
                        <Receipt size={14} />
                        Generate Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <div className="empty-orders-state">
                    <PackageX size={36} className="empty-orders-icon" />
                    <div className="empty-orders-title">No {statusFilter === 'All' ? '' : statusFilter} sales orders found</div>
                    <div className="empty-orders-subtitle">
                      {statusFilter === 'All' 
                        ? 'No sales orders matched your search criteria.' 
                        : `There are currently no sales orders with "${statusFilter}" status.`}
                    </div>
                    {statusFilter !== 'All' && (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => setStatusFilter('All')}
                      >
                        <RotateCcw size={14} />
                        View All Sales Orders
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
