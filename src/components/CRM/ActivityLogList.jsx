import React from 'react';
import { Phone, Mail, Calendar, Plus, Clock } from 'lucide-react';
import { formatDate } from '../../utils/date';

export default function ActivityLogList({ activities, onLogActivityClick, searchQuery }) {
  const query = (searchQuery || '').toLowerCase();
  const filteredActivities = (activities || []).filter(a => 
    a && (
      (a.subject || '').toLowerCase().includes(query) ||
      (a.contact || '').toLowerCase().includes(query) ||
      (a.notes || '').toLowerCase().includes(query)
    )
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#3b82f6" />
            <h2 className="card-title">Customer Interaction Feed & Follow-Ups</h2>
          </div>
          <span className="card-subtitle">Log of phone calls, meetings, emails, and scheduled tasks</span>
        </div>

        <button className="btn-primary" onClick={onLogActivityClick}>
          <Plus size={16} />
          Log Customer Interaction
        </button>
      </div>

      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Subject / Activity</th>
              <th>Contact / Account</th>
              <th>Date & Time</th>
              <th>Interaction Summary / Notes</th>
              <th>Logged By</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((act) => (
                <tr key={act.id}>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ 
                        background: act.type === 'Call' ? 'rgba(59, 130, 246, 0.15)' : act.type === 'Meeting' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: act.type === 'Call' ? '#3b82f6' : act.type === 'Meeting' ? '#8b5cf6' : '#10b981'
                      }}
                    >
                      {act.type === 'Call' && <Phone size={12} />}
                      {act.type === 'Meeting' && <Calendar size={12} />}
                      {act.type === 'Email' && <Mail size={12} />}
                      {act.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{act.subject}</td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{act.contact}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{typeof act.company === 'object' ? (act.company?.name || act.company?.code || '') : act.company}</div>
                  </td>
                  <td>{formatDate(act.date)} {act.time}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px' }}>{act.notes}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.owner || 'Jane Doe'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No interaction logs recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
