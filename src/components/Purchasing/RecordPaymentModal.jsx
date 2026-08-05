import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle2, Building2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function RecordPaymentModal({ isOpen, onClose, suppliers = [], targetSupplier, onRecordPayment }) {
  const [selectedSupplierName, setSelectedSupplierName] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Wire / ACH');
  const [referenceNumber, setReferenceNumber] = useState(`ACH-${Math.floor(100000 + Math.random() * 900000)}`);

  useEffect(() => {
    if (isOpen) {
      const initialName = targetSupplier?.name || suppliers[0]?.name || '';
      setSelectedSupplierName(initialName);
      const match = suppliers.find(s => s.name === initialName) || targetSupplier;
      if (match) {
        setAmount(match.balanceDue.toString());
      }
    }
  }, [isOpen, targetSupplier, suppliers]);

  if (!isOpen) return null;

  const currentSupplier = suppliers.find(s => s.name === selectedSupplierName) || targetSupplier;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplierName || !amount) return;

    onRecordPayment({
      id: `PAY-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplier: selectedSupplierName,
      amount: parseFloat(amount),
      method,
      referenceNumber,
      date: new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#10b981" />
            <h2 className="modal-title">Record Vendor Payment (Accounts Payable)</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Select Supplier / Vendor *</label>
              <select 
                className="form-control"
                value={selectedSupplierName}
                onChange={(e) => {
                  setSelectedSupplierName(e.target.value);
                  const supp = suppliers.find(s => s.name === e.target.value);
                  if (supp) setAmount(supp.balanceDue.toString());
                }}
                required
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} — Outstanding Due: {formatCurrency(s.balanceDue)}
                  </option>
                ))}
              </select>
            </div>

            {currentSupplier && (
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.08)', 
                padding: '12px 16px', 
                borderRadius: '10px', 
                border: '1px solid rgba(16, 185, 129, 0.25)', 
                marginBottom: '16px',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={20} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{currentSupplier.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contact: {currentSupplier.contactPerson} • {currentSupplier.phone || currentSupplier.email}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Balance Due</div>
                  <div style={{ fontWeight: '800', color: currentSupplier.balanceDue > 0 ? '#ef4444' : '#10b981', fontSize: '1rem' }}>
                    {formatCurrency(currentSupplier.balanceDue)}
                  </div>
                </div>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label>Payment Amount (₹ INR) *</label>
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
                  <option value="Bank Wire / ACH">Bank Wire / ACH Transfer</option>
                  <option value="Corporate Credit Card">Corporate Credit Card</option>
                  <option value="Company Check">Company Check</option>
                  <option value="Electronic Funds Transfer">EFT / Direct Transfer</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Reference / Transaction / Check #</label>
              <input 
                type="text" 
                className="form-control" 
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <CheckCircle2 size={16} />
              Confirm Vendor Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
