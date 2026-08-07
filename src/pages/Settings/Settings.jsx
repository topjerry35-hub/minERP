import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  ShieldCheck, 
  Database, 
  Save, 
  CheckCircle2, 
  Users, 
  Plus, 
  X, 
  UserCheck, 
  Lock, 
  Percent, 
  Upload, 
  Activity,
  Eye,
  EyeOff,
  MapPin,
  Edit2,
  Trash2,
  Briefcase
} from 'lucide-react';

import AddCompanyModal from '../../components/Settings/AddCompanyModal';
import AddOfficeModal from '../../components/Settings/AddOfficeModal';
import AddRoleModal from '../../components/Settings/AddRoleModal';
import EditUserModal from '../../components/Settings/EditUserModal';
import { saveUserToDB, saveRoleToDB, resetDatabaseToCleanState } from '../../services/api';

export default function Settings({ 
  searchQuery, 
  setSearchQuery, 
  usersList, 
  setUsersList,
  companies = [],
  setCompanies = () => {},
  offices = [],
  setOffices = () => {},
  roles = [],
  setRoles = () => {}
}) {
  const [activeSubTab, setActiveSubTab] = useState('companies_offices');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const [isAddOfficeOpen, setIsAddOfficeOpen] = useState(false);
  const [targetCompanyId, setTargetCompanyId] = useState(null);
  const [editingOffice, setEditingOffice] = useState(null);

  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Settings State
  const [companyName, setCompanyName] = useState('minERP Enterprise Solutions Inc.');
  const [country, setCountry] = useState('IN');
  const [taxId, setTaxId] = useState('GSTIN-27AABCU9603R1ZM');
  const [taxRate, setTaxRate] = useState('GST 18%');
  const [currency, setCurrency] = useState('INR (₹)');
  const [supportEmail, setSupportEmail] = useState('ops@minerp.com');
  const [address, setAddress] = useState('100 Enterprise Way, Suite 500, Mumbai, MH');

  const handleCountryChange = (selectedCountry) => {
    setCountry(selectedCountry);
    if (selectedCountry === 'US') {
      setCurrency('USD ($)');
      setTaxRate('US Sales Tax 8.875%');
    } else if (selectedCountry === 'GB') {
      setCurrency('GBP (£)');
      setTaxRate('VAT 20%');
    } else if (selectedCountry === 'DE') {
      setCurrency('EUR (€)');
      setTaxRate('VAT 20%');
    } else if (selectedCountry === 'IN') {
      setCurrency('INR (₹)');
      setTaxRate('GST 18%');
    }
  };

  // Audit Logs Dataset
  const [auditLogs, setAuditLogs] = useState([
    { id: 'LOG-991', user: 'Jane Doe (Admin)', action: 'Posted Journal Entry #JE-2026-042', timestamp: '2026-07-21 16:40:12', ip: '192.168.1.45' },
    { id: 'LOG-990', user: 'Alex Smith (Manager)', action: 'Approved Stock Intake (+50 units)', timestamp: '2026-07-21 14:15:30', ip: '192.168.1.88' },
    { id: 'LOG-989', user: 'Sarah Jenkins (Employee)', action: 'Created Sales Order #ORD-9842', timestamp: '2026-07-21 11:05:19', ip: '192.168.1.102' },
    { id: 'LOG-988', user: 'Jane Doe (Admin)', action: 'Updated Company GST/VAT Configuration', timestamp: '2026-07-20 09:22:01', ip: '192.168.1.45' }
  ]);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Employee');
  const [newUserCompany, setNewUserCompany] = useState(companies[0]?.name || 'minERP Enterprise HQ');
  const [newUserOffice, setNewUserOffice] = useState(offices[0]?.name || 'New York Main HQ');
  const [newUserTitle, setNewUserTitle] = useState('Operations Specialist');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Company Handlers
  const handleSaveCompany = (compData) => {
    setCompanies(prev => {
      const idx = prev.findIndex(c => c.id === compData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = compData;
        return copy;
      }
      return [...prev, compData];
    });
    showToast(`Company "${compData.name}" saved successfully!`);
  };

  // Office Handlers
  const handleSaveOffice = (officeData) => {
    setOffices(prev => {
      const idx = prev.findIndex(o => o.id === officeData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = officeData;
        return copy;
      }
      return [...prev, officeData];
    });
    showToast(`Office / Branch "${officeData.name}" saved under company!`);
  };

  // Role Handlers
  const handleSaveRole = (roleData) => {
    saveRoleToDB(roleData);
    setRoles(prev => {
      const idx = prev.findIndex(r => r.id === roleData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = roleData;
        return copy;
      }
      return [...prev, roleData];
    });
    showToast(`Role "${roleData.name}" and granted permissions updated!`);
  };

  const handleSaveCompanyProfile = (e) => {
    e.preventDefault();
    showToast(`Company profile, Tax rate (${taxRate}), and Currency saved successfully!`);
  };

  const handleCreateBackup = () => {
    const backupData = JSON.stringify({
      companies,
      offices,
      roles,
      users: usersList,
      auditLogs,
      timestamp: new Date().toISOString()
    }, null, 2);

    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `minERP_Enterprise_DB_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Enterprise Snapshot DB Backup generated and downloaded!');
  };

  const handleRestoreDatabase = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      showToast(`Database restored successfully from "${fileName}"! System synchronized.`);
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) return;

    const newUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      company: newUserCompany || (companies[0]?.name || 'minERP Enterprise HQ'),
      office: newUserOffice || (offices[0]?.name || 'New York Main HQ'),
      title: newUserTitle,
      status: 'Active',
      password: newUserPassword
    };

    saveUserToDB(newUser);
    setUsersList(prev => [newUser, ...prev]);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setShowNewUserPassword(false);
    showToast(`User ${newUser.name} assigned to ${newUser.company} (${newUser.office}) with ${newUser.role} role!`);
  };

  const handleSaveEditedUser = (updatedUser) => {
    saveUserToDB(updatedUser);
    setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    showToast(`User account & permissions for "${updatedUser.name}" updated successfully!`);
  };

  const handleChangeUserRole = (userId, newRole) => {
    setUsersList(prev => {
      const updated = prev.map(u => {
        if (u.id === userId) {
          const newUserObj = { ...u, role: newRole };
          saveUserToDB(newUserObj);
          return newUserObj;
        }
        return u;
      });
      return updated;
    });
    showToast(`User role updated to ${newRole}!`);
  };

  const handleChangeUserOffice = (userId, newOffice) => {
    setUsersList(prev => {
      const updated = prev.map(u => {
        if (u.id === userId) {
          const newUserObj = { ...u, office: newOffice };
          saveUserToDB(newUserObj);
          return newUserObj;
        }
        return u;
      });
      return updated;
    });
    showToast(`User location reassigned to ${newOffice}!`);
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.company && u.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.office && u.office.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="dashboard-body">
      {toastMessage && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
          marginBottom: '15px'
        }}>
          <CheckCircle2 size={20} />
          {toastMessage}
        </div>
      )}

      {/* Header title */}
      <div className="dashboard-header-title">
        <div>
          <h1>Enterprise Organization, Roles & System Settings</h1>
          <p>Configure multi-company structures, office branches/warehouses, custom roles & permissions (RBAC), and user accounts</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => { setEditingCompany(null); setIsAddCompanyOpen(true); }}>
            <Building2 size={16} />
            Add Company
          </button>
          <button className="btn-primary" onClick={() => setIsAddUserOpen(true)}>
            <Plus size={16} />
            Add System User
          </button>
        </div>
      </div>

      {/* Sub-tabs navigation */}
      <div className="inventory-nav-tabs">
        {[
          { id: 'companies_offices', label: 'Companies & Multi-Offices', icon: Building2 },
          { id: 'user_management', label: 'User Directory & Roles', icon: Users },
          { id: 'roles_matrix', label: 'Roles & Permissions (RBAC)', icon: ShieldCheck },
          { id: 'company', label: 'Company Profile, Currency & Tax', icon: Percent },
          { id: 'audit_logs', label: 'System Audit Logs', icon: Activity },
          { id: 'backups', label: 'Backup & Restore', icon: Database },
        ].map(tab => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              className={`inventory-tab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              <IconComp size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Companies & Multi-Offices Management */}
      {activeSubTab === 'companies_offices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header" style={{ margin: 0, paddingBottom: 0 }}>
            <div className="card-title-group">
              <h2 className="card-title">Registered Companies & Location Branches</h2>
              <span className="card-subtitle">Showing {companies.length} parent enterprise entities</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => { setEditingOffice(null); setTargetCompanyId(companies[0]?.id); setIsAddOfficeOpen(true); }}>
                <MapPin size={16} />
                Add Branch / Office
              </button>
              <button className="btn-primary" onClick={() => { setEditingCompany(null); setIsAddCompanyOpen(true); }}>
                <Plus size={16} />
                Register New Company
              </button>
            </div>
          </div>

          <div className="grid-2">
            {companies.map(comp => {
              const compOffices = offices.filter(o => o.companyId === comp.id || o.companyName === comp.name);
              return (
                <div key={comp.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(2, 132, 199, 0.15)', color: 'var(--accent-blue)', padding: '10px', borderRadius: '12px' }}>
                          <Building2 size={24} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '700' }}>{comp.name}</h3>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Code: {comp.code} | Tax ID: {comp.taxId || 'N/A'}</span>
                        </div>
                      </div>
                      <span className="status-badge completed">{comp.status}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'var(--bg-input)', padding: '10px 14px', borderRadius: '10px', marginBottom: '14px', fontSize: '0.8rem' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Country</div>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{comp.country}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Currency</div>
                        <div style={{ fontWeight: '700', color: 'var(--accent-blue)' }}>{comp.currency}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Offices / Branches</div>
                        <div style={{ fontWeight: '700', color: 'var(--status-warning)' }}>{compOffices.length} Locations</div>
                      </div>
                    </div>

                    {/* Offices list */}
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>Offices & Warehouses:</span>
                        <button 
                          type="button"
                          onClick={() => { setEditingOffice(null); setTargetCompanyId(comp.id); setIsAddOfficeOpen(true); }}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}
                        >
                          + Add Office
                        </button>
                      </div>

                      {compOffices.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                          No office branches registered yet for this company.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {compOffices.map(off => (
                            <div key={off.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={15} color="#d97706" />
                                <div>
                                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{off.name}</span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({off.type})</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Manager: {off.manager || 'N/A'}</span>
                                <button 
                                  onClick={() => { setEditingOffice(off); setIsAddOfficeOpen(true); }}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                  <Edit2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => { setEditingCompany(comp); setIsAddCompanyOpen(true); }}>
                      <Edit2 size={14} />
                      Edit Company Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: User Directory & Access Levels */}
      {activeSubTab === 'user_management' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Company Users & Location Access Assignment</h2>
              <span className="card-subtitle">Showing {filteredUsers.length} system users across companies</span>
            </div>

            <button className="btn-primary" onClick={() => setIsAddUserOpen(true)}>
              <Plus size={16} />
              Add System User
            </button>
          </div>

          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Work Email</th>
                  <th>Company</th>
                  <th>Assigned Office/Branch</th>
                  <th>Role Permission</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Change Role & Office</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{u.id}</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{u.name}</td>
                    <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{u.email}</td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--accent-blue)', fontSize: '0.82rem' }}>
                        {typeof u.company === 'object' ? (u.company?.name || u.company?.code || 'minERP Enterprise HQ') : (u.company || 'minERP Enterprise HQ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={13} color="#d97706" />
                        {u.office || 'New York Main HQ'}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          background: u.role === 'Admin' ? 'rgba(59, 130, 246, 0.2)' : u.role === 'Manager' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: u.role === 'Admin' ? '#3b82f6' : u.role === 'Manager' ? '#f59e0b' : '#10b981',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: '700'
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td><span className="status-badge completed">{u.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                        <button 
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => {
                            setEditingUser(u);
                            setIsEditUserOpen(true);
                          }}
                          title="Set Role & Custom Permissions"
                        >
                          <ShieldCheck size={14} color="var(--accent-blue)" />
                          Edit Role & Access
                        </button>

                        <select 
                          className="form-control"
                          style={{ width: '110px', padding: '4px 6px', fontSize: '0.75rem' }}
                          value={u.role}
                          onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Employee">Employee</option>
                          {roles.filter(r => !['Admin', 'Manager', 'Employee'].includes(r.name)).map(r => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Roles & Permissions Matrix (RBAC) */}
      {activeSubTab === 'roles_matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">Roles & Modular Permissions Definition</h2>
                <span className="card-subtitle">Showing {roles.length} system & custom roles</span>
              </div>

              <button className="btn-primary" onClick={() => { setEditingRole(null); setIsAddRoleOpen(true); }}>
                <Plus size={16} />
                Create Custom Role
              </button>
            </div>

            <div className="grid-3" style={{ marginBottom: '20px' }}>
              {roles.map(r => {
                const permsList = typeof r.permissions === 'string' ? JSON.parse(r.permissions || '[]') : r.permissions;
                return (
                  <div key={r.id} className="card" style={{ margin: 0, padding: '16px', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{r.name}</div>
                      {r.isSystemRole ? (
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '0.72rem' }}>System</span>
                      ) : (
                        <button 
                          onClick={() => { setEditingRole(r); setIsAddRoleOpen(true); }}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                      )}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{r.description}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {permsList.map(p => (
                        <span key={p} style={{ background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', border: '1px solid var(--border-color)', textTransform: 'capitalize' }}>
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card-header" style={{ paddingLeft: 0 }}>
              <h3 className="card-title" style={{ fontSize: '1rem' }}>Global Permissions Matrix</h3>
            </div>

            <div className="table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Role Title</th>
                    <th>Dashboard</th>
                    <th>Sales</th>
                    <th>Inventory</th>
                    <th>Accounting</th>
                    <th>Purchasing</th>
                    <th>HR</th>
                    <th>CRM</th>
                    <th>Settings</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(r => {
                    const permsList = typeof r.permissions === 'string' ? JSON.parse(r.permissions || '[]') : r.permissions;
                    const hasPerm = (m) => permsList.includes(m);
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{r.name}</td>
                        <td><span className={`status-badge ${hasPerm('dashboard') ? 'completed' : 'cancelled'}`}>{hasPerm('dashboard') ? 'Full' : 'Locked'}</span></td>
                        <td><span className={`status-badge ${hasPerm('sales') ? 'completed' : 'cancelled'}`}>{hasPerm('sales') ? 'Full' : 'Locked'}</span></td>
                        <td><span className={`status-badge ${hasPerm('inventory') ? 'completed' : 'cancelled'}`}>{hasPerm('inventory') ? 'Full' : 'Locked'}</span></td>
                        <td><span className={`status-badge ${hasPerm('accounting') ? 'completed' : 'cancelled'}`}>{hasPerm('accounting') ? 'Full' : 'Locked'}</span></td>
                        <td><span className={`status-badge ${hasPerm('purchasing') ? 'completed' : 'cancelled'}`}>{hasPerm('purchasing') ? 'Full' : 'Locked'}</span></td>
                        <td><span className={`status-badge ${hasPerm('hr') ? 'completed' : 'cancelled'}`}>{hasPerm('hr') ? 'Full' : 'Locked'}</span></td>
                        <td><span className={`status-badge ${hasPerm('crm') ? 'completed' : 'cancelled'}`}>{hasPerm('crm') ? 'Full' : 'Locked'}</span></td>
                        <td><span className={`status-badge ${hasPerm('settings') ? 'completed' : 'cancelled'}`}>{hasPerm('settings') ? 'Full' : 'Locked'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Company Profile, Currency & GST/VAT Engine */}
      {activeSubTab === 'company' && (
        <div className="card" style={{ maxWidth: '720px' }}>
          <div className="card-header">
            <h2 className="card-title">Enterprise Profile, Multi-Currency & GST/VAT Tax Engine</h2>
          </div>

          <form onSubmit={handleSaveCompanyProfile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Company Legal Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Headquarters Country *</label>
                  <select 
                    className="form-control"
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    required
                  >
                    <option value="IN">India (Default: INR, GST 18%)</option>
                    <option value="US">United States (Default: USD, US Tax)</option>
                    <option value="GB">United Kingdom (Default: GBP, VAT 20%)</option>
                    <option value="DE">Germany / Eurozone (Default: EUR, VAT 20%)</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Tax Registration Number (GST / VAT ID)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Tax Rate Engine</label>
                  <select 
                    className="form-control"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  >
                    <option value="GST 18%">GST 18% (Standard Goods & Services Tax)</option>
                    <option value="VAT 20%">VAT 20% (Value Added Tax)</option>
                    <option value="US Sales Tax 8.875%">US Sales Tax 8.875%</option>
                    <option value="Tax Exempt (0%)">Tax Exempt (0%)</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Base Multi-Currency Selection</label>
                  <select 
                    className="form-control"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="INR (₹)">INR (₹ Indian Rupee)</option>
                    <option value="USD ($)">USD ($ United States Dollar)</option>
                    <option value="EUR (€)">EUR (€ Euro)</option>
                    <option value="GBP (£)">GBP (£ British Pound)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Official Operations Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Company Registered Headquarters Address</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '10px' }}>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  Save Company & Tax Preferences
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: Audit Logs */}
      {activeSubTab === 'audit_logs' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">System Security & Operation Audit Logs</h2>
          </div>

          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Audit Log Ref</th>
                  <th>User Account</th>
                  <th>Event Description / Action</th>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{log.id}</td>
                    <td style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>{log.user}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{log.action}</td>
                    <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{log.timestamp}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Backups & Restore */}
      {activeSubTab === 'backups' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <div className="card-header">
            <h2 className="card-title">Database Backup & System Restoration</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Create full JSON database snapshots or restore minERP database state from an existing snapshot file.
            </p>

            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Export Database JSON Snapshot</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Download full system database archive</div>
              </div>
              <button className="btn-primary" onClick={handleCreateBackup}>
                <Database size={16} />
                Download JSON Backup
              </button>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Restore Database from File</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Upload JSON database backup file to restore system state</div>
              </div>
              <div>
                <input 
                  id="restoreDbInput" 
                  type="file" 
                  accept=".json" 
                  style={{ display: 'none' }} 
                  onChange={handleRestoreDatabase} 
                />
                <button 
                  className="btn-secondary" 
                  style={{ borderColor: '#10b98150', color: '#10b981' }}
                  onClick={() => document.getElementById('restoreDbInput').click()}
                >
                  <Upload size={16} />
                  Restore JSON File
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#ef4444' }}>Clear Default/Mock Data & Reset Database</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Purge local default mock data and reset central database to clean state</div>
              </div>
              <button 
                className="btn-secondary" 
                style={{ backgroundColor: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }}
                onClick={async () => {
                  if (window.confirm("Are you sure you want to clear all default/mock data and reset the database to a clean state?")) {
                    const res = await resetDatabaseToCleanState();
                    if (res && res.message) setToastMessage(res.message);
                    setTimeout(() => { window.location.reload(); }, 800);
                  }
                }}
              >
                <Trash2 size={16} />
                Clear & Reset Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      <AddCompanyModal 
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
        onSave={handleSaveCompany}
        editingCompany={editingCompany}
      />

      {/* Add Office Modal */}
      <AddOfficeModal 
        isOpen={isAddOfficeOpen}
        onClose={() => setIsAddOfficeOpen(false)}
        onSave={handleSaveOffice}
        companies={companies}
        targetCompanyId={targetCompanyId}
        editingOffice={editingOffice}
      />

      {/* Add Role Modal */}
      <AddRoleModal 
        isOpen={isAddRoleOpen}
        onClose={() => setIsAddRoleOpen(false)}
        onSave={handleSaveRole}
        companies={companies}
        editingRole={editingRole}
      />

      {/* Add System User Modal */}
      {isAddUserOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Register New System User & Assign Company/Branch</h2>
              <button className="modal-close" onClick={() => setIsAddUserOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. David Miller"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Work Email Address *</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="david.miller@minerp.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Assigned Company *</label>
                    <select 
                      className="form-control"
                      value={newUserCompany}
                      onChange={(e) => setNewUserCompany(e.target.value)}
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assigned Office / Branch *</label>
                    <select 
                      className="form-control"
                      value={newUserOffice}
                      onChange={(e) => setNewUserOffice(e.target.value)}
                    >
                      {offices.map(o => (
                        <option key={o.id} value={o.name}>{o.name} ({o.companyName})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Assigned Role (Permissions) *</label>
                    <select 
                      className="form-control"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                    >
                      <option value="Admin">Admin (Full System Access)</option>
                      <option value="Manager">Manager (Ops, Inv, Sales, CRM, Reports)</option>
                      <option value="Employee">Employee (Dashboard, Sales, CRM)</option>
                      {roles.filter(r => !['Admin', 'Manager', 'Employee'].includes(r.name)).map(r => (
                        <option key={r.id} value={r.name}>{r.name} ({r.description})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Job Title / Position</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newUserTitle}
                      onChange={(e) => setNewUserTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showNewUserPassword ? 'text' : 'password'} 
                        className="form-control" 
                        placeholder="••••••••"
                        style={{ paddingRight: '40px' }}
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0'
                        }}
                      >
                        {showNewUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={{ opacity: 0.5 }}>Password Security Note</label>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '10px' }}>
                      Assign a secure password. Users will use this password alongside their work email to authenticate.
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <UserCheck size={16} />
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Role & Permissions Modal */}
      <EditUserModal 
        isOpen={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        onSave={handleSaveEditedUser}
        userToEdit={editingUser}
        roles={roles}
        companies={companies}
        offices={offices}
      />
    </div>
  );
}
