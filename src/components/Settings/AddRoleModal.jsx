import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Save } from 'lucide-react';

export default function AddRoleModal({ isOpen, onClose, onSave, companies = [], editingRole = null }) {
  const [companyId, setCompanyId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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

  const availableModules = [
    { id: 'dashboard', label: 'Executive Dashboard & Financial Overview' },
    { id: 'sales', label: 'Sales Orders, Invoicing & Payments' },
    { id: 'inventory', label: 'Inventory Master, Stock Control & SKUs' },
    { id: 'accounting', label: 'General Ledger, Chart of Accounts & Journals' },
    { id: 'purchasing', label: 'Purchase Orders & Supplier Management' },
    { id: 'hr', label: 'HR Directory, Payroll & Leave Requests' },
    { id: 'crm', label: 'CRM Pipeline, Leads & Customer Accounts' },
    { id: 'reports', label: 'Analytics, Financial Reports & Audits' },
    { id: 'settings', label: 'System Configuration & User Management' },
  ];

  useEffect(() => {
    if (editingRole) {
      setCompanyId(editingRole.companyId || (companies[0]?.id || ''));
      setName(editingRole.name || '');
      setDescription(editingRole.description || '');
      
      const parsedPerms = typeof editingRole.permissions === 'string' 
        ? JSON.parse(editingRole.permissions || '[]') 
        : editingRole.permissions || [];
        
      const newPerms = { ...permissions };
      availableModules.forEach(mod => {
        newPerms[mod.id] = parsedPerms.includes(mod.id);
      });
      setPermissions(newPerms);
    } else {
      setCompanyId(companies[0]?.id || '');
      setName('');
      setDescription('');
      setPermissions({
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
    }
  }, [editingRole, companies, isOpen]);

  if (!isOpen) return null;

  const handleTogglePermission = (modId) => {
    setPermissions(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleSelectAll = (select) => {
    const updated = {};
    availableModules.forEach(mod => {
      updated[mod.id] = select;
    });
    setPermissions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const activePermList = Object.keys(permissions).filter(k => permissions[k]);

    const roleData = {
      id: editingRole ? editingRole.id : `ROL-${Math.floor(100 + Math.random() * 900)}`,
      companyId: companyId || (companies[0]?.id || null),
      name,
      description: description || 'Custom enterprise access level',
      permissions: JSON.stringify(activePermList),
      isSystemRole: false
    };

    onSave(roleData);
    onClose();

    // Reset inputs after submission
    setName('');
    setDescription('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="var(--accent-indigo)" />
            <h2 className="modal-title">{editingRole ? 'Edit Company Role' : 'Create Custom Role & Permissions'}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label>Role Name / Access Title *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Branch Inventory Manager"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Parent Company Scope</label>
                <select 
                  className="form-control"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                >
                  <option value="">All Companies (Global Scope)</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Role Description</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Brief summary of duties and granted module permissions"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Granted Module Permissions ({Object.values(permissions).filter(Boolean).length}/{availableModules.length})
                </label>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem' }}>
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
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(1, 1fr)', 
                gap: '8px', 
                background: 'var(--bg-input)', 
                padding: '12px 16px', 
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                {availableModules.map(mod => (
                  <label key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <input 
                      type="checkbox" 
                      checked={!!permissions[mod.id]}
                      onChange={() => handleTogglePermission(mod.id)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--accent-indigo)', cursor: 'pointer' }}
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
              {editingRole ? 'Update Role' : 'Save Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
