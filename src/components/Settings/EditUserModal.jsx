import React, { useState, useEffect } from 'react';
import { X, UserCheck, ShieldCheck, Save, Lock, Building2, MapPin, CheckCircle2 } from 'lucide-react';

export default function EditUserModal({ 
  isOpen, 
  onClose, 
  onSave, 
  userToEdit = null, 
  roles = [], 
  companies = [], 
  offices = [] 
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [company, setCompany] = useState('');
  const [office, setOffice] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Active');
  const [customPermissionsEnabled, setCustomPermissionsEnabled] = useState(false);

  const availableModules = [
    { id: 'dashboard', label: 'Executive Dashboard & Overview' },
    { id: 'sales', label: 'Sales Orders, Invoicing & POS' },
    { id: 'inventory', label: 'Inventory Master & Stock Control' },
    { id: 'accounting', label: 'General Ledger & Financial Accounting' },
    { id: 'purchasing', label: 'Purchase Orders & Supplier Vendors' },
    { id: 'hr', label: 'HR Directory, Payroll & Leave Management' },
    { id: 'crm', label: 'CRM Pipeline, Leads & Accounts' },
    { id: 'reports', label: 'Business Analytics & Financial Audits' },
    { id: 'settings', label: 'System Configuration & Admin Settings' },
  ];

  const [permissions, setPermissions] = useState({
    dashboard: true,
    sales: true,
    inventory: true,
    accounting: false,
    purchasing: false,
    hr: false,
    crm: true,
    reports: false,
    settings: false,
  });

  const getRolePermissions = (roleName) => {
    const foundRole = roles.find(r => r.name === roleName);
    if (foundRole) {
      const perms = typeof foundRole.permissions === 'string' 
        ? JSON.parse(foundRole.permissions || '[]') 
        : foundRole.permissions;
      return perms || [];
    }
    if (roleName === 'Admin') return availableModules.map(m => m.id);
    if (roleName === 'Manager') return ['dashboard', 'sales', 'inventory', 'purchasing', 'crm', 'reports'];
    if (roleName === 'Employee') return ['dashboard', 'sales', 'crm'];
    return ['dashboard', 'sales'];
  };

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setRole(userToEdit.role || 'Employee');
      setCompany(userToEdit.company || (companies[0]?.name || 'minERP Enterprise HQ'));
      setOffice(userToEdit.office || (offices[0]?.name || 'New York Main HQ'));
      setTitle(userToEdit.title || userToEdit.role || 'Operations Specialist');
      setStatus(userToEdit.status || 'Active');

      let userPerms = [];
      if (userToEdit.permissions) {
        userPerms = typeof userToEdit.permissions === 'string'
          ? JSON.parse(userToEdit.permissions)
          : userToEdit.permissions;
        setCustomPermissionsEnabled(true);
      } else {
        userPerms = getRolePermissions(userToEdit.role || 'Employee');
        setCustomPermissionsEnabled(false);
      }

      const initialPerms = {};
      availableModules.forEach(mod => {
        initialPerms[mod.id] = userPerms.includes(mod.id);
      });
      setPermissions(initialPerms);
    }
  }, [userToEdit, isOpen]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (!customPermissionsEnabled) {
      const defaultPerms = getRolePermissions(newRole);
      const updated = {};
      availableModules.forEach(mod => {
        updated[mod.id] = defaultPerms.includes(mod.id);
      });
      setPermissions(updated);
    }
  };

  const handleTogglePermission = (modId) => {
    setCustomPermissionsEnabled(true);
    setPermissions(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleSelectAll = (select) => {
    setCustomPermissionsEnabled(true);
    const updated = {};
    availableModules.forEach(mod => {
      updated[mod.id] = select;
    });
    setPermissions(updated);
  };

  const handleResetToRoleDefault = () => {
    setCustomPermissionsEnabled(false);
    const defaultPerms = getRolePermissions(role);
    const updated = {};
    availableModules.forEach(mod => {
      updated[mod.id] = defaultPerms.includes(mod.id);
    });
    setPermissions(updated);
  };

  if (!isOpen || !userToEdit) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    const activePermsList = Object.keys(permissions).filter(k => permissions[k]);

    const updatedUser = {
      ...userToEdit,
      name,
      email,
      role,
      company,
      office,
      title,
      status,
      permissions: customPermissionsEnabled ? JSON.stringify(activePermsList) : null
    };

    onSave(updatedUser);
    onClose();

    // Reset inputs after submission
    setName('');
    setEmail('');
    setTitle('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={24} color="var(--accent-blue)" />
            <div>
              <h2 className="modal-title">Set Role & Custom Permissions</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Managing user: <strong style={{ color: 'var(--text-primary)' }}>{userToEdit.name}</strong> ({userToEdit.id})
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label>User Full Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Work Email Address *</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>System Role Assignment *</label>
                <select 
                  className="form-control"
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <option value="Admin">Admin (Full System Access)</option>
                  <option value="Manager">Manager (Standard Management Scope)</option>
                  <option value="Employee">Employee (Standard Staff Scope)</option>
                  {roles.filter(r => !['Admin', 'Manager', 'Employee'].includes(r.name)).map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Job Title / Designation</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Senior Financial Accountant"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Assigned Company</label>
                <select 
                  className="form-control"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Office / Branch</label>
                <select 
                  className="form-control"
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                >
                  {offices.map(o => (
                    <option key={o.id} value={o.name}>{o.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Account Access Status</label>
              <select 
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active (Granted Access)</option>
                <option value="Inactive">Inactive (Suspended / Disabled Access)</option>
              </select>
            </div>

            {/* Granular Module Permissions */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <label style={{ fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Granted Module Access Permissions ({Object.values(permissions).filter(Boolean).length}/{availableModules.length})
                  </label>
                  {customPermissionsEnabled && (
                    <span className="badge" style={{ marginLeft: '8px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.7rem' }}>
                      User Override Active
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem' }}>
                  <button 
                    type="button" 
                    onClick={() => handleSelectAll(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Select All
                  </button>
                  <span style={{ color: 'var(--text-muted)' }}>|</span>
                  <button 
                    type="button" 
                    onClick={() => handleSelectAll(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Deselect All
                  </button>
                  <span style={{ color: 'var(--text-muted)' }}>|</span>
                  <button 
                    type="button" 
                    onClick={handleResetToRoleDefault}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Reset to Role Defaults
                  </button>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '8px', 
                background: 'var(--bg-input)', 
                padding: '14px 16px', 
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {availableModules.map(mod => (
                  <label key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <input 
                      type="checkbox" 
                      checked={!!permissions[mod.id]}
                      onChange={() => handleTogglePermission(mod.id)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
                    />
                    {mod.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              Save Role & Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
