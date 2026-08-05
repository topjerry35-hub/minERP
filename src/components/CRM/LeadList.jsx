import React, { useState } from 'react';
import { Flame, Plus, UserCheck, Eye, Mail, Phone, Building2, Globe, IndianRupee, Target, TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function LeadList({ 
  leads = [], 
  onAddLeadClick, 
  onConvertLeadToCustomer,
  onSelectLead,
  searchQuery 
}) {
  const [tempFilter, setTempFilter] = useState('All');

  const query = (searchQuery || '').toLowerCase();
  
  const filteredLeads = leads.filter(l => {
    if (!l) return false;
    const matchesTemp = tempFilter === 'All' || l.temperature === tempFilter;
    const matchesSearch = (l.name || '').toLowerCase().includes(query) ||
                          (l.company || '').toLowerCase().includes(query) ||
                          (l.email || '').toLowerCase().includes(query) ||
                          (l.source || '').toLowerCase().includes(query);
    return matchesTemp && matchesSearch;
  });

  const totalPipelineVal = leads.reduce((sum, l) => sum + (parseFloat(l.estimatedValue) || 0), 0);
  const hotCount = leads.filter(l => l.temperature === 'Hot').length;
  const warmCount = leads.filter(l => l.temperature === 'Warm').length;
  const coldCount = leads.filter(l => l.temperature === 'Cold').length;

  const tempColors = {
    Hot: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', icon: '🔥' },
    Warm: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', icon: '⚡' },
    Cold: { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8', icon: '❄️' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top KPI Metrics Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Prospect Inquiries</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Target size={20} />
            </div>
          </div>
          <div className="kpi-value">{leads.length} Leads</div>
          <div className="kpi-subtitle">Registered Sales Prospects</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">🔥 Hot Leads (High Intent)</span>
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <Flame size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>{hotCount} Hot Leads</div>
          <div className="kpi-subtitle">{warmCount} Warm • {coldCount} Cold</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Est. Pipeline Value</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>
            {formatCurrency(totalPipelineVal)}
          </div>
          <div className="kpi-subtitle">Total Inquiry Opportunity</div>
        </div>
      </div>

      {/* Main Catalog Card */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="card-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Flame size={22} />
              </div>
              <div>
                <h2 className="card-title">Prospect Leads & Sales Inquiries</h2>
                <span className="card-subtitle">Showing {filteredLeads.length} active leads</span>
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={onAddLeadClick} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
            <Plus size={16} />
            Register New Lead
          </button>
        </div>

        {/* Temperature Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'All', label: 'All Leads', icon: Sparkles },
            { id: 'Hot', label: '🔥 Hot (High Intent)', count: hotCount },
            { id: 'Warm', label: '⚡ Warm (Engaged)', count: warmCount },
            { id: 'Cold', label: '❄️ Cold (Nurturing)', count: coldCount },
          ].map(tab => {
            const isActive = tempFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTempFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  border: '1px solid',
                  borderColor: isActive ? '#f59e0b' : 'var(--border-color)',
                  background: isActive ? 'rgba(245, 158, 11, 0.18)' : 'var(--bg-input)',
                  color: isActive ? '#f59e0b' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Leads Table */}
        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Lead / Prospect</th>
                <th>Company</th>
                <th>Score / Intent</th>
                <th>Channel Source</th>
                <th>Est. Deal Value</th>
                <th>Contact Info</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((l) => {
                  const styleObj = tempColors[l.temperature] || tempColors.Warm;

                  return (
                    <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => onSelectLead && onSelectLead(l)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            color: '#f59e0b'
                          }}>
                            {l.name ? l.name.charAt(0) : 'L'}
                          </div>

                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--accent-blue)' }}>{l.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {l.id}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} color="var(--text-muted)" />
                          {l.company || 'N/A'}
                        </div>
                      </td>

                      <td>
                        <span 
                          style={{ 
                            background: styleObj.bg, 
                            border: `1px solid ${styleObj.border}`, 
                            color: styleObj.color,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {styleObj.icon} {l.temperature}
                        </span>
                      </td>

                      <td>
                        <span className="status-badge info" style={{ fontSize: '0.75rem' }}>
                          <Globe size={11} style={{ marginRight: '4px' }} />
                          {l.source || 'Website Inquiry'}
                        </span>
                      </td>

                      <td style={{ fontWeight: '800', color: '#10b981' }}>
                        {formatCurrency(l.estimatedValue)}
                      </td>

                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '600' }}>{l.email || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.phone || 'N/A'}</div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            title="View Lead Inquiry Details"
                            onClick={(e) => { e.stopPropagation(); onSelectLead && onSelectLead(l); }}
                          >
                            <Eye size={14} color="#3b82f6" />
                            Details
                          </button>

                          <button 
                            className="btn-primary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                            onClick={(e) => { e.stopPropagation(); onConvertLeadToCustomer(l); }}
                          >
                            <UserCheck size={14} />
                            Convert
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '35px', color: 'var(--text-muted)' }}>
                    No prospect leads match your filter or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
