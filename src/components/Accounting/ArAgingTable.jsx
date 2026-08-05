import React from 'react';
import { IndianRupee, Clock, AlertTriangle, Send } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function ArAgingTable({ arInvoices, onSendReminder }) {
  const safeInvoices = arInvoices || [];
  const currentTotal = safeInvoices.filter(i => i && i.days <= 30).reduce((sum, i) => sum + (i.amount || 0), 0);
  const thirtyTotal = safeInvoices.filter(i => i && i.days > 30 && i.days <= 60).reduce((sum, i) => sum + (i.amount || 0), 0);
  const sixtyTotal = safeInvoices.filter(i => i && i.days > 60).reduce((sum, i) => sum + (i.amount || 0), 0);
  const grandTotal = currentTotal + thirtyTotal + sixtyTotal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Current (0 - 30 Days)</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>
            {formatCurrency(currentTotal)}
          </div>
          <div className="kpi-subtitle">Standard payment window</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">31 - 60 Days Overdue</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>
            {formatCurrency(thirtyTotal)}
          </div>
          <div className="kpi-subtitle">Second reminder stage</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">60+ Days Overdue (Critical)</span>
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>
            {formatCurrency(sixtyTotal)}
          </div>
          <div className="kpi-subtitle">Requires immediate collections</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">Accounts Receivable (AR) Customer Ledger</h2>
            <span className="card-subtitle">Total Outstanding Uncollected: {formatCurrency(grandTotal)}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Invoice Ref</th>
                <th>Customer Name</th>
                <th>Invoice Date</th>
                <th>Days Outstanding</th>
                <th>Aging Category</th>
                <th>Amount Outstanding</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {arInvoices.map((inv) => {
                const agingClass = inv.days > 60 ? 'out_of_stock' : inv.days > 30 ? 'low_stock' : 'in_stock';
                const agingLabel = inv.days > 60 ? '60+ Days Overdue' : inv.days > 30 ? '31-60 Days Overdue' : 'Current (0-30 Days)';

                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{inv.id}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{inv.customer}</td>
                    <td>{formatDate(inv.date)}</td>
                    <td style={{ fontWeight: '700' }}>{inv.days} days</td>
                    <td>
                      <span className={`status-badge ${agingClass}`}>
                        {agingLabel}
                      </span>
                    </td>
                    <td style={{ fontWeight: '800', color: '#f59e0b' }}>
                      {formatCurrency(inv.amount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => onSendReminder(inv)}
                      >
                        <Send size={12} />
                        Send Reminder
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
