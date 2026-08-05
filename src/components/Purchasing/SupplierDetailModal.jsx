import React from 'react';
import { X, Truck, Mail, Phone, Star, CreditCard, FileText, Calendar, Tag, UserCheck, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function SupplierDetailModal({ supplier, isOpen, onClose, onNewPo, onRecordPayment }) {
  if (!isOpen || !supplier) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Truck size={24} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>{supplier.name}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supplier ID: {supplier.id} • Approved Vendor</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '20px', paddingTop: '16px' }}>
          {/* Rating & Category Header Pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color="#3b82f6" />
              <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Category:</span>
              <span className="status-badge info">{supplier.category}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: '800', fontSize: '0.9rem' }}>
              <Star size={16} fill="#f59e0b" />
              {supplier.rating || '4.8'} / 5.0 Quality Rating
            </div>
          </div>

          {/* Contact Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={14} color="#3b82f6" />
                Primary Contact Person
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{supplier.contactPerson}</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="#10b981" />
                Payment Terms
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{supplier.paymentTerms || 'Net 30 Days'}</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="#6366f1" />
                Email Address
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{supplier.email}</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="#f59e0b" />
                Phone Number
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{supplier.phone}</div>
            </div>
          </div>

          {/* Accounts Payable / Balance Due Banner */}
          <div style={{ 
            background: supplier.balanceDue > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            border: `1px solid ${supplier.balanceDue > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Outstanding Accounts Payable</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: supplier.balanceDue > 0 ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                {formatCurrency(supplier.balanceDue)}
              </div>
            </div>

            {supplier.balanceDue > 0 ? (
              <span className="status-badge danger" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Unpaid Invoices</span>
            ) : (
              <span className="status-badge success" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Fully Settled</span>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', gap: '10px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Close
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={() => { onClose(); onNewPo(supplier); }}
            style={{ flex: 1, borderColor: '#3b82f650', color: '#3b82f6' }}
          >
            <FileText size={16} />
            + Issue PO
          </button>

          {supplier.balanceDue > 0 && (
            <button 
              className="btn-primary" 
              onClick={() => { onClose(); onRecordPayment(supplier); }}
              style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <CreditCard size={16} />
              Pay Bill
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
