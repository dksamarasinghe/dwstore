import React, { useState, useRef, useEffect } from 'react';
import { getStorefrontUrl } from '../../config';
import {
  Search,
  ChevronDown,
  Moon,
  Sun,
  Bell,
  Package,
  ShoppingBag,
  Star,
  AlertTriangle,
  Menu,
  ExternalLink,
  User,
  Settings as SettingsIcon,
  LogOut,
  Lock,
  Calendar,
  Clock,
} from 'lucide-react';
import { TabType } from '../../types';

interface TopbarProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onMobileToggle: () => void;
  setActiveTab: (tab: TabType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onLogout?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  theme,
  setTheme,
  onMobileToggle,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onLogout,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  // Live real-time clock updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Shortcut key '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        const input = document.getElementById('topbar-search-input');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScopeClick = (scope: string) => {
    if (scope === 'Products') setActiveTab('products');
    if (scope === 'Orders') setActiveTab('orders');
    if (scope === 'Customers') setActiveTab('customers');
    if (scope === 'Reviews') setActiveTab('reviews');
    setSearchOpen(false);
  };

  return (
    <header className="topbar">
      {/* Mobile Toggle Button */}
      <button
        className="icon-btn d-lg-none"
        onClick={onMobileToggle}
        aria-label="Open sidebar menu"
        type="button"
      >
        <Menu size={18} />
      </button>

      {/* Global Search with Slash Shortcut & Scope Dropdown */}
      <div className={`search ${searchOpen ? 'open' : ''}`} ref={searchRef}>
        <Search size={17} />
        <input
          id="topbar-search-input"
          type="text"
          placeholder="Search products, orders, customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          autoComplete="off"
        />
        <kbd>/</kbd>

        {searchOpen && (
          <div className="search-panel" style={{ display: 'block' }}>
            <div className="sp-label">Quick filter by module</div>
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                handleScopeClick('Products');
              }}
            >
              <Package size={16} /> Products Catalog
            </a>
            <a
              href="#orders"
              onClick={(e) => {
                e.preventDefault();
                handleScopeClick('Orders');
              }}
            >
              <ShoppingBag size={16} /> Orders & Shipments
            </a>
            <a
              href="#customers"
              onClick={(e) => {
                e.preventDefault();
                handleScopeClick('Customers');
              }}
            >
              <User size={16} /> Customers Directory
            </a>
            <a
              href="#reviews"
              onClick={(e) => {
                e.preventDefault();
                handleScopeClick('Reviews');
              }}
            >
              <Star size={16} /> Google Reviews
            </a>
          </div>
        )}
      </div>

      {/* Topbar Actions */}
      <div className="top-actions">
        {/* Live Date & Time Widget */}
        <div
          className="d-none d-md-flex align-items-center gap-2 px-3 rounded-pill"
          style={{
            background: 'var(--hover)',
            border: '1px solid var(--border)',
            fontSize: '12.5px',
            height: '38px',
            userSelect: 'none',
          }}
          title="Current System Date & Time"
        >
          <div className="d-flex align-items-center gap-1.5 text-muted">
            <Calendar size={13} className="text-primary" />
            <span style={{ fontWeight: 500 }}>{formattedDate}</span>
          </div>
          <span className="text-muted opacity-40">|</span>
          <div className="d-flex align-items-center gap-1.5" style={{ color: 'var(--text)' }}>
            <Clock size={13} className="text-success" />
            <span style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.3px' }}>
              {formattedTime}
            </span>
          </div>
        </div>

        {/* View Storefront Pill Button */}
        <a
          href={getStorefrontUrl()}
          target="_blank"
          rel="noreferrer"
          className="btn-soft d-none d-sm-inline-flex"
          title="Open customer storefront in new tab"
          style={{ height: '40px', fontSize: '13px' }}
        >
          <ExternalLink size={14} />
          Storefront
        </a>

        {/* Theme Toggle (Light / Dark) */}
        <button
          className="icon-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          type="button"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="position-relative" ref={notifRef}>
          <button
            className="icon-btn"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            title="Notifications"
            type="button"
          >
            <Bell size={18} />
            <span className="dot" />
          </button>
          {notifDropdownOpen && (
            <div
              className="dropdown-menu dropdown-menu-end notif show position-absolute"
              style={{ top: '100%', right: 0, marginTop: '8px', zIndex: 1060 }}
            >
              <div className="notif-head">
                <span>Notifications (3 unread)</span>
                <a href="#mark" onClick={(e) => { e.preventDefault(); setNotifDropdownOpen(false); }}>
                  Mark all read
                </a>
              </div>
              <a
                className="notif-item unread"
                href="#order"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('orders');
                  setNotifDropdownOpen(false);
                }}
              >
                <ShoppingBag size={18} className="text-primary" />
                <div>
                  <b>New COD order #DW-10482</b>
                  <small>Kavindu Perera • 2 mins ago</small>
                </div>
              </a>
              <a
                className="notif-item unread"
                href="#inventory"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('inventory');
                  setNotifDropdownOpen(false);
                }}
              >
                <AlertTriangle size={18} className="text-warning" />
                <div>
                  <b>Low stock: Remax 80,000mAh</b>
                  <small>Only 4 units left in Borella Hub</small>
                </div>
              </a>
              <a
                className="notif-item"
                href="#reviews"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('reviews');
                  setNotifDropdownOpen(false);
                }}
              >
                <Star size={18} className="text-amber-500" />
                <div>
                  <b>New 5-star Google review</b>
                  <small>Sisira R. • Yesterday</small>
                </div>
              </a>
            </div>
          )}
        </div>

        {/* Lock Session Quick Button */}
        {onLogout && (
          <button
            type="button"
            className="icon-btn d-none d-sm-inline-flex"
            onClick={onLogout}
            title="Lock Dashboard Session"
            style={{ color: 'var(--muted)' }}
          >
            <Lock size={17} />
          </button>
        )}

        {/* User Menu Avatar */}
        <div className="position-relative" ref={userRef}>
          <button
            className="avatar"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            type="button"
            title="Admin account"
            style={{ cursor: 'pointer', overflow: 'hidden' }}
          >
            <span>DW</span>
          </button>
          {userDropdownOpen && (
            <ul
              className="dropdown-menu dropdown-menu-end user-menu show position-absolute"
              style={{ top: '100%', right: 0, marginTop: '8px', zIndex: 1060 }}
            >
              <li className="um-head">
                <b>DWstore Admin</b>
                <small>admin@dwstore.lk</small>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActiveTab('settings');
                    setUserDropdownOpen(false);
                  }}
                >
                  <SettingsIcon size={14} /> Store Settings
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActiveTab('integrations');
                    setUserDropdownOpen(false);
                  }}
                >
                  <SettingsIcon size={14} /> Integrations & APIs
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              {onLogout && (
                <li>
                  <button
                    type="button"
                    className="dropdown-item text-danger d-flex align-items-center gap-2"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={14} /> Lock & Sign Out
                  </button>
                </li>
              )}
              <li>
                <a
                  className="dropdown-item text-muted"
                  href={getStorefrontUrl()}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={14} /> Storefront Preview
                </a>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};
