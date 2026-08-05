import React from 'react';
import { X, Flame, Building2, Mail, Phone, Globe, IndianRupee, UserCheck, Calendar, Tag, MessageSquare, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function LeadDetailModal({ lead, isOpen, onClose, onConvert }) {
  if (!isOpen || !lead) return null;

  const tempColors = {
    Hot: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444', icon: '🔥' },
    Warm: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#f59e0b', icon: '⚡' },
    Cold: { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)', text: '#38bdf8', icon: '❄️' }
  };

  const currentTemp = tempColors[lead.temperature] || tempColors.Warm;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.2rem',
              color: '#f59e0b'
            }}>
              {lead.name ? lead.name.charAt(0) : 'L'}
            </div>

            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>{lead.name}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lead Reference ID: {lead.id} • Sales Inquiry</span>
            </div>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '20px', paddingTop: '16px' }}>
          {/* Temperature & Pipeline Value Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div style={{
              background: currentTemp.bg,
              border: `1px solid ${currentTemp.border}`,
              padding: '14px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Lead Intent / Score</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: currentTemp.text, marginTop: '2px' }}>
                  {currentTemp.icon} {lead.temperature} Prospect
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '14px',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Potential Deal Value</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-blue)', marginTop: '2px' }}>
                {formatCurrency(lead.estimatedValue || 0)}
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} color="#3b82f6" />
                Company / Organization
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{lead.company || 'N/A'}</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={14} color="#10b981" />
                Acquisition Channel
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{lead.source || 'Website Inquiry'}</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="#6366f1" />
                Email Contact
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{lead.email || 'N/A'}</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="#f59e0b" />
                Phone Number
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{lead.phone || 'N/A'}</div>
            </div>
          </div>

          {/* Inquiry Overview Note Card */}
          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '14px'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} color="#38bdf8" />
              Inquiry Brief & Notes
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              Prospect reached out via {lead.source || 'Website Inquiry'} requesting ERP evaluation and pricing quote for enterprise deployment. Estimated contract value at {formatCurrency(lead.estimatedValue || 0)}.
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', gap: '10px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Close
          </button>
          
          <button 
            className="btn-primary" 
            onClick={() => { onClose(); onConvert(lead); }}
            style={{ flex: 1.5, background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <UserCheck size={16} />
            Convert to Customer & Deal
          </button>
        </div>
      </div>
    </div>
  );
}
