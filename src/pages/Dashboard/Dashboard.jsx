import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  ShoppingBag, 
  Package, 
  Receipt, 
  Users, 
  TrendingUp,
  Download,
  Filter,
  CheckCircle2
} from 'lucide-react';

import KPICard from '../../components/KPICard';
import RevenueChart from '../../components/RevenueChart';
import CategoryPieChart from '../../components/CategoryPieChart';
import RecentOrdersTable from '../../components/RecentOrdersTable';
import LowStockWidget from '../../components/LowStockWidget';
import OrderDetailModal from '../../components/OrderDetailModal';
import { formatCurrency } from '../../utils/currency';
import { fetchOrders, fetchProducts, fetchFinanceSummary } from '../../services/api';

export default function Dashboard({ searchQuery, timeRange, onNewSaleClick }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reorderNotification, setReorderNotification] = useState(null);
  const [financeSummary, setFinanceSummary] = useState({ grossRevenue: 0, operatingExpenses: 0, netProfit: 0 });

  // Database Datasets
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      const fetchedOrders = await fetchOrders();
      if (fetchedOrders) setOrders(fetchedOrders);

      const fetchedProducts = await fetchProducts();
      if (fetchedProducts) setProducts(fetchedProducts);

      const summary = await fetchFinanceSummary();
      if (summary) setFinanceSummary(summary);
    }
    loadDashboardData();
  }, []);

  const totalSalesRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const pendingReceivables = orders
    .filter(o => o.status === 'Pending' || o.status === 'Processing')
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const netProfitVal = totalSalesRevenue > 0 ? totalSalesRevenue * 0.35 : (financeSummary ? financeSummary.netProfit : 0);

  // Low Stock Items from Database Products
  const lowStockItems = products
    .filter(p => {
      const stock = p.stock !== undefined ? p.stock : (p.currentStock !== undefined ? p.currentStock : 0);
      const minStock = p.minStock !== undefined ? p.minStock : (p.minThreshold !== undefined ? p.minThreshold : 10);
      return stock <= minStock;
    })
    .map(p => ({
      name: p.name || p.sku,
      sku: p.sku,
      currentStock: p.stock !== undefined ? p.stock : p.currentStock,
      minThreshold: p.minStock !== undefined ? p.minStock : p.minThreshold,
      supplier: p.supplier || 'Primary Supplier'
    }));

  // Dynamic Category Breakdown from Database Orders
  const categoryDataMap = {};
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  orders.forEach(o => {
    const cat = o.category || 'General';
    categoryDataMap[cat] = (categoryDataMap[cat] || 0) + Number(o.amount || 0);
  });
  const categoryData = Object.keys(categoryDataMap).map((cat, idx) => ({
    name: cat,
    value: categoryDataMap[cat],
    color: colors[idx % colors.length]
  }));

  // Revenue Chart Data (derived from orders or clean timeline)
  const revenueChartData = [
    { label: 'Jan', revenue: 0, expenses: 0 },
    { label: 'Feb', revenue: 0, expenses: 0 },
    { label: 'Mar', revenue: 0, expenses: 0 },
    { label: 'Apr', revenue: 0, expenses: 0 },
    { label: 'May', revenue: 0, expenses: 0 },
    { label: 'Jun', revenue: 0, expenses: 0 },
    { label: 'Current YTD', revenue: totalSalesRevenue, expenses: totalSalesRevenue * 0.65 },
  ];

  const handleOrderUpdateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleReorderItem = (item) => {
    setReorderNotification(`Purchase Order issued to ${item.supplier} for 50 units of ${item.name}!`);
    setTimeout(() => setReorderNotification(null), 4000);
  };

  return (
    <div className="dashboard-body">
      {/* Toast Notification Banner for Quick Actions */}
      {reorderNotification && (
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
          {reorderNotification}
        </div>
      )}

      {/* Velzon Page Title & Breadcrumbs Banner */}
      <div className="page-title-box">
        <div>
          <h4>Enterprise Operations Dashboard 👋</h4>
          <p>Real-time updates directly from your central enterprise database ({timeRange}).</p>
        </div>
        
        <div className="page-title-right">
          <div className="breadcrumb-pill">
            <span>Dashboards</span>
            <span>/</span>
            <span className="active">Analytics & Operations</span>
          </div>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => alert('Downloading ERP Quarterly Report (PDF)')}>
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <KPICard 
          title="Total Sales Revenue" 
          value={formatCurrency(totalSalesRevenue)} 
          trend={orders.length > 0 ? "+100%" : "0%"} 
          isPositive={true} 
          subtitle="Database Total Revenue"
          icon={IndianRupee}
          color="#3b82f6"
        />
        <KPICard 
          title="Fulfilled Orders" 
          value={orders.length.toString()} 
          trend="Real-time" 
          isPositive={true} 
          subtitle="Total Recorded Orders"
          icon={ShoppingBag}
          color="#10b981"
        />
        <KPICard 
          title="Active Inventory SKUs" 
          value={`${products.length} SKU`} 
          trend={`${lowStockItems.length} Low Stock`} 
          isPositive={lowStockItems.length === 0} 
          subtitle="Live Inventory Status"
          icon={Package}
          color="#f59e0b"
        />
        <KPICard 
          title="Pending Receivables" 
          value={formatCurrency(pendingReceivables)} 
          trend="Live DB" 
          isPositive={true} 
          subtitle={`Estimated Margin: ${formatCurrency(netProfitVal)}`}
          icon={Receipt}
          color="#8b5cf6"
        />
      </div>

      {/* Financial Performance Overview */}
      <div style={{ marginBottom: '20px' }}>
        <RevenueChart data={revenueChartData} timeRange={timeRange} />
      </div>

      {/* Inventory Alerts & Category Breakdown (One Row) */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        <LowStockWidget 
          items={lowStockItems} 
          onReorder={handleReorderItem}
        />
        <CategoryPieChart data={categoryData} />
      </div>

      {/* Recent Orders & Fulfillment (Full Width) */}
      <div style={{ width: '100%' }}>
        <RecentOrdersTable 
          orders={orders} 
          onOrderSelect={(order) => setSelectedOrder(order)} 
          searchQuery={searchQuery}
        />
      </div>

      {/* Order Details Modal Popup */}
      <OrderDetailModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleOrderUpdateStatus}
      />
    </div>
  );
}
