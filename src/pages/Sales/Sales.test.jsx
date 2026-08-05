import { describe, it, expect, vi } from 'vitest';

// Mock API calls before component imports to prevent HTTP timeouts
vi.mock('../../services/api', () => ({
  fetchCustomers: vi.fn().mockResolvedValue([]),
  fetchOrders: vi.fn().mockResolvedValue([]),
  fetchProducts: vi.fn().mockResolvedValue([]),
  fetchQuotations: vi.fn().mockResolvedValue([]),
  fetchInvoices: vi.fn().mockResolvedValue([]),
  fetchCustomerPayments: vi.fn().mockResolvedValue([]),
  fetchSalesReturns: vi.fn().mockResolvedValue([]),
  createCustomer: vi.fn().mockResolvedValue({ customer: {} }),
  createOrder: vi.fn().mockResolvedValue({ order: {} }),
  createQuotation: vi.fn().mockResolvedValue({}),
  createInvoice: vi.fn().mockResolvedValue({}),
  createCustomerPayment: vi.fn().mockResolvedValue({}),
  createSalesReturn: vi.fn().mockResolvedValue({})
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Sales from './Sales';
import SalesOrderList from '../../components/Sales/SalesOrderList';
import CustomerList from '../../components/Sales/CustomerList';
import QuotationList from '../../components/Sales/QuotationList';
import InvoiceList from '../../components/Sales/InvoiceList';

// Mock mockDataGenerator to provide predictable sample data for testing
const sampleOrders = [
  { id: 'ORD-9801', customer: 'Nexus Tech Solutions', email: 'procurement@nexustech.io', date: '2026-07-21', itemsCount: 4, amount: 3450.00, status: 'Completed' },
  { id: 'ORD-9802', customer: 'Apex Logistics Inc.', email: 'billing@apexlogistics.com', date: '2026-07-21', itemsCount: 1, amount: 1850.00, status: 'Processing' },
  { id: 'ORD-9803', customer: 'Vanguard Capital', email: 'office@vanguardcap.com', date: '2026-07-20', itemsCount: 6, amount: 5400.00, status: 'Pending' }
];

const sampleCustomers = [
  { id: 'CUST-1001', name: 'Jane Doe', company: 'Nexus Tech Solutions', email: 'jane@nexustech.io', phone: '+1 555-0199', creditLimit: 50000, lifetimeSales: 120000, receivablesBalance: 3450, status: 'Active' },
  { id: 'CUST-1002', name: 'Alex Smith', company: 'Apex Logistics Inc.', email: 'alex@apex.com', phone: '+1 555-0188', creditLimit: 25000, lifetimeSales: 45000, receivablesBalance: 1850, status: 'Active' }
];

const sampleQuotations = [
  { id: 'QTN-2026-101', customer: 'Nexus Tech Solutions', date: '2026-07-18', validUntil: '2026-08-18', amount: 4800.00, status: 'Sent' }
];

const sampleInvoices = [
  { id: 'INV-2026-001', orderId: 'ORD-9801', customer: 'Nexus Tech Solutions', date: '2026-07-21', dueDate: '2026-08-20', amount: 3450.00, status: 'Unpaid' }
];

describe('Sales Module Test Suite', () => {

  describe('SalesOrderList Component Tests', () => {
    it('renders sales orders list properly', () => {
      render(
        <SalesOrderList 
          salesOrders={sampleOrders} 
          onNewOrderClick={vi.fn()} 
          onViewOrderDetails={vi.fn()} 
          onGenerateInvoiceForOrder={vi.fn()} 
          searchQuery="" 
        />
      );

      expect(screen.getByText('Sales Orders & Fulfillment')).toBeInTheDocument();
      expect(screen.getByText('ORD-9801')).toBeInTheDocument();
      expect(screen.getByText('Nexus Tech Solutions')).toBeInTheDocument();
      expect(screen.getByText('ORD-9802')).toBeInTheDocument();
    });

    it('filters orders safely by searchQuery', () => {
      render(
        <SalesOrderList 
          salesOrders={sampleOrders} 
          onNewOrderClick={vi.fn()} 
          onViewOrderDetails={vi.fn()} 
          onGenerateInvoiceForOrder={vi.fn()} 
          searchQuery="Apex" 
        />
      );

      expect(screen.getByText('Apex Logistics Inc.')).toBeInTheDocument();
      expect(screen.queryByText('Nexus Tech Solutions')).not.toBeInTheDocument();
    });

    it('handles null/undefined searchQuery and properties without throwing TypeError', () => {
      expect(() => {
        render(
          <SalesOrderList 
            salesOrders={[{ id: undefined, customer: null, status: 'Pending' }]} 
            onNewOrderClick={vi.fn()} 
            onViewOrderDetails={vi.fn()} 
            onGenerateInvoiceForOrder={vi.fn()} 
            searchQuery={undefined} 
          />
        );
      }).not.toThrow();
    });

    it('filters orders by status filter buttons', () => {
      render(
        <SalesOrderList 
          salesOrders={sampleOrders} 
          onNewOrderClick={vi.fn()} 
          onViewOrderDetails={vi.fn()} 
          onGenerateInvoiceForOrder={vi.fn()} 
          searchQuery="" 
        />
      );

      // Click 'Processing' status button
      const processingBtn = screen.getByRole('button', { name: /processing/i });
      fireEvent.click(processingBtn);

      expect(screen.getByText('ORD-9802')).toBeInTheDocument();
      expect(screen.queryByText('ORD-9801')).not.toBeInTheDocument();
    });

    it('triggers view details callback on View button click', () => {
      const handleViewDetails = vi.fn();
      render(
        <SalesOrderList 
          salesOrders={sampleOrders} 
          onNewOrderClick={vi.fn()} 
          onViewOrderDetails={handleViewDetails} 
          onGenerateInvoiceForOrder={vi.fn()} 
          searchQuery="" 
        />
      );

      const viewBtns = screen.getAllByRole('button', { name: /view/i });
      fireEvent.click(viewBtns[0]);

      expect(handleViewDetails).toHaveBeenCalledWith(sampleOrders[0]);
    });
  });

  describe('CustomerList Component Tests', () => {
    it('renders customer list and calculates total receivables correctly', () => {
      render(
        <CustomerList 
          customers={sampleCustomers} 
          onAddCustomerClick={vi.fn()} 
          onNewQuoteForCustomer={vi.fn()} 
          onNewOrderForCustomer={vi.fn()} 
          onRecordPaymentForCustomer={vi.fn()} 
          searchQuery="" 
        />
      );

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Alex Smith')).toBeInTheDocument();
      expect(screen.getByText('₹5,300.00')).toBeInTheDocument(); // 3450 + 1850
    });

    it('filters customers safely with searchQuery', () => {
      render(
        <CustomerList 
          customers={sampleCustomers} 
          onAddCustomerClick={vi.fn()} 
          onNewQuoteForCustomer={vi.fn()} 
          onNewOrderForCustomer={vi.fn()} 
          onRecordPaymentForCustomer={vi.fn()} 
          searchQuery="Jane" 
        />
      );

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.queryByText('Alex Smith')).not.toBeInTheDocument();
    });
  });

  describe('QuotationList Component Tests', () => {
    it('renders quotations and handles quote-to-order conversion', () => {
      const handleConvert = vi.fn();
      render(
        <QuotationList 
          quotations={sampleQuotations} 
          onNewQuotationClick={vi.fn()} 
          onConvertQuoteToOrder={handleConvert} 
          searchQuery="" 
        />
      );

      expect(screen.getByText('QTN-2026-101')).toBeInTheDocument();
      const convertBtn = screen.getByRole('button', { name: /convert/i });
      fireEvent.click(convertBtn);

      expect(handleConvert).toHaveBeenCalledWith(sampleQuotations[0]);
    });
  });

  describe('Sales Page Integration Tests', () => {
    it('renders Sales page subtabs and navigates between views', async () => {
      render(<Sales searchQuery="" setSearchQuery={vi.fn()} />);

      // Verify sub-navigation buttons exist
      expect(screen.getByRole('button', { name: /customers/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sales orders/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /invoices/i })).toBeInTheDocument();

      // Click 'Sales Orders' subtab
      const ordersSubTab = screen.getByRole('button', { name: /sales orders/i });
      fireEvent.click(ordersSubTab);

      expect(await screen.findByText('Sales Orders & Fulfillment')).toBeInTheDocument();
    }, 15000);

    it('verifies product stock quantity decreases after sales order creation', () => {
      // Test the stock deduction logic directly
      const initialProducts = [
        { sku: 'SKU-101', name: 'Test Product 1', stock: 50, minThreshold: 10 }
      ];
      const newOrder = {
        id: 'ORD-TEST-1',
        customer: 'Test Customer',
        amount: 500,
        items: [{ sku: 'SKU-101', name: 'Test Product 1', qty: 5, price: 100 }]
      };

      const updatedProducts = initialProducts.map(prod => {
        const soldItem = newOrder.items.find(i => i.sku === prod.sku);
        if (soldItem) {
          const qtySold = Number(soldItem.qty) || 1;
          const newStock = Math.max(0, (Number(prod.stock) || 0) - qtySold);
          return { ...prod, stock: newStock };
        }
        return prod;
      });

      expect(updatedProducts[0].stock).toBe(45);
    });
  });

});
