import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Initializing Database schema with default Companies and Admin setup (Mock data generation disabled)...');

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

  // 1. Seed 2 Main Enterprise Companies
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

  // 2. Seed Primary Office Locations
  const offices = [
    {
      id: 'OFF-101',
      companyId: 'CMP-001',
      name: 'Mumbai Main HQ (Company 1)',
      code: 'LOC-BOM-01',
      type: 'Headquarters',
      address: '100 Enterprise Way',
      city: 'Mumbai',
      country: 'US',
      phone: '+1 (555) 100-2000',
      email: 'office1@cmp-1.com',
      manager: 'Jane Doe',
      status: 'Active'
    },
    {
      id: 'OFF-102',
      companyId: 'CMP-001',
      name: 'Bengaluru Tech Center (Company 1)',
      code: 'LOC-BLR-02',
      type: 'Regional Office',
      address: '500 MG Road',
      city: 'Bengaluru',
      country: 'US',
      phone: '+1 (555) 100-2001',
      email: 'office2@cmp-1.com',
      manager: 'Alex Smith',
      status: 'Active'
    }
  ];
  await prisma.officeLocation.createMany({ data: offices });
  console.log(`✅ Seeded ${offices.length} Primary Office Locations`);

  // 3. Seed System Roles
  const roles = [
    { id: 'ROL-001', companyId: 'CMP-001', name: 'Executive Admin', description: 'Full root access to all system modules', permissions: JSON.stringify(['dashboard', 'sales', 'inventory', 'accounting', 'purchasing', 'hr', 'crm', 'settings']), isSystemRole: true },
    { id: 'ROL-002', companyId: 'CMP-001', name: 'Sales Representative', description: 'Access to POS, orders, leads & deals', permissions: JSON.stringify(['dashboard', 'sales', 'crm']), isSystemRole: false }
  ];
  await prisma.role.createMany({ data: roles });
  console.log(`✅ Seeded ${roles.length} System Roles`);

  // 4. Seed Default Admin & Manager Users
  const defaultPasswordHash = hashPassword('minERP2026!');
  const users = [
    {
      id: 'USR-101',
      email: 'admin@minerp.com',
      name: 'Jane Doe (Admin)',
      passwordHash: defaultPasswordHash,
      role: 'Executive Admin',
      roleId: 'ROL-001',
      title: 'Company 1 Executive Admin',
      companyId: 'CMP-001',
      locationId: 'OFF-101',
      status: 'Active'
    },
    {
      id: 'USR-102',
      email: 'alex@minerp.com',
      name: 'Alex Smith (Manager)',
      passwordHash: defaultPasswordHash,
      role: 'Sales Representative',
      roleId: 'ROL-002',
      title: 'Company 1 Sales Representative',
      companyId: 'CMP-001',
      locationId: 'OFF-102',
      status: 'Active'
    }
  ];
  await prisma.user.createMany({ data: users });
  console.log(`✅ Seeded ${users.length} Default Users (Admin & Manager)`);

  console.log('🎉 COMPLETED INITIALIZING SYSTEM DATA! ALL MOCK ENTITY RECORDS REMOVED.');
}

main()
  .catch((e) => {
    console.error('❌ Error during database initialization:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
