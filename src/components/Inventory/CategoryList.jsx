import React from 'react';
import { Layers, IndianRupee, Package } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function CategoryList({ products = [] }) {
  const categoriesMap = {};

  products.forEach(p => {
    if (!categoriesMap[p.category]) {
      categoriesMap[p.category] = {
        name: p.category,
        skuCount: 0,
        totalUnits: 0,
        totalValuation: 0
      };
    }

    const stock = p.stock !== undefined ? p.stock : (p.currentStock || 0);
    const price = p.unitPrice !== undefined ? p.unitPrice : (p.price || 0);

    categoriesMap[p.category].skuCount += 1;
    categoriesMap[p.category].totalUnits += stock;
    categoriesMap[p.category].totalValuation += stock * price;
  });

  const categories = Object.values(categoriesMap);
  const grandTotalValuation = categories.reduce((sum, c) => sum + c.totalValuation, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="kpi-grid">
        {categories.map((cat) => {
          const percentVal = grandTotalValuation > 0 ? ((cat.totalValuation / grandTotalValuation) * 100).toFixed(1) : 0;
          return (
            <div key={cat.name} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Category
                </span>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
                  <Layers size={18} />
                </div>
              </div>

              <div style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-primary)' }}>
                {cat.name}
              </div>

              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-blue)', margin: '8px 0' }}>
                {formatCurrency(cat.totalValuation)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '6px' }}>
                <span>{cat.skuCount} Registered SKUs</span>
                <span>{cat.totalUnits} Total Units</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Category Valuation Matrix</h2>
        </div>
        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Registered SKUs</th>
                <th>Total Inventory Units</th>
                <th>Valuation Share</th>
                <th>Total Valuation (₹ INR)</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.name}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{cat.name}</td>
                  <td>{cat.skuCount} SKUs</td>
                  <td>{cat.totalUnits} units</td>
                  <td>
                    {grandTotalValuation > 0 ? ((cat.totalValuation / grandTotalValuation) * 100).toFixed(1) : 0}%
                  </td>
                  <td style={{ fontWeight: '800', color: '#10b981' }}>
                    {formatCurrency(cat.totalValuation)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
