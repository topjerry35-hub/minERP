import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Calendar, 
  RotateCw, 
  Building2, 
  MapPin, 
  Moon, 
  Sun, 
  LogOut, 
  User,
  Menu
} from 'lucide-react';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  timeRange, 
  setTimeRange, 
  onNewSaleClick, 
  toggleNotifications, 
  unreadCount, 
  onRefresh, 
  user, 
  onLogout,
  companies = [],
  offices = [],
  selectedCompany = '',
  setSelectedCompany = () => {},
  selectedBranch = '',
  setSelectedBranch = () => {},
  onToggleSidebar = () => {}
}) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('minerp_theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('minerp_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <header className="header">
      <div className="header-left">
        {/* Mobile Sidebar Toggle Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleSidebar}
          title="Toggle Navigation Drawer"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar aligned with body content */}
        <div className="search-bar">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search SKUs, orders, customers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>

      <div className="header-right">
        {/* Multi-Company Selector */}
        <div className="header-dropdown-btn" title="Select Enterprise Company">
          <Building2 size={15} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
          <select 
            value={selectedCompany} 
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="header-select-input"
          >
            {companies.map(c => (
              <option key={c.id} value={c.name} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Multi-Branch Selector */}
        <div className="header-dropdown-btn" title="Select Branch / Office Location">
          <MapPin size={15} color="var(--status-warning)" style={{ flexShrink: 0 }} />
          <select 
            value={selectedBranch} 
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="header-select-input"
          >
            {offices.map(o => (
              <option key={o.id} value={o.name} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                {o.name} ({o.type})
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="date-picker-btn" title="Select Reporting Time Frame">
          <Calendar size={15} style={{ flexShrink: 0 }} />
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="header-select-input"
          >
            <option value="Today" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Today</option>
            <option value="This Week" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>This Week</option>
            <option value="This Month" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>This Month</option>
            <option value="This Quarter" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>This Quarter</option>
            <option value="Year to Date" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Year to Date</option>
          </select>
        </div>

        {/* Theme Switcher */}
        <button 
          className="icon-btn" 
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={18} color="#f7b84b" /> : <Moon size={18} color="#405189" />}
        </button>

        {/* Refresh */}
        <button className="icon-btn" onClick={onRefresh} title="Sync Realtime Ledger Data">
          <RotateCw size={18} />
        </button>

        {/* Notifications */}
        <button className="icon-btn notification-btn" onClick={toggleNotifications} title="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>
      </div>
    </header>
  );
}
