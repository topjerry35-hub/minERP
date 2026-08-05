import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';

export default function AddCompanyModal({ isOpen, onClose, onSave, editingCompany = null }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [taxId, setTaxId] = useState('');
  const [currency, setCurrency] = useState('INR (₹)');
  const [country, setCountry] = useState('IN');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (editingCompany) {
      setName(editingCompany.name || '');
      setCode(editingCompany.code || '');
      setTaxId(editingCompany.taxId || '');
      setCurrency(editingCompany.currency || 'INR (₹)');
      setCountry(editingCompany.country || 'IN');
      setEmail(editingCompany.email || '');
      setPhone(editingCompany.phone || '');
      setAddress(editingCompany.address || '');
    } else {
      setName('');
      setCode(`CMP-${Math.floor(100 + Math.random() * 900)}`);
      setTaxId('GSTIN-27AABCU9603R1ZM');
      setCurrency('INR (₹)');
      setCountry('IN');
      setEmail('ops@minerp.com');
      setPhone('+91 22 5550 1000');
      setAddress('100 Enterprise Way, Suite 500, Mumbai, MH');
    }
  }, [editingCompany, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !code) return;

    const companyData = {
      id: editingCompany ? editingCompany.id : `CMP-${Math.floor(100 + Math.random() * 900)}`,
      name,
      code,
      taxId,
      currency,
      country,
      email,
      phone,
      address,
      status: 'Active',
      officesCount: editingCompany ? (editingCompany.officesCount || 1) : 1,
      usersCount: editingCompany ? (editingCompany.usersCount || 1) : 1
    };

    onSave(companyData);
    onClose();

    // Reset inputs after submission
    setName('');
    setCode(`CMP-${Math.floor(100 + Math.random() * 900)}`);
    setTaxId('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={22} color="var(--accent-blue)" />
            <h2 className="modal-title">{editingCompany ? 'Edit Company Profile' : 'Register New Company'}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label>Company Legal Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. minERP Global Ltd."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company Code / Short Identifier *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. CMP-GLB"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Tax Registration ID (GST/VAT/EIN)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="TAX-992019-US"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Headquarters Country *</label>
                <select 
                  className="form-control"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="IN">India (IN)</option>
                  <option value="US">United States (US)</option>
                  <option value="GB">United Kingdom (UK)</option>
                  <option value="DE">Germany (DE)</option>
                  <option value="SG">Singapore (SG)</option>
                  <option value="JP">Japan (JP)</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Base Operating Currency *</label>
                <select 
                  className="form-control"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR (₹)">INR (₹ Indian Rupee)</option>
                  <option value="USD ($)">USD ($ United States Dollar)</option>
                  <option value="EUR (€)">EUR (€ Euro)</option>
                  <option value="GBP (£)">GBP (£ British Pound)</option>
                  <option value="SGD ($)">SGD ($ Singapore Dollar)</option>
                  <option value="JPY (¥)">JPY (¥ Japanese Yen)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Official Operations Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="ops@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Contact Phone Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Registered Headquarters Address</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="100 Enterprise Way, Suite 500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              {editingCompany ? 'Update Company' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
