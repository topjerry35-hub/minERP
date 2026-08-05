import React, { useState } from 'react';
import { PackageCheck, CheckCircle2, FileCheck, Eye, ShieldAlert, Award, Clock, ArrowDownRight } from 'lucide-react';
import { formatDate } from '../../utils/date';
import GrnDetailModal from './GrnDetailModal';

export default function GoodsReceiptList({ goodsReceipts = [], searchQuery, onApproveQc }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedGrn, setSelectedGrn] = useState(null);

  const query = (searchQuery || '').toLowerCase();

  const filteredGRNs = (goodsReceipts || []).filter(g => {
    if (!g) return false;
    const matchesSearch = 
      (g.id || '').toLowerCase().includes(query) ||
      (g.poId || '').toLowerCase().includes(query) ||
      (g.supplier || '').toLowerCase().includes(query);

    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Passed' && (g.inspectionStatus || '').includes('Passed')) ||
      (statusFilter === 'Pending' && (g.inspectionStatus || '').includes('Pending'));

    return matchesSearch && matchesStatus;
  });

  const totalGRNs = goodsReceipts.length;
  const totalUnits = goodsReceipts.reduce((sum, g) => sum + (g.unitsReceived || 0), 0);
  const passedCount = goodsReceipts.filter(g => (g.inspectionStatus || '').includes('Passed')).length;
  const passRate = totalGRNs > 0 ? ((passedCount / totalGRNs) * 100).toFixed(1) : 100;
  const pendingCount = goodsReceipts.filter(g => (g.inspectionStatus || '').includes('Pending')).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Executive GRN KPI Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total GRN Slips</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <FileCheck size={20} />
            </div>
          </div>
          <div className="kpi-value">{totalGRNs} Receipts</div>
          <div className="kpi-subtitle">Verified Inward Invoices</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Units Inwarded</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <PackageCheck size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>
            +{totalUnits.toLocaleString()} Units
          </div>
          <div className="kpi-subtitle">Accepted into Warehouse Inventory</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">QC Inspection Pass Rate</span>
            <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <Award size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#8b5cf6' }}>
            {passRate}%
          </div>
          <div className="kpi-subtitle">{passedCount} of {totalGRNs} Passed Quality Audit</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Pending QC Review</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>
            {pendingCount} Pending
          </div>
          <div className="kpi-subtitle">Awaiting Quality Officer Signoff</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={20} color="#10b981" />
              <h2 className="card-title">Goods Receipt Notes (GRN) History Log</h2>
            </div>
            <span className="card-subtitle">Showing {filteredGRNs.length} verified inventory receiving vouchers</span>
          </div>

          <div className="date-filter-group">
            {['All', 'Passed', 'Pending'].map(status => (
              <button
                key={status}
                className={`date-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'Passed' ? 'Passed Audit' : status === 'Pending' ? 'Pending Review' : 'All GRNs'}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>GRN Reference</th>
                <th>Linked PO</th>
                <th>Supplier / Vendor</th>
                <th>Received Date</th>
                <th>Units Received</th>
                <th>Quality Inspection</th>
                <th>QC Inspector</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGRNs.length > 0 ? (
                filteredGRNs.map((g) => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {g.id}
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>{g.poId}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{g.supplier}</td>
                    <td>{formatDate(g.receivedDate)}</td>
                    <td style={{ fontWeight: '800', color: '#10b981' }}>
                      +{g.unitsReceived} units
                    </td>
                    <td>
                      <span className={`status-badge ${g.inspectionStatus === 'Pending Quality Review' ? 'pending' : 'completed'}`}>
                        <CheckCircle2 size={12} />
                        {g.inspectionStatus || 'Passed Audit'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{g.inspector || 'Warehouse QC'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => setSelectedGrn(g)}
                        >
                          <Eye size={14} /> View Slip
                        </button>

                        {g.inspectionStatus === 'Pending Quality Review' && onApproveQc && (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#10b98150', color: '#10b981' }}
                            onClick={() => onApproveQc(g.id)}
                          >
                            Pass QC
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No Goods Receipt Notes match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRN Voucher Modal */}
      <GrnDetailModal 
        isOpen={Boolean(selectedGrn)}
        onClose={() => setSelectedGrn(null)}
        grn={selectedGrn}
      />
    </div>
  );
}
