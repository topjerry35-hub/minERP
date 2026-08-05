import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, PackageMinus } from 'lucide-react';

export default function StockOutModal({ isOpen, onClose, products, onStockOut }) {
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('Customer Order');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedSku('');
      setQuantity(1);
      setDestination('');
      setReason('Customer Order');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.sku === selectedSku);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSku || quantity <= 0) return;

    if (selectedProduct && parseInt(quantity) > selectedProduct.currentStock) {
      setError(`Cannot dispatch ${quantity} units. Only ${selectedProduct.currentStock} units available in stock.`);
      return;
    }

    onStockOut({
      sku: selectedSku,
      quantity: parseInt(quantity),
      destination: destination || 'Warehouse Dispatch',
      reason,
      date: new Date().toISOString().split('T')[0]
    });

    onClose();

    // Reset all form inputs after submission
    setQuantity(1);
    setDestination('');
    setReason('Customer Order');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'var(--status-danger-bg)', color: 'var(--status-danger)' }}>
              <ArrowUpRight size={20} />
            </div>
            <h2 className="modal-title">Stock Out (Issue / Dispatch Inventory)</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Select Product SKU *</label>
              <select 
                className="form-control"
                value={selectedSku}
                onChange={(e) => {
                  setSelectedSku(e.target.value);
                  setError('');
                }}
                required
              >
                <option value="">-- Select Product SKU --</option>
                {products.map(p => (
                  <option key={p.sku} value={p.sku}>
                    {p.name} ({p.sku}) — In Stock: {p.currentStock} units
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{selectedProduct.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Current Available Stock: <strong>{selectedProduct.currentStock} units</strong></div>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label>Quantity to Dispatch (- Units) *</label>
                <input 
                  type="number" 
                  min="1"
                  className="form-control" 
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Issue Purpose / Reason</label>
                <select 
                  className="form-control"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="Customer Order">Customer Order Fulfillment</option>
                  <option value="Internal Transfer">Internal Department Transfer</option>
                  <option value="Production Use">Production / Assembly Line</option>
                  <option value="Sample / Demo">Sample / Marketing Demo</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Destination / Recipient Reference</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Order #ORD-9842 / Seattle Regional Lab"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <PackageMinus size={16} />
              Confirm Stock Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
