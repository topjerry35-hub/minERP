import React from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function LowStockWidget({ items, onReorder }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <h2 className="card-title">Low Stock Alert</h2>
          </div>
          <span className="card-subtitle">Items requiring immediate reorder</span>
        </div>
        <span 
          className="badge" 
          style={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.2)', 
            color: '#f59e0b',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '700'
          }}
        >
          {items.length} Items Critical
        </span>
      </div>

      <div className="stock-list">
        {items.map((item) => {
          const percent = Math.min(100, Math.round((item.currentStock / item.minThreshold) * 100));
          const isSeverelyLow = item.currentStock <= item.minThreshold / 2;

          return (
            <div key={item.sku} className="stock-item">
              <div className="stock-details">
                <div className="stock-name">{item.name}</div>
                <div className="stock-sku">SKU: {item.sku} • Supplier: {item.supplier}</div>
                <div className="stock-progress-bar">
                  <div 
                    className="stock-progress-fill" 
                    style={{ 
                      width: `${percent}%`,
                      backgroundColor: isSeverelyLow ? '#ef4444' : '#f59e0b' 
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: isSeverelyLow ? '#ef4444' : '#f59e0b' }}>
                  {item.currentStock} / {item.minThreshold} left
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '3px 8px', fontSize: '0.75rem', borderColor: isSeverelyLow ? '#ef444450' : undefined }}
                  onClick={() => onReorder(item)}
                >
                  <RefreshCw size={12} />
                  Reorder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
