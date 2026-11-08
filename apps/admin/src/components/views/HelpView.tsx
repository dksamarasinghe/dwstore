import React from 'react';
import { HelpCircle, ExternalLink, BookOpen, MessageCircle, Code, Shield } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Help Center & Architecture Docs</h1>
          <p>Guides on managing products, syncing WooCommerce data, and configuring live gateways.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="card-x h-100">
            <h5 className="mb-2">Admin Dashboard Quick Reference</h5>
            <p className="text-muted" style={{ fontSize: '13px' }}>
              Learn how to utilize all modules in your new DWstore SaaS panel:
            </p>
            <ul style={{ fontSize: '13px', lineHeight: '1.8' }} className="ps-3 text-muted">
              <li><b>Orders:</b> Click the WhatsApp icon to open direct chat with customer with their order details pre-filled.</li>
              <li><b>Status Dropdown:</b> Updating status on any order sends a live PATCH request to the backend.</li>
              <li><b>Reviews:</b> Any reviews added or deleted in the Reviews tab immediately sync with the `/api/reviews` endpoint.</li>
              <li><b>Dark / Light Theme:</b> Click the moon/sun icon in the topbar to toggle themes; your preference is automatically saved.</li>
              <li><b>Search Shortcut:</b> Press <kbd>/</kbd> anywhere to quickly search products, orders, and customers.</li>
            </ul>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card-x h-100">
            <h5 className="mb-2">Hetzner VPS & Production Deployment</h5>
            <p className="text-muted" style={{ fontSize: '13px' }}>
              Architecture stack summary:
            </p>
            <div className="p-3 rounded-3 font-monospace mb-3" style={{ background: 'var(--hover)', fontSize: '12px' }}>
              <div>• Next.js 14 / Vite React Admin</div>
              <div>• PostgreSQL 16 on Hetzner VPS</div>
              <div>• Docker Compose & Nginx Reverse Proxy</div>
              <div>• Let's Encrypt SSL & HTTP/2</div>
            </div>
            <a
              href="https://dwstore.lk"
              target="_blank"
              rel="noreferrer"
              className="btn-soft d-inline-flex"
            >
              <ExternalLink size={14} /> Visit Live Storefront
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
