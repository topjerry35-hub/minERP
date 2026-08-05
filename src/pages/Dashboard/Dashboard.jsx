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
import { fetchOrders, fetchFinanceSummary } from '../../services/api';

export default function Dashboard({ searchQuery, timeRange, onNewSaleClick }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reorderNotification, setReorderNotification] = useState(null);
  const [financeSummary, setFinanceSummary] = useState({ grossRevenue: 128450, operatingExpenses: 96400, netProfit: 32050 });

  // Mock/Database Orders Data
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      const fetchedOrders = await fetchOrders();
      if (fetchedOrders && fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
      } else {
        setOrders(unusedMockOrders);
      }

      const summary = await fetchFinanceSummary();
      if (summary) setFinanceSummary(summary);
    }
    loadDashboardData();
  }, []);

  const totalSalesRevenue = orders.length > 0 ? orders.reduce((sum, o) => sum + (o.amount || 0), 0) : financeSummary.grossRevenue;
  const pendingReceivables = orders.length > 0 
    ? orders.filter(o => o.status === 'Pending' || o.status === 'Processing').reduce((sum, o) => sum + (o.amount || 0), 0)
    : 18290;
  const netProfitVal = orders.length > 0 ? totalSalesRevenue - (totalSalesRevenue * 0.7) : financeSummary.netProfit;

  const [unusedMockOrders, setUnusedMockOrders] = useState([
    {
      id: 'ORD-9842',
      customer: 'Nexus Tech Solutions',
      email: 'procurement@nexustech.io',
      date: '2026-08-05',
      time: '02:15 PM',
      category: 'Electronics',
      itemsCount: 4,
      amount: 3450.00,
      status: 'Completed',
      shippingAddress: '100 Silicon Way, Tech Park, Bldg 4',
      items: [
        { name: 'UltraWide 34" Curved Monitor', sku: 'MON-34-UW', qty: 2, price: 1100.00 },
        { name: 'Thunderbolt 4 Docking Station', sku: 'DOC-TB4-PRO', qty: 2, price: 625.00 }
      ]
    },
    {
      id: 'ORD-9841',
      customer: 'Apex Logistics Inc.',
      email: 'billing@apexlogistics.com',
      date: '2026-08-05',
      time: '11:30 AM',
      category: 'Services',
      itemsCount: 1,
      amount: 1850.00,
      status: 'Processing',
      shippingAddress: '450 Harbor Blvd, Terminal 9, Seattle',
      items: [
        { name: 'Quarterly ERP System Maintenance', sku: 'SRV-ERP-MAINT', qty: 1, price: 1850.00 }
      ]
    },
    {
      id: 'ORD-9840',
      customer: 'Quantum BioLabs',
      email: 'supplies@quantumbio.org',
      date: '2026-08-04',
      time: '04:45 PM',
      category: 'Office Supplies',
      itemsCount: 12,
      amount: 720.50,
      status: 'Completed',
      shippingAddress: '88 Innovation Drive, Suite 200, Boston',
      items: [
        { name: 'Ergonomic Mechanical Keyboards', sku: 'KB-ERG-01', qty: 4, price: 130.00 },
        { name: 'Precision Wireless Laser Mice', sku: 'MSE-PR-99', qty: 4, price: 50.12 }
      ]
    },
    {
      id: 'ORD-9839',
      customer: 'Vanguard Capital',
      email: 'office@vanguardcap.com',
      date: '2026-08-04',
      time: '09:10 AM',
      category: 'Furniture',
      itemsCount: 6,
      amount: 5400.00,
      status: 'Pending',
      shippingAddress: '500 Wall Street, 32nd Floor, New York',
      items: [
        { name: 'Executive Leather Task Chairs', sku: 'CHR-EX-BLK', qty: 6, price: 900.00 }
      ]
    },
    {
      id: 'ORD-9838',
      customer: 'Hyperion Creative Studio',
      email: 'studio@hyperiondesign.co',
      date: '2026-08-03',
      time: '03:20 PM',
      category: 'Electronics',
      itemsCount: 3,
      amount: 2199.99,
      status: 'Completed',
      shippingAddress: '12 Sunset Blvd, Los Angeles, CA',
      items: [
        { name: 'High-Performance Workstation PC', sku: 'PC-WKST-X1', qty: 1, price: 2199.99 }
      ]
    }
  ]);

  // Low Stock Items Data
  const [lowStockItems, setLowStockItems] = useState([
    { name: 'Thunderbolt 4 Docking Station', sku: 'DOC-TB4-PRO', currentStock: 3, minThreshold: 15, supplier: 'Anker Corp' },
    { name: 'Ergonomic Mechanical Keyboards', sku: 'KB-ERG-01', currentStock: 4, minThreshold: 20, supplier: 'Logitech Global' },
    { name: 'UltraWide 34" Curved Monitor', sku: 'MON-34-UW', currentStock: 2, minThreshold: 10, supplier: 'Dell Enterprise' },
    { name: 'Cat6 Ethernet Patch Cable 50ft', sku: 'CBL-C6-50', currentStock: 8, minThreshold: 50, supplier: 'Belkin Direct' }
  ]);

  // Financial Revenue Chart Data
  const revenueChartData = [
    { label: 'Jan', revenue: 65000, expenses: 42000 },
    { label: 'Feb', revenue: 78000, expenses: 48000 },
    { label: 'Mar', revenue: 84000, expenses: 51000 },
    { label: 'Apr', revenue: 92000, expenses: 55000 },
    { label: 'May', revenue: 105000, expenses: 62000 },
    { label: 'Jun', revenue: 118000, expenses: 68000 },
    { label: 'Jul (YTD)', revenue: 128450, expenses: 72000 },
  ];

  // Category Pie Chart Data
  const categoryData = [
    { name: 'Electronics', value: 54200, color: '#3b82f6' },
    { name: 'Furniture', value: 38500, color: '#8b5cf6' },
    { name: 'Office Supplies', value: 21750, color: '#10b981' },
    { name: 'Services', value: 14000, color: '#f59e0b' },
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
          <h4>Good Morning, Jane Doe! 👋</h4>
          <p>Here's what's happening with your store & enterprise operations today ({timeRange}).</p>
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
          trend="+14.2%" 
          isPositive={true} 
          subtitle={`vs ${formatCurrency(112500)} last month`}
          icon={IndianRupee}
          color="#3b82f6"
        />
        <KPICard 
          title="Fulfilled Orders" 
          value={orders.length > 0 ? orders.length.toString() : "1,420"} 
          trend="+8.5%" 
          isPositive={true} 
          subtitle="98.4% on-time delivery"
          icon={ShoppingBag}
          color="#10b981"
        />
        <KPICard 
          title="Active Inventory SKUs" 
          value="432 SKU" 
          trend="12 Low Stock" 
          isPositive={false} 
          subtitle="Requires inventory replenishment"
          icon={Package}
          color="#f59e0b"
        />
        <KPICard 
          title="Pending Receivables" 
          value={formatCurrency(pendingReceivables)} 
          trend="-3.1%" 
          isPositive={true} 
          subtitle={`Net Profit: ${formatCurrency(netProfitVal)}`}
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
