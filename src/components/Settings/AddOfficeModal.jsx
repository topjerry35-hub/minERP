import React, { useState, useEffect } from 'react';
import { X, MapPin, Save } from 'lucide-react';

export default function AddOfficeModal({ isOpen, onClose, onSave, companies = [], targetCompanyId = null, editingOffice = null }) {
  const [companyId, setCompanyId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('Branch Office');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('US');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [manager, setManager] = useState('');

  useEffect(() => {
    if (editingOffice) {
      setCompanyId(editingOffice.companyId || (companies[0]?.id || ''));
      setName(editingOffice.name || '');
      setCode(editingOffice.code || '');
      setType(editingOffice.type || 'Branch Office');
      setAddress(editingOffice.address || '');
      setCity(editingOffice.city || '');
      setCountry(editingOffice.country || 'US');
      setPhone(editingOffice.phone || '');
      setEmail(editingOffice.email || '');
      setManager(editingOffice.manager || '');
    } else {
      setCompanyId(targetCompanyId || (companies[0]?.id || ''));
      setName('');
      setCode(`LOC-${Math.floor(100 + Math.random() * 900)}`);
      setType('Branch Office');
      setAddress('');
      setCity('');
      setCountry('US');
      setPhone('');
      setEmail('');
      setManager('');
    }
  }, [editingOffice, targetCompanyId, companies, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !companyId) return;

    const selectedComp = companies.find(c => c.id === companyId);
    const officeData = {
      id: editingOffice ? editingOffice.id : `OFF-${Math.floor(100 + Math.random() * 900)}`,
      companyId,
      companyName: selectedComp ? selectedComp.name : 'Primary Enterprise',
      name,
      code: code || `LOC-${Math.floor(100 + Math.random() * 900)}`,
      type,
      address,
      city,
      country,
      phone,
      email,
      manager: manager || 'Unassigned',
      status: 'Active'
    };

    onSave(officeData);
    onClose();

    // Reset inputs after submission
    setName('');
    setCode(`LOC-${Math.floor(100 + Math.random() * 900)}`);
    setAddress('');
    setCity('');
    setPhone('');
    setEmail('');
    setManager('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={22} color="var(--status-warning)" />
            <h2 className="modal-title">{editingOffice ? 'Edit Office / Branch Location' : 'Add New Office / Location'}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label>Parent Company *</label>
                <select 
                  className="form-control"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Office / Location Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. London Warehouse Hub"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Office Code / Branch Ref *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. LOC-LON-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location Type *</label>
                <select 
                  className="form-control"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Headquarters">Headquarters (HQ)</option>
                  <option value="Regional Office">Regional Office</option>
                  <option value="Branch Office">Branch Office</option>
                  <option value="Warehouse Hub">Warehouse & Logistics Hub</option>
                  <option value="Retail Outlet">Retail Outlet / Store</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Branch Manager / Lead</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Alex Smith"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Branch Contact Phone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="+44 20 7946 0912"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Branch Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="london.wh@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>City & Country</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="City (e.g. London)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <select 
                    className="form-control"
                    style={{ width: '110px' }}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="US">US</option>
                    <option value="GB">UK</option>
                    <option value="DE">DE</option>
                    <option value="SG">SG</option>
                    <option value="IN">IN</option>
                    <option value="JP">JP</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="45 Docklands Road, Unit 12"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              {editingOffice ? 'Update Office Location' : 'Create Office Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
