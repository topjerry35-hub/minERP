import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Zap, CheckCircle2, DollarSign, Calculator, Layers, ShieldCheck } from 'lucide-react';
import { fetchProducts } from '../services/api';

export default function NewSaleModal({ 
  isOpen, 
  onClose, 
  onAddOrder, 
  isDirectMode = false, 
  customers = [],
  products = []
}) {
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [isDirectSale, setIsDirectSale] = useState(isDirectMode);
  const [customer, setCustomer] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Electronics');

  // Multi-line Itemized Cart (Default 1st product selected)
  const [items, setItems] = useState([]);

  // Tax & Discount controls (empty string or number allowed for clean typing)
  const [discountPercent, setDiscountPercent] = useState('');
  const [gstPercent, setGstPercent] = useState(18); // Default 18% Indian GST slab rate
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [status, setStatus] = useState('Completed');
  const [autoInvoice, setAutoInvoice] = useState(true);

  // Compute active catalog products dynamically from database
  const activeProducts = (products && products.length > 0) ? products : fetchedProducts;
  const defaultProducts = activeProducts;

  // Load database products on modal open if products prop is not provided
  useEffect(() => {
    let isMounted = true;
    if (isOpen && (!products || products.length === 0) && fetchedProducts.length === 0) {
      fetchProducts().then(prods => {
        if (isMounted && prods && prods.length > 0) {
          setFetchedProducts(prods);
        }
      });
    }
    return () => { isMounted = false; };
  }, [isOpen, products, fetchedProducts.length]);

  // Reset/Initialize form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsDirectSale(isDirectMode);
      if (customers.length > 0 && !customer) {
        setCustomer(customers[0].name);
      }
      
      if (items.length === 0) {
        setItems([
          {
            sku: '',
            name: '',
            qty: 1,
            unitPrice: ''
          }
        ]);
      }

      if (isDirectMode) {
        setStatus('Completed');
        setAutoInvoice(true);
      }
    }
  }, [isOpen, isDirectMode]);

  if (!isOpen) return null;

  // Add line item with empty placeholder state
  const handleAddItem = () => {
    setItems(prev => [...prev, {
      sku: '',
      name: '',
      qty: 1,
      unitPrice: ''
    }]);
  };

  // Remove line item
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update item row & autofill details on SKU/Name typing or dropdown selection
  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        if (field === 'sku' || field === 'name') {
          const matchedProd = defaultProducts.find(
            p => (p.sku || '').toLowerCase() === (value || '').toLowerCase() || 
                 (p.name || '').toLowerCase() === (value || '').toLowerCase() ||
                 p.sku === value || p.name === value
          );
          if (matchedProd) {
            return {
              ...item,
              sku: matchedProd.sku,
              name: matchedProd.name,
              unitPrice: matchedProd.unitPrice !== undefined 
                ? matchedProd.unitPrice 
                : (matchedProd.price !== undefined ? matchedProd.price : 100.00)
            };
          }
          return { ...item, name: value, sku: value };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Financial Calculations
  const numericDiscount = parseFloat(discountPercent) || 0;
  const numericGst = parseFloat(gstPercent) || 0;

  const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.qty || 0) * parseFloat(i.unitPrice || 0)), 0);
  const discountAmount = Number((subtotal * (numericDiscount / 100)).toFixed(2));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstAmount = Number((taxableAmount * (numericGst / 100)).toFixed(2));
  const grandTotal = Number((taxableAmount + gstAmount).toFixed(2));

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCustomer = customer === 'Custom' || !customer ? (customCustomerName || 'Walk-in Retail Customer') : customer;
    if (!finalCustomer || items.length === 0) return;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      customer: finalCustomer,
      email: email || `${finalCustomer.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
      category,
      itemsCount: items.reduce((sum, i) => sum + parseInt(i.qty || 1), 0),
      subtotal,
      discountPercent: numericDiscount,
      discountAmount,
      gstPercent: numericGst,
      gstAmount,
      amount: grandTotal,
      paymentMethod: isDirectSale ? paymentMethod : undefined,
      status: isDirectSale ? 'Completed' : status,
      date: new Date().toISOString().split('T')[0],
      autoInvoice: isDirectSale ? autoInvoice : false,
      items: items.map(i => ({
        sku: i.sku,
        name: i.name,
        qty: parseInt(i.qty || 1),
        price: parseFloat(i.unitPrice || 0)
      }))
    };

    onAddOrder(newOrder);
    onClose();

    // Reset form
    setCustomCustomerName('');
    setDiscountPercent('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <div className="modal-header" style={{ background: isDirectSale ? 'linear-gradient(135deg, #059669, #10b981)' : undefined, color: isDirectSale ? '#ffffff' : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDirectSale ? <Zap size={20} color="#fbbf24" /> : <Layers size={20} color="var(--accent-blue)" />}
            <h2 className="modal-title" style={{ color: isDirectSale ? '#ffffff' : undefined }}>
              {isDirectSale ? '⚡ Record Direct Sale (Itemized Invoice & GST)' : 'Create Itemized Sales Order'}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} style={{ color: isDirectSale ? '#ffffff' : undefined }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
            {/* Mode Switch Banner */}
            <div style={{
              background: isDirectSale ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-input)',
              border: `1px solid ${isDirectSale ? '#10b981' : 'var(--border-color)'}`,
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '600' }}>
                <Zap size={16} color={isDirectSale ? '#10b981' : 'var(--text-muted)'} />
                <span>{isDirectSale ? 'Direct Sale Mode (Instant Paid Billing & Auto-GST Calculation)' : 'Standard ERP Order Mode (Itemized Quote & Fulfillment)'}</span>
              </div>

              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '3px 8px', fontSize: '0.75rem', borderColor: isDirectSale ? '#10b981' : undefined }}
                onClick={() => setIsDirectSale(!isDirectSale)}
              >
                Switch to {isDirectSale ? 'Standard Order' : '⚡ Direct Sale'}
              </button>
            </div>

            {/* Customer & General Header Details */}
            <div className="grid-2">
              <div className="form-group">
                <label>Select Customer *</label>
                <select 
                  className="form-control"
                  value={customer}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    setCustomer(selectedName);
                    const matchedCustomer = customers.find(c => c.name === selectedName);
                    if (matchedCustomer && matchedCustomer.email) {
                      setEmail(matchedCustomer.email);
                    } else if (selectedName === 'Walk-in Retail Customer') {
                      setEmail('retail.customer@minerp.io');
                    }
                  }}
                >
                  <option value="Walk-in Retail Customer">Walk-in Retail Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.company || 'Enterprise'})</option>
                  ))}
                  <option value="Custom">+ Enter Walk-in / Custom Name</option>
                </select>
              </div>

              {customer === 'Custom' ? (
                <div className="form-group">
                  <label>Walk-in Customer Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Acme Corp / Sarah Connor"
                    value={customCustomerName}
                    onChange={(e) => setCustomCustomerName(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Customer Contact Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Itemized Line Items Table */}
            <div style={{ marginTop: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Sale Line Items ({items.length})
                </label>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ padding: '3px 10px', fontSize: '0.78rem', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }} 
                  onClick={handleAddItem}
                >
                  <Plus size={14} /> Add Item Line
                </button>
              </div>

              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', paddingRight: '28px' }}>
                  <span style={{ flex: 3 }}>PRODUCT / SKU</span>
                  <span style={{ width: '75px', textAlign: 'center' }}>QTY</span>
                  <span style={{ width: '100px', textAlign: 'right' }}>UNIT PRICE</span>
                  <span style={{ width: '100px', textAlign: 'right' }}>TOTAL</span>
                </div>

                {items.map((item, idx) => {
                  const lineTotal = (parseFloat(item.qty || 0) * parseFloat(item.unitPrice || 0)).toFixed(2);
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 3, position: 'relative' }}>
                        <input 
                          type="text" 
                          list={`sale-product-list-${idx}`}
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
                        <datalist id={`sale-product-list-${idx}`}>
                          {defaultProducts.map(p => (
                            <option key={p.sku} value={p.name}>
                              {p.sku} — ₹{(p.unitPrice || p.price || 0).toFixed(2)}{p.stock !== undefined ? ` (Stock: ${p.stock})` : ''}
                            </option>
                          ))}
                        </datalist>
                      </div>

                      <input 
                        type="number" 
                        min="1" 
                        className="form-control" 
                        style={{ width: '75px', textAlign: 'center', fontSize: '0.82rem' }}
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        required
                      />

                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        className="form-control" 
                        style={{ width: '100px', textAlign: 'right', fontSize: '0.82rem' }}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        required
                      />

                      <div style={{ width: '100px', textAlign: 'right', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        ₹{lineTotal}
                      </div>

                      <button 
                        type="button" 
                        style={{ background: 'transparent', border: 'none', color: items.length <= 1 ? 'var(--text-muted)' : 'var(--status-danger)', cursor: items.length <= 1 ? 'not-allowed' : 'pointer', padding: '2px' }}
                        disabled={items.length <= 1}
                        onClick={() => handleRemoveItem(idx)}
                        title="Delete Row"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Calculations Section (Subtotal, Discount, GST/Tax, Grand Total) */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Discount Rate (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="50"
                      placeholder="0"
                      className="form-control" 
                      style={{ fontSize: '0.82rem' }}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>GST / Tax Rate (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="30"
                      placeholder="18"
                      className="form-control" 
                      style={{ fontSize: '0.82rem' }}
                      value={gstPercent}
                      onChange={(e) => setGstPercent(e.target.value)}
                    />
                  </div>
                </div>

                {/* Subtotal & GST Summary Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>Items Subtotal:</span>
                    <span style={{ fontWeight: '700' }}>₹{subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--status-success)' }}>
                      <span>Discount ({numericDiscount}%):</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>GST / Tax ({numericGst}%):</span>
                    <span style={{ fontWeight: '700' }}>+₹{gstAmount.toFixed(2)}</span>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justify: 'space-between', 
                    fontSize: '1.2rem', 
                    fontWeight: '800', 
                    color: 'var(--text-primary)', 
                    borderTop: '2px solid var(--border-color)', 
                    paddingTop: '6px',
                    marginTop: '4px'
                  }}>
                    <span>Grand Total:</span>
                    <span style={{ color: isDirectSale ? '#10b981' : 'var(--accent-blue)' }}>
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Fulfillment Settings */}
            <div className="grid-2">
              {isDirectSale ? (
                <div className="form-group">
                  <label>Payment Tender Method</label>
                  <select 
                    className="form-control"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Cash">Cash Payment</option>
                    <option value="Credit Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Direct Bank Wire</option>
                    <option value="UPI / Mobile">UPI / Mobile Money</option>
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label>Fulfillment Status</label>
                  <select 
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Completed">Completed (Paid)</option>
                    <option value="Processing">Processing (In Assembly)</option>
                    <option value="Pending">Pending Payment</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Product Category</label>
                <select 
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture & Decor</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Services">Maintenance & Services</option>
                </select>
              </div>
            </div>

            {isDirectSale && (
              <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={autoInvoice}
                    onChange={(e) => setAutoInvoice(e.target.checked)}
                  />
                  <span style={{ fontWeight: '600' }}>Auto-generate Paid Billing Invoice & GST Receipt instantly</span>
                </label>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              style={{
                background: isDirectSale ? 'linear-gradient(135deg, #059669, #10b981)' : undefined,
                boxShadow: isDirectSale ? '0 4px 14px rgba(16, 185, 129, 0.35)' : undefined
              }}
            >
              {isDirectSale ? <Zap size={16} /> : <CheckCircle2 size={16} />}
              {isDirectSale ? `Complete Direct Sale (₹${grandTotal.toFixed(2)})` : `Create Sale Order (₹${grandTotal.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
