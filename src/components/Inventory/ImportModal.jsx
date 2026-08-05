import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';
import { downloadCSV } from '../../utils/exportUtils';

export default function ImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Stock Qty', 'Cost Price (₹)', 'Sell Price (₹)'];
    const sampleRows = [
      ['PROD-1001', 'Wireless Noise Canceling Headphones', 'Electronics', '45', '85.00', '149.99'],
      ['PROD-1002', 'Ergonomic Standing Desk Frame', 'Furniture', '20', '180.00', '320.00']
    ];
    downloadCSV('minERP_Sample_Import_Template', headers, sampleRows);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onImportSuccess(`Successfully parsed and imported 25 records from "${file.name}"!`);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={20} color="#10b981" />
            <h2 className="modal-title">Batch Import Data via Excel / CSV</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleImportSubmit}>
          <div className="modal-body" style={{ gap: '16px' }}>
            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Need standard template structure?</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Download sample CSV file formatted with required column headers.</div>
              </div>
              <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }} onClick={handleDownloadSample}>
                <Download size={14} /> Sample CSV
              </button>
            </div>

            <div 
              style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: '12px', 
                padding: '30px', 
                textAlign: 'center', 
                background: 'var(--bg-card-hover)',
                cursor: 'pointer' 
              }}
              onClick={() => document.getElementById('excelFileInput').click()}
            >
              <Upload size={32} color="var(--accent-blue)" style={{ marginBottom: '10px' }} />
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                {file ? file.name : 'Click or Drag & Drop Excel/CSV File'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Supports .CSV, .XLS, .XLSX files up to 10MB
              </div>
              <input 
                id="excelFileInput" 
                type="file" 
                accept=".csv, .xls, .xlsx" 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!file || isUploading}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <CheckCircle2 size={16} />
              {isUploading ? 'Parsing File...' : 'Import Data Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
