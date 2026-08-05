import React from 'react';
import { X, FileCheck, CheckCircle2, Download, Printer, Truck, ShieldCheck, Building2, Package } from 'lucide-react';
import { formatDate } from '../../utils/date';
import { downloadPDFSimulated } from '../../utils/exportUtils';

export default function GrnDetailModal({ isOpen, onClose, grn }) {
  if (!isOpen || !grn) return null;

  const handleDownloadPDF = () => {
    const content = `
==================================================
        GOODS RECEIPT NOTE (GRN) VOUCHER         
==================================================
GRN Ref: ${grn.id}
Linked PO: ${grn.poId}
Supplier / Vendor: ${grn.supplier}
Received Date: ${formatDate(grn.receivedDate)}
Inspector: ${grn.inspector || 'Warehouse Receiving QC'}
QC Status: ${grn.inspectionStatus || 'Passed Audit'}
--------------------------------------------------
INWARD ITEM SPECIFICATIONS:
--------------------------------------------------
- Units Received: ${grn.unitsReceived} Units
- Inward Storage Location: Main Warehouse (Bin A-04)
- Verification Method: Barcode Scan & Physical Count
--------------------------------------------------
AUTHORIZATION & AUDIT:
Received & Verified By: ${grn.inspector || 'Warehouse Receiving QC'}
Status: Cleared & Restocked into Enterprise Inventory
==================================================
`;
    downloadPDFSimulated(`GRN_Voucher_${grn.id}`, content);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', background: 'var(--bg-card)' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck size={22} color="#10b981" />
            <div>
              <h2 className="modal-title">Goods Receipt Note (GRN) Voucher</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Reference #: {grn.id}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '16px' }}>
          {/* Status banner */}
          <div style={{
            background: grn.inspectionStatus === 'Pending Quality Review' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${grn.inspectionStatus === 'Pending Quality Review' ? '#f59e0b50' : '#10b98150'}`,
            padding: '14px 18px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-muted)' }}>Inspection Status</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: grn.inspectionStatus === 'Pending Quality Review' ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} /> {grn.inspectionStatus || 'Passed Audit'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Received Date</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {formatDate(grn.receivedDate)}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid-2">
            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#3b82f6', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={15} /> Supplier Information
              </div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{grn.supplier}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Linked PO: <strong style={{ color: 'var(--accent-blue)' }}>{grn.poId}</strong></div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} /> QC & Warehouse Receiving
              </div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{grn.inspector || 'Warehouse QC Team'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Inward Bin: <strong style={{ color: '#10b981' }}>Main Store (Zone A)</strong></div>
            </div>
          </div>

          {/* Inward Items Breakdown */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--bg-input)', padding: '10px 14px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
              Inward Stock Verification Summary
            </div>
            <table className="erp-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>SKU / Item Description</th>
                  <th>Inward Qty</th>
                  <th>QC Test Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    PO Delivery Batch #{grn.poId}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified against packing list & PO specifications</div>
                  </td>
                  <td style={{ fontWeight: '800', color: '#10b981' }}>+{grn.unitsReceived} Units</td>
                  <td>
                    <span className="status-badge completed">
                      {grn.inspectionStatus || 'Passed Audit'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleDownloadPDF}>
            <Download size={16} color="#ef4444" />
            Download GRN PDF
          </button>
          <button className="btn-primary" onClick={onClose}>
            Close Voucher
          </button>
        </div>
      </div>
    </div>
  );
}
