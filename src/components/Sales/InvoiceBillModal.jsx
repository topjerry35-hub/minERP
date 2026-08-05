import React from 'react';
import { X, Printer, CheckCircle2, FileText, Download, Building2 } from 'lucide-react';
import { downloadPDFSimulated } from '../../utils/exportUtils';
import { formatDate } from '../../utils/date';

export default function InvoiceBillModal({ isOpen, onClose, invoice, order }) {
  if (!isOpen || (!invoice && !order)) return null;

  const invId = invoice?.id || `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
  const orderId = order?.id || invoice?.orderId || 'ORD-1001';
  const customerName = invoice?.customer || order?.customer || 'Walk-in Retail Customer';
  const dateStr = formatDate(invoice?.date || order?.date || new Date());
  const items = order?.items || [
    { name: 'Supply Order Package', sku: 'SKU-101', qty: order?.itemsCount || 1, price: order?.amount || invoice?.amount || 0 }
  ];

  const subtotal = order?.subtotal || items.reduce((sum, i) => sum + (parseFloat(i.qty || 1) * parseFloat(i.price || i.unitPrice || 0)), 0);
  const discountAmount = order?.discountAmount || 0;
  const gstAmount = order?.gstAmount || Math.round(subtotal * 0.18);
  const grandTotal = invoice?.amount || order?.amount || (subtotal - discountAmount + gstAmount);
  const isPaid = invoice?.status === 'Paid' || order?.status === 'Completed';

  const handlePrintPDF = () => {
    const billElement = document.getElementById('commercial-invoice-bill-body');
    if (billElement) {
      const printWin = window.open('', '_blank', 'width=700,height=900');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Tax Invoice ${invId}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 25px; color: #0f172a; background: #fff; }
                * { box-sizing: border-box; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
                th { background: #f1f5f9; text-align: left; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              ${billElement.innerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
        return;
      }
    }

    const billContent = `
============================================================
              TAX INVOICE / BILL OF SUPPLY                  
                 minERP ENTERPRISE OS                       
============================================================
Invoice Number: ${invId}
Order Reference: ${orderId}
Invoice Date: ${dateStr}
Payment Status: ${isPaid ? 'PAID' : 'UNPAID / PENDING DUE'}
Payment Mode: ${order?.paymentMethod || 'Cash / Online Tender'}

BILLED TO:
Customer: ${customerName}
Email: ${order?.email || 'N/A'}
------------------------------------------------------------
ITEM DESCRIPTION                  QTY     PRICE        TOTAL
------------------------------------------------------------
${items.map(i => `${(i.name || i.sku).padEnd(30, ' ')} x${i.qty || 1}   ₹${(i.price || i.unitPrice || 0).toFixed(2).padStart(8, ' ')}   ₹${((i.qty || 1) * (i.price || i.unitPrice || 0)).toFixed(2).padStart(8, ' ')}`).join('\n')}
------------------------------------------------------------
Items Subtotal:                               ₹${subtotal.toFixed(2)}
Discount:                                    -₹${discountAmount.toFixed(2)}
GST / Tax (18%):                             +₹${gstAmount.toFixed(2)}
------------------------------------------------------------
TOTAL AMOUNT DUE:                             ₹${grandTotal.toFixed(2)}
============================================================
           Thank you for doing business with us!            
============================================================
`;
    downloadPDFSimulated(`Tax_Invoice_${invId}`, billContent);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '620px', background: '#ffffff', color: '#0f172a' }}
      >
        <div className="modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#10b981" />
            <h2 className="modal-title" style={{ color: '#0f172a', fontSize: '1.15rem' }}>
              Commercial GST Bill / Tax Invoice
            </h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {/* Invoice Document Box */}
          <div id="commercial-invoice-bill-body" style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '24px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
            fontSize: '0.85rem'
          }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '1.25rem', color: '#0284c7' }}>
                  <Building2 size={22} /> minERP TAX INVOICE
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>GSTIN: 27AAAAA0000A1Z5 | Enterprise Retail</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>{invId}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {dateStr}</div>
                <span className={`status-badge ${isPaid ? 'paid' : 'pending'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                  {isPaid ? 'PAID & SETTLED' : 'UNPAID DUE'}
                </span>
              </div>
            </div>

            {/* Billed To */}
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Billed To Customer:</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>{customerName}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Ref Order: {orderId} | Contact: {order?.email || 'N/A'}</div>
            </div>

            {/* Itemized Table */}
            <div className="table-responsive" style={{ marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f1f5f9', color: '#475569', fontWeight: '700' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '600' }}>{item.name || item.sku}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.qty || 1}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{(item.price || item.unitPrice || 0).toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>
                        ₹{((item.qty || 1) * (item.price || item.unitPrice || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Discount:</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>GST / Tax:</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>+₹{gstAmount.toFixed(2)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justify: 'space-between', 
                  fontWeight: '800', 
                  fontSize: '1.1rem', 
                  color: '#0f172a', 
                  borderTop: '2px solid #0f172a', 
                  paddingTop: '6px',
                  marginTop: '4px'
                }}>
                  <span>GRAND TOTAL:</span>
                  <span style={{ color: '#0284c7' }}>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button 
            className="btn-primary" 
            style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
            onClick={handlePrintPDF}
          >
            <Printer size={16} />
            Print / Download PDF Bill
          </button>
        </div>
      </div>
    </div>
  );
}
