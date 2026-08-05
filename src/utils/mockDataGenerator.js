/**
 * minERP Enterprise OS - Mock Data Generator
 * Generates 100 realistic records for each enterprise module entity.
 */

const firstNames = [
  'John', 'Jane', 'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 
  'Robert', 'Amanda', 'William', 'Ashley', 'James', 'Stephanie', 'Daniel', 
  'Elizabeth', 'Matthew', 'Megan', 'Christopher', 'Lauren', 'Andrew', 'Hannah',
  'Joshua', 'Nicole', 'Joseph', 'Samantha', 'Brian', 'Rachel', 'Kevin', 'Victoria'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez'
];

const companySuffixes = [
  'Tech Solutions', 'Logistics Inc', 'BioLabs', 'Capital', 'Creative Studio',
  'Global Corp', 'Industries', 'Systems', 'Networks', 'Pharmaceuticals',
  'Robotics', 'Energy Group', 'Software Inc', 'Retail Hub', 'Holdings'
];

const productTypes = [
  { name: 'UltraWide 34" Curved Monitor', cat: 'Electronics', price: 1100.00, skuPrefix: 'MON-34' },
  { name: 'Thunderbolt 4 Docking Station', cat: 'Electronics', price: 625.00, skuPrefix: 'DOC-TB4' },
  { name: 'Ergonomic Mechanical Keyboard', cat: 'Electronics', price: 130.00, skuPrefix: 'KB-ERG' },
  { name: 'Precision Wireless Laser Mouse', cat: 'Electronics', price: 85.00, skuPrefix: 'MSE-PR' },
  { name: 'Executive Leather Task Chair', cat: 'Furniture', price: 900.00, skuPrefix: 'CHR-EX' },
  { name: 'Electric Sit-Stand Oak Desk', cat: 'Furniture', price: 1250.00, skuPrefix: 'DSK-ST' },
  { name: 'Ultra HD 4K Conference Webcam', cat: 'Electronics', price: 249.99, skuPrefix: 'CAM-4K' },
  { name: 'Noise-Canceling Wireless Headset', cat: 'Electronics', price: 199.50, skuPrefix: 'HDST-NC' },
  { name: 'Enterprise 2U Rack Server', cat: 'Networking Hardware', price: 3450.00, skuPrefix: 'SRV-2U' },
  { name: 'WiFi 6E Tri-Band Mesh Router', cat: 'Networking Hardware', price: 420.00, skuPrefix: 'RTR-W6' }
];

const vendors = [
  'Dell Enterprise Direct', 'Anker Corp Wholesale', 'Logitech Global Supply',
  'Herman Miller Office Furniture', 'Cisco Systems Enterprise', 'HP Commercial Direct',
  'Lenovo B2B Global', 'Apple Corporate Sales', 'Belkin Direct', 'Samsung Electronics'
];

const departments = [
  'Operations', 'Logistics', 'Sales', 'Finance', 'Human Resources', 
  'Information Technology', 'Quality Control', 'Procurement'
];

const empRoles = [
  'Operations Lead', 'Warehouse Manager', 'Sales Director', 'Financial Controller',
  'QC Auditor', 'Senior IT Specialist', 'HR Manager', 'Procurement Specialist',
  'Accountant', 'Supply Chain Analyst'
];

// Helper random pickers
const pick = (arr, i) => arr[i % arr.length];
const pad = (n, len = 3) => String(n).padStart(len, '0');

/** 1. Products (100 records) */
export function generateProducts(count = 100) {
  const products = [];
  for (let i = 1; i <= count; i++) {
    const pt = pick(productTypes, i);
    const sku = `${pt.skuPrefix}-${100 + i}`;
    const unitPrice = Number((pt.price + (i % 15) * 12.5).toFixed(2));
    const costPrice = Number((unitPrice * 0.65).toFixed(2));
    products.push({
      id: String(i),
      sku,
      name: `${pt.name} (Mod #${i})`,
      category: pt.cat,
      stock: (i * 7) % 85 + 2,
      minThreshold: 10,
      minStock: 10,
      unitPrice,
      price: unitPrice,
      costPrice,
      supplier: pick(vendors, i),
      barcode: `889000${10000 + i}`,
      status: (i * 7) % 85 < 10 ? 'Low Stock' : 'In Stock'
    });
  }
  return products;
}

/** 2. Customers (100 records) */
export function generateCustomers(count = 100) {
  const customers = [];
  for (let i = 1; i <= count; i++) {
    const fn = pick(firstNames, i);
    const ln = pick(lastNames, i);
    const company = `${pick(lastNames, i * 2)} ${pick(companySuffixes, i)}`;
    customers.push({
      id: `CUST-${1000 + i}`,
      name: `${fn} ${ln}`,
      company,
      email: `procurement${i}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `+1 (555) ${300 + (i % 600)}-${4000 + i}`,
      creditLimit: Number((10000 + i * 750).toFixed(2)),
      lifetimeSales: Number((22000 + i * 1850).toFixed(2)),
      receivablesBalance: Number((i % 3 === 0 ? 0 : 1200 + i * 110).toFixed(2)),
      status: i % 15 === 0 ? 'Inactive' : 'Active'
    });
  }
  return customers;
}

function getRelativeDateStr(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 3. Orders (100 records) */
export function generateOrders(count = 100) {
  const orders = [];
  const statuses = ['Completed', 'Processing', 'Pending', 'Shipped', 'Completed'];
  const customers = generateCustomers(100);
  const products = generateProducts(100);

  for (let i = 1; i <= count; i++) {
    const cust = customers[(i - 1) % customers.length];
    const prod = products[(i - 1) % products.length];
    const itemsCount = (i % 5) + 1;
    const amount = Number((prod.unitPrice * itemsCount).toFixed(2));
    const orderDate = getRelativeDateStr(i % 15);

    orders.push({
      id: `ORD-${9800 + i}`,
      customer: cust.company || cust.name,
      email: cust.email,
      date: orderDate,
      time: `${(i % 12) + 1}:00 ${i % 2 === 0 ? 'AM' : 'PM'}`,
      category: prod.category,
      itemsCount,
      amount,
      status: statuses[i % statuses.length],
      shippingAddress: `${100 + i} Commerce Blvd, Suite ${i}, New York, NY`,
      items: [
        { name: prod.name, sku: prod.sku, qty: itemsCount, price: prod.unitPrice }
      ]
    });
  }
  return orders;
}

/** 4. Quotations (100 records) */
export function generateQuotations(count = 100) {
  const quotes = [];
  const statuses = ['Sent', 'Draft', 'Converted', 'Expired', 'Sent'];
  const customers = generateCustomers(100);

  for (let i = 1; i <= count; i++) {
    const cust = customers[(i - 1) % customers.length];
    const amount = Number((2500 + i * 380).toFixed(2));
    const day = (i % 25) + 1;
    quotes.push({
      id: `QTN-2026-${100 + i}`,
      customer: cust.company || cust.name,
      date: `2026-07-${pad(day, 2)}`,
      validUntil: `2026-08-${pad(day, 2)}`,
      amount,
      status: statuses[i % statuses.length]
    });
  }
  return quotes;
}

/** 5. Invoices (100 records) */
export function generateInvoices(count = 100) {
  const invoices = [];
  const statuses = ['Paid', 'Unpaid', 'Overdue', 'Paid'];
  const customers = generateCustomers(100);

  for (let i = 1; i <= count; i++) {
    const cust = customers[(i - 1) % customers.length];
    const amount = Number((1800 + i * 290).toFixed(2));
    const day = (i % 25) + 1;
    invoices.push({
      id: `INV-2026-${pad(i, 3)}`,
      orderId: `ORD-${9800 + i}`,
      customer: cust.company || cust.name,
      date: `2026-07-${pad(day, 2)}`,
      dueDate: `2026-08-${pad(day, 2)}`,
      amount,
      status: statuses[i % statuses.length]
    });
  }
  return invoices;
}

/** 6. Customer Payments (100 records) */
export function generateCustomerPayments(count = 100) {
  const payments = [];
  const methods = ['Credit Card', 'Bank Wire / ACH', 'Corporate Check', 'PayPal Enterprise'];
  const customers = generateCustomers(100);

  for (let i = 1; i <= count; i++) {
    const cust = customers[(i - 1) % customers.length];
    const amount = Number((1200 + i * 210).toFixed(2));
    const day = (i % 25) + 1;
    payments.push({
      id: `REC-2026-${pad(i, 3)}`,
      customer: cust.company || cust.name,
      amount,
      method: pick(methods, i),
      invoiceRef: `INV-2026-${pad(i, 3)}`,
      date: `2026-07-${pad(day, 2)}`
    });
  }
  return payments;
}

/** 7. Sales Returns (100 records) */
export function generateSalesReturns(count = 100) {
  const returns = [];
  const reasons = [
    'Defective / Damaged Goods', 'Wrong Item Shipped', 
    'Customer Cancelled Order', 'Overstock Return'
  ];
  const statuses = ['Approved & Restocked', 'Pending Review', 'Refund Issued'];
  const customers = generateCustomers(100);

  for (let i = 1; i <= count; i++) {
    const cust = customers[(i - 1) % customers.length];
    const refundAmount = Number((150 + i * 45).toFixed(2));
    const day = (i % 25) + 1;
    returns.push({
      id: `RMA-2026-${pad(i, 3)}`,
      orderId: `ORD-${9800 + i}`,
      customer: cust.company || cust.name,
      date: `2026-07-${pad(day, 2)}`,
      reason: pick(reasons, i),
      refundAmount,
      status: pick(statuses, i)
    });
  }
  return returns;
}

/** 8. Categories (20 records) */
export function generateCategories() {
  const cats = [
    'Electronics', 'Furniture', 'Networking Hardware', 'Office Supplies', 
    'Software & Licenses', 'IT Peripherals', 'Facility Equipment', 'Safety & Security',
    'Audio & Video', 'Cables & Accessories', 'Printers & Imaging', 'Servers & Storage',
    'Mobile Devices', 'Power & UPS', 'Components & RAM', 'Display & Monitors',
    'Smart Office Tech', 'Maintenance Supplies', 'Packaging & Shipping', 'Services & Support'
  ];
  return cats.map((name, idx) => ({
    id: idx + 1,
    name,
    skuCount: 5 + (idx * 3),
    totalValue: Number((12000 + idx * 4500).toFixed(2))
  }));
}

/** 9. Inventory Transaction Logs (100 records) */
export function generateInventoryLogs(count = 100) {
  const logs = [];
  const products = generateProducts(100);
  const users = ['Alex Smith', 'Jane Doe', 'David Miller', 'Sarah Jenkins'];

  for (let i = 1; i <= count; i++) {
    const prod = products[(i - 1) % products.length];
    const isIntake = i % 2 === 0;
    const qty = isIntake ? +((i % 15) + 5) : -((i % 5) + 1);
    const day = (i % 25) + 1;
    logs.push({
      id: `LOG-${800 + i}`,
      date: `2026-07-${pad(day, 2)} ${(i % 12) + 1}:30`,
      type: isIntake ? 'INTAKE' : 'DISPATCH',
      sku: prod.sku,
      name: prod.name,
      qty,
      user: pick(users, i)
    });
  }
  return logs;
}

/** 10. Suppliers / Vendors (100 records) */
export function generateSuppliers(count = 100) {
  const suppliers = [];
  const terms = ['Net 15', 'Net 30', 'Net 45', 'Net 60'];
  const categories = ['Electronics', 'Furniture', 'Networking Hardware', 'Office Supplies'];

  for (let i = 1; i <= count; i++) {
    const fn = pick(firstNames, i);
    const ln = pick(lastNames, i);
    const name = `${pick(vendors, i)} #${i}`;
    suppliers.push({
      id: `SUP-${100 + i}`,
      name,
      contactPerson: `${fn} ${ln}`,
      email: `vendor${i}@${name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `+1 (555) ${400 + (i % 500)}-${6000 + i}`,
      category: pick(categories, i),
      rating: Number((4.2 + (i % 8) * 0.1).toFixed(1)),
      paymentTerms: pick(terms, i),
      balanceDue: Number((i % 4 === 0 ? 0 : 2500 + i * 320).toFixed(2))
    });
  }
  return suppliers;
}

/** 11. Purchase Orders (100 records) */
export function generatePurchaseOrders(count = 100) {
  const pos = [];
  const statuses = ['Sent', 'Received', 'Approved', 'Pending', 'Sent'];
  const suppliers = generateSuppliers(100);

  for (let i = 1; i <= count; i++) {
    const sup = suppliers[(i - 1) % suppliers.length];
    const itemsCount = (i % 8) + 2;
    const totalAmount = Number((3200 + i * 490).toFixed(2));
    const day = (i % 25) + 1;
    pos.push({
      id: `PO-2026-${800 + i}`,
      supplier: sup.name,
      orderDate: `2026-07-${pad(day, 2)}`,
      deliveryDate: `2026-08-${pad(day, 2)}`,
      itemsCount,
      totalAmount,
      status: statuses[i % statuses.length]
    });
  }
  return pos;
}

/** 12. Goods Receipt Notes (100 records) */
export function generateGoodsReceipts(count = 100) {
  const grns = [];
  const suppliers = generateSuppliers(100);

  for (let i = 1; i <= count; i++) {
    const sup = suppliers[(i - 1) % suppliers.length];
    const day = (i % 25) + 1;
    grns.push({
      id: `GRN-2026-${pad(i, 3)}`,
      poId: `PO-2026-${800 + i}`,
      supplier: sup.name,
      receivedDate: `2026-07-${pad(day, 2)}`,
      unitsReceived: (i % 15) + 5,
      inspectionStatus: i % 12 === 0 ? 'Pending Quality Review' : 'Passed Audit',
      inspector: 'Warehouse Receiving QC'
    });
  }
  return grns;
}

/** 13. Supplier Payments (100 records) */
export function generateSupplierPayments(count = 100) {
  const payments = [];
  const methods = ['Bank Wire / ACH', 'Corporate Check', 'Direct Debit'];
  const suppliers = generateSuppliers(100);

  for (let i = 1; i <= count; i++) {
    const sup = suppliers[(i - 1) % suppliers.length];
    const amount = Number((2800 + i * 340).toFixed(2));
    const day = (i % 25) + 1;
    payments.push({
      id: `PAY-2026-${100 + i}`,
      supplier: sup.name,
      amount,
      method: pick(methods, i),
      referenceNumber: `ACH-9823${1000 + i}`,
      date: `2026-07-${pad(day, 2)}`
    });
  }
  return payments;
}

/** 14. Deals (100 records) */
export function generateDeals(count = 100) {
  const deals = [];
  const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const probs = { Lead: 20, Qualified: 40, Proposal: 60, Negotiation: 80, Won: 100, Lost: 0 };
  const customers = generateCustomers(100);

  for (let i = 1; i <= count; i++) {
    const cust = customers[(i - 1) % customers.length];
    const stage = pick(stages, i);
    const amount = Number((15000 + i * 1400).toFixed(2));
    deals.push({
      id: `DEAL-${100 + i}`,
      title: `${cust.company} Workstation Expansion #${i}`,
      company: cust.company,
      contact: cust.name,
      amount,
      stage,
      probability: probs[stage]
    });
  }
  return deals;
}

/** 15. Leads (100 records) */
export function generateLeads(count = 100) {
  const leads = [];
  const temps = ['Hot', 'Warm', 'Cold'];
  const sources = ['Website Inquiry', 'Referral', 'LinkedIn Outbound', 'Trade Show Event', 'Direct Email'];

  for (let i = 1; i <= count; i++) {
    const fn = pick(firstNames, i);
    const ln = pick(lastNames, i);
    const company = `${ln} Global Holdings #${i}`;
    leads.push({
      id: `LEAD-${500 + i}`,
      name: `${fn} ${ln}`,
      company,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `+1 (555) ${300 + (i % 400)}-${7000 + i}`,
      temperature: pick(temps, i),
      source: pick(sources, i),
      estimatedValue: Number((12000 + i * 950).toFixed(2))
    });
  }
  return leads;
}

/** 16. Activities (100 records) */
export function generateActivities(count = 100) {
  const activities = [];
  const types = ['Call', 'Meeting', 'Email', 'Follow-up'];
  const customers = generateCustomers(100);
  const owners = ['Jane Doe', 'Alex Smith', 'David Miller', 'Sarah Jenkins'];

  for (let i = 1; i <= count; i++) {
    const cust = customers[(i - 1) % customers.length];
    const type = pick(types, i);
    const day = (i % 25) + 1;
    activities.push({
      id: `ACT-${900 + i}`,
      type,
      subject: `Q3 Contract & Hardware Specs ${type} #${i}`,
      contact: cust.name,
      company: cust.company,
      date: `2026-07-${pad(day, 2)}`,
      time: `${(i % 12) + 1}:00 ${i % 2 === 0 ? 'AM' : 'PM'}`,
      notes: `Discussed scope and delivery terms. Follow up scheduled next week.`,
      owner: pick(owners, i)
    });
  }
  return activities;
}

/** 17. Bank Accounts (100 records) */
export function generateBankAccounts(count = 100) {
  const accounts = [];
  const types = ['Checking', 'Savings', 'Money Market', 'Petty Cash'];

  for (let i = 1; i <= count; i++) {
    const isComp1 = i <= 50;
    accounts.push({
      id: `BANK-${pad(i, 2)}`,
      name: `${isComp1 ? 'Company 1' : 'Company 2'} Operating ${pick(types, i)} #${i}`,
      type: pick(types, i),
      accountNumber: `•••• ${8000 + i}`,
      balance: Number((45000 + i * 6200).toFixed(2))
    });
  }
  return accounts;
}

/** 18. AR Invoices Aging (100 records) */
export function generateArInvoices(count = 100) {
  const invoices = [];
  const customers = generateCustomers(100);

  for (let i = 1; i <= count; i++) {
    const cust = customers[(i - 1) % customers.length];
    const day = (i % 25) + 1;
    invoices.push({
      id: `INV-2026-${pad(i, 3)}`,
      customer: cust.company || cust.name,
      date: `2026-07-${pad(day, 2)}`,
      days: (i * 3) % 90,
      amount: Number((1400 + i * 230).toFixed(2))
    });
  }
  return invoices;
}

/** 19. AP Bills (100 records) */
export function generateApBills(count = 100) {
  const bills = [];
  const suppliers = generateSuppliers(100);

  for (let i = 1; i <= count; i++) {
    const sup = suppliers[(i - 1) % suppliers.length];
    const day = (i % 25) + 1;
    bills.push({
      id: `BILL-${9900 + i}`,
      supplier: sup.name,
      billDate: `2026-07-${pad(day, 2)}`,
      dueDate: `2026-08-${pad(day, 2)}`,
      amountDue: Number((2600 + i * 290).toFixed(2))
    });
  }
  return bills;
}

/** 20. Chart of Accounts (100 records) */
export function generateChartOfAccounts(count = 100) {
  const accounts = [];
  const types = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
  const categories = ['Current Asset', 'Fixed Asset', 'Current Liability', 'Long Term Liability', 'Equity', 'Operating Income', 'Direct Cost', 'Operating Expense'];

  for (let i = 1; i <= count; i++) {
    const code = `${1000 + i * 10}`;
    const type = pick(types, i);
    accounts.push({
      code,
      name: `GL Account #${code} - ${type} (${i <= 50 ? 'Company 1' : 'Company 2'})`,
      type,
      category: pick(categories, i),
      balance: Number((15000 + i * 3200).toFixed(2))
    });
  }
  return accounts;
}

/** 21. Journal Entries (100 records) */
export function generateJournalEntries(count = 100) {
  const entries = [];
  for (let i = 1; i <= count; i++) {
    const day = (i % 25) + 1;
    entries.push({
      id: `JE-2026-${pad(i, 3)}`,
      date: `2026-07-${pad(day, 2)}`,
      description: `Journal settlement entry #${i} for operating ledger balance`,
      debitAccount: `${1000 + (i % 10) * 10} - Cash & Operating Assets`,
      creditAccount: `${4000 + (i % 5) * 10} - Sales Revenue / Accounts Payable`,
      amount: Number((1800 + i * 240).toFixed(2)),
      status: 'Posted'
    });
  }
  return entries;
}

/** 22. HR Employees (100 records) */
export function generateEmployees(count = 100) {
  const employees = [];
  for (let i = 1; i <= count; i++) {
    const fn = pick(firstNames, i);
    const ln = pick(lastNames, i);
    employees.push({
      id: `EMP-${1000 + i}`,
      name: `${fn} ${ln}`,
      role: pick(empRoles, i),
      department: pick(departments, i),
      salary: Number((55000 + i * 850).toFixed(2)),
      status: i % 10 === 0 ? 'On Leave' : 'Active',
      hireDate: `2024-${pad((i % 12) + 1, 2)}-${pad((i % 28) + 1, 2)}`
    });
  }
  return employees;
}

/** 23. HR Attendance Logs (100 records) */
export function generateAttendanceLogs(count = 100) {
  const logs = [];
  const employees = generateEmployees(100);
  const modes = ['On-Site', 'Remote', 'Hybrid Office'];
  const statuses = ['Present', 'Present', 'Present', 'Late', 'Remote'];

  for (let i = 1; i <= count; i++) {
    const emp = employees[(i - 1) % employees.length];
    const day = (i % 25) + 1;
    logs.push({
      id: `ATT-${900 + i}`,
      employee: emp.name,
      date: `2026-07-${pad(day, 2)}`,
      clockIn: `08:${pad((i * 3) % 60, 2)} AM`,
      clockOut: `05:${pad((i * 4) % 60, 2)} PM`,
      status: pick(statuses, i),
      mode: pick(modes, i)
    });
  }
  return logs;
}

/** 24. HR Leave Requests (100 records) */
export function generateLeaveRequests(count = 100) {
  const leaves = [];
  const types = ['Annual Vacation', 'Sick Leave', 'Casual Leave', 'Maternity/Paternity', 'Unpaid Leave'];
  const statuses = ['Approved', 'Pending', 'Approved', 'Rejected'];
  const employees = generateEmployees(100);

  for (let i = 1; i <= count; i++) {
    const emp = employees[(i - 1) % employees.length];
    const day = (i % 25) + 1;
    leaves.push({
      id: `LV-${400 + i}`,
      employee: emp.name,
      type: pick(types, i),
      duration: `${(i % 5) + 1} Days`,
      dates: `Aug ${pad(day, 2)} - Aug ${pad(day + (i % 5), 2)}`,
      status: pick(statuses, i)
    });
  }
  return leaves;
}

/** 25. HR Payroll History (100 records) */
export function generatePayrollHistory(count = 100) {
  const payrolls = [];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  for (let i = 1; i <= count; i++) {
    const m = pick(months, i);
    const yr = 2026 - Math.floor(i / 12);
    const grossPay = Number((280000 + i * 5400).toFixed(2));
    const taxDeductions = Number((grossPay * 0.20).toFixed(2));
    const netPay = Number((grossPay - taxDeductions).toFixed(2));
    payrolls.push({
      period: `${m} ${yr}`,
      totalEmployees: 100,
      grossPay,
      taxDeductions,
      netPay,
      status: 'Completed'
    });
  }
  return payrolls;
}
