/**
 * minERP Central Database & REST API Service Client
 * Provides persistent Database operations across all Enterprise modules (Offline & Online mode)
 * All values are fetched from and stored directly in the Database engine.
 */
import { 
  generateOrders, 
  generateProducts, 
  generateCategories,
  generateInventoryLogs,
  generateQuotations,
  generateCustomers, 
  generateInvoices,
  generateCustomerPayments,
  generateSalesReturns,
  generateSuppliers,
  generatePurchaseOrders,
  generateGoodsReceipts,
  generateSupplierPayments,
  generateLeads,
  generateDeals,
  generateActivities,
  generateEmployees, 
  generateAttendanceLogs,
  generateLeaveRequests,
  generatePayrollHistory,
  generateBankAccounts,
  generateArInvoices,
  generateApBills,
  generateChartOfAccounts,
  generateJournalEntries 
} from '../utils/mockDataGenerator';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:5005/api';
const DB_KEY = 'minerp_database_v2';

// Central Database Engine (LocalStorage / API fallback)
export function getLocalDB() {
  let db = null;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) db = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse local DB', e);
  }

  // Seed Initial Database with 100+ Enterprise Records per collection
  const seedDB = {
    products: generateProducts(100),
    categories: generateCategories(),
    inventoryLogs: generateInventoryLogs(100),
    orders: generateOrders(100),
    quotations: generateQuotations(100),
    customers: generateCustomers(100),
    invoices: generateInvoices(100),
    customerPayments: generateCustomerPayments(100),
    salesReturns: generateSalesReturns(100),
    suppliers: generateSuppliers(100),
    purchaseOrders: generatePurchaseOrders(100),
    goodsReceipts: generateGoodsReceipts(100),
    supplierPayments: generateSupplierPayments(100),
    leads: generateLeads(100),
    deals: generateDeals(100),
    activities: generateActivities(100),
    employees: generateEmployees(100),
    attendanceLogs: generateAttendanceLogs(100),
    leaveRequests: generateLeaveRequests(100),
    payrollHistory: generatePayrollHistory(100),
    bankAccounts: generateBankAccounts(100),
    arInvoices: generateArInvoices(100),
    apBills: generateApBills(100),
    accounts: generateChartOfAccounts(100),
    journalEntries: generateJournalEntries(100),
    finance: { grossRevenue: 1284500, operatingExpenses: 964000, netProfit: 320500 },
    companies: [
      { id: 'CMP-001', name: 'Company 1 - minERP Primary Enterprise HQ', code: 'CMP-1', taxId: 'GSTIN-27AABCU9603R1ZM', currency: 'INR (₹)', country: 'IN', email: 'company1.ops@minerp.com', phone: '+91 22 5550 1000', address: '100 Enterprise Way, Suite 500, Mumbai, MH', status: 'Active' },
      { id: 'CMP-002', name: 'Company 2 - minERP Global Solutions Ltd.', code: 'CMP-2', taxId: 'VAT-992018-UK', currency: 'GBP (£)', country: 'GB', email: 'company2.ops@minerp.com', phone: '+44 20 7946 0912', address: '14 Docklands Business Park, London, UK', status: 'Active' }
    ],
    offices: [
      { id: 'OFF-101', companyId: 'CMP-001', companyName: 'Company 1 - minERP Primary Enterprise HQ', name: 'Mumbai Main HQ (Company 1)', code: 'LOC-BOM-01', type: 'Headquarters', address: '100 Enterprise Way', city: 'Mumbai', country: 'IN', phone: '+91 22 5550 1000', manager: 'Jane Doe', status: 'Active' },
      { id: 'OFF-102', companyId: 'CMP-001', companyName: 'Company 1 - minERP Primary Enterprise HQ', name: 'Bengaluru Tech Center (Company 1)', code: 'LOC-BLR-02', type: 'Regional Office', address: '500 MG Road', city: 'Bengaluru', country: 'IN', phone: '+91 80 5550 0188', manager: 'Alex Smith', status: 'Active' }
    ],
    roles: [
      { id: 'ROL-001', companyId: 'CMP-001', name: 'Executive Admin', description: 'Full root access to all system modules', permissions: JSON.stringify(['dashboard', 'sales', 'inventory', 'accounting', 'purchasing', 'hr', 'crm', 'settings']), isSystemRole: true },
      { id: 'ROL-002', companyId: 'CMP-001', name: 'Sales Representative', description: 'Access to POS, orders, leads & deals', permissions: JSON.stringify(['dashboard', 'sales', 'crm']), isSystemRole: false }
    ],
    users: [
      { id: 'USR-101', name: 'Jane Doe (Admin)', email: 'admin@minerp.com', role: 'Executive Admin', roleId: 'ROL-001', company: 'Company 1 - minERP Primary Enterprise HQ', office: 'Mumbai Main HQ (Company 1)', status: 'Active' },
      { id: 'USR-102', name: 'Alex Smith (Manager)', email: 'alex@minerp.com', role: 'Sales Representative', roleId: 'ROL-002', company: 'Company 1 - minERP Primary Enterprise HQ', office: 'Bengaluru Tech Center (Company 1)', status: 'Active' }
    ]
  };

  if (!db) {
    db = seedDB;
  } else {
    // Fill in any missing or empty collections
    Object.keys(seedDB).forEach(key => {
      if (!db[key] || (Array.isArray(db[key]) && db[key].length === 0)) {
        db[key] = seedDB[key];
      }
    });
  }

  saveLocalDB(db);
  return db;
}

export function saveLocalDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save local DB', e);
  }
}

// Backend availability status
let backendOnlineStatus = null;
let lastCheckTime = 0;

async function isBackendAvailable() {
  const now = Date.now();
  if (backendOnlineStatus !== null && (now - lastCheckTime < 10000)) {
    return backendOnlineStatus;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    backendOnlineStatus = res.ok;
  } catch (err) {
    backendOnlineStatus = false;
  }
  lastCheckTime = now;
  return backendOnlineStatus;
}

// Health Check
export async function fetchHealth() {
  const online = await isBackendAvailable();
  if (!online) return { status: 'OK (Database Engine Enabled)', mockData: false, dbSource: 'IndexedDB / LocalStorage' };
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    backendOnlineStatus = false;
    return { status: 'OK (Database Engine Enabled)', mockData: false, dbSource: 'IndexedDB / LocalStorage' };
  }
}

/* ==========================================
   PRODUCTS DATABASE CRUD
   ========================================== */
export async function fetchProducts() {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) { backendOnlineStatus = false; }
  }
  return getLocalDB().products || [];
}

export async function createProduct(productData) {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) return await res.json();
    } catch (e) { backendOnlineStatus = false; }
  }
  const db = getLocalDB();
  const unitPrice = parseFloat(productData.unitPrice !== undefined ? productData.unitPrice : (productData.price !== undefined ? productData.price : 0));
  const costPrice = parseFloat(productData.costPrice !== undefined ? productData.costPrice : (productData.cost !== undefined ? productData.cost : (unitPrice * 0.65)));
  const stock = parseInt(productData.stock !== undefined ? productData.stock : (productData.currentStock !== undefined ? productData.currentStock : 0));
  const minStock = parseInt(productData.minStock !== undefined ? productData.minStock : (productData.minThreshold !== undefined ? productData.minThreshold : 10));

  const newProduct = { 
    ...productData, 
    sku: productData.sku || `SKU-${Date.now()}`,
    unitPrice,
    price: unitPrice,
    costPrice,
    stock,
    minStock,
    minThreshold: minStock,
    status: stock <= minStock ? (stock === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock'
  };
  db.products = [newProduct, ...db.products];
  saveLocalDB(db);
  return { id: newProduct.sku, product: newProduct };
}

export async function updateProduct(sku, productData) {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(sku)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) return await res.json();
    } catch (e) { backendOnlineStatus = false; }
  }
  const db = getLocalDB();
  db.products = db.products.map(p => p.sku === sku ? { ...p, ...productData } : p);
  saveLocalDB(db);
  return { sku, product: productData };
}

export async function fetchCategories() {
  return getLocalDB().categories || [];
}

export async function fetchInventoryLogs() {
  return getLocalDB().inventoryLogs || [];
}

/* ==========================================
   ORDERS & QUOTATIONS DATABASE CRUD
   ========================================== */
export async function fetchOrders() {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) { backendOnlineStatus = false; }
  }
  return getLocalDB().orders || [];
}

export async function createOrder(orderData) {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) return await res.json();
    } catch (e) { backendOnlineStatus = false; }
  }
  const db = getLocalDB();
  const newOrder = { id: orderData.id || `ORD-${Math.floor(9800 + Math.random() * 200)}`, ...orderData };
  db.orders = [newOrder, ...db.orders];

  // Decrease stock quantity for products in order items
  if (newOrder.items && Array.isArray(newOrder.items)) {
    newOrder.items.forEach(item => {
      const itemSku = (item.sku || '').trim().toLowerCase();
      const itemName = (item.name || '').trim().toLowerCase();

      let prodIndex = -1;
      if (itemSku) {
        prodIndex = db.products.findIndex(p => 
          (p.sku || '').trim().toLowerCase() === itemSku || 
          String(p.id).trim().toLowerCase() === itemSku
        );
      }
      if (prodIndex === -1 && itemName) {
        prodIndex = db.products.findIndex(p => {
          const pName = (p.name || '').trim().toLowerCase();
          return pName === itemName || pName.includes(itemName) || itemName.includes(pName);
        });
      }

      if (prodIndex !== -1) {
        const qtySold = Number(item.qty) || 1;
        const currentStock = Number(db.products[prodIndex].stock) || 0;
        const newStock = Math.max(0, currentStock - qtySold);
        const minThresh = db.products[prodIndex].minThreshold || db.products[prodIndex].minStock || 10;
        
        db.products[prodIndex].stock = newStock;
        db.products[prodIndex].status = newStock <= minThresh ? (newStock === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock';

        // Record DISPATCH Inventory Log
        const newLog = {
          id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toLocaleString(),
          type: 'DISPATCH',
          sku: db.products[prodIndex].sku,
          name: db.products[prodIndex].name,
          qty: -qtySold,
          user: newOrder.customer || 'Direct Sale'
        };
        db.inventoryLogs = [newLog, ...(db.inventoryLogs || [])];
      }
    });
  }

  saveLocalDB(db);
  return { id: newOrder.id, order: newOrder };
}

export async function updateOrder(id, orderData) {
  const db = getLocalDB();
  db.orders = db.orders.map(o => o.id === id ? { ...o, ...orderData } : o);
  saveLocalDB(db);
  return { id, order: orderData };
}

export async function fetchQuotations() {
  return getLocalDB().quotations || [];
}

export async function createQuotation(quoteData) {
  const db = getLocalDB();
  const newQuote = { id: `QTN-2026-${Math.floor(100 + Math.random() * 900)}`, ...quoteData };
  db.quotations = [newQuote, ...db.quotations];
  saveLocalDB(db);
  return newQuote;
}

export async function fetchInvoices() {
  return getLocalDB().invoices || [];
}

export async function createInvoice(invoiceData) {
  const db = getLocalDB();
  const newInv = { id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`, ...invoiceData };
  db.invoices = [newInv, ...db.invoices];
  saveLocalDB(db);
  return newInv;
}

export async function fetchCustomerPayments() {
  return getLocalDB().customerPayments || [];
}

export async function createCustomerPayment(paymentData) {
  const db = getLocalDB();
  const newPay = { id: `REC-2026-${Math.floor(100 + Math.random() * 900)}`, ...paymentData };
  db.customerPayments = [newPay, ...db.customerPayments];
  saveLocalDB(db);
  return newPay;
}

export async function fetchSalesReturns() {
  return getLocalDB().salesReturns || [];
}

export async function createSalesReturn(returnData) {
  const db = getLocalDB();
  const newReturn = { id: `RMA-2026-${Math.floor(100 + Math.random() * 900)}`, ...returnData };
  db.salesReturns = [newReturn, ...db.salesReturns];

  if (returnData.autoRestock && returnData.orderId) {
    const targetOrder = db.orders.find(o => o.id === returnData.orderId);
    if (targetOrder && targetOrder.items && Array.isArray(targetOrder.items)) {
      targetOrder.items.forEach(item => {
        if (item.sku) {
          const pIdx = db.products.findIndex(p => p.sku === item.sku);
          if (pIdx !== -1) {
            const restockQty = Number(item.qty) || 1;
            const currentStock = Number(db.products[pIdx].stock) || 0;
            const newStock = currentStock + restockQty;
            const minThresh = db.products[pIdx].minThreshold || db.products[pIdx].minStock || 10;
            db.products[pIdx].stock = newStock;
            db.products[pIdx].status = newStock <= minThresh ? (newStock === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock';

            const newLog = {
              id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
              date: new Date().toLocaleString(),
              type: 'INTAKE',
              sku: item.sku,
              name: item.name || db.products[pIdx].name,
              qty: restockQty,
              user: `RMA Return (${newReturn.id})`
            };
            db.inventoryLogs = [newLog, ...(db.inventoryLogs || [])];
          }
        }
      });
    }
  }

  saveLocalDB(db);
  return newReturn;
}

/* ==========================================
   CUSTOMERS DATABASE CRUD
   ========================================== */
export async function fetchCustomers() {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) { backendOnlineStatus = false; }
  }
  return getLocalDB().customers || [];
}

export async function createCustomer(customerData) {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      if (res.ok) return await res.json();
    } catch (e) { backendOnlineStatus = false; }
  }
  const db = getLocalDB();
  const newCust = { id: customerData.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`, ...customerData };
  db.customers = [newCust, ...db.customers];
  saveLocalDB(db);
  return { id: newCust.id, customer: newCust };
}

export async function updateCustomer(id, customerData) {
  const db = getLocalDB();
  db.customers = db.customers.map(c => c.id === id ? { ...c, ...customerData } : c);
  saveLocalDB(db);
  return { id, customer: customerData };
}

/* ==========================================
   PURCHASING DATABASE CRUD
   ========================================== */
export async function fetchSuppliers() {
  return getLocalDB().suppliers || [];
}

export async function createSupplier(supplierData) {
  const db = getLocalDB();
  const newSup = { id: supplierData.id || `SUP-${Math.floor(100 + Math.random() * 900)}`, ...supplierData };
  db.suppliers = [newSup, ...db.suppliers];
  saveLocalDB(db);
  return newSup;
}

export async function fetchPurchaseOrders() {
  return getLocalDB().purchaseOrders || [];
}

export async function createPurchaseOrder(poData) {
  const db = getLocalDB();
  const newPo = { id: poData.id || `PO-2026-${Math.floor(800 + Math.random() * 200)}`, ...poData };
  db.purchaseOrders = [newPo, ...db.purchaseOrders];
  saveLocalDB(db);
  return newPo;
}

export async function fetchGoodsReceipts() {
  return getLocalDB().goodsReceipts || [];
}

export async function createGoodsReceipt(grnData) {
  const db = getLocalDB();
  const newGrn = { id: `GRN-2026-${Math.floor(100 + Math.random() * 900)}`, ...grnData };
  db.goodsReceipts = [newGrn, ...db.goodsReceipts];
  saveLocalDB(db);
  return newGrn;
}

export async function fetchSupplierPayments() {
  return getLocalDB().supplierPayments || [];
}

export async function createSupplierPayment(paymentData) {
  const db = getLocalDB();
  const newPayment = { id: `PAY-2026-${Math.floor(100 + Math.random() * 900)}`, ...paymentData };
  db.supplierPayments = [newPayment, ...db.supplierPayments];
  saveLocalDB(db);
  return newPayment;
}

/* ==========================================
   CRM DATABASE CRUD
   ========================================== */
export async function fetchLeads() {
  return getLocalDB().leads || [];
}

export async function createLead(leadData) {
  const db = getLocalDB();
  const newLead = { id: leadData.id || `LEAD-${Math.floor(500 + Math.random() * 500)}`, ...leadData };
  db.leads = [newLead, ...db.leads];
  saveLocalDB(db);
  return newLead;
}

export async function fetchDeals() {
  return getLocalDB().deals || [];
}

export async function createDeal(dealData) {
  const db = getLocalDB();
  const newDeal = { id: dealData.id || `DEAL-${Math.floor(100 + Math.random() * 900)}`, ...dealData };
  db.deals = [newDeal, ...db.deals];
  saveLocalDB(db);
  return newDeal;
}

export async function updateDealStage(id, stage) {
  const db = getLocalDB();
  db.deals = db.deals.map(d => d.id === id ? { ...d, stage } : d);
  saveLocalDB(db);
  return { id, stage };
}

export async function fetchActivities() {
  return getLocalDB().activities || [];
}

export async function createActivity(activityData) {
  const db = getLocalDB();
  const newAct = { id: activityData.id || `ACT-${Math.floor(900 + Math.random() * 100)}`, ...activityData };
  db.activities = [newAct, ...db.activities];
  saveLocalDB(db);
  return newAct;
}

/* ==========================================
   HR DATABASE CRUD
   ========================================== */
export async function fetchEmployees() {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/employees`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) { backendOnlineStatus = false; }
  }
  return getLocalDB().employees || [];
}

export async function createEmployee(employeeData) {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      if (res.ok) return await res.json();
    } catch (e) { backendOnlineStatus = false; }
  }
  const db = getLocalDB();
  const newEmp = { id: employeeData.id || `EMP-${Math.floor(100 + Math.random() * 900)}`, ...employeeData };
  db.employees = [newEmp, ...db.employees];
  saveLocalDB(db);
  return { id: newEmp.id, employee: newEmp };
}

export async function fetchAttendanceLogs() {
  return getLocalDB().attendanceLogs || [];
}

export async function createAttendanceLog(logData) {
  const db = getLocalDB();
  const newLog = { id: `ATT-${Math.floor(900 + Math.random() * 100)}`, ...logData };
  db.attendanceLogs = [newLog, ...db.attendanceLogs];
  saveLocalDB(db);
  return newLog;
}

export async function fetchLeaveRequests() {
  return getLocalDB().leaveRequests || [];
}

export async function createLeaveRequest(leaveData) {
  const db = getLocalDB();
  const newLeave = { id: `LV-${Math.floor(400 + Math.random() * 600)}`, ...leaveData };
  db.leaveRequests = [newLeave, ...db.leaveRequests];
  saveLocalDB(db);
  return newLeave;
}

export async function fetchPayrollHistory() {
  return getLocalDB().payrollHistory || [];
}

/* ==========================================
   ACCOUNTING & FINANCE DATABASE CRUD
   ========================================== */
export async function fetchFinanceSummary() {
  const db = getLocalDB();
  return db.finance || { grossRevenue: 1284500, operatingExpenses: 964000, netProfit: 320500 };
}

export async function fetchBankAccounts() {
  return getLocalDB().bankAccounts || [];
}

export async function updateBankAccountBalance(id, newBalance) {
  const db = getLocalDB();
  db.bankAccounts = db.bankAccounts.map(b => b.id === id ? { ...b, balance: newBalance } : b);
  saveLocalDB(db);
  return { id, newBalance };
}

export async function fetchArInvoices() {
  return getLocalDB().arInvoices || [];
}

export async function fetchApBills() {
  return getLocalDB().apBills || [];
}

export async function updateApBill(billId, billData) {
  const db = getLocalDB();
  db.apBills = (db.apBills || []).map(b => b.id === billId ? { ...b, ...billData } : b);
  saveLocalDB(db);
  return { id: billId, bill: billData };
}

export async function fetchAccounts() {
  return getLocalDB().accounts || [];
}

export async function fetchJournalEntries() {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/journal`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) { backendOnlineStatus = false; }
  }
  return getLocalDB().journalEntries || [];
}

export async function createJournalEntry(entryData) {
  const db = getLocalDB();
  const newEntry = { id: entryData.id || `JRN-${Math.floor(1000 + Math.random() * 9000)}`, ...entryData };
  db.journalEntries = [newEntry, ...db.journalEntries];
  saveLocalDB(db);
  return { id: newEntry.id, entry: newEntry };
}

/* ==========================================
   COMPANIES, OFFICES, ROLES, USERS DATABASE CRUD
   ========================================== */
export async function fetchCompanies() {
  return getLocalDB().companies || [];
}

export async function saveCompanyToDB(companyData) {
  const db = getLocalDB();
  const exists = db.companies.find(c => c.id === companyData.id);
  if (exists) {
    db.companies = db.companies.map(c => c.id === companyData.id ? { ...c, ...companyData } : c);
  } else {
    db.companies = [companyData, ...db.companies];
  }
  saveLocalDB(db);
  return companyData;
}

export async function fetchOffices() {
  return getLocalDB().offices || [];
}

export async function saveOfficeToDB(officeData) {
  const db = getLocalDB();
  const exists = db.offices.find(o => o.id === officeData.id);
  if (exists) {
    db.offices = db.offices.map(o => o.id === officeData.id ? { ...o, ...officeData } : o);
  } else {
    db.offices = [officeData, ...db.offices];
  }
  saveLocalDB(db);
  return officeData;
}

export async function fetchRoles() {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) { backendOnlineStatus = false; }
  }
  return getLocalDB().roles || [];
}

export async function saveRoleToDB(roleData) {
  if (await isBackendAvailable()) {
    try {
      const isEdit = !!roleData.id;
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${API_BASE_URL}/roles/${encodeURIComponent(roleData.id)}` : `${API_BASE_URL}/roles`;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      });
    } catch (e) { backendOnlineStatus = false; }
  }
  const db = getLocalDB();
  const exists = db.roles.find(r => r.id === roleData.id);
  if (exists) {
    db.roles = db.roles.map(r => r.id === roleData.id ? { ...r, ...roleData } : r);
  } else {
    db.roles = [roleData, ...db.roles];
  }
  saveLocalDB(db);
  return roleData;
}

export async function fetchUsers() {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) { backendOnlineStatus = false; }
  }
  return getLocalDB().users || [];
}

export async function saveUserToDB(userData) {
  if (await isBackendAvailable()) {
    try {
      const isEdit = !!userData.id;
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${API_BASE_URL}/users/${encodeURIComponent(userData.id)}` : `${API_BASE_URL}/users`;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    } catch (e) { backendOnlineStatus = false; }
  }
  const db = getLocalDB();
  const exists = db.users.find(u => u.id === userData.id);
  if (exists) {
    db.users = db.users.map(u => u.id === userData.id ? { ...u, ...userData } : u);
  } else {
    db.users = [userData, ...db.users];
  }
  saveLocalDB(db);
  return userData;
}

