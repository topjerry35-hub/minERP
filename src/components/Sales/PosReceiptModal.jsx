import React from 'react';
import { X, Printer, Download, CheckCircle2, Layers } from 'lucide-react';
import { downloadPDFSimulated } from '../../utils/exportUtils';
import { formatDate } from '../../utils/date';

export default function PosReceiptModal({ isOpen, onClose, receipt }) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    const printableArea = document.getElementById('pos-thermal-receipt-body');
    if (printableArea) {
      const printWin = window.open('', '_blank', 'width=420,height=600');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>POS Receipt ${receipt.id}</title>
              <style>
                body { font-family: monospace, sans-serif; padding: 15px; margin: 0; color: #000; background: #fff; }
                * { box-sizing: border-box; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              ${printableArea.innerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 400);
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
        return;
      }
    }

    const textContent = `
==================================================
           minERP ENTERPRISE POS RECEIPT          
==================================================
Receipt #: ${receipt.id}
Date: ${formatDate(receipt.date)} | Time: ${receipt.time}
Register: Checkout Terminal #01
Cashier: ${receipt.cashier || 'Jane Doe (Store Lead)'}
Customer: ${receipt.customerName || 'Walk-in Retail Customer'}
--------------------------------------------------
ITEMS PURCHASED:
${receipt.items.map(item => `${item.name.padEnd(30, ' ')} x${item.qty}   ₹${(item.price * item.qty).toFixed(2)}`).join('\n')}
--------------------------------------------------
Subtotal:                    ₹${receipt.subtotal.toFixed(2)}
Discount (${receipt.discountPercent}%):           -₹${receipt.discountAmount.toFixed(2)}
Tax / GST (10%):             +₹${receipt.taxAmount.toFixed(2)}
--------------------------------------------------
TOTAL AMOUNT DUE:            ₹${receipt.grandTotal.toFixed(2)}
--------------------------------------------------
PAYMENT METHOD:              ${receipt.paymentMethod}
Amount Tendered:             ₹${receipt.amountTendered ? receipt.amountTendered.toFixed(2) : receipt.grandTotal.toFixed(2)}
Change Returned:             ₹${receipt.changeDue ? receipt.changeDue.toFixed(2) : '0.00'}
==================================================
 Thank you for shopping with minERP Enterprise OS! 
==================================================
`;
    downloadPDFSimulated(`POS_Receipt_${receipt.id}`, textContent);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '440px', background: '#ffffff', color: '#1e293b' }}
      >
        <div className="modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h2 className="modal-title" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Transaction Completed</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px', fontFamily: 'monospace, sans-serif' }}>
          {/* Thermal Receipt Styling Container */}
          <div id="pos-thermal-receipt-body" style={{
            background: '#fff8f0',
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            fontSize: '0.82rem',
            color: '#334155'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '1.2rem', color: '#0284c7' }}>
                <Layers size={18} /> minERP POS
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Enterprise Retail & Branch Terminal</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Receipt #: <strong>{receipt.id}</strong></div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{formatDate(receipt.date)} | {receipt.time}</div>
            </div>

            {/* Customer & Cashier info */}
            <div style={{ marginBottom: '12px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
              <div>Customer: <strong>{receipt.customerName || 'Walk-in Customer'}</strong></div>
              <div>Cashier: <strong>{receipt.cashier || 'Jane Doe'}</strong></div>
            </div>

            {/* Itemized Table */}
            <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '8px 0', margin: '8px 0' }}>
              <div style={{ display: 'flex', fontWeight: '700', fontSize: '0.75rem', marginBottom: '6px', color: '#475569' }}>
                <span style={{ flex: 1 }}>Item</span>
                <span style={{ width: '40px', textAlign: 'center' }}>Qty</span>
                <span style={{ width: '60px', textAlign: 'right' }}>Price</span>
                <span style={{ width: '65px', textAlign: 'right' }}>Total</span>
              </div>

              {receipt.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '4px' }}>
                    {item.name}
                  </span>
                  <span style={{ width: '40px', textAlign: 'center' }}>x{item.qty}</span>
                  <span style={{ width: '60px', textAlign: 'right' }}>₹{item.price.toFixed(2)}</span>
                  <span style={{ width: '65px', textAlign: 'right', fontWeight: '600' }}>
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>₹{receipt.subtotal.toFixed(2)}</span>
              </div>
              {receipt.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Discount ({receipt.discountPercent}%):</span>
                  <span>-₹{receipt.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax (GST 10%):</span>
                <span>+₹{receipt.taxAmount.toFixed(2)}</span>
              </div>

              <div style={{
                display: 'flex',
                justify: 'space-between',
                fontWeight: '800',
                fontSize: '1.05rem',
                borderTop: '2px solid #0f172a',
                paddingTop: '8px',
                marginTop: '6px',
                color: '#0f172a'
              }}>
                <span>TOTAL:</span>
                <span>₹{receipt.grandTotal.toFixed(2)}</span>
              </div>

              {/* Payment Details */}
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Payment Method:</span>
                  <span style={{ fontWeight: '700' }}>{receipt.paymentMethod}</span>
                </div>
                {receipt.amountTendered > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cash Tendered:</span>
                      <span>₹{receipt.amountTendered.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7', fontWeight: '700' }}>
                      <span>Change Returned:</span>
                      <span>₹{receipt.changeDue.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Barcode & Footer note */}
            <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
              <div style={{ letterSpacing: '4px', fontWeight: '800', fontSize: '0.85rem' }}>||||| || |||||| |||| ||||</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Thank you for shopping! Keep receipt for returns.</div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={handlePrint} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Printer size={16} />
            Print Receipt (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
