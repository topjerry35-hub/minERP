import React from 'react';
import { FileText, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/date';

export default function QuotationList({ 
  quotations, 
  onNewQuotationClick, 
  onConvertQuoteToOrder,
  searchQuery 
}) {
  const query = (searchQuery || '').toLowerCase();
  const filteredQuotes = (quotations || []).filter(q => 
    q && (
      (q.id || '').toLowerCase().includes(query) ||
      (q.customer || '').toLowerCase().includes(query)
    )
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#3b82f6" />
            <h2 className="card-title">Quotations & Proposals</h2>
          </div>
          <span className="card-subtitle">Manage price estimates and convert them to Sales Orders</span>
        </div>

        <button className="btn-primary" onClick={onNewQuotationClick}>
          <Plus size={16} />
          Create Quotation
        </button>
      </div>

      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Quote Ref</th>
              <th>Customer Name</th>
              <th>Quote Date</th>
              <th>Valid Until</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((q) => (
                <tr key={q.id}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {q.id}
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{q.customer}</td>
                  <td>{formatDate(q.date)}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(q.validUntil)}</td>
                  <td style={{ fontWeight: '800', color: 'var(--text-primary)' }}>
                    ₹{q.amount.toFixed(2)}
                  </td>
                  <td>
                    <span className={`status-badge ${q.status === 'Converted' ? 'completed' : q.status === 'Accepted' ? 'paid' : 'pending'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {q.status !== 'Converted' ? (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#3b82f6', borderColor: '#3b82f650' }}
                        onClick={() => onConvertQuoteToOrder(q)}
                      >
                        Convert to Order
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>
                        <CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Converted
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No price quotations recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
