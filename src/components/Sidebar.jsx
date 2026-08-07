import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Receipt, 
  Users, 
  Briefcase, 
  Truck, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  LogOut,
  Lock
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, user, roles = [], onLogout }) {
  const role = user?.role || 'Admin';

  // Dynamic Permission Checker
  const isModuleRestricted = (tabId) => {
    if (role === 'Admin') return false;

    // 1. Direct user custom permissions override
    if (user?.permissions) {
      const userPerms = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions || '[]')
        : user.permissions;
      return !userPerms.includes(tabId);
    }

    // 2. Check matched Role from system/custom roles list
    const foundRole = roles.find(r => r.name === role);
    if (foundRole) {
      const rolePerms = typeof foundRole.permissions === 'string'
        ? JSON.parse(foundRole.permissions || '[]')
        : foundRole.permissions;
      if (Array.isArray(rolePerms)) {
        return !rolePerms.includes(tabId);
      }
    }

    // 3. Fallback defaults for standard built-in roles
    if (role === 'Manager') {
      return ['accounting', 'hr', 'settings'].includes(tabId);
    }
    if (role === 'Employee') {
      return ['accounting', 'hr', 'purchasing', 'reports', 'settings'].includes(tabId);
    }
    return false;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales & Orders', icon: ShoppingBag, badge: '14' },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package, badge: '12 Low', badgeColor: '#f59e0b' },
    { id: 'accounting', label: 'Accounting & Invoices', icon: Receipt },
    { id: 'crm', label: 'CRM & Clients', icon: Users },
    { id: 'hr', label: 'HR & Payroll', icon: Briefcase },
    { id: 'purchasing', label: 'Purchasing & Vendors', icon: Truck },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (itemId) => {
    if (isModuleRestricted(itemId)) {
      alert(`Access Restricted: Your role (${role}) does not have permission to access the ${itemId.toUpperCase()} module. Please contact System Administrator.`);
      return;
    }
    setActiveTab(itemId);
    if (window.innerWidth <= 768 && setCollapsed) {
      setCollapsed(true);
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <a href="#dashboard" className="brand-logo" onClick={() => handleNavClick('dashboard')}>
          <div className="logo-badge">
            <Layers size={22} />
          </div>
          {!collapsed && (
            <div className="brand-text">
              min<span>ERP</span>
            </div>
          )}
        </a>
        <button 
          className="toggle-btn" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px 6px 12px' }}>
            <span className="nav-section-title" style={{ padding: 0 }}>Main Menu</span>
            <span 
              className="badge" 
              style={{ 
                background: role === 'Admin' ? 'rgba(59, 130, 246, 0.2)' : role === 'Manager' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: role === 'Admin' ? '#3b82f6' : role === 'Manager' ? '#f59e0b' : '#10b981',
                fontSize: '0.68rem'
              }}
            >
              {role}
            </span>
          </div>
        )}

        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          const restricted = isModuleRestricted(item.id);

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{ opacity: restricted ? 0.45 : 1, cursor: restricted ? 'not-allowed' : 'pointer' }}
              onClick={() => handleNavClick(item.id)}
              title={collapsed ? `${item.label} ${restricted ? '(Restricted)' : ''}` : undefined}
            >
              <IconComponent size={20} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && restricted && (
                <Lock size={14} style={{ marginLeft: 'auto', color: 'var(--status-danger)' }} />
              )}
              {!collapsed && !restricted && item.badge && (
                <span 
                  className="badge" 
                  style={{ 
                    backgroundColor: item.badgeColor ? `${item.badgeColor}25` : 'rgba(59, 130, 246, 0.2)',
                    color: item.badgeColor || '#3b82f6',
                    border: `1px solid ${item.badgeColor || '#3b82f6'}50`
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">{user?.avatar || 'JD'}</div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'Jane Doe'}</div>
              <div className="user-role">{user?.role || 'Admin'}</div>
            </div>
          )}
          <button 
            className="logout-btn" 
            onClick={onLogout}
            title="Sign Out of minERP"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
