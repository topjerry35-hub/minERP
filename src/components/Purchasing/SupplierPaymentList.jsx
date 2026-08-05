import React from 'react';
import { CreditCard, IndianRupee, Plus, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function SupplierPaymentList({ payments, onRecordPaymentClick, searchQuery }) {
  const query = (searchQuery || '').toLowerCase();
  const filteredPayments = (payments || []).filter(p => 
    p && (
      (p.id || '').toLowerCase().includes(query) ||
      (p.supplier || '').toLowerCase().includes(query) ||
      (p.method || '').toLowerCase().includes(query)
    )
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#8b5cf6" />
            <h2 className="card-title">Supplier Payments Ledger (Accounts Payable)</h2>
          </div>
          <span className="card-subtitle">Recorded vendor disbursements and bill settlements</span>
        </div>

        <button className="btn-primary" onClick={onRecordPaymentClick}>
          <Plus size={16} />
          Record Supplier Payment
        </button>
      </div>

      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Payment Voucher Ref</th>
              <th>Supplier Name</th>
              <th>Payment Date</th>
              <th>Payment Method</th>
              <th>Reference / Check #</th>
              <th>Amount Paid</th>
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
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.supplier}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{p.method}</td>
                  <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.referenceNumber || 'ACH-9921'}</td>
                  <td style={{ fontWeight: '800', color: '#10b981' }}>
                    {formatCurrency(p.amount)}
                  </td>
                  <td>
                    <span className="status-badge paid">
                      <CheckCircle size={12} />
                      Cleared
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No payment vouchers recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
