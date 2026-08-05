-- minERP PostgreSQL Enterprise Database DDL & Seed Schema

DROP TABLE IF EXISTS office_locations CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS sales_orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- 0. Companies Table
CREATE TABLE companies (
    id VARCHAR(60) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    tax_id VARCHAR(100),
    currency VARCHAR(20) DEFAULT 'USD ($)',
    country VARCHAR(100) DEFAULT 'US',
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 0b. Office Locations Table
CREATE TABLE office_locations (
    id VARCHAR(60) PRIMARY KEY,
    company_id VARCHAR(60) REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(100) DEFAULT 'Branch Office',
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    manager VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 0c. Roles Table
CREATE TABLE roles (
    id VARCHAR(60) PRIMARY KEY,
    company_id VARCHAR(60) REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    permissions TEXT NOT NULL,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. Master Products Table
CREATE TABLE products (
    sku VARCHAR(60) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 10,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    barcode VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sales Orders Table
CREATE TABLE sales_orders (
    id VARCHAR(60) PRIMARY KEY,
    customer VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    order_date DATE DEFAULT CURRENT_DATE,
    items_count INT DEFAULT 1,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customers Directory Table
CREATE TABLE customers (
    id VARCHAR(60) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    credit_limit NUMERIC(12, 2) DEFAULT 10000.00,
    lifetime_sales NUMERIC(12, 2) DEFAULT 0.00,
    receivables_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. HR Employees Table
CREATE TABLE employees (
    id VARCHAR(60) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Active',
    hire_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. General Ledger Journal Entries Table
CREATE TABLE journal_entries (
    id VARCHAR(60) PRIMARY KEY,
    entry_date DATE DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    debit_account VARCHAR(255) NOT NULL,
    credit_account VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data
INSERT INTO products (sku, name, category, stock, min_stock, unit_price, cost_price, barcode) VALUES
('MON-34-UW', 'UltraWide 34" Curved Monitor', 'Electronics', 2, 5, 499.99, 320.00, '109283749102'),
('DOC-TB4-PRO', 'Thunderbolt 4 Docking Station', 'Electronics', 24, 10, 189.50, 110.00, '883920192834'),
('CHR-EX-BLK', 'Executive Leather Task Chair', 'Furniture', 15, 8, 299.00, 175.00, '772910384756'),
('KB-ERG-01', 'Ergonomic Mechanical Keyboard', 'Electronics', 0, 15, 129.99, 70.00, '992018374625'),
('DSK-SIT-OAK', 'Motorized Sit-Stand Oak Desk', 'Furniture', 8, 6, 549.00, 350.00, '554019283746');

INSERT INTO sales_orders (id, customer, email, order_date, items_count, amount, status) VALUES
('ORD-9842', 'Nexus Tech Solutions', 'procurement@nexustech.io', '2026-07-21', 4, 3450.00, 'Completed'),
('ORD-9841', 'Apex Logistics Inc.', 'billing@apexlogistics.com', '2026-07-21', 1, 1850.00, 'Processing'),
('ORD-9840', 'Quantum BioLabs', 'supplies@quantumbio.org', '2026-07-20', 12, 720.50, 'Completed');

INSERT INTO customers (id, name, company, email, phone, credit_limit, lifetime_sales, receivables_balance) VALUES
('CUST-201', 'Nexus Tech Solutions', 'Nexus Tech Solutions', 'procurement@nexustech.io', '+1 (555) 234-8900', 25000.00, 45200.00, 3450.00),
('CUST-202', 'Apex Logistics Inc', 'Apex Logistics Inc', 'billing@apexlogistics.com', '+1 (555) 890-1234', 15000.00, 28900.00, 1850.00);

INSERT INTO employees (id, name, role, department, salary, status, hire_date) VALUES
('EMP-101', 'Jane Doe', 'Operations Lead', 'Operations', 95000.00, 'Active', '2024-03-15'),
('EMP-102', 'Alex Smith', 'Warehouse Manager', 'Logistics', 68000.00, 'Active', '2024-06-01');
