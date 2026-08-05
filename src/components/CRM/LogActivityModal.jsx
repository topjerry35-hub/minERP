import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2 } from 'lucide-react';

export default function LogActivityModal({ isOpen, onClose, onLogActivity }) {
  const [type, setType] = useState('Call');
  const [subject, setSubject] = useState('');
  const [contact, setContact] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType('Call');
      setSubject('');
      setContact('');
      setCompany('');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject) return;

    onLogActivity({
      id: `ACT-${Math.floor(100 + Math.random() * 900)}`,
      type,
      subject,
      contact: contact || 'Primary Stakeholder',
      company: company || 'Account Enterprise',
      notes,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      owner: 'Jane Doe'
    });

    onClose();

    // Reset all form inputs after submission
    setType('Call');
    setSubject('');
    setContact('');
    setCompany('');
    setNotes('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#3b82f6" />
            <h2 className="modal-title">Log Customer Interaction Activity</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label>Interaction Type *</label>
                <select 
                  className="form-control"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Call">Phone Call</option>
                  <option value="Meeting">In-Person / Zoom Meeting</option>
                  <option value="Email">Email Correspondence</option>
                  <option value="Task">Follow-Up Task</option>
                </select>
              </div>

              <div className="form-group">
                <label>Subject / Discussion Topic *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Q3 Hardware Pricing Discussion"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Contact Person</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Sarah Jenkins"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Company / Organization</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Nexus Tech Solutions"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Activity Summary / Key Takeaways Notes</label>
              <textarea 
                className="form-control" 
                rows="3"
                placeholder="Log discussion points, action items, or agreed next steps..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <CheckCircle2 size={16} />
              Save Interaction Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
