import React from 'react';
import { X, User, Briefcase, Mail, Phone, Calendar, CreditCard, ShieldAlert } from 'lucide-react';

import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function EmployeeProfileModal({ employee, onClose }) {
  if (!employee) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar" style={{ width: '44px', height: '44px', fontSize: '1.1rem' }}>
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="modal-title">{employee.name}</h2>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{employee.role} • {employee.department}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '16px' }}>
          {/* General info grid */}
          <div className="grid-2">
            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#3b82f6', marginBottom: '8px' }}>
                <Briefcase size={16} /> Employment Details
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>ID: <strong style={{ color: 'var(--text-primary)' }}>{employee.id}</strong></div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Hire Date: <strong style={{ color: 'var(--text-primary)' }}>{formatDate(employee.hireDate)}</strong></div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Salary: <strong style={{ color: '#10b981' }}>{formatCurrency(employee.salary)}/yr</strong></div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#8b5cf6', marginBottom: '8px' }}>
                <Mail size={16} /> Contact Information
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Email: <strong style={{ color: 'var(--text-primary)' }}>{employee.email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@minerp.com`}</strong></div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Phone: <strong style={{ color: 'var(--text-primary)' }}>{employee.phone || '+1 (555) 492-1092'}</strong></div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#f59e0b', marginBottom: '8px' }}>
              <ShieldAlert size={16} /> Emergency Contact
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{employee.emergencyContact || 'Mary Doe (Spouse)'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contact Phone: +1 (555) 998-1122</div>
          </div>

          {/* Payroll Direct Deposit */}
          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#10b981', marginBottom: '8px' }}>
              <CreditCard size={16} /> Direct Deposit Bank Account
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>Wells Fargo Bank Direct Deposit</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Routing: 121000248 • Account #: •••• 9821</div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
}
