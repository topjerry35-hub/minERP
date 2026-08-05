import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { getTodayFormatted } from '../../utils/date';

export default function RecordCustomerPaymentModal({ isOpen, onClose, customers, targetCustomer, targetInvoice, onRecordPayment }) {
  const [selectedCustomerName, setSelectedCustomerName] = useState(targetCustomer?.name || targetInvoice?.customer || customers[0]?.name || '');
  const [amount, setAmount] = useState(targetInvoice ? targetInvoice.amount.toString() : targetCustomer ? targetCustomer.receivablesBalance.toString() : '');
  const [method, setMethod] = useState('Credit Card');
  const [invoiceRef, setInvoiceRef] = useState(targetInvoice?.id || `INV-2026-${Math.floor(100 + Math.random() * 900)}`);

  if (!isOpen) return null;

  const currentCustomer = customers.find(c => c.name === selectedCustomerName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomerName || !amount) return;

    onRecordPayment({
      id: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      customer: selectedCustomerName,
      amount: parseFloat(amount),
      method,
      invoiceRef,
      date: getTodayFormatted()
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#10b981" />
            <h2 className="modal-title">Record Customer Payment Receipt</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Select Customer Account *</label>
              <select 
                className="form-control"
                value={selectedCustomerName}
                onChange={(e) => {
                  setSelectedCustomerName(e.target.value);
                  const cust = customers.find(c => c.name === e.target.value);
                  if (cust) setAmount(cust.receivablesBalance.toString());
                }}
                required
              >
                {customers.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.company}) — Receivables Due: {formatCurrency(c.receivablesBalance)}
                  </option>
                ))}
              </select>
            </div>

            {currentCustomer && (
              <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{currentCustomer.name} ({currentCustomer.company})</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Current Receivables Balance: <strong style={{ color: '#f59e0b' }}>{formatCurrency(currentCustomer.receivablesBalance)}</strong></div>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label>Amount Received (₹ INR) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select 
                  className="form-control"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="Credit Card">Credit Card (Stripe / Visa)</option>
                  <option value="Bank Wire / ACH">Bank Wire / ACH</option>
                  <option value="Company Check">Company Check</option>
                  <option value="PayPal / Stripe">PayPal / Online Gateway</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Settling Invoice Number / Reference</label>
              <input 
                type="text" 
                className="form-control" 
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <CheckCircle2 size={16} />
              Confirm Payment Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
