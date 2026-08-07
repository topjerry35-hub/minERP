import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  Receipt, 
  Package, 
  User, 
  CheckCircle2, 
  Zap,
  Tag,
  ArrowRight
} from 'lucide-react';
import { getTodayFormatted } from '../../utils/date';
import PosReceiptModal from './PosReceiptModal';

export default function PosTerminal({ products = [], customers = [], onAddOrder }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState('Walk-in Retail Customer');
  
  // Cart state: Array of { product, qty }
  const [cart, setCart] = useState([]);
  
  // Checkout state
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState('');
  
  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const categories = ['All', 'Electronics', 'Furniture', 'Networking Hardware', 'Office Supplies'];

  // Filter products
  const query = searchQuery.toLowerCase();
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = (p.name || '').toLowerCase().includes(query) || (p.sku || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert(`Out of Stock: ${product.name} currently has 0 stock remaining.`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.sku === product.sku);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(`Maximum Stock Reached: Only ${product.stock} units available for ${product.name}.`);
          return prevCart;
        }
        return prevCart.map(item => 
          item.product.sku === product.sku 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      } else {
        return [...prevCart, { product, qty: 1 }];
      }
    });
  };

  const updateCartQty = (sku, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.sku === sku) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            alert(`Stock limit reached (${item.product.stock} units available)`);
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (sku) => {
    setCart(prev => prev.filter(item => item.product.sku !== sku));
  };

  const clearCart = () => {
    setCart([]);
    setAmountTendered('');
    setDiscountPercent(0);
  };

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.product.unitPrice * item.qty), 0);
  const discountAmount = Number((subtotal * (discountPercent / 100)).toFixed(2));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableAmount * 0.10).toFixed(2)); // 10% GST/VAT
  const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

  const tenderedVal = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, tenderedVal - grandTotal);

  // Quick cash tender preset button helper
  const handleQuickCash = (amt) => {
    setAmountTendered(String(amt));
  };

  // Complete POS Order Checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your POS Shopping Cart is empty! Please add products before checking out.');
      return;
    }

    if (paymentMethod === 'Cash' && tenderedVal > 0 && tenderedVal < grandTotal) {
      alert(`Insufficient Cash Tendered: Total is ₹${grandTotal.toFixed(2)}, but tendered amount is ₹${tenderedVal.toFixed(2)}.`);
      return;
    }

    const orderId = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = getTodayFormatted();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder = {
      id: orderId,
      customer: selectedCustomer,
      email: `${selectedCustomer.toLowerCase().replace(/[^a-z]/g, '')}@retailpos.com`,
      category: cart[0]?.product.category || 'Retail POS',
      itemsCount: cart.reduce((sum, i) => sum + i.qty, 0),
      amount: grandTotal,
      status: 'Completed',
      date: dateStr,
      items: cart.map(i => ({
        name: i.product.name,
        sku: i.product.sku,
        qty: i.qty,
        price: i.product.unitPrice
      }))
    };

    const receiptObj = {
      id: orderId,
      date: dateStr,
      time: timeStr,
      customerName: selectedCustomer,
      cashier: 'Jane Doe (Store Lead)',
      items: cart.map(i => ({
        name: i.product.name,
        sku: i.product.sku,
        qty: i.qty,
        price: i.product.unitPrice
      })),
      subtotal,
      discountPercent,
      discountAmount,
      taxAmount,
      grandTotal,
      paymentMethod,
      amountTendered: tenderedVal || grandTotal,
      changeDue
    };

    // Callback to parent Sales module to update sales state
    onAddOrder(newOrder);

    // Open Printable Receipt Modal & Reset Cart
    setCompletedReceipt(receiptObj);
    setIsReceiptOpen(true);
    clearCart();

    setToastMessage(`POS Transaction ${orderId} completed successfully!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
      {toastMessage && (
        <div style={{
          gridColumn: 'span 2',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle2 size={20} />
          {toastMessage}
        </div>
      )}

      {/* LEFT COLUMN: Products Catalog & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* POS Search Bar & Category Filter Bar */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: '240px' }}>
              <Search className="search-icon" size={16} />
              <input 
                type="text" 
                placeholder="Search catalog by SKU, product name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-shortcut">⌘F</span>
            </div>

            <div className="inventory-nav-tabs" style={{ paddingBottom: 0, borderBottom: 'none' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`inventory-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Catalog Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '16px',
          maxHeight: 'calc(100vh - 280px)',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(prod => {
              const inCart = cart.find(item => item.product.sku === prod.sku);
              const isLowStock = prod.stock > 0 && prod.stock <= 10;
              const isOutStock = prod.stock <= 0;

              return (
                <div 
                  key={prod.sku} 
                  className="kpi-card" 
                  style={{ 
                    padding: '16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justify: 'space-between',
                    position: 'relative',
                    cursor: isOutStock ? 'not-allowed' : 'pointer',
                    opacity: isOutStock ? 0.55 : 1,
                    border: inCart ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                    background: inCart ? 'var(--bg-card-hover)' : 'var(--bg-card)'
                  }}
                  onClick={() => !isOutStock && addToCart(prod)}
                >
                  {inCart && (
                    <span className="badge" style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-blue)', color: 'white' }}>
                      {inCart.qty} in Cart
                    </span>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: 'rgba(56, 189, 248, 0.15)', 
                        color: 'var(--accent-blue)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justify: 'center' 
                      }}>
                        <Package size={18} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>{prod.sku}</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{prod.category}</div>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.2' }}>
                      {prod.name}
                    </h4>
                  </div>

                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        ₹{prod.unitPrice.toFixed(2)}
                      </div>
                      <span className={`status-badge ${isOutStock ? 'out_of_stock' : isLowStock ? 'low_stock' : 'in_stock'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        {isOutStock ? 'Out of Stock' : `${prod.stock} in stock`}
                      </span>
                    </div>

                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      disabled={isOutStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod);
                      }}
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No products found matching "{searchQuery}". Try adjusting your search query or category filter.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: POS Checkout Register Panel */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', position: 'sticky', top: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} color="var(--accent-blue)" />
            <h2 className="card-title" style={{ fontSize: '1.1rem' }}>POS Register Cart</h2>
          </div>

          <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', fontSize: '0.78rem' }}>
            {cart.reduce((sum, i) => sum + i.qty, 0)} Items
          </span>
        </div>

        {/* Customer Select */}
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Customer Profile</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={16} color="var(--text-muted)" />
            <select 
              className="form-control" 
              value={selectedCustomer} 
              onChange={(e) => setSelectedCustomer(e.target.value)}
              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
            >
              <option value="Walk-in Retail Customer">Walk-in Retail Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name} ({typeof c.company === 'object' ? (c.company?.name || c.company?.code || '') : c.company})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Itemized Cart List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', paddingRight: '4px' }}>
          {cart.length > 0 ? (
            cart.map(item => (
              <div 
                key={item.product.sku} 
                style={{ 
                  background: 'var(--bg-input)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px', 
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.84rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ₹{item.product.unitPrice.toFixed(2)} each
                  </div>
                </div>

                {/* Qty Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <button 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '2px' }}
                    onClick={() => updateCartQty(item.product.sku, -1)}
                  >
                    <Minus size={12} />
                  </button>

                  <span style={{ fontWeight: '800', fontSize: '0.82rem', minWidth: '18px', textAlign: 'center' }}>
                    {item.qty}
                  </span>

                  <button 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '2px' }}
                    onClick={() => updateCartQty(item.product.sku, +1)}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div style={{ fontWeight: '800', fontSize: '0.88rem', color: 'var(--text-primary)', minWidth: '60px', textAlign: 'right' }}>
                  ₹{(item.product.unitPrice * item.qty).toFixed(2)}
                </div>

                <button 
                  style={{ background: 'transparent', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: '2px' }}
                  onClick={() => removeFromCart(item.product.sku)}
                  title="Remove from Cart"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
              Cart is currently empty.<br />Click products on the left to add items.
            </div>
          )}
        </div>

        {/* Financial Summary & Payment options */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal:</span>
            <span style={{ fontWeight: '700' }}>₹{subtotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Discount (%):</span>
            <input 
              type="number" 
              min="0" 
              max="50" 
              className="form-control" 
              style={{ width: '70px', padding: '2px 6px', fontSize: '0.8rem', textAlign: 'right' }} 
              value={discountPercent} 
              onChange={(e) => setDiscountPercent(Math.max(0, Math.min(50, parseFloat(e.target.value) || 0)))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Tax (10% GST):</span>
            <span style={{ fontWeight: '700' }}>+₹{taxAmount.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
            <span>Total:</span>
            <span style={{ color: 'var(--accent-blue)' }}>₹{grandTotal.toFixed(2)}</span>
          </div>

          {/* Payment Method Selector */}
          <div style={{ marginTop: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PAYMENT METHOD</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { name: 'Cash', icon: DollarSign },
                { name: 'Card', icon: CreditCard },
                { name: 'UPI / Mobile', icon: Smartphone }
              ].map(m => {
                const IconComp = m.icon;
                const isSelected = paymentMethod === m.name;
                return (
                  <button
                    key={m.name}
                    className={`inventory-tab-btn ${isSelected ? 'active' : ''}`}
                    style={{ padding: '6px 4px', fontSize: '0.75rem', justifyContent: 'center' }}
                    onClick={() => setPaymentMethod(m.name)}
                  >
                    <IconComp size={14} />
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tendered Input & Change Due */}
          {paymentMethod === 'Cash' && (
            <div style={{ background: 'var(--bg-input)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Cash Tendered:</span>
                <input 
                  type="number" 
                  placeholder={`e.g. ${grandTotal}`} 
                  className="form-control"
                  style={{ width: '100px', padding: '4px 8px', fontSize: '0.82rem', textAlign: 'right' }}
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                />
              </div>

              {/* Preset Buttons */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                {[grandTotal, 200, 500, 1000, 2000].map((amt, idx) => (
                  <button
                    key={idx}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '2px 0', fontSize: '0.68rem', justifyContent: 'center' }}
                    onClick={() => handleQuickCash(amt)}
                  >
                    {amt === grandTotal ? 'Exact' : `₹${amt}`}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', color: changeDue > 0 ? 'var(--status-success)' : 'var(--text-muted)' }}>
                <span>Change Due:</span>
                <span>₹{changeDue.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button 
              className="btn-secondary" 
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={clearCart}
            >
              Clear
            </button>

            <button 
              className="btn-primary" 
              style={{ 
                flex: 2, 
                justify: 'center', 
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
              onClick={handleCheckout}
            >
              <Zap size={16} />
              Complete Sale (₹{grandTotal.toFixed(2)})
            </button>
          </div>
        </div>
      </div>

      {/* POS Printable Receipt Voucher Modal */}
      <PosReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={completedReceipt}
      />
    </div>
  );
}
