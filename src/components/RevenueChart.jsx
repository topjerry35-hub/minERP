import React, { useState } from 'react';
import { TrendingUp, IndianRupee, ArrowUpRight } from 'lucide-react';

export default function RevenueChart({ data, timeRange }) {
  const [activeMetric, setActiveMetric] = useState('revenue');
  const [hoveredBar, setHoveredBar] = useState(null);

  const maxValue = Math.max(...data.map(d => Math.max(d.revenue, d.expenses))) * 1.15;
  const height = 220;
  const width = 600;

  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalExpenses = data.reduce((acc, curr) => acc + curr.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Financial Performance Breakdown</h2>
          <span className="card-subtitle">Revenue, Expenses & Profit trends ({timeRange})</span>
        </div>
        
        <div className="date-filter-group">
          <button 
            className={`date-btn ${activeMetric === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveMetric('revenue')}
          >
            Revenue (₹{totalRevenue.toLocaleString()})
          </button>
          <button 
            className={`date-btn ${activeMetric === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveMetric('expenses')}
          >
            Expenses (₹{totalExpenses.toLocaleString()})
          </button>
          <button 
            className={`date-btn ${activeMetric === 'profit' ? 'active' : ''}`}
            onClick={() => setActiveMetric('profit')}
          >
            Net Profit (₹{totalProfit.toLocaleString()})
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: `${height}px`, marginTop: '10px' }}>
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - (ratio * (height - 30)) - 20;
            return (
              <line 
                key={idx}
                x1="0" 
                y1={y} 
                x2={width} 
                y2={y} 
                stroke="var(--border-color)" 
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Bar Chart Visualization */}
          {data.map((item, idx) => {
            const barWidth = (width / data.length) * 0.45;
            const groupX = (idx * (width / data.length)) + (width / data.length) / 2;
            const revHeight = (item.revenue / maxValue) * (height - 40);
            const expHeight = (item.expenses / maxValue) * (height - 40);
            const profitHeight = ((item.revenue - item.expenses) / maxValue) * (height - 40);

            const isHovered = hoveredBar === idx;

            return (
              <g 
                key={idx}
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Revenue Bar */}
                {(activeMetric === 'revenue' || activeMetric === 'all') && (
                  <rect
                    x={groupX - barWidth / 2}
                    y={height - revHeight - 20}
                    width={barWidth}
                    height={revHeight}
                    fill="url(#revenueGrad)"
                    rx="4"
                    stroke={isHovered ? '#60a5fa' : 'none'}
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.2s' }}
                  />
                )}

                {/* Expenses Bar */}
                {activeMetric === 'expenses' && (
                  <rect
                    x={groupX - barWidth / 2}
                    y={height - expHeight - 20}
                    width={barWidth}
                    height={expHeight}
                    fill="url(#expenseGrad)"
                    rx="4"
                    stroke={isHovered ? '#fca5a5' : 'none'}
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.2s' }}
                  />
                )}

                {/* Profit Bar */}
                {activeMetric === 'profit' && (
                  <rect
                    x={groupX - barWidth / 2}
                    y={height - profitHeight - 20}
                    width={barWidth}
                    height={profitHeight}
                    fill="url(#profitGrad)"
                    rx="4"
                    stroke={isHovered ? '#6ee7b7' : 'none'}
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.2s' }}
                  />
                )}

                {/* X Axis Label */}
                <text
                  x={groupX}
                  y={height - 2}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="11"
                  fontWeight={isHovered ? "700" : "500"}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip overlay */}
        {hoveredBar !== null && (
          <div 
            style={{
              position: 'absolute',
              top: '10px',
              left: `${(hoveredBar / data.length) * 100 + 4}%`,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '8px 12px',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
              zIndex: 10,
              fontSize: '0.8rem'
            }}
          >
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {data[hoveredBar].label}
            </div>
            <div style={{ color: 'var(--accent-blue)' }}>
              Rev: ₹{data[hoveredBar].revenue.toLocaleString('en-IN')}
            </div>
            <div style={{ color: '#ef4444' }}>
              Exp: ₹{data[hoveredBar].expenses.toLocaleString('en-IN')}
            </div>
            <div style={{ color: '#10b981', fontWeight: '700' }}>
              Profit: ₹{(data[hoveredBar].revenue - data[hoveredBar].expenses).toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#3b82f6' }}></span>
          Revenue
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#ef4444' }}></span>
          Expenses
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#10b981' }}></span>
          Profit Margin (+31.4%)
        </div>
      </div>
    </div>
  );
}
