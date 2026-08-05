import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, ShoppingCart, X } from 'lucide-react';

export default function NotificationsDrawer({ isOpen, onClose, notifications, onMarkAllRead }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        top: '65px',
        right: '28px',
        width: '360px',
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-backdrop)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 50,
        overflow: 'hidden',
        animation: 'modalFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div 
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-input)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          <Bell size={16} color="var(--accent-blue)" />
          System Notifications ({notifications.filter(n => !n.read).length} unread)
        </div>
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                background: n.read ? 'transparent' : 'var(--bg-card-hover)',
                display: 'flex',
                gap: '12px'
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {n.type === 'warning' && <AlertTriangle size={18} color="var(--status-warning)" />}
                {n.type === 'success' && <CheckCircle size={18} color="var(--status-success)" />}
                {n.type === 'order' && <ShoppingCart size={18} color="var(--accent-blue)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{n.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{n.time}</div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No notifications available.
          </div>
        )}
      </div>

      <div 
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          background: 'var(--bg-input)'
        }}
      >
        <button 
          onClick={onMarkAllRead}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-blue)',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
}
