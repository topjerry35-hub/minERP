import React, { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';

export default function NewDealModal({ isOpen, onClose, onCreateDeal }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState('Lead');
  const [probability, setProbability] = useState('50');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCompany('');
      setContact('');
      setAmount('');
      setStage('Lead');
      setProbability('50');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    onCreateDeal({
      id: `DEAL-${Math.floor(100 + Math.random() * 900)}`,
      title,
      company: company || 'Enterprise Prospect',
      contact: contact || 'Key Decision Maker',
      amount: parseFloat(amount),
      stage,
      probability: parseInt(probability) || 50
    });

    onClose();

    // Reset all form inputs after submission
    setTitle('');
    setCompany('');
    setContact('');
    setAmount('');
    setStage('Lead');
    setProbability('50');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Sales Opportunity Deal</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Deal Opportunity Name *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Enterprise ERP License Renewal & Hardware"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Company / Account</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Nexus Tech Solutions"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Key Contact Person</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Sarah Connor"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Deal Contract Value (₹ INR) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  placeholder="25000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pipeline Stage</label>
                <select 
                  className="form-control"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  <option value="Lead">Lead / Inquiry</option>
                  <option value="Qualified">Qualified Prospect</option>
                  <option value="Proposal">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Closed-Won 🎉</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Win Probability ({probability}%)</label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="10"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                style={{ accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={16} />
              Save Deal Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
