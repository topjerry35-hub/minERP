import React, { useState } from 'react';
import { Eye, Plus, ArrowDownRight, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function PurchaseOrderList({ 
  purchaseOrders, 
  onNewPoClick, 
  onViewPoDetails, 
  onReceiveGoodsForPo,
  searchQuery 
}) {
  const [statusFilter, setStatusFilter] = useState('All');

  const query = (searchQuery || '').toLowerCase();
  const filteredPOs = (purchaseOrders || []).filter(po => {
    if (!po) return false;
    const matchesSearch = 
      (po.id || '').toLowerCase().includes(query) ||
      (po.supplier || '').toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || (po.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Purchase Orders (PO) Management</h2>
          <span className="card-subtitle">Showing {filteredPOs.length} procurement orders</span>
        </div>

        <button className="btn-primary" onClick={onNewPoClick}>
          <Plus size={16} />
          Create Purchase Order
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="date-filter-group">
          {['All', 'Draft', 'Approved', 'Sent', 'Received', 'Closed'].map(status => (
            <button
              key={status}
              className={`date-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier / Vendor</th>
              <th>Order Date</th>
              <th>Expected Delivery</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPOs.length > 0 ? (
              filteredPOs.map((po) => (
                <tr key={po.id}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {po.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{po.supplier}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{po.itemsCount || po.items?.length || 1} items</div>
                  </td>
                  <td>{formatDate(po.orderDate)}</td>
                  <td>{formatDate(po.deliveryDate)}</td>
                  <td style={{ fontWeight: '800', color: 'var(--text-primary)' }}>
                    {formatCurrency(po.totalAmount)}
                  </td>
                  <td>
                    <span className={`status-badge ${po.status === 'Received' || po.status === 'Closed' ? 'completed' : po.status === 'Sent' ? 'shipped' : 'pending'}`}>
                      {po.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => onViewPoDetails(po)}
                      >
                        <Eye size={14} />
                        View
                      </button>

                      {(po.status === 'Sent' || po.status === 'Approved') && (
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#10b98150', color: '#10b981' }}
                          onClick={() => onReceiveGoodsForPo(po)}
                        >
                          <ArrowDownRight size={14} />
                          Receive GRN
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No Purchase Orders match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
