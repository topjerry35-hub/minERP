import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Trash2 } from 'lucide-react';

export default function NewQuotationModal({ isOpen, onClose, customers = [], products = [], onCreateQuotation }) {
  const [customer, setCustomer] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialCustomer = customers[0]?.name || '';
      setCustomer(initialCustomer);

      // Default validUntil to 30 days from today
      const today = new Date();
      today.setDate(today.getDate() + 30);
      setValidUntil(today.toISOString().split('T')[0]);

      const initialSku = products[0]?.sku || products[0]?.name || '';
      const initialName = products[0]?.name || products[0]?.sku || '';
      const initialPrice = products[0]?.unitPrice || products[0]?.price || 100.00;

      setItems([
        { sku: initialSku, name: initialName, qty: 1, unitPrice: initialPrice }
      ]);
      setValidationError('');
    }
  }, [isOpen, customers, products]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const firstSku = products[0]?.sku || products[0]?.name || '';
    const firstPrice = products[0]?.unitPrice || products[0]?.price || 100.00;
    const firstName = products[0]?.name || '';
    setItems(prev => [...prev, { sku: firstSku, name: firstName, qty: 1, unitPrice: firstPrice }]);
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        if (field === 'sku' || field === 'name') {
          const selectedProd = products.find(
            p => (p.sku || '').toLowerCase() === (value || '').toLowerCase() || 
                 (p.name || '').toLowerCase() === (value || '').toLowerCase() ||
                 p.sku === value || p.name === value
          );
          if (selectedProd) {
            return {
              ...item,
              sku: selectedProd.sku,
              name: selectedProd.name,
              unitPrice: selectedProd.unitPrice || selectedProd.price || 100.00
            };
          }
          return { ...item, name: value, sku: value };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.unitPrice || 0)), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmedCustomer = (customer || '').trim();
    if (!trimmedCustomer) {
      setValidationError('Please select or enter a Customer Name for this quotation.');
      return;
    }

    if (items.length === 0) {
      setValidationError('Please add at least one line item to the quotation.');
      return;
    }

    const validItems = items.map(item => {
      const pName = item.name || item.sku || 'Quoted Product / Item';
      const pSku = item.sku || item.name || `SKU-${Date.now()}`;
      return {
        sku: pSku,
        name: pName,
        qty: parseInt(item.qty) || 1,
        unitPrice: parseFloat(item.unitPrice) || 0
      };
    });

    const amount = calculateTotal();
    const qtnId = `QTN-2026-${Math.floor(100 + Math.random() * 900)}`;

    onCreateQuotation({
      id: qtnId,
      customer: trimmedCustomer,
      date: new Date().toISOString().split('T')[0],
      validUntil: validUntil || new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      items: validItems,
      amount,
      status: 'Sent'
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Create Price Quotation / Proposal</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {validationError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: '600' }}>
                ⚠️ {validationError}
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label>Select or Enter Customer *</label>
                <input 
                  type="text" 
                  list="qtn-customer-datalist"
                  className="form-control"
                  placeholder="Type or select Customer Name"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  required
                />
                <datalist id="qtn-customer-datalist">
                  {customers.map(c => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.company ? `${c.name} (${typeof c.company === 'object' ? (c.company.name || c.company.code || '') : c.company})` : c.name}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label>Quotation Expiration Date *</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Line Items Builder */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Quote Items</label>
                <button type="button" className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={handleAddItem}>
                  + Add Line
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 2, position: 'relative' }}>
                    <input 
                      type="text" 
                      list={`qtn-product-list-${idx}`}
                      className="form-control" 
                      style={{ fontSize: '0.82rem' }}
                      placeholder="-- Select or Search Item --"
                      value={item.name || item.sku || ''}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      required
                    />
                    <datalist id={`qtn-product-list-${idx}`}>
                      {products.map(p => (
                        <option key={p.sku} value={p.name}>
                          {p.sku} — ₹{(p.unitPrice || p.price || 0).toFixed(2)}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <input 
                    type="number" 
                    min="1" 
                    className="form-control" 
                    style={{ width: '80px' }}
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                    required
                  />

                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    style={{ width: '100px' }}
                    placeholder="Price (₹)"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    required
                  />

                  <div style={{ fontWeight: '700', width: '80px', fontSize: '0.85rem', textAlign: 'right' }}>
                    ₹{(parseFloat(item.qty || 0) * parseFloat(item.unitPrice || 0)).toFixed(2)}
                  </div>

                  {items.length > 1 && (
                    <button type="button" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleRemoveItem(idx)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Quote Total: <span style={{ color: 'var(--accent-blue)' }}>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={16} />
              Issue Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
