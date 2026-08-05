import React, { useState } from 'react';
import { Layers, Lock, Mail, Eye, EyeOff, LogIn, UserCheck, ShieldCheck, User } from 'lucide-react';

export default function Login({ onLogin, usersList = [] }) {
  const [email, setEmail] = useState('jane.doe@minerp.com');
  const [password, setPassword] = useState('adminPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter valid email and password.');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (res.ok) {
        onLogin({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          title: data.user.title || data.user.role,
          avatar: data.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        });
        return;
      }
    } catch (err) {
      // Backend fetch failed or timed out
    }

    // Local Database & Demo Accounts Authentication Fallback
    const localUser = usersList.find(u => 
      u.email.toLowerCase() === email.toLowerCase() ||
      u.email.split('@')[0].toLowerCase() === email.split('@')[0].toLowerCase()
    );

    if (localUser) {
      onLogin({
        name: localUser.name,
        email: localUser.email,
        role: localUser.role,
        title: localUser.title || localUser.role,
        avatar: localUser.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        permissions: localUser.permissions
      });
      return;
    }

    // Default Fallback for Demo Accounts if not in usersList
    if (email.includes('jane') || email.includes('admin')) {
      onLogin({ name: 'Jane Doe', email: email, role: 'Admin', title: 'System Administrator', avatar: 'JD' });
      return;
    } else if (email.includes('alex') || email.includes('david')) {
      onLogin({ name: 'Alex Smith', email: email, role: 'Manager', title: 'Operations Manager', avatar: 'AS' });
      return;
    } else if (email.includes('sarah')) {
      onLogin({ name: 'Sarah Jenkins', email: email, role: 'Employee', title: 'Sales Representative', avatar: 'SJ' });
      return;
    }

    setError('Invalid email or password.');
  };

  const fillDemoUser = (roleType) => {
    if (roleType === 'admin') {
      setEmail('jane.doe@minerp.com');
      setPassword('adminPass123!');
    } else if (roleType === 'manager') {
      setEmail('alex.smith@minerp.com');
      setPassword('managerPass123!');
    } else if (roleType === 'employee') {
      setEmail('sarah.jenkins@minerp.com');
      setPassword('employeePass123!');
    }
    setError('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-background-glow"></div>

      <div className="login-card" style={{ maxWidth: '480px' }}>
        <div className="login-brand">
          <div className="logo-badge">
            <Layers size={28} />
          </div>
          <div>
            <h1>min<span>ERP</span> Enterprise Portal</h1>
            <p>Select a user role or enter credentials to sign in</p>
          </div>
        </div>

        {/* Quick Fill Demo Logins for 3 Roles */}
        <div className="demo-credentials">
          <div className="demo-credentials-title">Quick Demo Role Login:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button" 
              className="demo-btn"
              style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
              onClick={() => {
                fillDemoUser('admin');
                onLogin({ name: 'Jane Doe', email: 'jane.doe@minerp.com', role: 'Admin', title: 'System Administrator', avatar: 'JD' });
              }}
            >
              <ShieldCheck size={18} color="#3b82f6" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Jane Doe (Admin)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Full Access to all 9 ERP Modules</div>
              </div>
            </button>

            <button 
              type="button" 
              className="demo-btn"
              style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
              onClick={() => {
                fillDemoUser('manager');
                onLogin({ name: 'Alex Smith', email: 'alex.smith@minerp.com', role: 'Manager', title: 'Warehouse & Operations Manager', avatar: 'AS' });
              }}
            >
              <UserCheck size={18} color="#f59e0b" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Alex Smith (Manager)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Access to Inventory, Sales, Purchasing, CRM & Reports</div>
              </div>
            </button>

            <button 
              type="button" 
              className="demo-btn"
              style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
              onClick={() => {
                fillDemoUser('employee');
                onLogin({ name: 'Sarah Jenkins', email: 'sarah.jenkins@minerp.com', role: 'Employee', title: 'Sales Representative', avatar: 'SJ' });
              }}
            >
              <User size={18} color="#10b981" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Sarah Jenkins (Employee)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Access to Dashboard, Sales & CRM</div>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--status-danger-bg)',
            color: 'var(--status-danger)',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Work Email / Username</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input 
                type="email" 
                className="form-control" 
                style={{ paddingLeft: '38px' }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            <LogIn size={18} />
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
