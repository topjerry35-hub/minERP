import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';

export default function CategoryPieChart({ data = [] }) {
  const total = (data || []).reduce((sum, item) => sum + (item.value || 0), 0);
  
  // Calculate SVG donut segments
  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  const slices = (data || []).map((slice) => {
    const startPercent = cumulativePercent;
    const slicePercent = total > 0 ? slice.value / total : 0;
    cumulativePercent += slicePercent;
    const endPercent = cumulativePercent;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);

    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L 0 0`,
    ].join(' ');

    return {
      pathData,
      color: slice.color,
      name: slice.name,
      value: slice.value,
      percentage: Math.round(slicePercent * 100)
    };
  });

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={18} style={{ color: 'var(--accent-blue)' }} />
            Sales by Category
          </h2>
          <span className="card-subtitle">Distribution by product line</span>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '16px', 
        paddingTop: '6px' 
      }}>
        {/* Donut Chart */}
        <div style={{ position: 'relative', width: '135px', height: '135px', flexShrink: 0 }}>
          <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            {slices.map((slice, idx) => (
              <path key={idx} d={slice.pathData} fill={slice.color} />
            ))}
            {/* Center hole for Donut effect */}
            <circle cx="0" cy="0" r="0.6" fill="var(--bg-card)" />
          </svg>
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              ₹{(total / 1000).toFixed(1)}k
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Sales</div>
          </div>
        </div>

        {/* Legend List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {slices.map((slice, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                fontSize: '0.8rem',
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: slice.color, flexShrink: 0 }}></span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {slice.name}
                </span>
              </div>
              <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '8px' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)', marginRight: '4px' }}>{slice.percentage}%</span>
                <span style={{ fontSize: '0.74rem' }}>(₹{(slice.value || 0).toLocaleString()})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
