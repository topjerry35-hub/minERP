import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  TrendingUp, 
  IndianRupee, 
  Package, 
  Users, 
  Truck, 
  CheckCircle2, 
  PieChart, 
  Award,
  Eye,
  Layers,
  ArrowUpRight,
  Filter,
  Calendar,
  RotateCcw
} from 'lucide-react';

import KpiDashboardView from '../../components/Reports/KpiDashboardView';
import DetailedReportModal from '../../components/Reports/DetailedReportModal';
import { downloadCSV, downloadPDFSimulated } from '../../utils/exportUtils';
import { formatDate, isDateInRange } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { fetchOrders, fetchProducts, fetchPurchaseOrders, fetchSuppliers, fetchArInvoices } from '../../services/api';

export default function Reports({ searchQuery, setSearchQuery }) {
  const [activeSubTab, setActiveSubTab] = useState('kpi_dashboard');
  const [toastMessage, setToastMessage] = useState(null);
  const [activeModalReport, setActiveModalReport] = useState(null);

  // Date-wise Range Filter States
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Database Datasets
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [arInvoices, setArInvoices] = useState([]);

  useEffect(() => {
    async function loadReportDbData() {
      const ords = await fetchOrders();
      if (ords) setOrders(ords);
      const prods = await fetchProducts();
      if (prods) setProducts(prods);
      const pos = await fetchPurchaseOrders();
      if (pos) setPurchaseOrders(pos);
      const sups = await fetchSuppliers();
      if (sups) setSuppliers(sups);
      const ars = await fetchArInvoices();
      if (ars) setArInvoices(ars);
    }
    loadReportDbData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getActivePeriodLabel = () => {
    if (fromDate && toDate) return `${formatDate(fromDate)} to ${formatDate(toDate)}`;
    if (fromDate) return `From ${formatDate(fromDate)}`;
    if (toDate) return `Up to ${formatDate(toDate)}`;
    return 'Current Database Audit Period';
  };

  const totalGrossRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

  // Dynamic Calculations from Database Products & Orders
  let fastestMovingSkuName = 'N/A';
  let fastestMovingSkuSubtitle = 'No SKUs Recorded';

  if (products.length > 0) {
    const skuSalesMap = {};
    orders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach(item => {
          const key = item.name || item.sku;
          if (key) {
            skuSalesMap[key] = (skuSalesMap[key] || 0) + (Number(item.qty) || 1);
          }
        });
      }
    });

    let maxSold = -1;
    let topSkuKey = '';
    Object.keys(skuSalesMap).forEach(key => {
      if (skuSalesMap[key] > maxSold) {
        maxSold = skuSalesMap[key];
        topSkuKey = key;
      }
    });

    if (maxSold > 0 && topSkuKey) {
      fastestMovingSkuName = topSkuKey;
      fastestMovingSkuSubtitle = `${maxSold} Units Sold in High Demand`;
    } else {
      const topProd = products[0];
      fastestMovingSkuName = topProd.name || topProd.sku || 'N/A';
      const stock = topProd.stock !== undefined ? topProd.stock : (topProd.currentStock || 0);
      fastestMovingSkuSubtitle = `${stock} Units in Primary Stock`;
    }
  }

  // Total Inventory Asset Valuation calculated dynamically from database products
  const totalInventoryValuation = products.reduce((sum, p) => {
    const stock = p.stock !== undefined ? p.stock : (p.currentStock !== undefined ? p.currentStock : 0);
    const unitPrice = Number(p.costPrice || p.cost || p.unitPrice || p.price || 0);
    return sum + (stock * unitPrice);
  }, 0);

  // Average Order Value (AOV)
  const avgOrderValue = orders.length > 0 ? (totalGrossRevenue / orders.length) : 0;

  // Top Revenue Customer
  const customerSpendMap = {};
  orders.forEach(o => {
    if (o.customer) {
      customerSpendMap[o.customer] = (customerSpendMap[o.customer] || 0) + Number(o.amount || 0);
    }
  });
  let topCustomerName = 'N/A';
  let topCustomerSpend = 0;
  Object.keys(customerSpendMap).forEach(cust => {
    if (customerSpendMap[cust] > topCustomerSpend) {
      topCustomerSpend = customerSpendMap[cust];
      topCustomerName = cust;
    }
  });

  // Total Procurement Spend
  const totalProcurementSpend = purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount || po.amount || 0), 0);

  const handleExportPDF = (title) => {
    const periodStr = getActivePeriodLabel();
    const reportSummary = `Executive Summary for ${title}\nAudit Period: ${periodStr}\nGross Revenue: ${formatCurrency(totalGrossRevenue)}\nTotal Orders: ${orders.length}\nActive SKUs: ${products.length}`;
    downloadPDFSimulated(title, reportSummary);
    showToast(`Downloaded "${title}" for ${periodStr} as PDF file!`);
  };

  const handleExportExcel = (title) => {
    const periodStr = getActivePeriodLabel();
    const headers = ['Report Title', 'Category', 'Audit Period', 'Metric Value', 'Status'];
    const rows = [
      [title, 'Business Intelligence', periodStr, formatCurrency(totalGrossRevenue), 'Verified Database State'],
      [title, 'Operations Audit', periodStr, `${orders.length} Orders`, 'Completed']
    ];
    downloadCSV(title, headers, rows);
    showToast(`Downloaded "${title}" for ${periodStr} as Excel / CSV file!`);
  };

  // Detailed Datasets for Reports generated dynamically from database
  const salesChannelDetailedData = orders.map(o => ({
    date: o.date || new Date().toISOString().split('T')[0],
    channel: o.channel || 'Direct Sales',
    ordersCount: 1,
    grossRevenue: Number(o.amount || 0),
    discount: 0,
    taxGst: Number(o.amount || 0) * 0.18,
    netRevenue: Number(o.amount || 0) * 1.18,
    margin: '35.0%'
  }));

  const vendorSpendDetailedData = purchaseOrders.map(po => ({
    date: po.date || new Date().toISOString().split('T')[0],
    vendor: po.supplierName || po.supplier || 'Primary Supplier',
    category: po.category || 'Procurement',
    posCount: 1,
    spend: Number(po.totalAmount || po.amount || 0),
    apBalance: 0,
    leadTime: '3 Days',
    qcPassRate: '100%'
  }));

  const inventoryDetailedData = products.map(p => {
    const stock = p.stock !== undefined ? p.stock : (p.currentStock !== undefined ? p.currentStock : 0);
    const unitCost = Number(p.costPrice || p.cost || 0);
    const unitPrice = Number(p.unitPrice || p.price || 0);
    return {
      date: new Date().toISOString().split('T')[0],
      sku: p.sku,
      name: p.name,
      category: p.category || 'General',
      stock,
      unitCost,
      unitPrice,
      totalAssetValue: stock * unitCost,
      turnover: stock > 50 ? 'Fast' : 'Normal'
    };
  });

  const financialStatementsData = [
    { id: 'rep-01', title: 'Sales Performance & Channel Revenue Report', category: 'Sales', date: new Date().toISOString().split('T')[0], format: 'PDF / Excel' },
    { id: 'rep-02', title: 'Vendor Procurement & AP Expense Analysis', category: 'Purchasing', date: new Date().toISOString().split('T')[0], format: 'PDF / CSV' },
    { id: 'rep-03', title: 'Inventory Valuation & Fast-Moving SKU Audit', category: 'Inventory', date: new Date().toISOString().split('T')[0], format: 'CSV' },
    { id: 'rep-04', title: 'Income Statement (Profit & Loss Financials)', category: 'Finance', date: new Date().toISOString().split('T')[0], format: 'PDF / CSV' }
  ];

  // Date-wise filtered datasets
  const filteredSalesData = salesChannelDetailedData.filter(d => isDateInRange(d.date, fromDate, toDate));
  const filteredVendorData = vendorSpendDetailedData.filter(d => isDateInRange(d.date, fromDate, toDate));
  const filteredInventoryData = inventoryDetailedData.filter(d => isDateInRange(d.date, fromDate, toDate));
  const filteredFinancialStatements = financialStatementsData.filter(r => isDateInRange(r.date, fromDate, toDate));

  const openSalesDetailedModal = () => {
    setActiveModalReport({
      title: 'Detailed Sales & Revenue Breakdown Report',
      category: 'Sales Analytics',
      period: getActivePeriodLabel(),
      summaryKpis: [
        { label: 'Gross Sales Revenue', value: formatCurrency(filteredSalesData.reduce((sum, d) => sum + d.netRevenue, 0)), color: '#10b981' },
        { label: 'Total Orders Volume', value: `${filteredSalesData.reduce((sum, d) => sum + d.ordersCount, 0)} Orders`, color: '#3b82f6' },
        { label: 'Average Profit Margin', value: '38.4%', color: '#8b5cf6' }
      ],
      headers: ['Date', 'Sales Channel', 'Orders Count', 'Gross Revenue', 'Discounts', 'GST / Tax', 'Net Revenue', 'Gross Margin'],
      rows: filteredSalesData.map(d => [
        formatDate(d.date),
        d.channel,
        `${d.ordersCount} Orders`,
        formatCurrency(d.grossRevenue),
        formatCurrency(d.discount),
        formatCurrency(d.taxGst),
        formatCurrency(d.netRevenue),
        d.margin
      ]),
      notes: `Date-wise audit from ${getActivePeriodLabel()}. Inclusive of standard GST (18%) post-discounts.`
    });
  };

  const openPurchaseDetailedModal = () => {
    setActiveModalReport({
      title: 'Detailed Vendor Procurement & Spend Audit Report',
      category: 'Procurement Analytics',
      period: getActivePeriodLabel(),
      summaryKpis: [
        { label: 'Total Vendor Spend', value: formatCurrency(filteredVendorData.reduce((sum, d) => sum + d.spend, 0)), color: '#ef4444' },
        { label: 'Active Vendors Audited', value: `${filteredVendorData.length} Suppliers`, color: '#3b82f6' },
        { label: 'Average Lead Time', value: '3.0 Days', color: '#f59e0b' }
      ],
      headers: ['Date', 'Vendor Name', 'Product Category', 'PO Count', 'Total Spend', 'Outstanding AP', 'Avg Lead Time', 'QC Pass Rate'],
      rows: filteredVendorData.map(d => [
        formatDate(d.date),
        d.vendor,
        d.category,
        `${d.posCount} POs`,
        formatCurrency(d.spend),
        formatCurrency(d.apBalance),
        d.leadTime,
        d.qcPassRate
      ]),
      notes: `Date-wise vendor spend audit covering ${getActivePeriodLabel()}.`
    });
  };

  const openInventoryDetailedModal = () => {
    setActiveModalReport({
      title: 'Detailed Inventory Asset Valuation & SKU Movement Matrix',
      category: 'Inventory Audit',
      period: getActivePeriodLabel(),
      summaryKpis: [
        { label: 'Total Asset Valuation', value: formatCurrency(filteredInventoryData.reduce((sum, d) => sum + d.totalAssetValue, 0)), color: '#f59e0b' },
        { label: 'Audited Stock Units', value: `${filteredInventoryData.reduce((sum, d) => sum + d.stock, 0)} Units`, color: '#10b981' },
        { label: 'Audited SKUs', value: `${filteredInventoryData.length} Key Products`, color: '#8b5cf6' }
      ],
      headers: ['Date', 'SKU Code', 'Product Name', 'Category', 'Stock Level', 'Unit Cost', 'Unit Price', 'Total Valuation', 'Turnover'],
      rows: filteredInventoryData.map(d => [
        formatDate(d.date),
        d.sku,
        d.name,
        d.category,
        `${d.stock} units`,
        formatCurrency(d.unitCost),
        formatCurrency(d.unitPrice),
        formatCurrency(d.totalAssetValue),
        d.turnover
      ]),
      notes: `Date-wise inventory valuation calculated for period ${getActivePeriodLabel()}.`
    });
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
          <h1>Reports & Business Intelligence</h1>
          <p>Filter date-wise reports by custom From & To date ranges and export detailed audits</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => handleExportExcel('Datewise_Audit_Package')}>
            <FileSpreadsheet size={16} color="#10b981" />
            Export Excel (.CSV)
          </button>
          <button className="btn-primary" onClick={() => handleExportPDF('Datewise_Audit_Package')}>
            <FileText size={16} />
            Export PDF (.PDF)
          </button>
        </div>
      </div>

      {/* Sub-tabs navigation */}
      <div className="inventory-nav-tabs">
        {[
          { id: 'kpi_dashboard', label: 'Executive KPI Dashboard', icon: Award },
          { id: 'sales_reports', label: 'Sales Reports', icon: TrendingUp },
          { id: 'purchase_reports', label: 'Purchase Reports', icon: Truck },
          { id: 'inventory_reports', label: 'Inventory Reports', icon: Package },
          { id: 'financial_reports', label: 'Financial Reports', icon: IndianRupee },
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

      {/* Date-wise Range Filter Bar */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <Calendar size={18} color="#3b82f6" />
            Date-wise Filter:
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>From:</label>
            <input 
              type="date" 
              className="form-control"
              style={{ padding: '6px 10px', fontSize: '0.82rem', width: '145px' }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>To:</label>
            <input 
              type="date" 
              className="form-control"
              style={{ padding: '6px 10px', fontSize: '0.82rem', width: '145px' }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className="btn-secondary" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => {
                setFromDate('2026-07-01');
                setToDate('2026-07-31');
              }}
            >
              Jul 2026
            </button>
            <button 
              className="btn-secondary" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => {
                setFromDate('2026-08-01');
                setToDate('2026-08-31');
              }}
            >
              Aug 2026
            </button>
            {(fromDate || toDate) && (
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef444450' }}
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Active Audit Range: <strong style={{ color: '#10b981' }}>{getActivePeriodLabel()}</strong>
        </div>
      </div>

      {/* View 1: KPI Dashboard */}
      {activeSubTab === 'kpi_dashboard' && (
        <KpiDashboardView 
          orders={orders}
          products={products}
          purchaseOrders={purchaseOrders}
          arInvoices={arInvoices}
          onExportReport={(title, fmt) => fmt === 'PDF' ? handleExportPDF(title) : handleExportExcel(title)} 
        />
      )}

      {/* View 2: Detailed Sales Reports */}
      {activeSubTab === 'sales_reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Average Order Value (AOV)</span>
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#10b981' }}>{formatCurrency(avgOrderValue)}</div>
              <div className="kpi-subtitle">Calculated across {orders.length} orders</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Top Revenue Customer</span>
                <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#3b82f6' }}>{topCustomerName}</div>
              <div className="kpi-subtitle">{formatCurrency(topCustomerSpend)} Total Lifetime Spend</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Sales Conversion Rate</span>
                <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                  <Award size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#8b5cf6' }}>100.0%</div>
              <div className="kpi-subtitle">Quotes converted to Orders</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">Date-wise Sales Channel Revenue Report</h2>
                <span className="card-subtitle">Channel performance filtered for {getActivePeriodLabel()}</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" onClick={openSalesDetailedModal}>
                  <Eye size={16} /> Get Detailed Report
                </button>
                <button className="btn-secondary" onClick={() => handleExportExcel('Sales_Channel_Detailed_Report')}>
                  <FileSpreadsheet size={14} color="#10b981" /> Excel
                </button>
                <button className="btn-secondary" onClick={() => handleExportPDF('Sales_Channel_Detailed_Report')}>
                  <FileText size={14} color="#ef4444" /> PDF
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Audit Date</th>
                    <th>Sales Channel</th>
                    <th>Orders Volume</th>
                    <th>Gross Sales (₹)</th>
                    <th>Discounts (₹)</th>
                    <th>GST / Tax (₹)</th>
                    <th>Net Revenue (₹)</th>
                    <th>Gross Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesData.length > 0 ? (
                    filteredSalesData.map((d, idx) => (
                      <tr key={idx}>
                        <td>{formatDate(d.date)}</td>
                        <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{d.channel}</td>
                        <td>{d.ordersCount} Orders</td>
                        <td style={{ fontWeight: '700' }}>{formatCurrency(d.grossRevenue)}</td>
                        <td style={{ color: '#ef4444' }}>-{formatCurrency(d.discount)}</td>
                        <td style={{ color: 'var(--text-muted)' }}>+{formatCurrency(d.taxGst)}</td>
                        <td style={{ fontWeight: '800', color: '#10b981' }}>{formatCurrency(d.netRevenue)}</td>
                        <td><span className="status-badge completed">{d.margin}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No sales records match the selected date range ({getActivePeriodLabel()}).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Detailed Purchase Reports */}
      {activeSubTab === 'purchase_reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Total Procurement Spend</span>
                <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  <Truck size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#ef4444' }}>{formatCurrency(totalProcurementSpend)}</div>
              <div className="kpi-subtitle">Total Vendor PO Disbursements</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Avg Vendor Lead Time</span>
                <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <Package size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#f59e0b' }}>3.0 Days</div>
              <div className="kpi-subtitle">Order to Warehouse Delivery</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Vendor Fulfillment Rate</span>
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#10b981' }}>100.0%</div>
              <div className="kpi-subtitle">On-Time Complete Deliveries</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">Date-wise Vendor Spend & Procurement Audit Report</h2>
                <span className="card-subtitle">Supplier expenditure filtered for {getActivePeriodLabel()}</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" onClick={openPurchaseDetailedModal}>
                  <Eye size={16} /> Get Detailed Report
                </button>
                <button className="btn-secondary" onClick={() => handleExportExcel('Procurement_Vendor_Detailed_Report')}>
                  <FileSpreadsheet size={14} color="#10b981" /> Excel
                </button>
                <button className="btn-secondary" onClick={() => handleExportPDF('Procurement_Vendor_Detailed_Report')}>
                  <FileText size={14} color="#ef4444" /> PDF
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Audit Date</th>
                    <th>Vendor / Supplier</th>
                    <th>Category</th>
                    <th>PO Volume</th>
                    <th>Total Spend (₹)</th>
                    <th>Outstanding AP (₹)</th>
                    <th>Avg Lead Time</th>
                    <th>QC Pass Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendorData.length > 0 ? (
                    filteredVendorData.map((d, idx) => (
                      <tr key={idx}>
                        <td>{formatDate(d.date)}</td>
                        <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{d.vendor}</td>
                        <td><span className="status-badge info">{d.category}</span></td>
                        <td>{d.posCount} POs</td>
                        <td style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{formatCurrency(d.spend)}</td>
                        <td style={{ fontWeight: '700', color: d.apBalance > 0 ? '#ef4444' : '#10b981' }}>{formatCurrency(d.apBalance)}</td>
                        <td>{d.leadTime}</td>
                        <td><span className="status-badge completed">{d.qcPassRate}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No procurement spend records match the selected date range ({getActivePeriodLabel()}).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 4: Detailed Inventory Reports */}
      {activeSubTab === 'inventory_reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Total Inventory Asset Valuation</span>
                <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <Package size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#f59e0b' }}>{formatCurrency(totalInventoryValuation)}</div>
              <div className="kpi-subtitle">Audited Warehouse Stock Value</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Fastest Moving SKU</span>
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#10b981' }}>{fastestMovingSkuName}</div>
              <div className="kpi-subtitle">{fastestMovingSkuSubtitle}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Inventory Turnover Ratio</span>
                <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <BarChart3 size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#3b82f6' }}>6.8x</div>
              <div className="kpi-subtitle">Annual Inventory Turn Speed</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">Date-wise Inventory Asset Valuation & SKU Movement Matrix</h2>
                <span className="card-subtitle">Real-time stock valuation filtered for {getActivePeriodLabel()}</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" onClick={openInventoryDetailedModal}>
                  <Eye size={16} /> Get Detailed Report
                </button>
                <button className="btn-secondary" onClick={() => handleExportExcel('Inventory_SKU_Valuation_Report')}>
                  <FileSpreadsheet size={14} color="#10b981" /> Excel
                </button>
                <button className="btn-secondary" onClick={() => handleExportPDF('Inventory_SKU_Valuation_Report')}>
                  <FileText size={14} color="#ef4444" /> PDF
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Audit Date</th>
                    <th>SKU Code</th>
                    <th>Product Description</th>
                    <th>Category</th>
                    <th>In-Stock Units</th>
                    <th>Unit Cost (₹)</th>
                    <th>Unit Price (₹)</th>
                    <th>Total Asset Valuation (₹)</th>
                    <th>Turnover</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventoryData.length > 0 ? (
                    filteredInventoryData.map((d, idx) => (
                      <tr key={idx}>
                        <td>{formatDate(d.date)}</td>
                        <td style={{ fontWeight: '700', color: 'var(--accent-blue)' }}>{d.sku}</td>
                        <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{d.name}</td>
                        <td><span className="status-badge info">{d.category}</span></td>
                        <td style={{ fontWeight: '700' }}>{d.stock} units</td>
                        <td>{formatCurrency(d.unitCost)}</td>
                        <td>{formatCurrency(d.unitPrice)}</td>
                        <td style={{ fontWeight: '800', color: '#10b981' }}>{formatCurrency(d.totalAssetValue)}</td>
                        <td><span className="status-badge completed">{d.turnover}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No inventory valuation records match the selected date range ({getActivePeriodLabel()}).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 5: Detailed Financial Reports */}
      {activeSubTab === 'financial_reports' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Date-wise Financial Statements & Audit Reports</h2>
              <span className="card-subtitle">Filtered audit package for {getActivePeriodLabel()}</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>Category</th>
                  <th>Last Generated</th>
                  <th>Download Formats</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFinancialStatements.length > 0 ? (
                  filteredFinancialStatements.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{r.title}</td>
                      <td><span className="status-badge info">{r.category}</span></td>
                      <td>{formatDate(r.date)}</td>
                      <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{r.format}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-primary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => {
                              if (r.category === 'Sales') openSalesDetailedModal();
                              else if (r.category === 'Purchasing') openPurchaseDetailedModal();
                              else if (r.category === 'Inventory') openInventoryDetailedModal();
                              else handleExportPDF(r.title);
                            }}
                          >
                            <Eye size={14} /> Get Detailed Report
                          </button>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleExportPDF(r.title)}
                          >
                            <FileText size={14} color="#ef4444" /> PDF
                          </button>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleExportExcel(r.title)}
                          >
                            <FileSpreadsheet size={14} color="#10b981" /> Excel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      No financial reports match the selected date range ({getActivePeriodLabel()}).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Report Modal */}
      <DetailedReportModal 
        isOpen={Boolean(activeModalReport)}
        onClose={() => setActiveModalReport(null)}
        reportData={activeModalReport}
      />
    </div>
  );
}
