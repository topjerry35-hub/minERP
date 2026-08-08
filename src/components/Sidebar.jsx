import React, { useState, useEffect } from 'react';
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
import { 
  fetchProducts, 
  fetchOrders, 
  fetchCustomers, 
  fetchSuppliers, 
  fetchEmployees,
  fetchInvoices
} from '../services/api';

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, user, roles = [], onLogout }) {
  const role = user?.role || 'Admin';

  const [dbCounts, setDbCounts] = useState({
    sales: 0,
    lowStock: 0,
    products: 0,
    customers: 0,
    suppliers: 0,
    employees: 0,
    invoices: 0
  });

  useEffect(() => {
    async function loadCounts() {
      try {
        const prods = await fetchProducts();
        const orders = await fetchOrders();
        const custs = await fetchCustomers();
        const sups = await fetchSuppliers();
        const emps = await fetchEmployees();
        const invs = await fetchInvoices();

        const pList = prods || [];
        const oList = orders || [];
        const lowS = pList.filter(p => {
          const s = Number(p.stock) || 0;
          const min = Number(p.minStock !== undefined ? p.minStock : (p.minThreshold || 10));
          return s <= min;
        }).length;

        setDbCounts({
          sales: oList.length,
          lowStock: lowS,
          products: pList.length,
          customers: (custs || []).length,
          suppliers: (sups || []).length,
          employees: (emps || []).length,
          invoices: (invs || []).length
        });
      } catch (e) {}
    }

    loadCounts();
    const interval = setInterval(loadCounts, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

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
    { 
      id: 'sales', 
      label: 'Sales & Orders', 
      icon: ShoppingBag, 
      badge: dbCounts.sales > 0 ? `${dbCounts.sales}` : null,
      badgeColor: '#3b82f6'
    },
    { 
      id: 'inventory', 
      label: 'Inventory & Stock', 
      icon: Package, 
      badge: dbCounts.lowStock > 0 ? `${dbCounts.lowStock} Low` : (dbCounts.products > 0 ? `${dbCounts.products}` : null), 
      badgeColor: dbCounts.lowStock > 0 ? '#f59e0b' : '#10b981'
    },
    { 
      id: 'accounting', 
      label: 'Accounting & Invoices', 
      icon: Receipt,
      badge: dbCounts.invoices > 0 ? `${dbCounts.invoices}` : null,
      badgeColor: '#8b5cf6'
    },
    { 
      id: 'crm', 
      label: 'CRM & Clients', 
      icon: Users,
      badge: dbCounts.customers > 0 ? `${dbCounts.customers}` : null,
      badgeColor: '#06b6d4'
    },
    { 
      id: 'hr', 
      label: 'HR & Payroll', 
      icon: Briefcase,
      badge: dbCounts.employees > 0 ? `${dbCounts.employees}` : null,
      badgeColor: '#ec4899'
    },
    { 
      id: 'purchasing', 
      label: 'Purchasing & Vendors', 
      icon: Truck,
      badge: dbCounts.suppliers > 0 ? `${dbCounts.suppliers}` : null,
      badgeColor: '#f97316'
    },
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
