import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  FileText, 
  PackageCheck, 
  CreditCard, 
  Plus, 
  CheckCircle2 
} from 'lucide-react';

import SupplierList from '../../components/Purchasing/SupplierList';
import PurchaseOrderList from '../../components/Purchasing/PurchaseOrderList';
import GoodsReceiptList from '../../components/Purchasing/GoodsReceiptList';
import SupplierPaymentList from '../../components/Purchasing/SupplierPaymentList';
import NewPurchaseOrderModal from '../../components/Purchasing/NewPurchaseOrderModal';
import NewSupplierModal from '../../components/Purchasing/NewSupplierModal';
import RecordPaymentModal from '../../components/Purchasing/RecordPaymentModal';
import SupplierDetailModal from '../../components/Purchasing/SupplierDetailModal';
import { formatCurrency } from '../../utils/currency';
import { getTodayFormatted } from '../../utils/date';
import { 
  fetchSuppliers, 
  createSupplier, 
  fetchPurchaseOrders, 
  createPurchaseOrder, 
  fetchGoodsReceipts, 
  createGoodsReceipt, 
  fetchSupplierPayments, 
  createSupplierPayment,
  fetchProducts
} from '../../services/api';

export default function Purchasing({ searchQuery, setSearchQuery }) {
  const [activeSubTab, setActiveSubTab] = useState('suppliers');

  // Modal triggers
  const [isNewPoOpen, setIsNewPoOpen] = useState(false);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [targetSupplierForAction, setTargetSupplierForAction] = useState(null);
  const [selectedSupplierForDetail, setSelectedSupplierForDetail] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  // Database Datasets
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadDbData() {
      const sups = await fetchSuppliers();
      if (sups) setSuppliers(sups);

      const pos = await fetchPurchaseOrders();
      if (pos) setPurchaseOrders(pos);

      const grns = await fetchGoodsReceipts();
      if (grns) setGoodsReceipts(grns);

      const pays = await fetchSupplierPayments();
      if (pays) setPayments(pays);

      const prods = await fetchProducts();
      if (prods) setProducts(prods);
    }
    loadDbData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreatePo = async (newPoData) => {
    const savedPo = await createPurchaseOrder(newPoData);
    setPurchaseOrders(prev => [savedPo, ...prev]);
    showToast(`Purchase Order ${savedPo.id} issued to ${savedPo.supplier} (₹${(savedPo.totalAmount || 0).toFixed(2)})!`);
  };

  const handleAddSupplier = async (newSupplierData) => {
    const savedSup = await createSupplier(newSupplierData);
    setSuppliers(prev => [savedSup, ...prev]);
    showToast(`Vendor ${savedSup.name} added to Suppliers Directory!`);
  };

  const handleRecordPayment = async (paymentData) => {
    const savedPayment = await createSupplierPayment(paymentData);
    setPayments(prev => [savedPayment, ...prev]);

    // Update supplier balance due
    setSuppliers(prev => prev.map(s => {
      if (s.name === paymentData.supplier) {
        return { ...s, balanceDue: Math.max(0, s.balanceDue - paymentData.amount) };
      }
      return s;
    }));

    showToast(`Recorded vendor payment of ₹${paymentData.amount.toFixed(2)} to ${paymentData.supplier}!`);
  };

  const handleReceiveGoodsForPo = async (po) => {
    const newGrnData = {
      poId: po.id,
      supplier: po.supplier,
      receivedDate: getTodayFormatted(),
      unitsReceived: po.itemsCount || 10,
      inspectionStatus: 'Passed Audit',
      inspector: 'Warehouse Receiving QC'
    };

    const savedGrn = await createGoodsReceipt(newGrnData);
    setGoodsReceipts(prev => [savedGrn, ...prev]);
    setPurchaseOrders(prev => prev.map(p => p.id === po.id ? { ...p, status: 'Received' } : p));

    showToast(`Goods Receipt Note ${savedGrn.id} generated for PO ${po.id}!`);
  };

  const handleApproveQc = (grnId) => {
    setGoodsReceipts(prev => prev.map(g => g.id === grnId ? { ...g, inspectionStatus: 'Passed Audit', inspector: 'Senior Quality Auditor' } : g));
    showToast(`QC Inspection Approved for GRN ${grnId}! Status set to Passed Audit.`);
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
          <h1>Purchasing & Vendor Procurement</h1>
          <p>Manage vendors, purchase orders, goods receipts (GRN), and Accounts Payable</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => setIsNewSupplierOpen(true)}>
            <Truck size={16} color="#3b82f6" />
            + New Supplier
          </button>
          <button className="btn-secondary" onClick={() => setIsRecordPaymentOpen(true)}>
            <CreditCard size={16} color="#10b981" />
            Record Payment
          </button>
          <button className="btn-primary" onClick={() => setIsNewPoOpen(true)}>
            <Plus size={16} />
            Create PO
          </button>
        </div>
      </div>

      {/* Sub-tabs navigation */}
      <div className="inventory-nav-tabs">
        {[
          { id: 'suppliers', label: 'Suppliers Directory', icon: Truck },
          { id: 'pos', label: 'Purchase Orders (PO)', icon: FileText },
          { id: 'grn', label: 'Goods Receipts (GRN)', icon: PackageCheck },
          { id: 'payments', label: 'Supplier Payments', icon: CreditCard },
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
      {activeSubTab === 'suppliers' && (
        <SupplierList 
          suppliers={suppliers}
          onAddSupplierClick={() => setIsNewSupplierOpen(true)}
          onNewPoForSupplier={(supp) => {
            setTargetSupplierForAction(supp);
            setIsNewPoOpen(true);
          }}
          onRecordPaymentForSupplier={(supp) => {
            setTargetSupplierForAction(supp);
            setIsRecordPaymentOpen(true);
          }}
          onSelectSupplier={(supp) => setSelectedSupplierForDetail(supp)}
          searchQuery={searchQuery}
        />
      )}

      {activeSubTab === 'pos' && (
        <PurchaseOrderList 
          purchaseOrders={purchaseOrders}
          onNewPoClick={() => setIsNewPoOpen(true)}
          onViewPoDetails={(po) => alert(`PO Specifications & Line Items for ${po.id}:\nVendor: ${po.supplier}\nTotal Cost: ${formatCurrency(po.totalAmount)}\nStatus: ${po.status}`)}
          onReceiveGoodsForPo={handleReceiveGoodsForPo}
          searchQuery={searchQuery}
        />
      )}

      {activeSubTab === 'grn' && (
        <GoodsReceiptList 
          goodsReceipts={goodsReceipts}
          searchQuery={searchQuery}
          onApproveQc={handleApproveQc}
        />
      )}

      {activeSubTab === 'payments' && (
        <SupplierPaymentList 
          payments={payments}
          onRecordPaymentClick={() => setIsRecordPaymentOpen(true)}
          searchQuery={searchQuery}
        />
      )}

      {/* Modals */}
      <NewPurchaseOrderModal 
        isOpen={isNewPoOpen}
        onClose={() => {
          setIsNewPoOpen(false);
          setTargetSupplierForAction(null);
        }}
        suppliers={suppliers}
        products={products}
        targetSupplier={targetSupplierForAction}
        onCreatePo={handleCreatePo}
      />

      <NewSupplierModal 
        isOpen={isNewSupplierOpen}
        onClose={() => setIsNewSupplierOpen(false)}
        onAddSupplier={handleAddSupplier}
      />

      <RecordPaymentModal 
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setTargetSupplierForAction(null);
        }}
        suppliers={suppliers}
        targetSupplier={targetSupplierForAction}
        onRecordPayment={handleRecordPayment}
      />

      <SupplierDetailModal 
        isOpen={!!selectedSupplierForDetail}
        supplier={selectedSupplierForDetail}
        onClose={() => setSelectedSupplierForDetail(null)}
        onNewPo={(supp) => {
          setTargetSupplierForAction(supp);
          setIsNewPoOpen(true);
        }}
        onRecordPayment={(supp) => {
          setTargetSupplierForAction(supp);
          setIsRecordPaymentOpen(true);
        }}
      />
    </div>
  );
}
