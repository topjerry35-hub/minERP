import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

export default function MarkAttendanceModal({ isOpen, onClose, employees, onMarkAttendance }) {
  const getCurrentFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const [selectedEmployeeName, setSelectedEmployeeName] = useState(employees[0]?.name || '');
  const [status, setStatus] = useState('Present');
  const [mode, setMode] = useState('On-Site');
  const [clockInTime, setClockInTime] = useState(getCurrentFormattedTime());
  const [clockOutTime, setClockOutTime] = useState('');
  const [liveTimer, setLiveTimer] = useState(getCurrentFormattedTime());

  useEffect(() => {
    if (isOpen) {
      const now = getCurrentFormattedTime();
      setClockInTime(now);
      setLiveTimer(now);
      if (employees.length > 0 && !selectedEmployeeName) {
        setSelectedEmployeeName(employees[0].name);
      }
    }
  }, [isOpen, employees]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setLiveTimer(getCurrentFormattedTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSetClockInCurrent = () => {
    setClockInTime(getCurrentFormattedTime());
  };

  const handleSetClockOutCurrent = () => {
    setClockOutTime(getCurrentFormattedTime());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmployeeName) return;

    onMarkAttendance({
      id: `ATT-${Math.floor(100 + Math.random() * 900)}`,
      employee: selectedEmployeeName,
      date: new Date().toISOString().split('T')[0],
      clockIn: clockInTime || getCurrentFormattedTime(),
      clockOut: clockOutTime || '--:--',
      status,
      mode
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#10b981" />
              <h2 className="modal-title">Mark Employee Attendance</h2>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Live System Clock:</span>
              <strong style={{ color: '#10b981', fontFamily: 'monospace', fontSize: '0.85rem' }}>{liveTimer}</strong>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Select Employee *</label>
              <select 
                className="form-control"
                value={selectedEmployeeName}
                onChange={(e) => setSelectedEmployeeName(e.target.value)}
                required
              >
                {employees.map(e => (
                  <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Attendance Status *</label>
                <select 
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div className="form-group">
                <label>Work Location Mode *</label>
                <select 
                  className="form-control"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="On-Site">On-Site Office</option>
                  <option value="Remote">Remote Work</option>
                  <option value="Field Visit">Field Visit</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ margin: 0 }}>Clock In Time *</label>
                  <button 
                    type="button" 
                    onClick={handleSetClockInCurrent}
                    style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <RefreshCw size={11} /> Use Current Time
                  </button>
                </div>
                <input 
                  type="text" 
                  className="form-control"
                  value={clockInTime}
                  onChange={(e) => setClockInTime(e.target.value)}
                  placeholder="e.g. 09:00 AM"
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ margin: 0 }}>Clock Out Time</label>
                  <button 
                    type="button" 
                    onClick={handleSetClockOutCurrent}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <RefreshCw size={11} /> Set to Now
                  </button>
                </div>
                <input 
                  type="text" 
                  className="form-control"
                  value={clockOutTime}
                  onChange={(e) => setClockOutTime(e.target.value)}
                  placeholder="Optional e.g. 05:30 PM"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <CheckCircle2 size={16} />
              Save Attendance Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
