import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Trash2, Building2, UserCheck, Calendar, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function NewPurchaseOrderModal({ isOpen, onClose, suppliers = [], products = [], targetSupplier, onCreatePo }) {
  const [supplier, setSupplier] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('2026-08-15');
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const initialSupplier = targetSupplier?.name || suppliers[0]?.name || '';
      setSupplier(initialSupplier);
      
      if (items.length === 0) {
        setItems([{ sku: '', name: '', qty: 1, unitCost: '' }]);
      }
    }
  }, [isOpen, targetSupplier, suppliers]);

  if (!isOpen) return null;

  const selectedVendorObj = suppliers.find(s => s.name === supplier) || targetSupplier;

  const handleAddItem = () => {
    setItems(prev => [...prev, { sku: '', name: '', qty: 1, unitCost: '' }]);
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
              unitCost: selectedProd.costPrice || selectedProd.unitPrice || selectedProd.price || 100.00
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
    return items.reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.unitCost || 0)), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplier || items.length === 0) return;

    const totalAmount = calculateTotal();
    const poId = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    onCreatePo({
      id: poId,
      supplier,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate,
      items,
      itemsCount: items.reduce((acc, curr) => acc + parseInt(curr.qty || 1), 0),
      totalAmount,
      status: 'Sent'
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Create Purchase Order (PO)</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label>Select Vendor / Supplier *</label>
                <select 
                  className="form-control"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  required
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Expected Delivery Date *</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Selected Vendor Information Banner */}
            {selectedVendorObj && (
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={20} color="#38bdf8" />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {selectedVendorObj.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({selectedVendorObj.id})</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Contact: {selectedVendorObj.contactPerson} • {selectedVendorObj.phone || selectedVendorObj.email}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Terms: {selectedVendorObj.paymentTerms || 'Net 30'}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: selectedVendorObj.balanceDue > 0 ? '#ef4444' : '#10b981' }}>
                    Outstanding: {formatCurrency(selectedVendorObj.balanceDue || 0)}
                  </div>
                </div>
              </div>
            )}

            {/* Line Items Builder */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Order Line Items</label>
                <button type="button" className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={handleAddItem}>
                  + Add Line
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 2, position: 'relative' }}>
                    <input 
                      type="text" 
                      list={`po-product-list-${idx}`}
                      className="form-control" 
                      style={{ fontSize: '0.82rem' }}
                      placeholder="-- Select or Search Item --"
                      value={item.name || item.sku || ''}
                      onFocus={(e) => {
                        if (e.target.value === '-- Select or Search Item --') {
                          handleItemChange(idx, 'name', '');
                        }
                      }}
                      onClick={(e) => {
                        if (e.target.value === '-- Select or Search Item --') {
                          handleItemChange(idx, 'name', '');
                        }
                      }}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      required
                    />
                    <datalist id={`po-product-list-${idx}`}>
                      {products.map(p => (
                        <option key={p.sku} value={p.name}>
                          {p.sku} — ₹{(p.costPrice || p.unitPrice || p.price || 0).toFixed(2)}
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
                  />

                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    style={{ width: '100px' }}
                    placeholder="Cost (₹)"
                    value={item.unitCost}
                    onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                  />

                  <div style={{ fontWeight: '700', width: '80px', fontSize: '0.85rem', textAlign: 'right' }}>
                    ₹{(parseFloat(item.qty || 0) * parseFloat(item.unitCost || 0)).toFixed(2)}
                  </div>

                  {items.length > 1 && (
                    <button type="button" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleRemoveItem(idx)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Total Order Value: <span style={{ color: 'var(--accent-blue)' }}>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={16} />
              Issue Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
