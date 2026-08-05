import React, { useState } from 'react';
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

export default function Reports({ searchQuery, setSearchQuery }) {
  const [activeSubTab, setActiveSubTab] = useState('kpi_dashboard');
  const [toastMessage, setToastMessage] = useState(null);
  const [activeModalReport, setActiveModalReport] = useState(null);

  // Date-wise Range Filter States
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getActivePeriodLabel = () => {
    if (fromDate && toDate) return `${formatDate(fromDate)} to ${formatDate(toDate)}`;
    if (fromDate) return `From ${formatDate(fromDate)}`;
    if (toDate) return `Up to ${formatDate(toDate)}`;
    return 'Q3 2026 Full Audit Period';
  };

  const handleExportPDF = (title) => {
    const periodStr = getActivePeriodLabel();
    const reportSummary = `Executive Summary for ${title}\nAudit Period: ${periodStr}\nGross Revenue YTD: ₹1,28,450.00\nInventory Valuation: ₹1,28,400.00\nNet Operating Income: ₹32,050.00\nFulfillment Rate: 98.2%`;
    downloadPDFSimulated(title, reportSummary);
    showToast(`Downloaded "${title}" for ${periodStr} as PDF file!`);
  };

  const handleExportExcel = (title) => {
    const periodStr = getActivePeriodLabel();
    const headers = ['Report Title', 'Category', 'Audit Period', 'Metric Value', 'Status'];
    const rows = [
      [title, 'Business Intelligence', periodStr, '₹1,28,450.00', 'Verified'],
      [title, 'Operations Audit', periodStr, '₹32,050.00 Net Income', 'Completed']
    ];
    downloadCSV(title, headers, rows);
    showToast(`Downloaded "${title}" for ${periodStr} as Excel / CSV file!`);
  };

  // Detailed Datasets for Reports
  const salesChannelDetailedData = [
    { date: '2026-07-21', channel: 'Direct B2B Enterprise Sales', ordersCount: 42, grossRevenue: 84500.00, discount: 2100.00, taxGst: 14832.00, netRevenue: 97232.00, margin: '38.5%' },
    { date: '2026-07-20', channel: 'Retail POS In-Store Terminals', ordersCount: 128, grossRevenue: 34200.00, discount: 850.00, taxGst: 6003.00, netRevenue: 39353.00, margin: '42.1%' },
    { date: '2026-07-19', channel: 'E-Commerce Online Gateway', ordersCount: 95, grossRevenue: 28900.00, discount: 1200.00, taxGst: 4986.00, netRevenue: 32686.00, margin: '45.0%' },
    { date: '2026-07-15', channel: 'Wholesale Distributor Partners', ordersCount: 18, grossRevenue: 52000.00, discount: 4500.00, taxGst: 8550.00, netRevenue: 56050.00, margin: '28.0%' }
  ];

  const vendorSpendDetailedData = [
    { date: '2026-07-21', vendor: 'Dell Enterprise Direct', category: 'Electronics', posCount: 14, spend: 38400.00, apBalance: 4200.00, leadTime: '3 Days', qcPassRate: '98.5%' },
    { date: '2026-07-20', vendor: 'Cisco Systems Enterprise', category: 'Networking', posCount: 8, spend: 24500.00, apBalance: 0.00, leadTime: '2 Days', qcPassRate: '100%' },
    { date: '2026-07-18', vendor: 'Herman Miller Office Furniture', category: 'Furniture', posCount: 6, spend: 18200.00, apBalance: 3100.00, leadTime: '5 Days', qcPassRate: '96.0%' },
    { date: '2026-07-15', vendor: 'Logitech Global Supply', category: 'Peripherals', posCount: 22, spend: 12800.00, apBalance: 850.00, leadTime: '1 Day', qcPassRate: '99.0%' },
    { date: '2026-07-10', vendor: 'HP Commercial Direct', category: 'Electronics', posCount: 10, spend: 16900.00, apBalance: 2400.00, leadTime: '4 Days', qcPassRate: '97.5%' }
  ];

  const inventoryDetailedData = [
    { date: '2026-07-21', sku: 'MON-34-UW', name: 'UltraWide 34" Curved Monitor', category: 'Electronics', stock: 45, unitCost: 650.00, unitPrice: 1100.00, totalAssetValue: 29250.00, turnover: 'Fast' },
    { date: '2026-07-20', sku: 'DOC-TB4-PRO', name: 'Thunderbolt 4 Docking Station', category: 'Electronics', stock: 120, unitCost: 380.00, unitPrice: 625.00, totalAssetValue: 45600.00, turnover: 'Very Fast' },
    { date: '2026-07-19', sku: 'CHR-EX-BLK', name: 'Executive Leather Task Chair', category: 'Furniture', stock: 18, unitCost: 520.00, unitPrice: 900.00, totalAssetValue: 9360.00, turnover: 'Medium' },
    { date: '2026-07-16', sku: 'KB-ERG-01', name: 'Ergonomic Mechanical Keyboard', category: 'Electronics', stock: 85, unitCost: 70.00, unitPrice: 130.00, totalAssetValue: 5950.00, turnover: 'Fast' },
    { date: '2026-07-12', sku: 'DSK-ST-OAK', name: 'Electric Sit-Stand Oak Desk', category: 'Furniture', stock: 12, unitCost: 750.00, unitPrice: 1250.00, totalAssetValue: 9000.00, turnover: 'Medium' }
  ];

  const financialStatementsData = [
    { id: 'rep-01', title: 'Sales Performance & Channel Revenue Report', category: 'Sales', date: '2026-07-21', format: 'PDF / Excel' },
    { id: 'rep-02', title: 'Vendor Procurement & AP Expense Analysis', category: 'Purchasing', date: '2026-07-20', format: 'PDF / CSV' },
    { id: 'rep-03', title: 'Inventory Valuation & Fast-Moving SKU Audit', category: 'Inventory', date: '2026-07-19', format: 'CSV' },
    { id: 'rep-04', title: 'Income Statement (Profit & Loss Financials)', category: 'Finance', date: '2026-07-15', format: 'PDF / CSV' }
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
        <KpiDashboardView onExportReport={(title, fmt) => fmt === 'PDF' ? handleExportPDF(title) : handleExportExcel(title)} />
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
              <div className="kpi-value" style={{ color: '#10b981' }}>₹2,410.00</div>
              <div className="kpi-subtitle">+12.4% vs last quarter</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Top Revenue Customer</span>
                <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#3b82f6' }}>Vanguard Capital</div>
              <div className="kpi-subtitle">₹98,000.00 Total Lifetime Value</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Sales Conversion Rate</span>
                <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                  <Award size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#8b5cf6' }}>64.2%</div>
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
              <div className="kpi-value" style={{ color: '#ef4444' }}>₹1,10,800.00</div>
              <div className="kpi-subtitle">YTD Vendor PO Disbursements</div>
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
              <div className="kpi-value" style={{ color: '#10b981' }}>98.2%</div>
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
              <div className="kpi-value" style={{ color: '#f59e0b' }}>₹99,160.00</div>
              <div className="kpi-subtitle">Audited Warehouse Stock Value</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Fastest Moving SKU</span>
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#10b981' }}>Thunderbolt 4 Dock</div>
              <div className="kpi-subtitle">120 Units in High Turn Demand</div>
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
