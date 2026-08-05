import React from 'react';
import { TrendingUp, IndianRupee, Package, Users, BarChart3, Download, ArrowUpRight, Award, Zap } from 'lucide-react';

export default function KpiDashboardView({ onExportReport }) {
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
          <div className="kpi-value" style={{ color: '#3b82f6' }}>₹128,450.00</div>
          <div className="kpi-subtitle" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> +14.2% YoY growth
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Inventory Net Valuation</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Package size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>₹128,400.00</div>
          <div className="kpi-subtitle">Across 432 SKUs</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Net Operating Profit</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>₹32,050.00</div>
          <div className="kpi-subtitle">Profit margin: +31.4%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Accounts Receivable</span>
            <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#8b5cf6' }}>₹18,290.00</div>
          <div className="kpi-subtitle">Uncollected invoices</div>
        </div>
      </div>

      {/* Performance Progress Gauges */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Quarterly Revenue Target Progress</h2>
              <span className="card-subtitle">Q3 2026 Target: ₹150,000.00</span>
            </div>
            <Award size={20} color="#f59e0b" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
              <span>Target Achievement: 85.6%</span>
              <span style={{ color: '#10b981' }}>₹128,450 / ₹150,000</span>
            </div>

            <div style={{ width: '100%', height: '10px', background: 'var(--bg-input)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: '85.6%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: '5px' }}></div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ₹21,550 remaining to hit quarterly enterprise sales benchmark.
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
              <span>Fulfillment Accuracy: 98.2%</span>
              <span style={{ color: '#3b82f6' }}>1,420 / 1,446 Orders</span>
            </div>

            <div style={{ width: '100%', height: '10px', background: 'var(--bg-input)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: '98.2%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '5px' }}></div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Average order dispatch time: 4.2 hours from payment confirmation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
