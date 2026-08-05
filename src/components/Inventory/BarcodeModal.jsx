import React, { useState } from 'react';
import { X, QrCode, Printer, Camera, Search, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function BarcodeModal({ product, products, isOpen, onClose, onScannedProduct }) {
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);

  if (!isOpen) return null;

  // Generate deterministic barcode width pattern based on SKU characters
  const generateBarcodeLines = (codeStr) => {
    const str = codeStr || 'MIN-9999';
    const lines = [];
    for (let i = 0; i < 38; i++) {
      const charCode = str.charCodeAt(i % str.length);
      const width = (charCode % 3) + 1; // 1px, 2px, or 3px
      lines.push({ width, key: i });
    }
    return lines;
  };

  const handleSimulateScan = (e) => {
    e.preventDefault();
    if (!scanInput) return;
    
    const found = products?.find(p => 
      p.sku.toLowerCase() === scanInput.trim().toLowerCase() ||
      p.barcode?.toLowerCase() === scanInput.trim().toLowerCase() ||
      p.name.toLowerCase().includes(scanInput.trim().toLowerCase())
    );

    if (found) {
      setScanResult(found);
      if (onScannedProduct) onScannedProduct(found);
    } else {
      setScanResult('NOT_FOUND');
    }
  };

  const currentItem = product || scanResult;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={20} color="#3b82f6" />
            <h2 className="modal-title">{product ? `Barcode Label - ${product.sku}` : 'Barcode Scanner & Search'}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '20px' }}>
          {/* Scanner Input Simulation */}
          <form onSubmit={handleSimulateScan} style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Scan barcode or type SKU (e.g. MON-34-UW)..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary">
              <Camera size={16} />
              Simulate Scan
            </button>
          </form>

          {/* Quick SKU selector chips */}
          {products && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '100%' }}>Sample SKUs to scan:</span>
              {products.slice(0, 4).map(p => (
                <button 
                  key={p.sku} 
                  type="button" 
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  onClick={() => {
                    setScanInput(p.sku);
                    setScanResult(p);
                  }}
                >
                  {p.sku}
                </button>
              ))}
            </div>
          )}

          {scanResult === 'NOT_FOUND' && (
            <div style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
              No product SKU matching "{scanInput}" found in database.
            </div>
          )}

          {/* Render Visual Barcode Graphic Card */}
          {currentItem && currentItem !== 'NOT_FOUND' && (
            <div className="barcode-card">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{currentItem.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category: {currentItem.category} • Price: {formatCurrency(currentItem.unitPrice !== undefined ? currentItem.unitPrice : (currentItem.price || 0))}</div>
              </div>

              {/* CODE128 Visual SVG Barcode Lines */}
              <div className="barcode-lines">
                {generateBarcodeLines(currentItem.sku).map(line => (
                  <div 
                    key={line.key} 
                    className="barcode-line" 
                    style={{ width: `${line.width * 2}px` }} 
                  />
                ))}
              </div>

              <div className="barcode-text">
                {currentItem.barcode || currentItem.sku}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                * minERP Verified Inventory SKU Label *
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {currentItem && currentItem !== 'NOT_FOUND' && (
            <button className="btn-primary" onClick={() => alert(`Printing Barcode Label Sticker for ${currentItem.sku}`)}>
              <Printer size={16} />
              Print Barcode Label
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
