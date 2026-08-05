import React from 'react';
import { X, Printer, PackageCheck, User, MapPin, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { formatDate } from '../utils/date';

export default function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="modal-title">Order Details: {order.id}</h2>
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Placed on {formatDate(order.date)} at {order.time || '10:42 AM'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Customer & Shipping Summary Grid */}
          <div className="grid-2">
            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '8px', color: 'var(--accent-blue)' }}>
                <User size={16} />
                Customer Information
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{order.customer}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.email}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+1 (555) 234-8900</div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '8px', color: 'var(--status-success)' }}>
                <MapPin size={16} />
                Shipping Details
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{order.shippingAddress || '742 Evergreen Terrace, Suite 4B'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Method: Express Cargo Logistics</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tracking: TRK-98230198</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div style={{ fontWeight: '700', marginBottom: '10px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Purchased Line Items</div>
            <div className="table-responsive" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sku}</td>
                        <td>{item.qty}</td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>
                          ₹{(item.qty * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Default Order Items Breakdown ({order.itemsCount || 2} items)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals Calculation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '260px', background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span>₹{(order.amount * 0.9).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                <span>Tax (10% GST):</span>
                <span>₹{(order.amount * 0.1).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '10px', color: 'var(--text-muted)' }}>
                <span>Shipping:</span>
                <span style={{ color: 'var(--status-success)' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '800', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', color: 'var(--text-primary)' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--accent-blue)' }}>₹{order.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment Progress Status */}
          <div style={{ background: 'var(--bg-input)', padding: '14px 20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Order Status Workflow</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)', fontSize: '0.8rem', fontWeight: '600' }}>
                <CheckCircle size={16} /> Placed
              </div>
              <div style={{ height: '2px', flex: 1, background: 'var(--status-success)', margin: '0 8px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)', fontSize: '0.8rem', fontWeight: '600' }}>
                <CheckCircle size={16} /> Paid
              </div>
              <div style={{ height: '2px', flex: 1, background: order.status === 'Completed' || order.status === 'Shipped' ? 'var(--status-success)' : 'var(--border-color)', margin: '0 8px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: order.status === 'Completed' || order.status === 'Shipped' ? 'var(--status-success)' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
                <PackageCheck size={16} /> Dispatched
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => alert(`Printing Commercial Invoice for ${order.id}`)}>
            <Printer size={16} />
            Print Invoice
          </button>
          {order.status !== 'Completed' && (
            <button className="btn-primary" onClick={() => onUpdateStatus(order.id, 'Completed')}>
              <PackageCheck size={16} />
              Mark as Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
