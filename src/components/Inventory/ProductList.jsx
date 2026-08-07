import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Barcode, 
  ArrowDownRight, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Search, 
  FileSpreadsheet, 
  MoreVertical, 
  Layers 
} from 'lucide-react';

import { formatCurrency } from '../../utils/currency';

export default function ProductList({ 
  products, 
  onAddProductClick, 
  onStockInClick, 
  onStockOutClick, 
  onBarcodeClick, 
  onAdjustmentClick,
  onImportClick,
  searchQuery 
}) {
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set((products || []).map(p => p.category).filter(Boolean)))];

  const query = (searchQuery || '').toLowerCase();
  const filteredProducts = (products || []).filter(p => {
    if (!p) return false;
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = (p.name || '').toLowerCase().includes(query) ||
                          (p.sku || '').toLowerCase().includes(query) ||
                          (p.category || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="card">
      {/* Header & Main Actions */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)' }}>
              <Package size={22} />
            </div>
            <div>
              <h2 className="card-title">Master Product Inventory Catalog</h2>
              <span className="card-subtitle">Managing {filteredProducts.length} registered active SKUs</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onImportClick && (
            <button className="btn-secondary" onClick={onImportClick} title="Import via Excel / CSV">
              <FileSpreadsheet size={15} color="#10b981" />
              Import CSV
            </button>
          )}

          <button className="btn-secondary" onClick={onStockInClick}>
            <ArrowDownRight size={15} color="#10b981" />
            Stock Intake (+)
          </button>

          <button className="btn-secondary" onClick={onStockOutClick}>
            <ArrowUpRight size={15} color="#ef4444" />
            Stock Out (-)
          </button>

          <button className="btn-primary" onClick={onAddProductClick}>
            <Plus size={16} />
            Register SKU
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: '1px solid',
              borderColor: categoryFilter === cat ? 'var(--accent-blue)' : 'var(--border-color)',
              background: categoryFilter === cat ? 'rgba(56, 189, 248, 0.18)' : 'var(--bg-input)',
              color: categoryFilter === cat ? 'var(--accent-blue)' : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>SKU / Product</th>
              <th>Category</th>
              <th>Unit Cost</th>
              <th>Selling Price</th>
              <th>Stock Level & Progress</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => {
                const stockPercent = Math.min(100, Math.max(0, (product.stock / 50) * 100));
                const statusClass = product.stock <= 0 ? 'out_of_stock' : product.stock <= product.minStock ? 'low_stock' : 'in_stock';
                const statusLabel = product.stock <= 0 ? 'Out of Stock' : product.stock <= product.minStock ? 'Low Stock Alert' : 'In Stock';

                const sellingPrice = product.unitPrice !== undefined ? product.unitPrice : (product.price !== undefined ? product.price : 0);
                const costPriceVal = product.costPrice !== undefined ? product.costPrice : (product.cost !== undefined ? product.cost : Number((sellingPrice * 0.65).toFixed(2)));

                return (
                  <tr key={product.sku}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            style={{ 
                              width: '38px', 
                              height: '38px', 
                              borderRadius: '10px', 
                              objectFit: 'cover',
                              border: '1px solid rgba(56, 189, 248, 0.2)'
                            }}
                          />
                        ) : (
                          <div 
                            style={{ 
                              width: '38px', 
                              height: '38px', 
                              borderRadius: '10px', 
                              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.15))', 
                              border: '1px solid rgba(56, 189, 248, 0.2)',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'var(--accent-blue)',
                              fontWeight: '800',
                              fontSize: '0.8rem'
                            }}
                          >
                            {product.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge info">
                        {product.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                      {formatCurrency(costPriceVal)}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {formatCurrency(sellingPrice)}
                    </td>
                    <td style={{ width: '220px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700' }}>
                          <span style={{ color: product.stock <= product.minStock ? 'var(--status-warning)' : 'var(--text-primary)' }}>
                            {product.stock} units
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Min: {product.minStock || 10}</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${stockPercent}%`, 
                              height: '100%', 
                              background: product.stock <= 0 ? 'var(--status-danger)' : product.stock <= product.minStock ? 'var(--status-warning)' : 'linear-gradient(90deg, #38bdf8, #10b981)',
                              borderRadius: '3px' 
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Generate Barcode Label"
                          onClick={() => onBarcodeClick(product)}
                        >
                          <Barcode size={14} color="var(--accent-blue)" />
                          Barcode
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Adjust Stock Count"
                          onClick={() => onAdjustmentClick(product)}
                        >
                          <SlidersHorizontal size={14} color="var(--status-warning)" />
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No SKUs match the current search or category filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
