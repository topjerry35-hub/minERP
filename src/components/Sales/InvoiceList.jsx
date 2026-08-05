import React, { useState } from 'react';
import { Receipt, Printer, CreditCard, Plus, CheckCircle2, FileText, Mail, X } from 'lucide-react';
import { downloadPDFSimulated } from '../../utils/exportUtils';
import { formatDate } from '../../utils/date';

export default function InvoiceList({ invoices, onReceivePaymentForInvoice, searchQuery }) {
  const [emailModalInvoice, setEmailModalInvoice] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDownloadPDFInvoice = (inv) => {
    const invContent = `COMMERCIAL INVOICE: ${inv.id}
Order Reference: ${inv.orderId}
Customer: ${inv.customer}
Date: ${inv.date} | Payment Due Date: ${inv.dueDate}
----------------------------------------------------
Billed Amount Due: ₹${inv.amount.toFixed(2)} INR
Tax Mode: Standard Tax / GST Included
Payment Terms: Net 30 Days
----------------------------------------------------
Please remit payment to minERP Operating Checking Account.`;

    downloadPDFSimulated(`Commercial_Invoice_${inv.id}`, invContent);
    showToast(`Downloaded Commercial Invoice PDF for ${inv.id}`);
  };

  const handleSendEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailModalInvoice || !recipientEmail) return;

    showToast(`Invoice PDF ${emailModalInvoice.id} emailed to ${recipientEmail}!`);
    setEmailModalInvoice(null);
    setRecipientEmail('');
  };

  const query = (searchQuery || '').toLowerCase();
  const filteredInvoices = (invoices || []).filter(i => 
    i && (
      (i.id || '').toLowerCase().includes(query) ||
      (i.customer || '').toLowerCase().includes(query) ||
      (i.orderId || '').toLowerCase().includes(query)
    )
  );

  return (
    <div className="card">
      {toastMessage && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '10px 16px',
          borderRadius: '8px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '0.85rem'
        }}>
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Commercial Billing Invoices ({filteredInvoices.length})</h2>
          <span className="card-subtitle">Track billed revenue, due dates, and accounts receivable</span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Order Ref</th>
              <th>Customer Name</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Billed Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(inv => (
              <tr key={inv.id}>
                <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{inv.id}</td>
                <td style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>{inv.orderId}</td>
                <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{inv.customer}</td>
                <td>{formatDate(inv.date)}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(inv.dueDate)}</td>
                <td style={{ fontWeight: '800', color: 'var(--text-primary)' }}>
                  ₹{inv.amount.toFixed(2)}
                </td>
                <td>
                  <span className={`status-badge ${inv.status === 'Paid' ? 'paid' : inv.status === 'Overdue' ? 'cancelled' : 'unpaid'}`}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Download PDF Invoice"
                      onClick={() => handleDownloadPDFInvoice(inv)}
                    >
                      <FileText size={14} color="#ef4444" />
                      PDF
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Email Invoice to Customer"
                      onClick={() => {
                        setEmailModalInvoice(inv);
                        setRecipientEmail(`${inv.customer.toLowerCase().replace(/\s+/g, '.')}@example.com`);
                      }}
                    >
                      <Mail size={14} color="#3b82f6" />
                      Email
                    </button>
                    {inv.status !== 'Paid' && (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#10b98150', color: '#10b981' }}
                        onClick={() => onReceivePaymentForInvoice(inv)}
                      >
                        <CreditCard size={14} />
                        Pay
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Email Dispatcher Modal */}
      {emailModalInvoice && (
        <div className="modal-overlay" onClick={() => setEmailModalInvoice(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} color="#3b82f6" />
                <h2 className="modal-title">Email Invoice #{emailModalInvoice.id}</h2>
              </div>
              <button className="modal-close" onClick={() => setEmailModalInvoice(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendEmailSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Recipient Customer Email *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Subject</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={`Commercial Invoice #${emailModalInvoice.id} from minERP Enterprise`}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Email Body Preview</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={`Dear ${emailModalInvoice.customer},\n\nPlease find attached Commercial Invoice #${emailModalInvoice.id} for ₹${emailModalInvoice.amount.toFixed(2)}. Payment is due by ${formatDate(emailModalInvoice.dueDate)}.\n\nThank you for your business!`}
                    readOnly
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEmailModalInvoice(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Mail size={16} />
                  Send Email Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
