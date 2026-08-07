import React, { useState } from 'react';
import { Plus, ChevronRight, CheckCircle2, IndianRupee, Award, LayoutGrid, Table, Briefcase, TrendingUp, Sparkles, Building2, UserCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function DealsPipelineBoard({ 
  deals = [], 
  onNewDealClick, 
  onMoveDealStage,
  searchQuery 
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [stageFilter, setStageFilter] = useState('All');

  const stages = [
    { id: 'Lead', label: 'Lead / Inquiry', color: '#3b82f6', badge: 'info' },
    { id: 'Qualified', label: 'Qualified Prospect', color: '#06b6d4', badge: 'info' },
    { id: 'Proposal', label: 'Proposal Sent', color: '#8b5cf6', badge: 'warning' },
    { id: 'Negotiation', label: 'Negotiation', color: '#f59e0b', badge: 'warning' },
    { id: 'Won', label: 'Closed-Won 🎉', color: '#10b981', badge: 'success' }
  ];

  const query = (searchQuery || '').toLowerCase();
  
  const filteredDeals = (deals || []).filter(d => {
    if (!d) return false;
    const matchesStage = stageFilter === 'All' || d.stage === stageFilter;
    const matchesSearch = (d.title || '').toLowerCase().includes(query) ||
                          (d.company || '').toLowerCase().includes(query) ||
                          (d.contact || '').toLowerCase().includes(query) ||
                          (d.stage || '').toLowerCase().includes(query);
    return matchesStage && matchesSearch;
  });

  const totalPipelineValue = filteredDeals.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const wonDeals = filteredDeals.filter(d => d.stage === 'Won');
  const wonValue = wonDeals.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const winRate = filteredDeals.length > 0 ? ((wonDeals.length / filteredDeals.length) * 100).toFixed(1) : 0;
  const avgDealSize = filteredDeals.length > 0 ? (totalPipelineValue / filteredDeals.length).toFixed(2) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top KPI Metrics Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Active Pipeline</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#3b82f6' }}>
            {formatCurrency(totalPipelineValue)}
          </div>
          <div className="kpi-subtitle">Across {filteredDeals.length} active opportunities</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Closed-Won Contracts</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Award size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>
            {formatCurrency(wonValue)}
          </div>
          <div className="kpi-subtitle">{wonDeals.length} Won • Win Rate: {winRate}%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Avg Opportunity Size</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>
            {formatCurrency(avgDealSize)}
          </div>
          <div className="kpi-subtitle">Average Contract Value</div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="card">
        {/* Header & Controls */}
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="card-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                <Briefcase size={22} />
              </div>
              <div>
                <h2 className="card-title">Deals & Opportunities Ledger</h2>
                <span className="card-subtitle">Managing {filteredDeals.length} active pipeline deals</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* View Mode Switcher Pills */}
            <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  background: viewMode === 'table' ? 'var(--accent-blue)' : 'transparent',
                  color: viewMode === 'table' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Table size={14} />
                Table View
              </button>

              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  background: viewMode === 'kanban' ? 'var(--accent-blue)' : 'transparent',
                  color: viewMode === 'kanban' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <LayoutGrid size={14} />
                Kanban Board
              </button>
            </div>

            <button className="btn-primary" onClick={onNewDealClick}>
              <Plus size={16} />
              Create Opportunity
            </button>
          </div>
        </div>

        {/* Stage Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setStageFilter('All')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: '1px solid',
              borderColor: stageFilter === 'All' ? 'var(--accent-blue)' : 'var(--border-color)',
              background: stageFilter === 'All' ? 'rgba(56, 189, 248, 0.18)' : 'var(--bg-input)',
              color: stageFilter === 'All' ? 'var(--accent-blue)' : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Stages ({deals.length})
          </button>

          {stages.map(stg => {
            const count = deals.filter(d => d.stage === stg.id).length;
            const isActive = stageFilter === stg.id;

            return (
              <button
                key={stg.id}
                onClick={() => setStageFilter(stg.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  border: '1px solid',
                  borderColor: isActive ? stg.color : 'var(--border-color)',
                  background: isActive ? `${stg.color}25` : 'var(--bg-input)',
                  color: isActive ? stg.color : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: stg.color }}></span>
                {stg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* View Mode 1: Standard ERP Table View */}
        {viewMode === 'table' && (
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Deal Opportunity</th>
                  <th>Company / Client</th>
                  <th>Key Contact</th>
                  <th>Deal Value</th>
                  <th>Pipeline Stage</th>
                  <th>Win Probability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length > 0 ? (
                  filteredDeals.map((deal) => {
                    const stgObj = stages.find(s => s.id === deal.stage) || stages[0];
                    const prob = deal.probability || (deal.stage === 'Won' ? 100 : 50);

                    return (
                      <tr key={deal.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: `${stgObj.color}20`,
                              border: `1px solid ${stgObj.color}40`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: stgObj.color,
                              fontWeight: '800',
                              fontSize: '0.8rem'
                            }}>
                              <Briefcase size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{deal.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {deal.id}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={14} color="var(--text-muted)" />
                            {typeof deal.company === 'object' ? (deal.company?.name || deal.company?.code || 'Enterprise Account') : (deal.company || 'Enterprise Account')}
                          </div>
                        </td>

                        <td style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {deal.contact || 'Key Stakeholder'}
                        </td>

                        <td style={{ fontWeight: '800', color: '#10b981' }}>
                          {formatCurrency(deal.amount)}
                        </td>

                        <td>
                          <span 
                            style={{ 
                              background: `${stgObj.color}20`,
                              border: `1px solid ${stgObj.color}50`,
                              color: stgObj.color,
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: stgObj.color }}></span>
                            {stgObj.label}
                          </span>
                        </td>

                        <td style={{ width: '160px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                              <span style={{ color: 'var(--text-primary)' }}>{prob}%</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Confidence</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  width: `${prob}%`, 
                                  height: '100%', 
                                  background: deal.stage === 'Won' ? '#10b981' : stgObj.color,
                                  borderRadius: '3px' 
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          {deal.stage !== 'Won' ? (
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#3b82f650', color: '#3b82f6' }}
                              onClick={() => {
                                const idx = stages.findIndex(s => s.id === deal.stage);
                                if (idx < stages.length - 1) {
                                  onMoveDealStage(deal.id, stages[idx + 1].id);
                                }
                              }}
                            >
                              Advance Stage <ChevronRight size={14} />
                            </button>
                          ) : (
                            <span className="status-badge success" style={{ fontSize: '0.75rem' }}>
                              <CheckCircle2 size={12} /> Closed Won
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No deals match the current filter or search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View Mode 2: Kanban Pipeline Board View */}
        {viewMode === 'kanban' && (
          <div className="crm-kanban-board">
            {stages.map(stage => {
              const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
              const stageTotal = stageDeals.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

              return (
                <div key={stage.id} className="kanban-column">
                  <div className="kanban-column-header">
                    <div className="kanban-column-title">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color || '#3b82f6' }}></span>
                      {stage.label}
                    </div>
                    <span 
                      className="badge" 
                      style={{ 
                        background: `${stage.color || '#3b82f6'}20`, 
                        color: stage.color || '#3b82f6',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}
                    >
                      {stageDeals.length}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>
                    Value: {formatCurrency(stageTotal)}
                  </div>

                  {/* Deal Cards list */}
                  {stageDeals.map(deal => (
                    <div key={deal.id} className="deal-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="deal-title">{deal.title}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                          {deal.probability}% Prob
                        </span>
                      </div>

                      <div className="deal-company">{typeof deal.company === 'object' ? (deal.company?.name || deal.company?.code || 'Enterprise') : (deal.company || 'Enterprise')} • {deal.contact}</div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <div className="deal-amount" style={{ color: '#10b981' }}>{formatCurrency(deal.amount)}</div>
                        
                        {deal.stage !== 'Won' && (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                            title="Move to Next Stage"
                            onClick={() => {
                              const idx = stages.findIndex(s => s.id === deal.stage);
                              if (idx < stages.length - 1) {
                                onMoveDealStage(deal.id, stages[idx + 1].id);
                              }
                            }}
                          >
                            Advance <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                      No deals in this stage
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
