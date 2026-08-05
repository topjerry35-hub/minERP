import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Flame, Building2, User, Mail, Phone, Globe, IndianRupee } from 'lucide-react';

export default function NewLeadModal({ isOpen, onClose, onAddLead }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [temperature, setTemperature] = useState('Hot');
  const [source, setSource] = useState('Website Inquiry');
  const [estimatedValue, setEstimatedValue] = useState('15000');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setTemperature('Hot');
      setSource('Website Inquiry');
      setEstimatedValue('15000');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    onAddLead({
      id: `LEAD-${Math.floor(100 + Math.random() * 900)}`,
      name,
      company: company || 'Prospect Company',
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@prospect.com`,
      phone: phone || '+1 (555) 321-7788',
      temperature,
      source,
      estimatedValue: parseFloat(estimatedValue) || 10000
    });

    onClose();
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Flame size={22} />
            </div>
            <div>
              <h2 className="modal-title">Register Sales Prospect Lead / Inquiry</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Log incoming prospect details & sales opportunity</span>
            </div>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label>Prospect Contact Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '36px' }}
                    placeholder="e.g. David Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Company / Organization</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '36px' }}
                    placeholder="e.g. Acme Innovations Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="email" 
                    className="form-control" 
                    style={{ paddingLeft: '36px' }}
                    placeholder="david@acmeinnovations.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '36px' }}
                    placeholder="+1 (555) 789-0123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Lead Temperature / Intent</label>
                <select 
                  className="form-control"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                >
                  <option value="Hot">🔥 Hot (High Purchase Intent)</option>
                  <option value="Warm">⚡ Warm (Engaged Inquiry)</option>
                  <option value="Cold">❄️ Cold (Long Term Nurture)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Acquisition Channel Source</label>
                <select 
                  className="form-control"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="Website Inquiry">Website Form Inquiry</option>
                  <option value="Referral">Customer Referral</option>
                  <option value="Trade Show">Trade Show / Event</option>
                  <option value="LinkedIn Outbound">LinkedIn Outbound</option>
                  <option value="Direct Call">Direct Phone Call</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Estimated Potential Deal Value (₹ INR)</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={16} color="#10b981" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="number" 
                  className="form-control" 
                  style={{ paddingLeft: '36px', fontWeight: '700', color: '#10b981' }}
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
              <PlusCircle size={16} />
              Register Prospect Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
