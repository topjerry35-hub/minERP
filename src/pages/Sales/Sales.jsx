import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  ShoppingBag, 
  Receipt, 
  CreditCard, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  Printer,
  Monitor,
  Zap
} from 'lucide-react';
import { getTodayFormatted, formatDate } from '../../utils/date';

import CustomerList from '../../components/Sales/CustomerList';
import QuotationList from '../../components/Sales/QuotationList';
import SalesOrderList from '../../components/Sales/SalesOrderList';
import InvoiceList from '../../components/Sales/InvoiceList';
import CustomerPaymentList from '../../components/Sales/CustomerPaymentList';
import SalesReturnList from '../../components/Sales/SalesReturnList';
import PosTerminal from '../../components/Sales/PosTerminal';

import NewQuotationModal from '../../components/Sales/NewQuotationModal';
import NewCustomerModal from '../../components/Sales/NewCustomerModal';
import RecordCustomerPaymentModal from '../../components/Sales/RecordCustomerPaymentModal';
import NewSalesReturnModal from '../../components/Sales/NewSalesReturnModal';
import NewSaleModal from '../../components/NewSaleModal';
import InvoiceBillModal from '../../components/Sales/InvoiceBillModal';
import { 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  fetchOrders, 
  createOrder, 
  updateOrder, 
  fetchProducts, 
  fetchQuotations, 
  createQuotation, 
  fetchInvoices, 
  createInvoice, 
  fetchCustomerPayments, 
  createCustomerPayment, 
  fetchSalesReturns, 
  createSalesReturn 
} from '../../services/api';

export default function Sales({ searchQuery, setSearchQuery }) {
  const [activeSubTab, setActiveSubTab] = useState('orders');

  // Modal triggers
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isDirectMode, setIsDirectMode] = useState(false);
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isNewReturnOpen, setIsNewReturnOpen] = useState(false);

  // PDF Bill / Commercial Invoice Modal Trigger State
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [activeInvoiceForBill, setActiveInvoiceForBill] = useState(null);
  const [activeOrderForBill, setActiveOrderForBill] = useState(null);

  const [targetCustomerForAction, setTargetCustomerForAction] = useState(null);
  const [targetInvoiceForAction, setTargetInvoiceForAction] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Database Datasets
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [salesReturns, setSalesReturns] = useState([]);

  useEffect(() => {
    async function loadData() {
      const fetchedCustomers = await fetchCustomers();
      if (fetchedCustomers) setCustomers(fetchedCustomers);
      
      const fetchedOrders = await fetchOrders();
      if (fetchedOrders) setSalesOrders(fetchedOrders);

      const fetchedProds = await fetchProducts();
      if (fetchedProds) setProducts(fetchedProds);

      const fetchedQuotes = await fetchQuotations();
      if (fetchedQuotes) setQuotations(fetchedQuotes);

      const fetchedInvs = await fetchInvoices();
      if (fetchedInvs) setInvoices(fetchedInvs);

      const fetchedPays = await fetchCustomerPayments();
      if (fetchedPays) setCustomerPayments(fetchedPays);

      const fetchedRets = await fetchSalesReturns();
      if (fetchedRets) setSalesReturns(fetchedRets);
    }
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateQuotation = async (newQuoteData) => {
    const savedQuote = await createQuotation(newQuoteData);
    setQuotations(prev => [savedQuote, ...prev]);
    showToast(`Quotation ${savedQuote.id} issued to ${savedQuote.customer} (₹${(savedQuote.amount || 0).toFixed(2)})!`);
  };

  const handleAddCustomer = async (newCustomer) => {
    const saved = await createCustomer(newCustomer);
    if (saved && saved.customer) {
      setCustomers(prev => [saved.customer, ...prev]);
      showToast(`Customer account ${saved.customer.name} (${saved.customer.company}) created!`);
    } else {
      showToast(`Failed to create customer on database!`);
    }
  };

  const handleRecordPayment = async (paymentData) => {
    const c = customers.find(cust => cust.name === paymentData.customer);
    if (!c) return;

    const newReceivables = Math.max(0, c.receivablesBalance - paymentData.amount);
    const newLifetimeSales = c.lifetimeSales + paymentData.amount;

    const updatedCust = await updateCustomer(c.id, {
      receivablesBalance: newReceivables,
      lifetimeSales: newLifetimeSales
    });

    if (updatedCust && updatedCust.customer) {
      setCustomers(prev => prev.map(cust => cust.id === c.id ? updatedCust.customer : cust));
      setCustomerPayments(prev => [paymentData, ...prev]);
      
      if (paymentData.invoiceRef) {
        setInvoices(prev => prev.map(inv => inv.id === paymentData.invoiceRef ? { ...inv, status: 'Paid' } : inv));
      }
      showToast(`Recorded customer payment receipt of ₹${paymentData.amount.toFixed(2)} from ${paymentData.customer}!`);
    } else {
      showToast(`Failed to record payment in database!`);
    }
  };

  const handleProcessReturn = async (returnData) => {
    const savedReturn = await createSalesReturn(returnData);
    const returnToSave = savedReturn || returnData;

    const c = customers.find(cust => cust.name === returnData.customer);
    const newReceivables = c ? Math.max(0, c.receivablesBalance - returnData.refundAmount) : 0;

    if (c) {
      const updatedResult = await updateCustomer(c.id, { receivablesBalance: newReceivables });
      const updatedCust = updatedResult?.customer || updatedResult || { ...c, receivablesBalance: newReceivables };
      setCustomers(prev => prev.map(cust => cust.id === c.id ? updatedCust : cust));
    }
    
    if (returnData.autoRestock && returnData.orderId) {
      const targetOrder = salesOrders.find(o => o.id === returnData.orderId);
      if (targetOrder && targetOrder.items && Array.isArray(targetOrder.items)) {
        setProducts(prevProducts => {
          return prevProducts.map(prod => {
            const returnedItem = targetOrder.items.find(i => i.sku === prod.sku);
            if (returnedItem) {
              const restockQty = Number(returnedItem.qty) || 1;
              const newStock = (Number(prod.stock) || 0) + restockQty;
              const minThresh = prod.minThreshold || prod.minStock || 10;
              return {
                ...prod,
                stock: newStock,
                status: newStock <= minThresh ? (newStock === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock'
              };
            }
            return prod;
          });
        });
      }
    }

    setSalesReturns(prev => [returnToSave, ...prev]);
    showToast(`Sales Return ${returnToSave.id} approved for Order ${returnData.orderId}! Refund of ₹${returnData.refundAmount.toFixed(2)} processed.`);
  };

  const handleConvertQuoteToOrder = async (quote) => {
    const newOrderId = `ORD-${Math.floor(9800 + Math.random() * 100)}`;
    const newOrder = {
      id: newOrderId,
      customer: quote.customer,
      email: `${quote.customer.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      date: getTodayFormatted(),
      itemsCount: quote.items?.length || 2,
      amount: quote.amount,
      status: 'Processing',
      items: quote.items || []
    };

    const saved = await createOrder(newOrder);
    const orderToSave = saved?.order || saved || newOrder;
    
    setSalesOrders(prev => [orderToSave, ...prev]);
    setQuotations(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Converted' } : q));
    showToast(`Converted Quote ${quote.id} into Sales Order ${newOrderId}!`);
  };

  const handleGenerateInvoiceForOrder = async (order) => {
    const invId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newInvoice = {
      id: invId,
      orderId: order.id,
      customer: order.customer,
      date: getTodayFormatted(),
      dueDate: formatDate(new Date(Date.now() + 30*24*60*60*1000)),
      amount: order.amount || 0,
      status: 'Unpaid'
    };

    // Update order status on backend to "Completed"
    const updatedResult = await updateOrder(order.id, { ...order, status: 'Completed' });
    const completedOrder = updatedResult?.order || updatedResult || { ...order, status: 'Completed' };

    setSalesOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...completedOrder, status: 'Completed' } : o));
    setInvoices(prev => [newInvoice, ...prev]);

    // Open PDF Tax Bill Modal
    setActiveOrderForBill(completedOrder);
    setActiveInvoiceForBill(newInvoice);
    setIsBillModalOpen(true);

    showToast(`Generated Billing Invoice ${invId} for Order ${order.id}!`);
  };

  const handleCreateNewSale = async (newOrder) => {
    const saved = await createOrder(newOrder);
    const orderToSave = (saved && saved.order) ? saved.order : newOrder;
    setSalesOrders(prev => [orderToSave, ...prev]);

    // Decrease product stock state for each item sold
    if (newOrder.items && Array.isArray(newOrder.items)) {
      setProducts(prevProducts => {
        return prevProducts.map(prod => {
          const prodSku = (prod.sku || '').trim().toLowerCase();
          const prodName = (prod.name || '').trim().toLowerCase();

          const soldItem = newOrder.items.find(i => {
            const itemSku = (i.sku || '').trim().toLowerCase();
            const itemName = (i.name || '').trim().toLowerCase();
            return (
              (itemSku && (prodSku === itemSku || String(prod.id).trim().toLowerCase() === itemSku)) ||
              (itemName && (prodName === itemName || prodName.includes(itemName) || itemName.includes(prodName)))
            );
          });

          if (soldItem) {
            const qtySold = Number(soldItem.qty) || 1;
            const newStock = Math.max(0, (Number(prod.stock) || 0) - qtySold);
            const minThresh = prod.minThreshold || prod.minStock || 10;
            return {
              ...prod,
              stock: newStock,
              status: newStock <= minThresh ? (newStock === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock'
            };
          }
          return prod;
        });
      });
    }

    const invId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newInvoice = {
      id: invId,
      orderId: orderToSave.id,
      customer: orderToSave.customer,
      date: getTodayFormatted(),
      dueDate: getTodayFormatted(),
      amount: orderToSave.amount || 0,
      status: (newOrder.autoInvoice || isDirectMode) ? 'Paid' : 'Unpaid'
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Show PDF Bill Modal immediately on sale submit ONLY for non-POS sales (POS shows its own POS Receipt)
    if (activeSubTab !== 'pos') {
      setActiveOrderForBill(orderToSave);
      setActiveInvoiceForBill(newInvoice);
      setIsBillModalOpen(true);
    }

    if (newOrder.autoInvoice || isDirectMode) {
      showToast(`Recorded Direct Sale ${orderToSave.id} (₹${(orderToSave.amount || 0).toFixed(2)}) & issued instant paid invoice ${invId}!`);
    } else {
      showToast(`New Sale Order ${orderToSave.id} for ₹${(orderToSave.amount || 0).toFixed(2)} recorded!`);
    }
  };

  return (
    <div className="dashboard-body">
      {toastMessage && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle2 size={20} />
          {toastMessage}
        </div>
      )}

      {/* Header title */}
      <div className="dashboard-header-title">
        <div>
          <h1>Sales & Revenue Management</h1>
          <p>Manage customer relationships, price quotations, orders, billing invoices, returns, and collections</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" style={{ borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }} onClick={() => setActiveSubTab('pos')}>
            <Monitor size={16} color="var(--accent-blue)" />
            Open POS Register
          </button>
          <button className="btn-secondary" onClick={() => setIsNewReturnOpen(true)}>
            <RotateCcw size={16} color="#ef4444" />
            + Sales Return (RMA)
          </button>
          <button className="btn-secondary" onClick={() => setIsNewCustomerOpen(true)}>
            <Users size={16} color="#3b82f6" />
            + New Customer
          </button>
          <button className="btn-secondary" onClick={() => setIsNewQuoteOpen(true)}>
            <FileText size={16} color="#8b5cf6" />
            + Create Quotation
          </button>
          <button className="btn-secondary" onClick={() => { setIsDirectMode(false); setIsNewSaleOpen(true); }}>
            <ShoppingBag size={16} color="#10b981" />
            + Standard Sale
          </button>
          <button 
            className="btn-primary" 
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)' }} 
            onClick={() => { setIsDirectMode(true); setIsNewSaleOpen(true); }}
          >
            <Zap size={16} color="#fbbf24" />
            ⚡ Direct Sale
          </button>
        </div>
      </div>

      {/* Sub-tabs navigation */}
      <div className="inventory-nav-tabs">
        {[
          { id: 'orders', label: 'Sales Orders', icon: ShoppingBag },
          { id: 'customers', label: 'Customers Directory', icon: Users },
          { id: 'quotations', label: 'Quotations & Quotes', icon: FileText },
          { id: 'pos', label: 'POS Register Terminal', icon: Monitor },
          { id: 'invoices', label: 'Billing Invoices', icon: Receipt },
          { id: 'returns', label: 'Sales Returns (RMA)', icon: RotateCcw },
          { id: 'payments', label: 'Customer Payments', icon: CreditCard },
        ].map(tab => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              className={`inventory-tab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              <IconComp size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab Views */}
      {activeSubTab === 'pos' && (
        <PosTerminal 
          products={products}
          customers={customers}
          onAddOrder={handleCreateNewSale}
        />
      )}
      {activeSubTab === 'customers' && (
        <CustomerList 
          customers={customers}
          onAddCustomerClick={() => setIsNewCustomerOpen(true)}
          onNewQuoteForCustomer={(cust) => {
            setTargetCustomerForAction(cust);
            setIsNewQuoteOpen(true);
          }}
          onNewOrderForCustomer={(cust) => {
            setTargetCustomerForAction(cust);
            alert(`Opening Order Creator for ${cust.name}`);
          }}
          onRecordPaymentForCustomer={(cust) => {
            setTargetCustomerForAction(cust);
            setIsRecordPaymentOpen(true);
          }}
          searchQuery={searchQuery}
        />
      )}

      {activeSubTab === 'quotations' && (
        <QuotationList 
          quotations={quotations}
          onNewQuotationClick={() => setIsNewQuoteOpen(true)}
          onConvertQuoteToOrder={handleConvertQuoteToOrder}
          searchQuery={searchQuery}
        />
      )}

      {activeSubTab === 'orders' && (
        <SalesOrderList 
          salesOrders={salesOrders}
          onNewOrderClick={() => setIsNewSaleOpen(true)}
          onViewOrderDetails={(order) => alert(`Sales Order Details for ${order.id}:\nCustomer: ${order.customer}\nAmount: ₹${(order.amount || 0).toFixed(2)}\nStatus: ${order.status}`)}
          onGenerateInvoiceForOrder={handleGenerateInvoiceForOrder}
          searchQuery={searchQuery}
        />
      )}

      {activeSubTab === 'invoices' && (
        <InvoiceList 
          invoices={invoices}
          onReceivePaymentForInvoice={(inv) => {
            setTargetInvoiceForAction(inv);
            setIsRecordPaymentOpen(true);
          }}
          onPrintInvoice={(inv) => alert(`Printing Commercial Invoice PDF for ${inv.id}`)}
          searchQuery={searchQuery}
        />
      )}

      {activeSubTab === 'returns' && (
        <SalesReturnList 
          salesReturns={salesReturns}
          onProcessReturnClick={() => setIsNewReturnOpen(true)}
          searchQuery={searchQuery}
        />
      )}

      {activeSubTab === 'payments' && (
        <CustomerPaymentList 
          payments={customerPayments}
          onRecordPaymentClick={() => setIsRecordPaymentOpen(true)}
          searchQuery={searchQuery}
        />
      )}

      {/* Modals */}
      <NewSaleModal 
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        onAddOrder={handleCreateNewSale}
        isDirectMode={isDirectMode}
        customers={customers}
        products={products}
      />

      <NewQuotationModal 
        isOpen={isNewQuoteOpen}
        onClose={() => {
          setIsNewQuoteOpen(false);
          setTargetCustomerForAction(null);
        }}
        customers={customers}
        products={products}
        onCreateQuotation={handleCreateQuotation}
      />

      <NewCustomerModal 
        isOpen={isNewCustomerOpen}
        onClose={() => setIsNewCustomerOpen(false)}
        onAddCustomer={handleAddCustomer}
      />

      <RecordCustomerPaymentModal 
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setTargetCustomerForAction(null);
          setTargetInvoiceForAction(null);
        }}
        customers={customers}
        targetCustomer={targetCustomerForAction}
        targetInvoice={targetInvoiceForAction}
        onRecordPayment={handleRecordPayment}
      />

      <NewSalesReturnModal 
        isOpen={isNewReturnOpen}
        onClose={() => setIsNewReturnOpen(false)}
        orders={salesOrders}
        onProcessReturn={handleProcessReturn}
      />

      <InvoiceBillModal 
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setActiveInvoiceForBill(null);
          setActiveOrderForBill(null);
        }}
        invoice={activeInvoiceForBill}
        order={activeOrderForBill}
      />
    </div>
  );
}
