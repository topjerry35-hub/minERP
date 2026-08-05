import React from 'react';
import { Users, IndianRupee, Plus, Mail, Phone, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';

export default function CustomerList({ 
  customers, 
  onAddCustomerClick, 
  onNewQuoteForCustomer, 
  onNewOrderForCustomer,
  onRecordPaymentForCustomer,
  searchQuery 
}) {
  const query = (searchQuery || '').toLowerCase();
  const filteredCustomers = (customers || []).filter(c => 
    c && (
      (c.name || '').toLowerCase().includes(query) ||
      (c.company || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query)
    )
  );

  const totalReceivables = customers.reduce((sum, c) => sum + c.receivablesBalance, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Customer KPI Summary */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Clients</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{customers.length} Accounts</div>
          <div className="kpi-subtitle">B2B & Retail Customers</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Accounts Receivable</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>
            ₹{totalReceivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtitle">Outstanding Customer Invoices</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Average Credit Limit</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>₹37,500.00</div>
          <div className="kpi-subtitle">Pre-approved Credit Limit</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">Customers Directory</h2>
            <span className="card-subtitle">Showing {filteredCustomers.length} client accounts</span>
          </div>

          <button className="btn-primary" onClick={onAddCustomerClick}>
            <Plus size={16} />
            Add New Customer
          </button>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Company</th>
                <th>Contact Info</th>
                <th>Credit Limit</th>
                <th>Lifetime Sales</th>
                <th>Receivables Due</th>
                <th style={{ textAlign: 'right' }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {c.name}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {c.id}</div>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{c.company}</td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{c.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.phone}</div>
                    </td>
                    <td>₹{c.creditLimit.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: '700', color: '#3b82f6' }}>
                      ₹{c.lifetimeSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontWeight: '800', color: c.receivablesBalance > 0 ? '#f59e0b' : '#10b981' }}>
                      ₹{c.receivablesBalance.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Create Quote"
                          onClick={() => onNewQuoteForCustomer(c)}
                        >
                          + Quote
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Create Sales Order"
                          onClick={() => onNewOrderForCustomer(c)}
                        >
                          + Order
                        </button>
                        {c.receivablesBalance > 0 && (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#10b98150', color: '#10b981' }}
                            title="Record Payment"
                            onClick={() => onRecordPaymentForCustomer(c)}
                          >
                            Receive ₹
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No customers match your search criteria.
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
