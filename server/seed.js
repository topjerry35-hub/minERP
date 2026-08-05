import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database around 2 Main Enterprise Companies: Company 1 & Company 2...');

  // Step 0: Clean existing tables in reverse dependency order safely
  console.log('🧹 Cleaning existing table records...');
  const modelsInOrder = [
    'salesOrderItem', 'salesOrder', 'goodsReceipt', 'purchaseOrder', 
    'supplierPayment', 'apBill', 'arInvoice', 'journalEntry', 
    'activity', 'deal', 'lead', 'employee', 'user', 
    'officeLocation', 'role', 'company', 'customer', 'product', 
    'bankAccount', 'account', 'supplier'
  ];

  for (const m of modelsInOrder) {
    try {
      if (prisma[m]) {
        await prisma[m].deleteMany();
      }
    } catch (e) {
      // Table may not exist yet in current DB schema, skip cleanly
    }
  }

  // 1. Seed 2 Main Companies
  const companies = [
    {
      id: 'CMP-001',
      name: 'Company 1 - minERP Primary Enterprise HQ',
      code: 'CMP-1',
      taxId: 'TAX-889201-US',
      currency: 'USD ($)',
      country: 'US',
      email: 'company1.ops@minerp.com',
      phone: '+1 (555) 100-2000',
      address: '100 Enterprise Way, Suite 500, Silicon Valley, CA',
      status: 'Active'
    },
    {
      id: 'CMP-002',
      name: 'Company 2 - minERP Global Solutions Ltd.',
      code: 'CMP-2',
      taxId: 'VAT-992018-UK',
      currency: 'GBP (£)',
      country: 'GB',
      email: 'company2.ops@minerp.com',
      phone: '+44 20 7946 0912',
      address: '14 Docklands Business Park, London, UK',
      status: 'Active'
    }
  ];
  await prisma.company.createMany({ data: companies });
  console.log(`✅ Seeded 2 Primary Enterprise Companies: Company 1 (CMP-1) & Company 2 (CMP-2)`);

  // Helper lists
  const comp1Cities = ['New York', 'San Francisco', 'Chicago', 'Austin', 'Seattle', 'Boston', 'Los Angeles', 'Denver', 'Atlanta', 'Miami'];
  const comp2Cities = ['London', 'Berlin', 'Paris', 'Singapore', 'Tokyo', 'Sydney', 'Toronto', 'Zurich', 'Amsterdam', 'Dubai'];
  const firstNames = ['John', 'Jane', 'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Amanda', 'William', 'Ashley', 'James', 'Stephanie', 'Daniel', 'Elizabeth', 'Matthew', 'Megan', 'Christopher', 'Lauren'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const categories = ['Electronics', 'Furniture', 'Software & Licenses', 'Office Supplies', 'Networking Hardware', 'IT Peripherals', 'Facility Equipment', 'Safety & Security'];
  const departments = ['Operations', 'Logistics', 'Sales', 'Finance', 'Human Resources', 'Information Technology', 'Quality Control', 'Procurement'];

  // 2. Seed 100 Office Locations (50 for Company 1, 50 for Company 2)
  const offices = [];
  const officeTypes = ['Headquarters', 'Regional Office', 'Branch Office', 'Warehouse Hub', 'Retail Outlet'];
  for (let i = 1; i <= 100; i++) {
    const isComp1 = i <= 50;
    const parentComp = isComp1 ? companies[0] : companies[1];
    const cityList = isComp1 ? comp1Cities : comp2Cities;
    const city = cityList[i % cityList.length];
    const code = `OFF-${1000 + i}`;
    offices.push({
      id: code,
      companyId: parentComp.id,
      name: `${city} ${officeTypes[i % officeTypes.length]} (${isComp1 ? 'Company 1' : 'Company 2'})`,
      code: `LOC-${city.substring(0, 3).toUpperCase()}-${i}`,
      type: officeTypes[i % officeTypes.length],
      address: `${100 + i} Commerce Way, Unit ${i}`,
      city,
      country: parentComp.country,
      phone: isComp1 ? `+1 (555) ${300 + i}-${4000 + i}` : `+44 20 ${7900 + i} ${1000 + i}`,
      email: `office${i}@${parentComp.code.toLowerCase()}.com`,
      manager: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      status: 'Active'
    });
  }
  await prisma.officeLocation.createMany({ data: offices });
  console.log(`✅ Seeded ${offices.length} Office Locations across Company 1 & Company 2`);

  // 3. Seed 100 Roles (50 per company scope)
  const roles = [
    { id: 'ROL-101', companyId: null, name: 'Admin', description: 'Global System Administrator', permissions: JSON.stringify(['dashboard','sales','inventory','accounting','purchasing','hr','crm','reports','settings']), isSystemRole: true },
    { id: 'ROL-102', companyId: null, name: 'Manager', description: 'Enterprise Operations Manager', permissions: JSON.stringify(['dashboard','sales','inventory','purchasing','crm','reports']), isSystemRole: true },
    { id: 'ROL-103', companyId: null, name: 'Employee', description: 'Standard Staff Access Level', permissions: JSON.stringify(['dashboard','sales','crm']), isSystemRole: true }
  ];
  const roleTitles = ['Inventory Lead', 'Financial Accountant', 'HR Officer', 'Procurement Specialist', 'Sales Representative', 'Warehouse Supervisor', 'QC Inspector', 'IT Administrator', 'Customer Success Agent', 'Audit Specialist'];
  for (let i = 4; i <= 100; i++) {
    const isComp1 = i <= 50;
    const parentComp = isComp1 ? companies[0] : companies[1];
    const title = `${isComp1 ? 'Company 1' : 'Company 2'} ${roleTitles[i % roleTitles.length]} #${i}`;
    roles.push({
      id: `ROL-${100 + i}`,
      companyId: parentComp.id,
      name: title,
      description: `Role profile for ${title} under ${parentComp.name}`,
      permissions: JSON.stringify(['dashboard', i % 2 === 0 ? 'sales' : 'inventory', i % 3 === 0 ? 'accounting' : 'crm']),
      isSystemRole: false
    });
  }
  await prisma.role.createMany({ data: roles });
  console.log(`✅ Seeded ${roles.length} System & Company Roles`);

  // 4. Seed 100 System Users (50 for Company 1, 50 for Company 2)
  const users = [];
  const defaultPasswordHash = hashPassword('minERP2026!');
  for (let i = 1; i <= 100; i++) {
    const isComp1 = i <= 50;
    const parentComp = isComp1 ? companies[0] : companies[1];
    const off = offices[(i - 1) % offices.length];
    const roleObj = roles[(i - 1) % roles.length];
    const fname = firstNames[i % firstNames.length];
    const lname = lastNames[i % lastNames.length];
    users.push({
      id: `USR-${1000 + i}`,
      email: `${fname.toLowerCase()}.${lname.toLowerCase()}${i}@${isComp1 ? 'company1.com' : 'company2.com'}`,
      name: `${fname} ${lname}`,
      passwordHash: defaultPasswordHash,
      role: roleObj.name,
      roleId: roleObj.id,
      title: `${isComp1 ? 'Company 1' : 'Company 2'} ${roleObj.name}`,
      companyId: parentComp.id,
      locationId: off.id,
      status: 'Active'
    });
  }
  await prisma.user.createMany({ data: users });
  console.log(`✅ Seeded ${users.length} System Users split between Company 1 & Company 2`);

  // 5. Seed 100 Products
  const products = [];
  const productNames = ['Monitor 34" UltraWide', 'Laptop Pro 16"', 'Ergonomic Mechanical Keyboard', 'Precision Wireless Mouse', 'Executive Task Chair', 'Sit-Stand Desk Oak', 'Webcam 4K Ultra', 'USB Studio Microphone', 'Server Rack 2U Enterprise', 'WiFi 6E Router'];
  for (let i = 1; i <= 100; i++) {
    const isComp1 = i <= 50;
    const name = `${productNames[i % productNames.length]} (${isComp1 ? 'C1' : 'C2'} Model #${i})`;
    const sku = `SKU-${1000 + i}`;
    const unitPrice = Number((49.99 + i * 14.5).toFixed(2));
    const costPrice = Number((unitPrice * 0.62).toFixed(2));
    products.push({
      sku,
      name,
      category: categories[i % categories.length],
      stock: (i * 9) % 95,
      minStock: 10,
      unitPrice,
      costPrice,
      barcode: `889000${10000 + i}`,
      imageUrl: `https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150`
    });
  }
  await prisma.product.createMany({ data: products });
  console.log(`✅ Seeded ${products.length} Products`);

  // 6. Seed 100 Customers
  const customers = [];
  for (let i = 1; i <= 100; i++) {
    const isComp1 = i <= 50;
    const fname = firstNames[i % firstNames.length];
    const lname = lastNames[i % lastNames.length];
    customers.push({
      id: `CUST-${1000 + i}`,
      name: `${fname} ${lname}`,
      company: `Client Corp #${i} (${isComp1 ? 'Company 1 Region' : 'Company 2 Region'})`,
      email: `procurement${i}@clientcorp${i}.com`,
      phone: `+1 (555) ${400 + i}-${5000 + i}`,
      creditLimit: Number((10000 + i * 600).toFixed(2)),
      lifetimeSales: Number((18000 + i * 1400).toFixed(2)),
      receivablesBalance: Number((i % 4 === 0 ? 0 : 1500 + i * 90).toFixed(2))
    });
  }
  await prisma.customer.createMany({ data: customers });
  console.log(`✅ Seeded ${customers.length} Customers`);

  // 7. Seed 100 HR Employees
  const employees = [];
  const empRoles = ['Operations Manager', 'Warehouse Lead', 'Sales Director', 'Financial Controller', 'QC Auditor', 'IT Specialist', 'HR Business Partner', 'Procurement Specialist'];
  for (let i = 1; i <= 100; i++) {
    const isComp1 = i <= 50;
    const fname = firstNames[i % firstNames.length];
    const lname = lastNames[i % lastNames.length];
    employees.push({
      id: `EMP-${1000 + i}`,
      name: `${fname} ${lname}`,
      role: `${isComp1 ? 'C1' : 'C2'} ${empRoles[i % empRoles.length]}`,
      department: departments[i % departments.length],
      salary: Number((58000 + i * 900).toFixed(2)),
      status: i % 10 === 0 ? 'On Leave' : 'Active',
      hireDate: new Date(2024, i % 12, (i % 28) + 1)
    });
  }
  await prisma.employee.createMany({ data: employees });
  console.log(`✅ Seeded ${employees.length} Employees`);

  // 8. Seed 100 Sales Orders & Line Items
  const salesOrders = [];
  const salesOrderItems = [];
  const statuses = ['Completed', 'Processing', 'Pending', 'Shipped', 'Completed'];
  for (let i = 1; i <= 100; i++) {
    const cust = customers[(i - 1) % customers.length];
    const prod = products[(i - 1) % products.length];
    const orderId = `ORD-${9800 + i}`;
    const qty = (i % 5) + 1;
    const itemAmount = Number((prod.unitPrice * qty).toFixed(2));

    salesOrders.push({
      id: orderId,
      customer: cust.company || cust.name,
      email: cust.email,
      orderDate: new Date(2026, 6, (i % 25) + 1),
      itemsCount: qty,
      amount: itemAmount,
      status: statuses[i % statuses.length]
    });

    salesOrderItems.push({
      id: `ITEM-${1000 + i}`,
      orderId,
      sku: prod.sku,
      name: prod.name,
      qty,
      price: prod.unitPrice
    });
  }
  await prisma.salesOrder.createMany({ data: salesOrders });
  await prisma.salesOrderItem.createMany({ data: salesOrderItems });
  console.log(`✅ Seeded ${salesOrders.length} Sales Orders & ${salesOrderItems.length} Sales Order Line Items`);

  // 9. Seed 100 Bank Accounts (50 per Company)
  const bankAccounts = [];
  for (let i = 1; i <= 100; i++) {
    const isComp1 = i <= 50;
    bankAccounts.push({
      id: `BANK-${100 + i}`,
      name: `${isComp1 ? 'Company 1' : 'Company 2'} Checking Account #${i}`,
      type: i % 2 === 0 ? 'Checking' : 'Savings',
      accountNumber: `•••• ${8000 + i}`,
      balance: Number((30000 + i * 5000).toFixed(2))
    });
  }
  await prisma.bankAccount.createMany({ data: bankAccounts });
  console.log(`✅ Seeded ${bankAccounts.length} Bank Accounts`);

  // 10. Seed 100 Accounts Receivable Invoices
  const arInvoices = [];
  for (let i = 1; i <= 100; i++) {
    const cust = customers[(i - 1) % customers.length];
    arInvoices.push({
      id: `INV-2026-${100 + i}`,
      customer: cust.company || cust.name,
      date: new Date(2026, 6, (i % 20) + 1),
      days: (i * 3) % 90,
      amount: Number((1500 + i * 200).toFixed(2))
    });
  }
  await prisma.arInvoice.createMany({ data: arInvoices });
  console.log(`✅ Seeded ${arInvoices.length} AR Invoices`);

  // 11. Seed 100 Accounts Payable Vendor Bills
  const apBills = [];
  const vendors = ['Dell Commercial Direct', 'Anker Corp Wholesale', 'Herman Miller B2B', 'Logitech Global', 'Cisco Systems Enterprise', 'HP Direct', 'Lenovo B2B', 'Apple Corporate Sales'];
  for (let i = 1; i <= 100; i++) {
    apBills.push({
      id: `BILL-${9900 + i}`,
      supplier: `${vendors[i % vendors.length]} #${i}`,
      billDate: new Date(2026, 6, (i % 20) + 1),
      dueDate: new Date(2026, 7, (i % 20) + 1),
      amountDue: Number((2800 + i * 240).toFixed(2))
    });
  }
  await prisma.apBill.createMany({ data: apBills });
  console.log(`✅ Seeded ${apBills.length} AP Bills`);

  // 12. Seed 100 Chart of Accounts
  const accounts = [];
  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
  for (let i = 1; i <= 100; i++) {
    const code = `${1000 + i * 10}`;
    accounts.push({
      code,
      name: `GL Account #${code} (${i <= 50 ? 'Company 1' : 'Company 2'})`,
      type: accountTypes[i % accountTypes.length],
      category: i % 2 === 0 ? 'Operating' : 'Current',
      balance: Number((20000 + i * 3500).toFixed(2))
    });
  }
  await prisma.account.createMany({ data: accounts });
  console.log(`✅ Seeded ${accounts.length} GL Accounts`);

  // 13. Seed 100 Journal Entries
  const journalEntries = [];
  for (let i = 1; i <= 100; i++) {
    journalEntries.push({
      id: `JE-2026-${100 + i}`,
      entryDate: new Date(2026, 6, (i % 25) + 1),
      description: `Journal Settlement Record #${i} (${i <= 50 ? 'Company 1' : 'Company 2'})`,
      debitAccount: `${accounts[(i - 1) % accounts.length].code} - ${accounts[(i - 1) % accounts.length].name}`,
      creditAccount: `${accounts[i % accounts.length].code} - ${accounts[i % accounts.length].name}`,
      amount: Number((1800 + i * 160).toFixed(2)),
      status: 'Posted'
    });
  }
  await prisma.journalEntry.createMany({ data: journalEntries });
  console.log(`✅ Seeded ${journalEntries.length} Journal Entries`);

  // 14. Seed 100 CRM Deals
  const deals = [];
  const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  for (let i = 1; i <= 100; i++) {
    const cust = customers[(i - 1) % customers.length];
    const stage = stages[i % stages.length];
    deals.push({
      id: `DEAL-${100 + i}`,
      title: `${i <= 50 ? 'Company 1' : 'Company 2'} Deal #${i}`,
      company: cust.company || cust.name,
      contact: cust.name,
      amount: Number((20000 + i * 3000).toFixed(2)),
      stage,
      probability: stage === 'Won' ? 100 : stage === 'Lost' ? 0 : (i * 15) % 90 + 10
    });
  }
  await prisma.deal.createMany({ data: deals });
  console.log(`✅ Seeded ${deals.length} CRM Deals`);

  // 15. Seed 100 CRM Leads
  const leads = [];
  for (let i = 1; i <= 100; i++) {
    const fname = firstNames[i % firstNames.length];
    const lname = lastNames[i % lastNames.length];
    leads.push({
      id: `LEAD-${500 + i}`,
      name: `${fname} ${lname}`,
      company: `Lead Client #${i}`,
      email: `${fname.toLowerCase()}.${lname.toLowerCase()}@lead${i}.com`,
      phone: `+1 (555) ${600 + i}-${7000 + i}`,
      temperature: i % 3 === 0 ? 'Hot' : i % 3 === 1 ? 'Warm' : 'Cold',
      source: i % 2 === 0 ? 'Website Inquiry' : 'Referral',
      estimatedValue: Number((15000 + i * 2000).toFixed(2))
    });
  }
  await prisma.lead.createMany({ data: leads });
  console.log(`✅ Seeded ${leads.length} CRM Leads`);

  // 16. Seed 100 CRM Activities
  const activities = [];
  for (let i = 1; i <= 100; i++) {
    const cust = customers[(i - 1) % customers.length];
    activities.push({
      id: `ACT-${900 + i}`,
      type: i % 2 === 0 ? 'Call' : 'Meeting',
      subject: `Business Review Meeting #${i} (${i <= 50 ? 'Company 1' : 'Company 2'})`,
      contact: cust.name,
      company: cust.company || cust.name,
      date: new Date(2026, 6, (i % 25) + 1),
      time: `${(i % 12) + 1}:00 PM`,
      notes: `Executive discussions regarding contract renewal #${i}`,
      owner: `Jane Doe`
    });
  }
  await prisma.activity.createMany({ data: activities });
  console.log(`✅ Seeded ${activities.length} CRM Activities`);

  // 17. Seed 100 Suppliers
  const suppliers = [];
  for (let i = 1; i <= 100; i++) {
    suppliers.push({
      id: `SUP-${100 + i}`,
      name: `${vendors[i % vendors.length]} #${i}`,
      contactPerson: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      email: `sales@vendor${i}.com`,
      phone: `+1 (555) ${700 + i}-${8000 + i}`,
      category: categories[i % categories.length],
      rating: Number((4.2 + (i % 8) * 0.1).toFixed(1)),
      paymentTerms: 'Net 30',
      balanceDue: Number((i % 3 === 0 ? 0 : 3000 + i * 400).toFixed(2))
    });
  }
  await prisma.supplier.createMany({ data: suppliers });
  console.log(`✅ Seeded ${suppliers.length} Suppliers`);

  // 18. Seed 100 Purchase Orders
  const purchaseOrders = [];
  for (let i = 1; i <= 100; i++) {
    const sup = suppliers[(i - 1) % suppliers.length];
    purchaseOrders.push({
      id: `PO-2026-${900 + i}`,
      supplier: sup.name,
      orderDate: new Date(2026, 6, (i % 20) + 1),
      deliveryDate: new Date(2026, 7, (i % 20) + 1),
      itemsCount: (i % 6) + 1,
      totalAmount: Number((4000 + i * 700).toFixed(2)),
      status: i % 2 === 0 ? 'Sent' : 'Received'
    });
  }
  await prisma.purchaseOrder.createMany({ data: purchaseOrders });
  console.log(`✅ Seeded ${purchaseOrders.length} Purchase Orders`);

  // 19. Seed 100 Goods Receipts
  const goodsReceipts = [];
  for (let i = 1; i <= 100; i++) {
    const po = purchaseOrders[(i - 1) % purchaseOrders.length];
    goodsReceipts.push({
      id: `GRN-2026-${100 + i}`,
      poId: po.id,
      supplier: po.supplier,
      receivedDate: new Date(2026, 6, (i % 20) + 1),
      unitsReceived: (i % 15) + 5,
      inspectionStatus: 'Passed Quality Audit',
      inspector: 'QC Auditor'
    });
  }
  await prisma.goodsReceipt.createMany({ data: goodsReceipts });
  console.log(`✅ Seeded ${goodsReceipts.length} Goods Receipts`);

  // 20. Seed 100 Supplier Payments
  const supplierPayments = [];
  for (let i = 1; i <= 100; i++) {
    const sup = suppliers[(i - 1) % suppliers.length];
    supplierPayments.push({
      id: `PAY-2026-${100 + i}`,
      supplier: sup.name,
      amount: Number((2000 + i * 450).toFixed(2)),
      method: 'Bank Wire / ACH',
      referenceNumber: `REF-ACH-${880000 + i}`,
      date: new Date(2026, 6, (i % 25) + 1)
    });
  }
  await prisma.supplierPayment.createMany({ data: supplierPayments });
  console.log(`✅ Seeded ${supplierPayments.length} Supplier Payments`);

  console.log('🎉 COMPLETED SEEDING DATABASE FOR COMPANY 1 & COMPANY 2! TOTAL 2,000+ ENTERPRISE RECORDS SEEDED!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
