import React from 'react';
import { RotateCcw, Plus, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatDate } from '../../utils/date';

export default function SalesReturnList({ salesReturns, onProcessReturnClick, searchQuery }) {
  const query = (searchQuery || '').toLowerCase();
  const filteredReturns = (salesReturns || []).filter(r => 
    r && (
      (r.id || '').toLowerCase().includes(query) ||
      (r.orderId || '').toLowerCase().includes(query) ||
      (r.customer || '').toLowerCase().includes(query) ||
      (r.reason || '').toLowerCase().includes(query)
    )
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={20} color="#ef4444" />
            <h2 className="card-title">Sales Returns & RMA Management</h2>
          </div>
          <span className="card-subtitle">Manage customer returns, credit refunds, and restock processing</span>
        </div>

        <button className="btn-primary" onClick={onProcessReturnClick}>
          <Plus size={16} />
          Process Sales Return (RMA)
        </button>
      </div>

      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>RMA Ref</th>
              <th>Order Ref</th>
              <th>Customer Name</th>
              <th>Return Date</th>
              <th>Return Reason</th>
              <th>Refund Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {r.id}
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>{r.orderId}</td>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{r.customer}</td>
                  <td>{formatDate(r.date)}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.15)', 
                        color: '#ef4444' 
                      }}
                    >
                      {r.reason}
                    </span>
                  </td>
                  <td style={{ fontWeight: '800', color: '#ef4444' }}>
                    -₹{r.refundAmount.toFixed(2)}
                  </td>
                  <td>
                    <span className="status-badge completed">
                      <CheckCircle2 size={12} />
                      {r.status || 'Approved & Restocked'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No Sales Returns recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
