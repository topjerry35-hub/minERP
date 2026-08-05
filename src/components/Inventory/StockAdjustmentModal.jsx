import React, { useState, useEffect } from 'react';
import { X, Sliders, AlertCircle } from 'lucide-react';

export default function StockAdjustmentModal({ isOpen, onClose, products = [], initialProduct, onAdjustStock }) {
  const [selectedSku, setSelectedSku] = useState('');
  const [type, setType] = useState('set'); // 'add', 'subtract', 'set'
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [reason, setReason] = useState('Physical Audit Count');
  const [auditNotes, setAuditNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedSku(initialProduct?.sku || products[0]?.sku || '');
      setType('set');
      setAdjustmentQty('');
      setReason('Physical Audit Count');
      setAuditNotes('');
    }
  }, [isOpen, initialProduct, products]);

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.sku === selectedSku);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSku || adjustmentQty === '' || !selectedProduct) return;

    let newStock = selectedProduct.stock || 0;
    const qty = parseInt(adjustmentQty);

    if (type === 'add') newStock += qty;
    else if (type === 'subtract') newStock = Math.max(0, newStock - qty);
    else if (type === 'set') newStock = Math.max(0, qty);

    onAdjustStock({
      sku: selectedSku,
      newStock,
      previousStock: selectedProduct.stock || 0,
      reason,
      auditNotes,
      date: new Date().toISOString().split('T')[0]
    });

    onClose();

    // Reset all form inputs after submission
    setAdjustmentQty('');
    setReason('Physical Audit Count');
    setAuditNotes('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}>
              <Sliders size={20} />
            </div>
            <h2 className="modal-title">Inventory Stock Adjustment</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
             <div className="form-group">
              <label>Select Product SKU *</label>
              <select 
                className="form-control"
                value={selectedSku}
                onChange={(e) => {
                  setSelectedSku(e.target.value);
                  if (type === 'set') setAdjustmentQty(products.find(p => p.sku === e.target.value)?.stock || '');
                }}
                required
              >
                {products.map(p => (
                  <option key={p.sku} value={p.sku}>
                    {p.name} ({p.sku}) — Current Stock: {p.stock}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{selectedProduct.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Current Recorded Level: <strong>{selectedProduct.stock} units</strong></div>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label>Adjustment Mode</label>
                <select 
                  className="form-control"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="set">Set Exact Count (Physical Audit)</option>
                  <option value="add">Increase Stock (+ Units)</option>
                  <option value="subtract">Decrease Stock (- Units)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity / New Level *</label>
                <input 
                  type="number" 
                  min="0"
                  className="form-control" 
                  placeholder={type === 'set' ? 'New exact stock count' : 'Qty to adjust'}
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Audit Reason Code *</label>
              <select 
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="Physical Audit Count">Physical Audit Count Reconciliation</option>
                <option value="Damaged Goods">Damaged / Broken Items Written Off</option>
                <option value="Discrepancy">Stock Discrepancy Correction</option>
                <option value="Lost / Stolen">Shrinkage / Lost / Stolen</option>
                <option value="Restock Return">Customer Restock Return</option>
              </select>
            </div>

            <div className="form-group">
              <label>Audit Memo / Inspector Notes</label>
              <textarea 
                className="form-control" 
                rows="2"
                placeholder="Log details for compliance audit history..."
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Sliders size={16} />
              Save Stock Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
