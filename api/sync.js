// Vercel Serverless Function for Central Multi-Device Database Sync
import { PrismaClient } from '@prisma/client';

let prisma = null;
if (process.env.DATABASE_URL) {
  try {
    if (!global.prismaInstance) {
      global.prismaInstance = new PrismaClient();
    }
    prisma = global.prismaInstance;
  } catch (e) {
    console.error('Prisma initialization warning:', e.message);
  }
}

// In-memory persistent state for serverless lifetime
let serverlessMemoryStore = null;

const CLOUD_STORAGE_URLS = [
  'https://kv.min-erp.workers.dev/sync',
  'https://jsonblob.com/api/jsonBlob/019fdc46-f6b6-7163-83de-bba51678fca3'
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // If PostgreSQL DATABASE_URL is configured on Vercel
  if (prisma) {
    try {
      if (req.method === 'GET') {
        const products = await prisma.product.findMany().catch(() => []);
        const orders = await prisma.salesOrder.findMany({ include: { items: true } }).catch(() => []);
        const customers = await prisma.customer.findMany().catch(() => []);
        const employees = await prisma.employee.findMany().catch(() => []);
        const suppliers = await prisma.supplier.findMany().catch(() => []);
        const deals = await prisma.deal.findMany().catch(() => []);
        const leads = await prisma.lead.findMany().catch(() => []);
        const bankAccounts = await prisma.bankAccount.findMany().catch(() => []);
        const accounts = await prisma.account.findMany().catch(() => []);
        const companies = await prisma.company.findMany().catch(() => []);
        const offices = await prisma.officeLocation.findMany().catch(() => []);
        const roles = await prisma.role.findMany().catch(() => []);
        const users = await prisma.user.findMany().catch(() => []);

        const dbData = {
          products,
          orders,
          customers,
          employees,
          suppliers,
          deals,
          leads,
          bankAccounts,
          accounts,
          companies,
          offices,
          roles,
          users,
          dbConnected: true,
          timestamp: Date.now()
        };
        serverlessMemoryStore = dbData;
        return res.status(200).json(dbData);
      }

      if (req.method === 'POST' || req.method === 'PUT') {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (data && typeof data === 'object') {
          serverlessMemoryStore = data;
          
          // Upsert Products if present
          if (Array.isArray(data.products)) {
            for (const p of data.products) {
              if (p.sku && p.name) {
                await prisma.product.upsert({
                  where: { sku: p.sku },
                  update: {
                    name: p.name,
                    category: p.category || 'General',
                    stock: Number(p.stock) || 0,
                    minStock: Number(p.minStock || p.minThreshold) || 10,
                    unitPrice: Number(p.unitPrice || p.price) || 0,
                    costPrice: Number(p.costPrice || p.cost) || 0
                  },
                  create: {
                    sku: p.sku,
                    name: p.name,
                    category: p.category || 'General',
                    stock: Number(p.stock) || 0,
                    minStock: Number(p.minStock || p.minThreshold) || 10,
                    unitPrice: Number(p.unitPrice || p.price) || 0,
                    costPrice: Number(p.costPrice || p.cost) || 0
                  }
                }).catch(() => {});
              }
            }
          }

          // Upsert Customers if present
          if (Array.isArray(data.customers)) {
            for (const c of data.customers) {
              if (c.id && c.name) {
                await prisma.customer.upsert({
                  where: { id: c.id },
                  update: {
                    name: c.name,
                    company: c.company || null,
                    email: c.email || `${c.id.toLowerCase()}@customer.com`,
                    phone: c.phone || null,
                    creditLimit: Number(c.creditLimit) || 10000.0,
                    receivablesBalance: Number(c.receivablesBalance) || 0.0
                  },
                  create: {
                    id: c.id,
                    name: c.name,
                    company: c.company || null,
                    email: c.email || `${c.id.toLowerCase()}@customer.com`,
                    phone: c.phone || null,
                    creditLimit: Number(c.creditLimit) || 10000.0,
                    receivablesBalance: Number(c.receivablesBalance) || 0.0
                  }
                }).catch(() => {});
              }
            }
          }

          return res.status(200).json({ success: true, dbConnected: true, timestamp: Date.now() });
        }
      }
    } catch (dbErr) {
      console.error('PostgreSQL query error in api/sync.js:', dbErr.message);
    }
  }

  // Fallback to Cloud Sync / Memory Storage if DATABASE_URL is not configured yet
  if (req.method === 'GET') {
    if (serverlessMemoryStore) {
      return res.status(200).json(serverlessMemoryStore);
    }

    for (const url of CLOUD_STORAGE_URLS) {
      try {
        const getRes = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (getRes.ok) {
          const data = await getRes.json();
          if (data && typeof data === 'object' && !data.empty) {
            serverlessMemoryStore = data;
            return res.status(200).json(data);
          }
        }
      } catch (e) {}
    }
    return res.status(200).json({ empty: true });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (data && typeof data === 'object') {
        serverlessMemoryStore = data;
        const payload = JSON.stringify(data);

        for (const url of CLOUD_STORAGE_URLS) {
          try {
            await fetch(url, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: payload
            });
          } catch (e) {}
        }
        return res.status(200).json({ success: true, timestamp: Date.now() });
      }
    } catch (err) {
      return res.status(400).json({ error: 'Failed to update cloud database' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
