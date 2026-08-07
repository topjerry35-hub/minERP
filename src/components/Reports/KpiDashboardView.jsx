import React from 'react';
import { TrendingUp, IndianRupee, Package, Users, ArrowUpRight, Award, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function KpiDashboardView({ orders = [], products = [], purchaseOrders = [], arInvoices = [] }) {
  const grossRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  
  const inventoryValuation = products.reduce((sum, p) => {
    const stock = p.stock !== undefined ? p.stock : (p.currentStock !== undefined ? p.currentStock : 0);
    const cost = Number(p.costPrice || p.cost || p.unitPrice || 0);
    return sum + (stock * cost);
  }, 0);

  const procurementSpend = purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount || po.amount || 0), 0);
  const netProfit = grossRevenue - procurementSpend;

  const totalArBalance = arInvoices.reduce((sum, inv) => {
    return sum + (inv.status !== 'Paid' ? Number(inv.amount || 0) : 0);
  }, 0);

  const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Dispatched' || o.status === 'Paid').length;
  const fulfillmentRate = orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : '100.0';

  const quarterlyTarget = 150000;
  const targetPct = Math.min(100, (grossRevenue / quarterlyTarget) * 100).toFixed(1);
  const targetRemaining = Math.max(0, quarterlyTarget - grossRevenue);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Gross Revenue YTD</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#3b82f6' }}>{formatCurrency(grossRevenue)}</div>
          <div className="kpi-subtitle" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> Calculated from {orders.length} orders
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Inventory Net Valuation</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Package size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>{formatCurrency(inventoryValuation)}</div>
          <div className="kpi-subtitle">Across {products.length} Active SKUs</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Net Operating Profit</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: netProfit >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(netProfit)}</div>
          <div className="kpi-subtitle">Revenue minus Spend</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Accounts Receivable</span>
            <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#8b5cf6' }}>{formatCurrency(totalArBalance)}</div>
          <div className="kpi-subtitle">Uncollected Invoices</div>
        </div>
      </div>

      {/* Performance Progress Gauges */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Quarterly Revenue Target Progress</h2>
              <span className="card-subtitle">Q3 2026 Target: {formatCurrency(quarterlyTarget)}</span>
            </div>
            <Award size={20} color="#f59e0b" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
              <span>Target Achievement: {targetPct}%</span>
              <span style={{ color: '#10b981' }}>{formatCurrency(grossRevenue)} / {formatCurrency(quarterlyTarget)}</span>
            </div>

            <div style={{ width: '100%', height: '10px', background: 'var(--bg-input)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${targetPct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: '5px' }}></div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {formatCurrency(targetRemaining)} remaining to hit quarterly enterprise sales benchmark.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Order Fulfillment Rate</h2>
              <span className="card-subtitle">Operational dispatch velocity</span>
            </div>
            <Zap size={20} color="#10b981" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
              <span>Fulfillment Accuracy: {fulfillmentRate}%</span>
              <span style={{ color: '#3b82f6' }}>{completedOrders} / {orders.length} Orders</span>
            </div>

            <div style={{ width: '100%', height: '10px', background: 'var(--bg-input)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${fulfillmentRate}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '5px' }}></div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Calculated dynamically from real-time database dispatches.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
