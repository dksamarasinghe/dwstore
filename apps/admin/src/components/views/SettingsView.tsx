import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Store, Shield, Database, Server } from 'lucide-react';

interface SettingsViewProps {
  showNotification: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ showNotification }) => {
  const [storeName, setStoreName] = useState('DWstore.lk');
  const [phone, setPhone] = useState('+94 75 669 3358');
  const [email, setEmail] = useState('support@dwstore.lk');
  const [address, setAddress] = useState('No.55/1/2, Borella road, Pannipitiya');
  const [currency, setCurrency] = useState('LKR (Rs.)');
  const [shippingFee, setShippingFee] = useState('400');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('10000');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Store configuration saved successfully!');
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Store Settings & Configuration</h1>
          <p>Manage store profile, Borella showroom details, default shipping fees, and database connections.</p>
        </div>
        <button className="btn-dark-x" onClick={handleSave} type="button">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="card-x mb-4">
            <div className="card-head">
              <h5>Store Profile</h5>
            </div>
            <form onSubmit={handleSave}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Store Name</label>
                  <input
                    type="text"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Support WhatsApp / Phone</label>
                  <input
                    type="text"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Official Support Email</label>
                <input
                  type="email"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Showroom Physical Address</label>
                <textarea
                  rows={2}
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Standard Courier Fee (LKR)</label>
                  <input
                    type="number"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Free Shipping Over (LKR)</label>
                  <input
                    type="number"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card-x mb-4">
            <div className="card-head">
              <h5>Infrastructure Health</h5>
            </div>
            <div className="d-flex flex-column gap-3" style={{ fontSize: '13px' }}>
              <div className="d-flex align-items-center justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                <span className="d-flex align-items-center gap-2">
                  <Server size={15} className="text-success" /> Hetzner Cloud VPS
                </span>
                <span className="badge-x s-Delivered">Online (99.9%)</span>
              </div>
              <div className="d-flex align-items-center justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                <span className="d-flex align-items-center gap-2">
                  <Database size={15} className="text-primary" /> PostgreSQL 16 DB
                </span>
                <span className="badge-x s-Delivered">Connected</span>
              </div>
              <div className="d-flex align-items-center justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                <span className="d-flex align-items-center gap-2">
                  <Shield size={15} className="text-info" /> SSL Certificate
                </span>
                <span className="badge-x s-Delivered">Valid (Let's Encrypt)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
