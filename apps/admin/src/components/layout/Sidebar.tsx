import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Tags,
  Warehouse,
  Users,
  Star,
  Percent,
  CreditCard,
  BarChart3,
  Truck,
  RotateCcw,
  ShoppingCart,
  Gift,
  Megaphone,
  Ticket,
  Mail,
  FileSpreadsheet,
  UserCheck,
  ShieldCheck,
  History,
  Settings,
  Plug,
  Bell,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
  Store,
  ChevronDown,
  LayoutTemplate
} from 'lucide-react';
import { TabType } from '../../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  pendingOrdersCount: number;
  reviewsCount: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  pendingOrdersCount,
  reviewsCount,
  mobileOpen,
  setMobileOpen,
}) => {
  const [dashboardsOpen, setDashboardsOpen] = React.useState(true);

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      <aside
        className={`sidebar ${collapsed ? 'sb-collapsed' : ''}`}
        style={{
          width: collapsed ? 'var(--sb-w-c, 76px)' : 'var(--sb-w, 264px)',
          transform: mobileOpen ? 'none' : undefined,
        }}
      >
        {/* Top Brand */}
        <div className="sb-top">
          <a
            className="brand-link"
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('dashboard');
            }}
          >
            <span className="logo">
              <Store size={18} />
            </span>
            {!collapsed && (
              <div className="d-flex align-items-center gap-2">
                <span className="brand">DWstore</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    background: 'rgba(99, 102, 241, 0.25)',
                    color: '#818cf8',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  SAAS
                </span>
              </div>
            )}
          </a>
          <button
            className="sb-toggle d-none d-lg-grid"
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Scrollable Nav */}
        <nav className="sb-scroll">
          {/* Group 1: General */}
          {!collapsed ? (
            <div className="sb-group">General</div>
          ) : (
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '10px 8px' }} />
          )}

          {/* Dashboards Accordion */}
          <div>
            <button
              type="button"
              className={`sb-link sb-parent w-100 border-0 bg-transparent text-start ${
                activeTab === 'dashboard' || activeTab === 'analytics' ? 'active' : ''
              }`}
              onClick={() => {
                if (collapsed) {
                  handleNavClick('dashboard');
                } else {
                  setDashboardsOpen(!dashboardsOpen);
                }
              }}
              title="Dashboards"
            >
              <LayoutDashboard size={18} />
              {!collapsed && (
                <>
                  <span className="flex-grow-1">Dashboards</span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: dashboardsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </>
              )}
            </button>
            {!collapsed && dashboardsOpen && (
              <div style={{ paddingLeft: '28px', marginTop: '2px' }}>
                <a
                  className={`sb-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  href="#dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('dashboard');
                  }}
                  title="Executive Overview"
                >
                  <span>Overview</span>
                </a>
                <a
                  className={`sb-link ${activeTab === 'analytics' ? 'active' : ''}`}
                  href="#analytics"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('analytics');
                  }}
                  title="Sales & Traffic"
                >
                  <span>Analytics</span>
                </a>
              </div>
            )}
          </div>

          <a
            className={`sb-link ${activeTab === 'orders' ? 'active' : ''}`}
            href="#orders"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('orders');
            }}
            title="Orders"
          >
            <ShoppingBag size={18} />
            {!collapsed && <span>Orders</span>}
            {!collapsed && pendingOrdersCount > 0 && (
              <em className="sb-badge">{pendingOrdersCount}</em>
            )}
          </a>

          <a
            className={`sb-link ${activeTab === 'products' || activeTab === 'add-product' ? 'active' : ''}`}
            href="#products"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('products');
            }}
            title="Products"
          >
            <Package size={18} />
            {!collapsed && <span>Products</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'categories' ? 'active' : ''}`}
            href="#categories"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('categories');
            }}
            title="Categories"
          >
            <Layers size={18} />
            {!collapsed && <span>Categories</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'brands' ? 'active' : ''}`}
            href="#brands"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('brands');
            }}
            title="Brands"
          >
            <Tags size={18} />
            {!collapsed && <span>Brands</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'home-customizer' ? 'active' : ''}`}
            href="#home-customizer"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home-customizer');
            }}
            title="Homepage Customizer"
          >
            <LayoutTemplate size={18} />
            {!collapsed && <span>Home Customizer</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'inventory' ? 'active' : ''}`}
            href="#inventory"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('inventory');
            }}
            title="Inventory"
          >
            <Warehouse size={18} />
            {!collapsed && <span>Inventory</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'customers' ? 'active' : ''}`}
            href="#customers"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('customers');
            }}
            title="Customers"
          >
            <Users size={18} />
            {!collapsed && <span>Customers</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'reviews' ? 'active' : ''}`}
            href="#reviews"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('reviews');
            }}
            title="Google Reviews"
          >
            <Star size={18} />
            {!collapsed && <span>Reviews</span>}
            {!collapsed && <em className="sb-badge">{reviewsCount}</em>}
          </a>

          <a
            className={`sb-link ${activeTab === 'discounts' ? 'active' : ''}`}
            href="#discounts"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('discounts');
            }}
            title="Discounts & Coupons"
          >
            <Percent size={18} />
            {!collapsed && <span>Discounts</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'payments' ? 'active' : ''}`}
            href="#payments"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('payments');
            }}
            title="Payments"
          >
            <CreditCard size={18} />
            {!collapsed && <span>Payments</span>}
          </a>

          {/* Group 2: Operations */}
          {!collapsed ? (
            <div className="sb-group">Operations</div>
          ) : (
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '10px 8px' }} />
          )}

          <a
            className={`sb-link ${activeTab === 'shipments' ? 'active' : ''}`}
            href="#shipments"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('shipments');
            }}
            title="Courier Shipments"
          >
            <Truck size={18} />
            {!collapsed && <span>Shipments</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'returns' ? 'active' : ''}`}
            href="#returns"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('returns');
            }}
            title="Returns & Warranty"
          >
            <RotateCcw size={18} />
            {!collapsed && <span>Returns</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'abandoned-carts' ? 'active' : ''}`}
            href="#abandoned-carts"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('abandoned-carts');
            }}
            title="Abandoned Carts"
          >
            <ShoppingCart size={18} />
            {!collapsed && <span>Abandoned Carts</span>}
          </a>

          {/* Group 3: Marketing & Coupons */}
          {!collapsed ? (
            <div className="sb-group">Marketing</div>
          ) : (
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '10px 8px' }} />
          )}

          <a
            className={`sb-link ${activeTab === 'coupons' || activeTab === 'discounts' ? 'active' : ''}`}
            href="#coupons"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('coupons');
            }}
            title="Promo Coupons"
          >
            <Ticket size={18} />
            {!collapsed && <span>Promo Coupons</span>}
          </a>

          {/* Group 4: Management & Data */}
          {!collapsed ? (
            <div className="sb-group">Management</div>
          ) : (
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '10px 8px' }} />
          )}

          <a
            className={`sb-link ${activeTab === 'imports' ? 'active' : ''}`}
            href="#imports"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('imports');
            }}
            title="WooCommerce CSV Import Audit"
          >
            <FileSpreadsheet size={18} />
            {!collapsed && <span>Woo Migration</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'logs' ? 'active' : ''}`}
            href="#logs"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('logs');
            }}
            title="Activity Logs"
          >
            <History size={18} />
            {!collapsed && <span>Activity Logs</span>}
          </a>

          {/* Group 5: Settings & System */}
          {!collapsed ? (
            <div className="sb-group">Settings & System</div>
          ) : (
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '10px 8px' }} />
          )}

          <a
            className={`sb-link ${activeTab === 'settings' ? 'active' : ''}`}
            href="#settings"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('settings');
            }}
            title="Settings"
          >
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'integrations' ? 'active' : ''}`}
            href="#integrations"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('integrations');
            }}
            title="Integrations (WhatsApp, Courier, Payment)"
          >
            <Plug size={18} />
            {!collapsed && <span>Integrations</span>}
          </a>

          <a
            className={`sb-link ${activeTab === 'help' ? 'active' : ''}`}
            href="#help"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('help');
            }}
            title="Help & Support"
          >
            <HelpCircle size={18} />
            {!collapsed && <span>Help & Docs</span>}
          </a>
        </nav>

        {/* Sidebar Footer */}
        <div className="sb-bottom">
          {!collapsed && (
            <div className="store-card">
              <span className="logo">
                <Store size={16} />
              </span>
              <div>
                <b>DWstore Borella</b>
                <small>dwstore.lk</small>
              </div>
            </div>
          )}
          <a
            className="sb-link"
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            title="View Live Storefront"
          >
            <ExternalLink size={18} />
            {!collapsed && <span>Storefront</span>}
          </a>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="backdrop"
          style={{ opacity: 1, visibility: 'visible' }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};
