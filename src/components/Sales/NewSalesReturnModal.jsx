import React, { useState } from 'react';
import { X, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function NewSalesReturnModal({ isOpen, onClose, orders, onProcessReturn }) {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');
  const [reason, setReason] = useState('Defective / Damaged Goods');
  const [refundAmount, setRefundAmount] = useState(orders[0] ? orders[0].amount.toString() : '');
  const [autoRestock, setAutoRestock] = useState(true);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentOrder = orders.find(o => o.id === selectedOrderId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrderId || !refundAmount) return;

    onProcessReturn({
      id: `RMA-2026-${Math.floor(100 + Math.random() * 900)}`,
      orderId: selectedOrderId,
      customer: currentOrder ? currentOrder.customer : 'Walk-in Customer',
      date: new Date().toISOString().split('T')[0],
      reason,
      refundAmount: parseFloat(refundAmount),
      autoRestock,
      notes,
      status: 'Approved & Restocked'
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={20} color="#ef4444" />
            <h2 className="modal-title">Process Customer Sales Return (RMA)</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Select Sales Order Ref *</label>
              <select 
                className="form-control"
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  const ord = orders.find(o => o.id === e.target.value);
                  if (ord) setRefundAmount(ord.amount.toString());
                }}
                required
              >
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.id} — {o.customer} (₹{o.amount.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {currentOrder && (
              <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Order {currentOrder.id} • {currentOrder.customer}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Order Amount: ₹{currentOrder.amount.toFixed(2)} • Date: {currentOrder.date}</div>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label>Return Reason Code *</label>
                <select 
                  className="form-control"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="Defective / Damaged Goods">Defective / Damaged Goods</option>
                  <option value="Wrong Item Shipped">Wrong Item Shipped</option>
                  <option value="Customer Changed Mind">Customer Changed Mind</option>
                  <option value="Specification Discrepancy">Specification Discrepancy</option>
                </select>
              </div>

              <div className="form-group">
                <label>Credit Refund Amount (₹ INR) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={autoRestock}
                  onChange={(e) => setAutoRestock(e.target.checked)}
                  style={{ accentColor: 'var(--accent-blue)' }}
                />
                Automatically Restock Returned Items (+ Stock Level)
              </label>
            </div>

            <div className="form-group">
              <label>Return Inspection Notes / Remarks</label>
              <textarea 
                className="form-control" 
                rows="2"
                placeholder="Log physical item condition upon receipt..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <RotateCcw size={16} />
              Approve Sales Return & Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
