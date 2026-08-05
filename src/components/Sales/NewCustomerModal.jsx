import React, { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';

export default function NewCustomerModal({ isOpen, onClose, onAddCustomer }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [creditLimit, setCreditLimit] = useState('10000');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setCreditLimit('10000');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    onAddCustomer({
      id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      name,
      company: company || name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: phone || '+1 (555) 012-3456',
      creditLimit: parseFloat(creditLimit) || 10000,
      lifetimeSales: 0.00,
      receivablesBalance: 0.00
    });

    onClose();

    // Reset all form inputs after submission
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setCreditLimit('10000');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Register New Customer / Client</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label>Primary Contact Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company / Account Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Nexus Tech Solutions"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="sarah@nexustech.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="+1 (555) 234-8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Approved Credit Limit (₹ INR)</label>
              <input 
                type="number" 
                className="form-control" 
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={16} />
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
