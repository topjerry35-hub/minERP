import React from 'react';
import { Star, Truck, Plus, Mail, Phone, ExternalLink, IndianRupee, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function SupplierList({ 
  suppliers, 
  onAddSupplierClick, 
  onNewPoForSupplier, 
  onRecordPaymentForSupplier,
  onSelectSupplier,
  searchQuery 
}) {
  const query = (searchQuery || '').toLowerCase();
  const filteredSuppliers = (suppliers || []).filter(s => 
    s && (
      (s.name || '').toLowerCase().includes(query) ||
      (s.contactPerson || '').toLowerCase().includes(query) ||
      (s.category || '').toLowerCase().includes(query)
    )
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards summary for Vendors */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Suppliers</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Truck size={20} />
            </div>
          </div>
          <div className="kpi-value">{suppliers.length} Vendors</div>
          <div className="kpi-subtitle">Verified Enterprise Partners</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Accounts Payable</span>
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>
            {formatCurrency(suppliers.reduce((sum, s) => sum + s.balanceDue, 0))}
          </div>
          <div className="kpi-subtitle">Outstanding unpaid vendor bills</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">Approved Suppliers Directory</h2>
            <span className="card-subtitle">Showing {filteredSuppliers.length} vendor partners</span>
          </div>

          <button className="btn-primary" onClick={onAddSupplierClick}>
            <Plus size={16} />
            Add New Supplier
          </button>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Payment Terms</th>
                <th>Balance Due</th>
                <th style={{ textAlign: 'right' }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} style={{ cursor: onSelectSupplier ? 'pointer' : 'default' }}>
                    <td 
                      style={{ fontWeight: '700', color: 'var(--text-primary)' }}
                      onClick={() => onSelectSupplier && onSelectSupplier(s)}
                    >
                      <div style={{ color: 'var(--accent-blue)', display: 'inline-block' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {s.id}</div>
                    </td>
                    <td onClick={() => onSelectSupplier && onSelectSupplier(s)}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{s.contactPerson}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email} • {s.phone}</div>
                    </td>
                    <td>{s.category}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: '700' }}>
                        <Star size={14} fill="#f59e0b" />
                        {s.rating} / 5.0
                      </div>
                    </td>
                    <td>{s.paymentTerms || 'Net 30'}</td>
                    <td style={{ fontWeight: '800', color: s.balanceDue > 0 ? '#ef4444' : '#10b981' }}>
                      {formatCurrency(s.balanceDue)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {onSelectSupplier && (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            title="View Supplier Details Card"
                            onClick={(e) => { e.stopPropagation(); onSelectSupplier(s); }}
                          >
                            <Eye size={14} color="#3b82f6" />
                            Details
                          </button>
                        )}
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={(e) => { e.stopPropagation(); onNewPoForSupplier(s); }}
                        >
                          + Issue PO
                        </button>
                        {s.balanceDue > 0 && (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#10b98150', color: '#10b981' }}
                            onClick={(e) => { e.stopPropagation(); onRecordPaymentForSupplier(s); }}
                          >
                            Pay Bill
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No suppliers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
