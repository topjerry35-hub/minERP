import http from 'http';
import crypto from 'crypto';
import { prisma, PG_CONFIG } from './db.js';
import { signJwtToken, verifyJwtToken } from './auth.js';

const PORT = process.env.PORT || 5005;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const server = http.createServer(async (req, res) => {
  // Enable CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const pathParts = pathname.split('/').filter(Boolean); // e.g. ['api', 'products', 'MON-34-UW']

  try {
    // 1. JWT Login Endpoint
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const { email, password } = JSON.parse(body);
          if (!email || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing email or password' }));
            return;
          }

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Authentication failed: User not found' }));
            return;
          }

          const expectedHash = hashPassword(password);
          if (user.passwordHash !== expectedHash) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Authentication failed: Invalid credentials' }));
            return;
          }

          const userPayload = { email: user.email, name: user.name, role: user.role, title: user.title };
          const token = signJwtToken(userPayload);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            message: 'JWT Authentication successful', 
            token, 
            tokenType: 'Bearer',
            user: userPayload 
          }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid login payload' }));
        }
      });
      return;
    }

    // 2. JWT Me (Verify Token) Endpoint
    if (req.method === 'GET' && pathname === '/api/auth/me') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      const decodedPayload = verifyJwtToken(token);

      if (!decodedPayload) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized: Invalid or expired JWT token' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ authenticated: true, user: decodedPayload }));
      return;
    }

    // 3. API Root & Health Check Endpoints
    if (req.method === 'GET' && (pathname === '/' || pathname === '/api' || pathname === '/api/' || pathname === '/api/health')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        name: 'minERP Enterprise REST API Engine',
        version: '2.0.0',
        status: 'OK', 
        orm: 'Prisma',
        database: 'PostgreSQL', 
        auth: 'JWT (HS256)',
        endpoints: [
          '/api/health',
          '/api/products',
          '/api/orders',
          '/api/customers',
          '/api/employees',
          '/api/finance/summary',
          '/api/journal',
          '/api/companies',
          '/api/offices',
          '/api/roles',
          '/api/users'
        ],
        timestamp: new Date().toISOString() 
      }));
      return;
    }

    // 4. Products API
    if (pathParts[0] === 'api' && pathParts[1] === 'products') {
      // GET all
      if (req.method === 'GET' && pathParts.length === 2) {
        const products = await prisma.product.findMany();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(products));
        return;
      }

      // POST create
      if (req.method === 'POST' && pathParts.length === 2) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const product = await prisma.product.create({
              data: {
                sku: data.sku,
                name: data.name,
                category: data.category,
                stock: Number(data.stock) || 0,
                minStock: Number(data.minStock) || 10,
                unitPrice: Number(data.unitPrice) || 0,
                costPrice: Number(data.costPrice) || 0,
                barcode: data.barcode || null,
                imageUrl: data.imageUrl || null
              }
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Product created', product }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message || 'Invalid JSON body' }));
          }
        });
        return;
      }

      // PUT update individual
      if (req.method === 'PUT' && pathParts.length === 3) {
        const sku = decodeURIComponent(pathParts[2]);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const updateData = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.category !== undefined) updateData.category = data.category;
            if (data.stock !== undefined) updateData.stock = Number(data.stock);
            if (data.minStock !== undefined) updateData.minStock = Number(data.minStock);
            if (data.unitPrice !== undefined) updateData.unitPrice = Number(data.unitPrice);
            if (data.costPrice !== undefined) updateData.costPrice = Number(data.costPrice);
            if (data.barcode !== undefined) updateData.barcode = data.barcode;
            if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

            const product = await prisma.product.update({
              where: { sku },
              data: updateData
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Product updated', product }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }

    // 5. Orders API
    if (pathParts[0] === 'api' && pathParts[1] === 'orders') {
      // GET all
      if (req.method === 'GET' && pathParts.length === 2) {
        const orders = await prisma.salesOrder.findMany({
          include: { items: true },
          orderBy: { orderDate: 'desc' }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(orders));
        return;
      }

      // POST create
      if (req.method === 'POST' && pathParts.length === 2) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const orderData = {
              id: data.id || `ORD-${Math.floor(9800 + Math.random() * 200)}`,
              customer: data.customer,
              email: data.email || null,
              itemsCount: Number(data.itemsCount) || 1,
              amount: Number(data.amount) || 0,
              status: data.status || 'Completed',
              orderDate: data.date ? new Date(data.date) : new Date()
            };

            if (data.items && Array.isArray(data.items)) {
              orderData.items = {
                create: data.items.map(item => ({
                  sku: item.sku || 'UNKNOWN',
                  name: item.name || 'Unknown Item',
                  qty: Number(item.qty) || 1,
                  price: Number(item.price) || 0.0
                }))
              };
            }

            const order = await prisma.salesOrder.create({
              data: orderData,
              include: { items: true }
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Order created', order }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      // PUT update
      if (req.method === 'PUT' && pathParts.length === 3) {
        const id = decodeURIComponent(pathParts[2]);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const updateData = {};
            if (data.status !== undefined) updateData.status = data.status;
            if (data.amount !== undefined) updateData.amount = Number(data.amount);

            const order = await prisma.salesOrder.update({
              where: { id },
              data: updateData
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Order updated', order }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }

    // 6. Customers API
    if (pathParts[0] === 'api' && pathParts[1] === 'customers') {
      // GET all
      if (req.method === 'GET' && pathParts.length === 2) {
        const customers = await prisma.customer.findMany();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(customers));
        return;
      }

      // POST create
      if (req.method === 'POST' && pathParts.length === 2) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const customer = await prisma.customer.create({
              data: {
                id: data.id || `CUST-${Math.floor(200 + Math.random() * 100)}`,
                name: data.name,
                company: data.company || null,
                email: data.email,
                phone: data.phone || null,
                creditLimit: Number(data.creditLimit) || 10000.0,
                lifetimeSales: Number(data.lifetimeSales) || 0.0,
                receivablesBalance: Number(data.receivablesBalance) || 0.0
              }
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Customer created', customer }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      // PUT update
      if (req.method === 'PUT' && pathParts.length === 3) {
        const id = decodeURIComponent(pathParts[2]);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const updateData = {};
            if (data.receivablesBalance !== undefined) updateData.receivablesBalance = Number(data.receivablesBalance);
            if (data.lifetimeSales !== undefined) updateData.lifetimeSales = Number(data.lifetimeSales);
            if (data.creditLimit !== undefined) updateData.creditLimit = Number(data.creditLimit);

            const customer = await prisma.customer.update({
              where: { id },
              data: updateData
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Customer updated', customer }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }

    // 7. Employees API
    if (pathParts[0] === 'api' && pathParts[1] === 'employees') {
      // GET all
      if (req.method === 'GET' && pathParts.length === 2) {
        const employees = await prisma.employee.findMany();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(employees));
        return;
      }

      // POST create
      if (req.method === 'POST' && pathParts.length === 2) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const employee = await prisma.employee.create({
              data: {
                id: data.id || `EMP-${Math.floor(100 + Math.random() * 900)}`,
                name: data.name,
                role: data.role,
                department: data.department,
                salary: Number(data.salary) || 0.0,
                status: data.status || 'Active',
                hireDate: data.hireDate ? new Date(data.hireDate) : new Date()
              }
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Employee created', employee }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }

    // 8. Finance Summary API
    if (req.method === 'GET' && pathname === '/api/finance/summary') {
      const orders = await prisma.salesOrder.findMany();
      const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0) + 125000.00;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ grossRevenue: totalRevenue, operatingExpenses: 96400.00, netProfit: totalRevenue - 96400.00 }));
      return;
    }

    // 9. Journal Entries API (General Ledger)
    if (pathParts[0] === 'api' && pathParts[1] === 'journal') {
      if (req.method === 'GET') {
        const entries = await prisma.journalEntry.findMany({
          orderBy: { entryDate: 'desc' }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(entries));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const entry = await prisma.journalEntry.create({
              data: {
                id: data.id || `JRN-${Math.floor(1000 + Math.random() * 9000)}`,
                description: data.description,
                debitAccount: data.debitAccount,
                creditAccount: data.creditAccount,
                amount: Number(data.amount) || 0.0,
                entryDate: data.entryDate ? new Date(data.entryDate) : new Date()
              }
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Journal entry created', entry }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }

    // 10. Companies API
    if (pathParts[0] === 'api' && pathParts[1] === 'companies') {
      if (req.method === 'GET') {
        const companies = await prisma.company.findMany({
          include: { offices: true, roles: true }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(companies));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const company = await prisma.company.create({
              data: {
                id: data.id || `CMP-${Math.floor(100 + Math.random() * 900)}`,
                name: data.name,
                code: data.code || `CMP-${Math.floor(100 + Math.random() * 900)}`,
                taxId: data.taxId || null,
                currency: data.currency || 'USD ($)',
                country: data.country || 'US',
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                status: data.status || 'Active'
              }
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Company created', company }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }

    // 11. Office Locations API
    if (pathParts[0] === 'api' && pathParts[1] === 'offices') {
      if (req.method === 'GET') {
        const offices = await prisma.officeLocation.findMany({
          include: { company: true }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(offices));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const office = await prisma.officeLocation.create({
              data: {
                id: data.id || `OFF-${Math.floor(100 + Math.random() * 900)}`,
                companyId: data.companyId,
                name: data.name,
                code: data.code || `LOC-${Math.floor(100 + Math.random() * 900)}`,
                type: data.type || 'Branch Office',
                address: data.address || null,
                city: data.city || null,
                country: data.country || 'US',
                phone: data.phone || null,
                email: data.email || null,
                manager: data.manager || null,
                status: data.status || 'Active'
              }
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Office location created', office }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }

    // 12. Roles API
    if (pathParts[0] === 'api' && pathParts[1] === 'roles') {
      if (req.method === 'GET' && pathParts.length === 2) {
        const roles = await prisma.role.findMany();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(roles));
        return;
      }

      if (req.method === 'POST' && pathParts.length === 2) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const role = await prisma.role.create({
              data: {
                id: data.id || `ROL-${Math.floor(100 + Math.random() * 900)}`,
                companyId: data.companyId || null,
                name: data.name,
                description: data.description || null,
                permissions: typeof data.permissions === 'string' ? data.permissions : JSON.stringify(data.permissions || []),
                isSystemRole: Boolean(data.isSystemRole)
              }
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Role created', role }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      if (req.method === 'PUT' && pathParts.length === 3) {
        const roleId = decodeURIComponent(pathParts[2]);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const updateData = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.permissions !== undefined) {
              updateData.permissions = typeof data.permissions === 'string' ? data.permissions : JSON.stringify(data.permissions);
            }
            if (data.companyId !== undefined) updateData.companyId = data.companyId;

            const role = await prisma.role.update({
              where: { id: roleId },
              data: updateData
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Role updated successfully', role }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }

    // 13. System Users Directory API
    if (pathParts[0] === 'api' && pathParts[1] === 'users') {
      if (req.method === 'GET' && pathParts.length === 2) {
        const users = await prisma.user.findMany({
          include: { company: true, location: true, userRole: true }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
        return;
      }

      if (req.method === 'POST' && pathParts.length === 2) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const user = await prisma.user.create({
              data: {
                id: data.id || `USR-${Math.floor(100 + Math.random() * 900)}`,
                email: data.email,
                name: data.name,
                passwordHash: data.password ? hashPassword(data.password) : hashPassword('defaultPass123!'),
                role: data.role || 'Employee',
                roleId: data.roleId || null,
                title: data.title || null,
                companyId: data.companyId || null,
                locationId: data.locationId || null,
                status: data.status || 'Active'
              }
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User created successfully', user }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      if (req.method === 'PUT' && pathParts.length === 3) {
        const userId = decodeURIComponent(pathParts[2]);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const updateData = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.email !== undefined) updateData.email = data.email;
            if (data.role !== undefined) updateData.role = data.role;
            if (data.roleId !== undefined) updateData.roleId = data.roleId;
            if (data.title !== undefined) updateData.title = data.title;
            if (data.companyId !== undefined) updateData.companyId = data.companyId;
            if (data.locationId !== undefined) updateData.locationId = data.locationId;
            if (data.status !== undefined) updateData.status = data.status;
            if (data.password) updateData.passwordHash = hashPassword(data.password);

            const user = await prisma.user.update({
              where: { id: userId },
              data: updateData
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User role and permissions updated successfully', user }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      if (req.method === 'DELETE' && pathParts.length === 3) {
        const userId = decodeURIComponent(pathParts[2]);
        try {
          await prisma.user.delete({ where: { id: userId } });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User deleted successfully', userId }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));

  } catch (globalError) {
    console.error('[Global Server Error]', globalError);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error', details: globalError.message }));
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`💎 minERP Prisma ORM & JWT Auth REST Server Running!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Database Connection: ${PG_CONFIG.connectionString}`);
  console.log(`====================================================`);
});
