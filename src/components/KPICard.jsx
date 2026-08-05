import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KPICard({ title, value, trend, isPositive, subtitle, icon: Icon, color = '#405189' }) {
  return (
    <div className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="kpi-header">
        <span className="kpi-title" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem', fontWeight: '700' }}>
          {title}
        </span>
        <div 
          className="kpi-icon"
          style={{ 
            backgroundColor: `${color}15`,
            color: color,
            border: `1px solid ${color}25`,
            width: '42px',
            height: '42px',
            borderRadius: '8px'
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="kpi-value-row" style={{ marginTop: '8px' }}>
        <div className="kpi-value" style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          {value}
        </div>
        {trend && (
          <div className={`kpi-trend ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>{subtitle}</span>
          <span style={{ color: 'var(--accent-blue)', fontWeight: '600', cursor: 'pointer' }}>View Details</span>
        </div>
      )}
    </div>
  );
}
