import { useState, useEffect } from 'react';
import './index.css';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Enterprise ERP Module Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Inventory from './pages/Inventory/Inventory';
import Purchasing from './pages/Purchasing/Purchasing';
import Sales from './pages/Sales/Sales';
import CRM from './pages/CRM/CRM';
import Accounting from './pages/Accounting/Accounting';
import HR from './pages/HR/HR';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';

import Login from './pages/Authentication/Login';
import NewSaleModal from './components/NewSaleModal';
import InvoiceBillModal from './components/Sales/InvoiceBillModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import { formatCurrency } from './utils/currency';
import { createOrder, createInvoice, fetchCompanies, fetchOffices, fetchRoles, fetchUsers, fetchProducts, fetchOrders, fetchInvoices } from './services/api';

function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedUser = localStorage.getItem('minerp_auth_user');
    return savedUser !== null;
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('minerp_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Companies & Multi-Office State
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('minerp_companies');
    return saved ? JSON.parse(saved) : [
      { id: 'CMP-001', name: 'Company 1 - minERP Primary Enterprise HQ', code: 'CMP-1', taxId: 'GSTIN-27AABCU9603R1ZM', currency: 'INR (₹)', country: 'IN', email: 'company1.ops@minerp.com', phone: '+91 22 5550 1000', address: '100 Enterprise Way, Suite 500, Mumbai, MH', status: 'Active' },
      { id: 'CMP-002', name: 'Company 2 - minERP Global Solutions Ltd.', code: 'CMP-2', taxId: 'VAT-992018-UK', currency: 'GBP (£)', country: 'GB', email: 'company2.ops@minerp.com', phone: '+44 20 7946 0912', address: '14 Docklands Business Park, London, UK', status: 'Active' }
    ];
  });

  const [offices, setOffices] = useState(() => {
    const saved = localStorage.getItem('minerp_offices');
    return saved ? JSON.parse(saved) : [
      { id: 'OFF-101', companyId: 'CMP-001', companyName: 'Company 1 - minERP Primary Enterprise HQ', name: 'New York Main HQ (Company 1)', code: 'LOC-NYC-01', type: 'Headquarters', address: '350 5th Ave', city: 'New York', country: 'US', phone: '+1 212 555 0199', manager: 'Jane Doe', status: 'Active' },
      { id: 'OFF-102', companyId: 'CMP-001', companyName: 'Company 1 - minERP Primary Enterprise HQ', name: 'San Francisco Tech Center (Company 1)', code: 'LOC-SFO-02', type: 'Regional Office', address: '500 Howard St', city: 'San Francisco', country: 'US', phone: '+1 415 555 0188', manager: 'Alex Smith', status: 'Active' },
      { id: 'OFF-103', companyId: 'CMP-002', companyName: 'Company 2 - minERP Global Solutions Ltd.', name: 'London Warehouse Hub (Company 2)', code: 'LOC-LON-01', type: 'Warehouse Hub', address: '45 Docklands Rd', city: 'London', country: 'GB', phone: '+44 20 7946 0912', manager: 'David Miller', status: 'Active' },
      { id: 'OFF-104', companyId: 'CMP-002', companyName: 'Company 2 - minERP Global Solutions Ltd.', name: 'Berlin Distribution Center (Company 2)', code: 'LOC-BER-02', type: 'Regional Office', address: 'Alexanderplatz 10', city: 'Berlin', country: 'DE', phone: '+49 30 1234 5678', manager: 'Sarah Jenkins', status: 'Active' }
    ];
  });

  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('minerp_roles');
    return saved ? JSON.parse(saved) : [
      { id: 'ROL-101', companyId: null, name: 'Admin', description: 'Full system administration access across all enterprise modules', permissions: JSON.stringify(['dashboard','sales','inventory','accounting','purchasing','hr','crm','reports','settings']), isSystemRole: true },
      { id: 'ROL-102', companyId: null, name: 'Manager', description: 'Branch management with access to sales, inventory, CRM, and reports', permissions: JSON.stringify(['dashboard','sales','inventory','purchasing','crm','reports']), isSystemRole: true },
      { id: 'ROL-103', companyId: null, name: 'Employee', description: 'Standard sales representative access', permissions: JSON.stringify(['dashboard','sales','crm']), isSystemRole: true },
      { id: 'ROL-104', companyId: 'CMP-001', name: 'Company 1 Inventory Lead', description: 'Dedicated stock & procurement access for Company 1', permissions: JSON.stringify(['dashboard','inventory','purchasing','reports']), isSystemRole: false },
      { id: 'ROL-105', companyId: 'CMP-002', name: 'Company 2 Financial Accountant', description: 'General ledger & journal entry access for Company 2', permissions: JSON.stringify(['dashboard','accounting','reports']), isSystemRole: false }
    ];
  });

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('minerp_users');
    return saved ? JSON.parse(saved) : [
      { id: 'USR-101', name: 'Jane Doe', email: 'jane.doe@company1.com', role: 'Admin', company: 'Company 1 - minERP Primary Enterprise HQ', office: 'New York Main HQ (Company 1)', title: 'Company 1 General Manager', status: 'Active', password: 'adminPass123!' },
      { id: 'USR-102', name: 'Alex Smith', email: 'alex.smith@company1.com', role: 'Manager', company: 'Company 1 - minERP Primary Enterprise HQ', office: 'San Francisco Tech Center (Company 1)', title: 'Company 1 Warehouse Lead', status: 'Active', password: 'managerPass123!' },
      { id: 'USR-103', name: 'Sarah Jenkins', email: 'sarah.jenkins@company2.com', role: 'Employee', company: 'Company 2 - minERP Global Solutions Ltd.', office: 'London Warehouse Hub (Company 2)', title: 'Company 2 Sales Director', status: 'Active', password: 'employeePass123!' },
      { id: 'USR-104', name: 'David Miller', email: 'david.miller@company2.com', role: 'Manager', company: 'Company 2 - minERP Global Solutions Ltd.', office: 'Berlin Distribution Center (Company 2)', title: 'Company 2 Regional Manager', status: 'Active', password: 'managerPass123!' }
    ];
  });

  const [selectedCompany, setSelectedCompany] = useState('minERP Enterprise HQ');
  const [selectedBranch, setSelectedBranch] = useState('New York Main HQ');

  useEffect(() => {
    async function loadSystemMetadata() {
      const c = await fetchCompanies();
      if (c && c.length > 0) setCompanies(c);
      const o = await fetchOffices();
      if (o && o.length > 0) setOffices(o);
      const r = await fetchRoles();
      if (r && r.length > 0) setRoles(r);
      const u = await fetchUsers();
      if (u && u.length > 0) setUsersList(u);
    }
    loadSystemMetadata();
  }, []);

  useEffect(() => {
    localStorage.setItem('minerp_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('minerp_offices', JSON.stringify(offices));
  }, [offices]);

  useEffect(() => {
    localStorage.setItem('minerp_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('minerp_users', JSON.stringify(usersList));
    if (user && user.email) {
      const match = usersList.find(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (match && (match.role !== user.role || match.permissions !== user.permissions)) {
        setUser(prev => ({
          ...prev,
          role: match.role,
          title: match.title || match.role,
          permissions: match.permissions
        }));
      }
    }
  }, [usersList, user]);

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('minerp_active_tab');
    return savedTab || 'dashboard';
  });

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('minerp_active_tab', activeTab);
    }
  }, [activeTab]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('minerp_sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : false; // Default to EXPANDED (not collapsed)
  });

  useEffect(() => {
    localStorage.setItem('minerp_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('This Month');
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Header Direct Sale Bill Modal State
  const [isHeaderBillModalOpen, setIsHeaderBillModalOpen] = useState(false);
  const [headerActiveInvoice, setHeaderActiveInvoice] = useState(null);
  const [headerActiveOrder, setHeaderActiveOrder] = useState(null);

  // Real-Time Database System Notifications
  const [notifications, setNotifications] = useState([]);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem('minerp_read_notif_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    async function syncDatabaseNotifications() {
      try {
        const prods = await fetchProducts();
        const orders = await fetchOrders();
        const invs = await fetchInvoices();

        const notifs = [];

        // 1. Low stock alerts from DB products
        (prods || []).forEach(p => {
          const stock = Number(p.stock) || 0;
          const minStock = Number(p.minStock !== undefined ? p.minStock : (p.minThreshold || 10));
          if (stock <= minStock) {
            const notifId = `NOTIF-STOCK-${p.sku}`;
            notifs.push({
              id: notifId,
              type: 'warning',
              title: `Low Stock Alert (${p.sku})`,
              message: `${p.name || p.sku} stock level is down to ${stock} units (min threshold: ${minStock}).`,
              time: 'Database Alert',
              read: readNotifIds.includes(notifId)
            });
          }
        });

        // 2. Recent sales orders from DB
        (orders || []).slice(0, 5).forEach(o => {
          const notifId = `NOTIF-ORD-${o.id}`;
          notifs.push({
            id: notifId,
            type: 'order',
            title: `Sales Order ${o.id}`,
            message: `${o.customer || 'Customer'} placed an order for ${formatCurrency(o.amount || 0)}.`,
            time: o.date || 'Database Order',
            read: readNotifIds.includes(notifId)
          });
        });

        // 3. Billing invoices from DB
        (invs || []).slice(0, 5).forEach(inv => {
          const notifId = `NOTIF-INV-${inv.id}`;
          notifs.push({
            id: notifId,
            type: 'success',
            title: `Invoice ${inv.id} (${inv.status || 'Active'})`,
            message: `Commercial Invoice issued to ${inv.customer || 'Client'} for ${formatCurrency(inv.amount || 0)}.`,
            time: inv.date || 'Database Invoice',
            read: readNotifIds.includes(notifId)
          });
        });

        setNotifications(notifs);
      } catch (e) {}
    }

    if (isAuthenticated) {
      syncDatabaseNotifications();
      const interval = setInterval(syncDatabaseNotifications, 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, readNotifIds]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('minerp_auth_user', JSON.stringify(userData));
    const savedTab = localStorage.getItem('minerp_active_tab');
    setActiveTab(savedTab || 'dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('minerp_auth_user');
    localStorage.removeItem('minerp_active_tab');
    setActiveTab('dashboard');
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifIds(allIds);
    localStorage.setItem('minerp_read_notif_ids', JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleRefresh = () => {
    const btn = document.querySelector('.icon-btn svg');
    if (btn) {
      btn.style.transition = 'transform 0.5s ease';
      btn.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        btn.style.transform = 'rotate(0deg)';
      }, 500);
    }
  };

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} usersList={usersList} />;
  }

  return (
    <div className="erp-container">
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${!sidebarCollapsed ? 'active' : ''}`}
        onClick={() => setSidebarCollapsed(true)}
      />

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        user={user}
        roles={roles}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Header Bar */}
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onNewSaleClick={() => setIsNewSaleOpen(true)}
          toggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
          unreadCount={notifications.filter(n => !n.read).length}
          onRefresh={handleRefresh}
          user={user}
          onLogout={handleLogout}
          companies={companies}
          offices={offices}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Notifications Popover */}
        <NotificationsDrawer 
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
        />

        {/* Dynamic View rendering based on Sidebar tab */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            searchQuery={searchQuery}
            timeRange={timeRange}
            onNewSaleClick={() => setIsNewSaleOpen(true)}
          />
        )}

        {activeTab === 'sales' && (
          <Sales 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'inventory' && (
          <Inventory 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'accounting' && (
          <Accounting 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'crm' && (
          <CRM 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'hr' && (
          <HR 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'purchasing' && (
          <Purchasing 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'reports' && (
          <Reports 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'settings' && (
          <Settings 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            usersList={usersList}
            setUsersList={setUsersList}
            companies={companies}
            setCompanies={setCompanies}
            offices={offices}
            setOffices={setOffices}
            roles={roles}
            setRoles={setRoles}
          />
        )}

        {/* Velzon Enterprise Footer */}
        <footer className="footer">
          <div>2026 © minERP Enterprise OS.</div>
          <div>Design & Developed by Enterprise Ops</div>
        </footer>
      </div>

      {/* New Sale Form Modal */}
      <NewSaleModal 
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        onAddOrder={async (newOrder) => {
          const saved = await createOrder(newOrder);
          const orderToSave = (saved && saved.order) ? saved.order : newOrder;

          const invId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
          const newInvoice = await createInvoice({
            id: invId,
            orderId: orderToSave.id,
            customer: orderToSave.customer,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString().split('T')[0],
            amount: orderToSave.amount || 0,
            status: 'Paid'
          });

          setHeaderActiveOrder(orderToSave);
          setHeaderActiveInvoice(newInvoice);
          setIsHeaderBillModalOpen(true);
        }}
      />

      {/* Commercial GST Bill Modal */}
      <InvoiceBillModal 
        isOpen={isHeaderBillModalOpen}
        onClose={() => {
          setIsHeaderBillModalOpen(false);
          setHeaderActiveInvoice(null);
          setHeaderActiveOrder(null);
        }}
        invoice={headerActiveInvoice}
        order={headerActiveOrder}
      />
    </div>
  );
}

export default App;
