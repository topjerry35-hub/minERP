import React, { useState, useEffect } from 'react';
import { Package, FolderTree, ArrowDownRight, ArrowUpRight, Barcode, SlidersHorizontal, Plus, CheckCircle2 } from 'lucide-react';

import ProductList from '../../components/Inventory/ProductList';
import CategoryList from '../../components/Inventory/CategoryList';
import StockInModal from '../../components/Inventory/StockInModal';
import StockOutModal from '../../components/Inventory/StockOutModal';
import BarcodeModal from '../../components/Inventory/BarcodeModal';
import StockAdjustmentModal from '../../components/Inventory/StockAdjustmentModal';
import AddProductModal from '../../components/Inventory/AddProductModal';
import ImportModal from '../../components/Inventory/ImportModal';
import { fetchProducts, createProduct, updateProduct, fetchCategories, fetchInventoryLogs } from '../../services/api';

import { 
  generateProducts, 
  generateCategories, 
  generateInventoryLogs 
} from '../../utils/mockDataGenerator';

export default function Inventory({ searchQuery, setSearchQuery }) {
  const [activeSubTab, setActiveSubTab] = useState('products');

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Database Datasets
  const [products, setProducts] = useState(() => generateProducts(100));
  const [categories, setCategories] = useState(() => generateCategories());
  const [inventoryLogs, setInventoryLogs] = useState(() => generateInventoryLogs(100));

  useEffect(() => {
    async function loadProducts() {
      const data = await fetchProducts();
      if (data && data.length > 0) setProducts(data);

      const cats = await fetchCategories();
      if (cats && cats.length > 0) setCategories(cats);

      const logs = await fetchInventoryLogs();
      if (logs && logs.length > 0) setInventoryLogs(logs);
    }
    loadProducts();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddProduct = async (newProduct) => {
    const saved = await createProduct(newProduct);
    if (saved && saved.product) {
      setProducts(prev => [saved.product, ...prev]);
      showToast(`Registered new SKU ${saved.product.sku} (${saved.product.name})!`);
    } else {
      showToast(`Failed to register SKU ${newProduct.sku} on database!`);
    }
  };

  const handleStockIn = async (sku, qty, supplier, unitCost) => {
    const prod = products.find(p => p.sku === sku);
    if (!prod) return;
    const updatedStock = prod.stock + Number(qty);
    const saved = await updateProduct(sku, { stock: updatedStock });
    if (saved && saved.product) {
      setProducts(prev => prev.map(p => p.sku === sku ? saved.product : p));
      
      const newLog = {
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleString(),
        type: 'INTAKE',
        sku,
        name: prod.name,
        qty: +qty,
        user: 'Current User'
      };
      setInventoryLogs(prev => [newLog, ...prev]);
      showToast(`Intake (+${qty} units) logged for SKU ${sku}`);
    } else {
      showToast(`Failed to update stock in database!`);
    }
  };

  const handleStockOut = async (sku, qty, reason) => {
    const prod = products.find(p => p.sku === sku);
    if (!prod) return;
    const updatedStock = Math.max(0, prod.stock - Number(qty));
    const saved = await updateProduct(sku, { stock: updatedStock });
    if (saved && saved.product) {
      setProducts(prev => prev.map(p => p.sku === sku ? saved.product : p));

      const newLog = {
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleString(),
        type: 'DISPATCH',
        sku,
        name: prod.name,
        qty: -qty,
        user: 'Current User'
      };
      setInventoryLogs(prev => [newLog, ...prev]);
      showToast(`Dispatch (-${qty} units) logged for SKU ${sku}`);
    } else {
      showToast(`Failed to update stock in database!`);
    }
  };

  const handleAdjustment = async ({ sku, newStock, reason }) => {
    const prod = products.find(p => p.sku === sku);
    if (!prod) return;
    const prevStock = prod.stock;
    const delta = newStock - prevStock;

    const saved = await updateProduct(sku, { stock: Number(newStock) });
    if (saved && saved.product) {
      setProducts(prev => prev.map(p => p.sku === sku ? saved.product : p));

      const newLog = {
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleString(),
        type: delta >= 0 ? 'INTAKE' : 'DISPATCH',
        sku,
        name: prod.name,
        qty: delta,
        user: 'Current User'
      };
      setInventoryLogs(prev => [newLog, ...prev]);

      showToast(`Reconciled stock level for SKU ${sku} to ${newStock} units (${reason})`);
    } else {
      showToast(`Failed to adjust stock level in database!`);
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
          <h1>Inventory & Stock Management</h1>
          <p>Product catalog master, barcode generation, stock intake/dispatch, and inventory reconciliation</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => setIsStockInOpen(true)}>
            <ArrowDownRight size={16} color="#10b981" />
            Stock Intake (+)
          </button>
          <button className="btn-secondary" onClick={() => setIsStockOutOpen(true)}>
            <ArrowUpRight size={16} color="#ef4444" />
            Stock Out (-)
          </button>
          <button className="btn-primary" onClick={() => setIsAddProductOpen(true)}>
            <Plus size={16} />
            Register SKU
          </button>
        </div>
      </div>

      {/* Sub-tabs navigation */}
      <div className="inventory-nav-tabs">
        {[
          { id: 'products', label: 'Master Product Catalog', icon: Package },
          { id: 'categories', label: 'Product Categories', icon: FolderTree },
          { id: 'logs', label: 'Stock Audit Trail', icon: Barcode },
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

      {/* View 1: Master Product List */}
      {activeSubTab === 'products' && (
        <ProductList 
          products={products}
          onAddProductClick={() => setIsAddProductOpen(true)}
          onStockInClick={() => setIsStockInOpen(true)}
          onStockOutClick={() => setIsStockOutOpen(true)}
          onImportClick={() => setIsImportOpen(true)}
          onBarcodeClick={(product) => {
            setSelectedProduct(product);
            setIsBarcodeOpen(true);
          }}
          onAdjustmentClick={(product) => {
            setSelectedProduct(product);
            setIsAdjustmentOpen(true);
          }}
          searchQuery={searchQuery}
        />
      )}

      {/* View 2: Categories List */}
      {activeSubTab === 'categories' && (
        <CategoryList 
          products={products}
        />
      )}

      {/* View 3: Stock Audit Logs */}
      {activeSubTab === 'logs' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Stock Transaction Audit Trail</h2>
          </div>
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Audit Ref</th>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Quantity Delta</th>
                  <th>Operator</th>
                </tr>
              </thead>
              <tbody>
                {inventoryLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{log.id}</td>
                    <td>{log.date}</td>
                    <td>
                      <span className={`status-badge ${log.type === 'INTAKE' ? 'completed' : 'cancelled'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: '#3b82f6' }}>{log.sku}</td>
                    <td>{log.name}</td>
                    <td style={{ fontWeight: '800', color: log.qty > 0 ? '#10b981' : '#ef4444' }}>
                      {log.qty > 0 ? `+${log.qty}` : log.qty} units
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddProductModal 
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <StockInModal 
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        products={products}
        onStockIn={handleStockIn}
      />

      <StockOutModal 
        isOpen={isStockOutOpen}
        onClose={() => setIsStockOutOpen(false)}
        products={products}
        onStockOut={handleStockOut}
      />

      <BarcodeModal 
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        product={selectedProduct}
      />

      {isAdjustmentOpen && (
        <StockAdjustmentModal 
          isOpen={isAdjustmentOpen}
          onClose={() => setIsAdjustmentOpen(false)}
          products={products}
          initialProduct={selectedProduct}
          onAdjustStock={handleAdjustment}
        />
      )}

      <ImportModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
}
