import React from 'react';
import { Truck, IndianRupee, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function ApBillsTable({ apBills = [], onPayBill }) {
  const unpaidBills = apBills.filter(b => b && b.status !== 'Paid');
  const totalApBalance = unpaidBills.reduce((sum, b) => sum + parseFloat(b.amountDue !== undefined ? b.amountDue : (b.amount || 0)), 0);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="#ef4444" />
            <h2 className="card-title">Accounts Payable (AP) Vendor Bills Ledger</h2>
          </div>
          <span className="card-subtitle">Total Outstanding Liabilities Due: {formatCurrency(totalApBalance)}</span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Bill / PO Reference</th>
              <th>Vendor / Supplier</th>
              <th>Bill Date</th>
              <th>Payment Due Date</th>
              <th>Total Amount Due</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apBills.length > 0 ? (
              apBills.map((bill) => {
                const isPaid = bill.status === 'Paid';
                const dueAmt = parseFloat(bill.amountDue !== undefined ? bill.amountDue : (bill.amount || 0));

                return (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{bill.id}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{bill.supplier}</td>
                    <td>{formatDate(bill.billDate || bill.date)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(bill.dueDate)}</td>
                    <td style={{ fontWeight: '800', color: isPaid ? '#10b981' : '#ef4444' }}>
                      {formatCurrency(dueAmt)}
                    </td>
                    <td>
                      {isPaid ? (
                        <span className="status-badge success">
                          <CheckCircle2 size={12} />
                          Paid
                        </span>
                      ) : (
                        <span className="status-badge unpaid">
                          <AlertCircle size={12} />
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isPaid ? (
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem', opacity: 0.6, cursor: 'not-allowed' }}
                          disabled
                        >
                          <CheckCircle2 size={14} color="#10b981" />
                          Paid & Settled
                        </button>
                      ) : (
                        <button 
                          className="btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                          onClick={() => onPayBill(bill)}
                        >
                          <CreditCard size={14} />
                          Pay Bill
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No accounts payable vendor bills found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
