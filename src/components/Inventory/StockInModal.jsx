import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, PackagePlus } from 'lucide-react';

export default function StockInModal({ isOpen, onClose, products, onStockIn }) {
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [supplier, setSupplier] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [batchNumber, setBatchNumber] = useState(`BATCH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedSku('');
      setQuantity(10);
      setSupplier('');
      setCostPrice('');
      setBatchNumber(`BATCH-${Math.floor(1000 + Math.random() * 9000)}`);
      setNotes('');
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSku || quantity <= 0) return;

    onStockIn({
      sku: selectedSku,
      quantity: parseInt(quantity),
      supplier: supplier || 'Primary Vendor',
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      batchNumber,
      notes,
      date: new Date().toISOString().split('T')[0]
    });

    onClose();

    // Reset all form inputs after submission
    setQuantity(10);
    setSupplier('');
    setCostPrice('');
    setBatchNumber(`BATCH-${Math.floor(1000 + Math.random() * 9000)}`);
    setNotes('');
  };

  const selectedProduct = products.find(p => p.sku === selectedSku);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'var(--status-success-bg)', color: 'var(--status-success)' }}>
              <ArrowDownRight size={20} />
            </div>
            <h2 className="modal-title">Stock In (Receive Inventory)</h2>
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
                  const sku = e.target.value;
                  setSelectedSku(sku);
                  const prod = products.find(p => p.sku === sku);
                  if (prod && (prod.costPrice || prod.unitPrice)) {
                    setCostPrice((prod.costPrice || prod.unitPrice).toString());
                  }
                }}
                required
              >
                <option value="">-- Select Product SKU --</option>
                {products.map(p => (
                  <option key={p.sku} value={p.sku}>
                    {p.name} ({p.sku}) — Current Stock: {p.currentStock}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{selectedProduct.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Current Level: <strong>{selectedProduct.currentStock} units</strong> • Reorder Point: {selectedProduct.minThreshold}</div>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label>Quantity to Receive (+ Units) *</label>
                <input 
                  type="number" 
                  min="1"
                  className="form-control" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Unit Purchase Cost (₹ INR)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  placeholder="e.g. 45.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Supplier / Vendor Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Dell Enterprise Direct"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Batch / Lot Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Receiving Notes / PO Reference</label>
              <textarea 
                className="form-control" 
                rows="2"
                placeholder="e.g. PO-88392 shipment arrived in good condition"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <PackagePlus size={16} />
              Confirm Stock Intake
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
