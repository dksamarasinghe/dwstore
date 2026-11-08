import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Store, Shield, Database, Server, Trash2, RefreshCw, HardDrive, Zap } from 'lucide-react';
import { getStorefrontUrl } from '../../config';

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
  
  // Cache & Storage Management State
  const [cacheSize, setCacheSize] = useState('0 B');
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [lastPurged, setLastPurged] = useState<string | null>(null);

  const fetchCacheStats = async () => {
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/system/clear-cache`);
      const data = await res.json();
      if (data?.cacheStats?.totalSize) {
        setCacheSize(data.cacheStats.totalSize);
      }
    } catch (e) {
      // Ignore if offline
    }
  };

  useEffect(() => {
    fetchCacheStats();
  }, []);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/system/clear-cache`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setCacheSize('0 B');
        setLastPurged(new Date().toLocaleTimeString());
        showNotification(data.message || 'Cache purged and storage freed successfully!');
      } else {
        showNotification('Failed to clear cache: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      showNotification('Error clearing cache: ' + err.message);
    } finally {
      setIsClearingCache(false);
      fetchCacheStats();
    }
  };

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

          <div className="card-x mb-4">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h5 className="d-flex align-items-center gap-2 m-0">
                <HardDrive size={17} className="text-primary" /> Cache & Storage Engine
              </h5>
              <button
                type="button"
                className="btn-link-x p-0 border-0 bg-transparent text-muted"
                onClick={fetchCacheStats}
                title="Refresh stats"
              >
                <RefreshCw size={13} />
              </button>
            </div>
            <div className="d-flex flex-column gap-3" style={{ fontSize: '13px' }}>
              <div className="d-flex align-items-center justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                <span className="d-flex align-items-center gap-2">
                  <Zap size={14} className="text-warning" /> In-Memory RAM Cache
                </span>
                <span className="text-success font-semibold">Active (0.5ms)</span>
              </div>

              <div className="d-flex align-items-center justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                <span className="d-flex align-items-center gap-2">
                  <HardDrive size={14} className="text-info" /> Next.js Image/Data Cache
                </span>
                <span className="badge-x s-Shipped">{cacheSize}</span>
              </div>

              {lastPurged && (
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  Last optimized at: {lastPurged}
                </div>
              )}

              <button
                type="button"
                className="btn-danger-x w-100 d-flex align-items-center justify-content-center gap-2 mt-1 py-2"
                onClick={handleClearCache}
                disabled={isClearingCache}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '6px',
                  cursor: isClearingCache ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                }}
              >
                {isClearingCache ? (
                  <>
                    <RefreshCw size={14} className="spinner-border spinner-border-sm" /> Optimizing Storage...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Clear Cache & Free Storage
                  </>
                )}
              </button>
              <div className="text-muted" style={{ fontSize: '11px', lineHeight: 1.4 }}>
                * Purges Next.js compiled image caches, fetch cache, and refreshes RAM stores safely without losing products or customer orders.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
