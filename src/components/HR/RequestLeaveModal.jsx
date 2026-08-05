import React, { useState, useEffect } from 'react';
import { X, Calendar, PlusCircle } from 'lucide-react';

export default function RequestLeaveModal({ isOpen, onClose, employees = [], onRequestLeave }) {
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [leaveType, setLeaveType] = useState('Annual Vacation');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-05');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployeeName(employees[0]?.name || '');
      setLeaveType('Annual Vacation');
      setStartDate('2026-08-01');
      setEndDate('2026-08-05');
      setReason('');
    }
  }, [isOpen, employees]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmployeeName || !startDate || !endDate) return;

    onRequestLeave({
      id: `LV-${Math.floor(100 + Math.random() * 900)}`,
      employee: selectedEmployeeName,
      type: leaveType,
      duration: '5 Days',
      dates: `${startDate} to ${endDate}`,
      reason: reason || 'Personal / Vacation Time Off',
      status: 'Pending'
    });

    onClose();

    // Reset inputs after submission
    setLeaveType('Annual Vacation');
    setReason('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#3b82f6" />
            <h2 className="modal-title">Submit Employee Leave Application</h2>
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

            <div className="form-group">
              <label>Leave Category / Type *</label>
              <select 
                className="form-control"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="Annual Vacation">Annual Vacation</option>
                <option value="Sick Leave">Sick / Medical Leave</option>
                <option value="Casual Leave">Casual Time Off</option>
                <option value="Parental Leave">Parental / Maternity Leave</option>
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Start Date *</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Reason / Notes</label>
              <textarea 
                className="form-control" 
                rows="2"
                placeholder="Optional explanation for leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={16} />
              Submit Leave Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
