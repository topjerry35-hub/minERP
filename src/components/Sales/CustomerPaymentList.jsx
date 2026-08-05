import React from 'react';
import { CreditCard, DollarSign, Plus, CheckCircle, IndianRupee } from 'lucide-react';
import { formatDate } from '../../utils/date';

export default function CustomerPaymentList({ payments, onRecordPaymentClick, searchQuery }) {
  const query = (searchQuery || '').toLowerCase();
  const filteredPayments = (payments || []).filter(p => 
    p && (
      (p.id || '').toLowerCase().includes(query) ||
      (p.customer || '').toLowerCase().includes(query) ||
      (p.method || '').toLowerCase().includes(query)
    )
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#10b981" />
            <h2 className="card-title">Customer Receipts & Payments Ledger</h2>
          </div>
          <span className="card-subtitle">Accounts Receivable collections and receipt vouchers</span>
        </div>

        <button className="btn-primary" onClick={onRecordPaymentClick}>
          <Plus size={16} />
          Record Customer Payment
        </button>
      </div>

      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Receipt Ref</th>
              <th>Customer Name</th>
              <th>Receipt Date</th>
              <th>Payment Method</th>
              <th>Invoice / Ref #</th>
              <th>Amount Received</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {p.id}
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.customer}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{p.method}</td>
                  <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.invoiceRef || 'INV-2026-001'}</td>
                  <td style={{ fontWeight: '800', color: '#10b981' }}>
                    ₹{p.amount.toFixed(2)}
                  </td>
                  <td>
                    <span className="status-badge paid">
                      <CheckCircle size={12} />
                      Settled
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No payment receipt vouchers recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
