import React from 'react';
import { X, FileText, FileSpreadsheet, Download, CheckCircle2, TrendingUp, BarChart2, ShieldCheck, Printer } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { downloadCSV, downloadPDFSimulated } from '../../utils/exportUtils';

export default function DetailedReportModal({ isOpen, onClose, reportData }) {
  if (!isOpen || !reportData) return null;

  const { title, category, period, summaryKpis = [], headers = [], rows = [], notes } = reportData;

  const handleExportPDF = () => {
    let pdfText = `==================================================\n`;
    pdfText += `       minERP ENTERPRISE DETAILED REPORT          \n`;
    pdfText += `==================================================\n`;
    pdfText += `Title: ${title}\n`;
    pdfText += `Category: ${category}\n`;
    pdfText += `Audit Period: ${period || 'Q3 2026'}\n`;
    pdfText += `Generated Date: ${formatDate(new Date())}\n`;
    pdfText += `--------------------------------------------------\n`;
    pdfText += `EXECUTIVE SUMMARY KPI METRICS:\n`;
    summaryKpis.forEach(kpi => {
      pdfText += `- ${kpi.label}: ${kpi.value}\n`;
    });
    pdfText += `--------------------------------------------------\n`;
    pdfText += `DETAILED AUDIT DATA ROWS:\n`;
    rows.forEach(row => {
      pdfText += row.join(' | ') + '\n';
    });
    pdfText += `==================================================\n`;

    downloadPDFSimulated(title, pdfText);
  };

  const handleExportExcel = () => {
    downloadCSV(title, headers, rows);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', width: '90%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={22} color="#3b82f6" />
            <div>
              <h2 className="modal-title">{title}</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Category: <strong>{category}</strong> • Period: <strong>{period || 'Q3 2026'}</strong>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '18px' }}>
          {/* Summary KPIs Banner */}
          {summaryKpis.length > 0 && (
            <div className="grid-3" style={{ gap: '12px' }}>
              {summaryKpis.map((kpi, idx) => (
                <div key={idx} style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: kpi.color || 'var(--text-primary)', marginTop: '2px' }}>
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Data Table */}
          <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ fontWeight: cIdx === 0 ? '700' : '500', color: cIdx === 0 ? 'var(--text-primary)' : 'inherit' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length || 1} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                      No detailed rows available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {notes && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
              <strong>Auditor Notes:</strong> {notes}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleExportExcel}>
            <FileSpreadsheet size={16} color="#10b981" />
            Export Excel (.CSV)
          </button>
          <button className="btn-secondary" onClick={handleExportPDF}>
            <FileText size={16} color="#ef4444" />
            Export PDF (.PDF)
          </button>
          <button className="btn-primary" onClick={onClose}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
