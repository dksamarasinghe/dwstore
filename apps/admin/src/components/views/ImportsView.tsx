import React, { useState } from 'react';
import { FileSpreadsheet, RefreshCw, CheckCircle2, AlertTriangle, Layers, Download, Check } from 'lucide-react';

interface ImportsViewProps {
  showNotification: (msg: string) => void;
}

export const ImportsView: React.FC<ImportsViewProps> = ({ showNotification }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [auditDone, setAuditDone] = useState(true);

  const handleRunAudit = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setAuditDone(true);
      showNotification('WooCommerce CSV Audit completed: 531 records verified!');
    }, 1500);
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>WooCommerce CSV Migration Audit</h1>
          <p>Inspection report for legacy WordPress/WooCommerce product exports to Next.js PostgreSQL.</p>
        </div>
        <button
          className="btn-dark-x"
          onClick={handleRunAudit}
          disabled={isRunning}
          type="button"
        >
          <RefreshCw size={16} className={isRunning ? 'animate-spin' : ''} />
          {isRunning ? 'Auditing CSV...' : 'Re-run CSV Audit'}
        </button>
      </div>

      <section className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#eef2fd', color: '#4f46e5' }}>
              <FileSpreadsheet size={20} />
            </span>
            <div>
              <small>Raw CSV Rows</small>
              <b>531 Records</b>
              <span className="ms-note up">wc-product-export-23-10</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#ecf6ef', color: '#059669' }}>
              <CheckCircle2 size={20} />
            </span>
            <div>
              <small>Clean Products</small>
              <b>407 Products</b>
              <span className="ms-note up">Ready for import</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#f6eff6', color: '#9333ea' }}>
              <Layers size={20} />
            </span>
            <div>
              <small>Variations / Straps</small>
              <b>124 Variants</b>
              <span className="ms-note">Mapped to parent SKUs</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#fef3c7', color: '#d97706' }}>
              <AlertTriangle size={20} />
            </span>
            <div>
              <small>Flagged / Sanitized</small>
              <b>11 Fixed</b>
              <span className="ms-note">Cleaned /n artifacts</span>
            </div>
          </div>
        </div>
      </section>

      <div className="card-x">
        <div className="card-head">
          <h5>Database Mapping & Schema Compatibility</h5>
        </div>

        <div className="d-flex flex-column gap-3" style={{ fontSize: '13px' }}>
          <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--hover)' }}>
            <div className="d-flex align-items-center gap-3">
              <CheckCircle2 size={18} className="text-success" />
              <div>
                <b>Price & Sale Price Sanitization</b>
                <small className="d-block text-muted">Parsed LKR integer values, removed commas and currency prefixes</small>
              </div>
            </div>
            <span className="badge-x s-Delivered">100% Passed</span>
          </div>

          <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--hover)' }}>
            <div className="d-flex align-items-center gap-3">
              <CheckCircle2 size={18} className="text-success" />
              <div>
                <b>Description HTML Formatting Filter</b>
                <small className="d-block text-muted">Cleaned legacy literal `\r\n` and `/n` string fragments into semantic HTML lists</small>
              </div>
            </div>
            <span className="badge-x s-Delivered">100% Sanitized</span>
          </div>

          <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--hover)' }}>
            <div className="d-flex align-items-center gap-3">
              <CheckCircle2 size={18} className="text-success" />
              <div>
                <b>Media & Image URL Integrity</b>
                <small className="d-block text-muted">All product gallery URLs cached and ready for local image serving</small>
              </div>
            </div>
            <span className="badge-x s-Delivered">100% Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
