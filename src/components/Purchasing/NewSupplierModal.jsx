import React, { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';

export default function NewSupplierModal({ isOpen, onClose, onAddSupplier }) {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setCategory('Electronics');
      setPaymentTerms('Net 30');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    onAddSupplier({
      id: `SUP-${Math.floor(100 + Math.random() * 900)}`,
      name,
      contactPerson: contactPerson || 'Purchasing Contact',
      email: email || `sales@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: phone || '+1 (555) 019-2831',
      category,
      rating: 5.0,
      paymentTerms,
      balanceDue: 0.00
    });

    onClose();

    // Reset all form inputs after submission
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setCategory('Electronics');
    setPaymentTerms('Net 30');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Register New Supplier / Vendor</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label>Company / Supplier Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Anker Electronics Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Primary Contact Person</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Robert Chen"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Work Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="robert@anker.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Primary Category</label>
                <select 
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div className="form-group">
                <label>Default Payment Terms</label>
                <select 
                  className="form-control"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                >
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={16} />
              Save Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
