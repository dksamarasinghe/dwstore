import React, { useState, useEffect } from 'react';
import {
  Plug,
  CheckCircle2,
  MessageCircle,
  CreditCard,
  Truck,
  BarChart2,
  Check,
  Settings,
  Key,
  Eye,
  EyeOff,
  X,
  Save,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { getStorefrontUrl } from '../../config';

interface IntegrationsViewProps {
  showNotification: (msg: string) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ showNotification }) => {
  // Gateways Config State
  const [gatewayConfig, setGatewayConfig] = useState<any>({
    payhere: {
      enabled: false,
      title: 'PayHere Online Payment',
      description: 'Pay securely with Visa, MasterCard, Genie, FriMi or eZ Cash.',
      mode: 'sandbox',
      merchantId: '',
      merchantSecret: '',
      appId: '',
      appSecret: '',
    },
    koko: {
      enabled: false,
      title: 'Koko (Buy Now Pay Later)',
      description: 'Pay in 3 interest-free installments using Debit / Credit card.',
      mode: 'test',
      merchantId: '',
      apiKey: '',
      publicKey: '',
      privateKey: '',
    },
    payzy: {
      enabled: false,
      title: 'Payzy (Buy Now Pay Later)',
      description: 'Pay in up to 4 interest-free installments with Payzy.',
      mode: 'test',
      shopId: '',
      secretKey: '',
    },
  });

  const [activeModal, setActiveModal] = useState<'payhere' | 'koko' | 'payzy' | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch gateway configs on mount
  useEffect(() => {
    fetch(`${getStorefrontUrl()}/api/integrations/payment-gateways`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.gateways) {
          setGatewayConfig(data.gateways);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveGateway = async (gatewayKey: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/integrations/payment-gateways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [gatewayKey]: gatewayConfig[gatewayKey],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`${gatewayKey.toUpperCase()} configuration saved successfully!`);
        setActiveModal(null);
      } else {
        showNotification('Failed to save: ' + (data.error || 'Unknown error'));
      }
    } catch (e: any) {
      showNotification('Error saving gateway: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const isConnected = (key: string) => {
    const gw = gatewayConfig[key];
    if (!gw?.enabled) return false;
    if (key === 'payhere') return Boolean(gw.merchantId && gw.merchantSecret);
    if (key === 'koko') return Boolean(gw.merchantId && gw.apiKey && gw.privateKey);
    if (key === 'payzy') return Boolean(gw.shopId && gw.secretKey);
    return false;
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Connected Integrations & Payment Gateways</h1>
          <p>Configure credentials, secret keys, and API modes for Sri Lankan payment gateways and logistics.</p>
        </div>
      </div>

      <div className="row g-3">
        {/* 1. PayHere Gateway Card */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#0284c7' }}>
                  <CreditCard size={22} />
                </span>
                <div className="d-flex align-items-center gap-2">
                  {gatewayConfig?.payhere?.mode === 'sandbox' && (
                    <span className="badge-x s-Shipped" style={{ fontSize: '10px' }}>Sandbox</span>
                  )}
                  <span
                    className={`badge-x ${isConnected('payhere') ? 's-Delivered' : 's-Cancelled'}`}
                    style={{ fontSize: '11px' }}
                  >
                    {isConnected('payhere') ? 'Connected' : 'Not Configured'}
                  </span>
                </div>
              </div>
              <h5 className="mb-1">PayHere Payment Gateway</h5>
              <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                Accept Visa, MasterCard, Genie, FriMi, and eZ Cash payments securely in LKR.
              </p>
            </div>
            <div className="pt-2 border-top border-border">
              <button
                className="btn-dark-x w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => { setActiveModal('payhere'); setShowSecret(false); }}
                type="button"
                style={{ fontSize: '13px' }}
              >
                <Settings size={15} /> Configure API & Secrets
              </button>
            </div>
          </div>
        </div>

        {/* 2. Koko BNPL Card */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#8b5cf6' }}>
                  <Zap size={22} />
                </span>
                <div className="d-flex align-items-center gap-2">
                  {gatewayConfig?.koko?.mode === 'test' && (
                    <span className="badge-x s-Shipped" style={{ fontSize: '10px' }}>Test Mode</span>
                  )}
                  <span
                    className={`badge-x ${isConnected('koko') ? 's-Delivered' : 's-Cancelled'}`}
                    style={{ fontSize: '11px' }}
                  >
                    {isConnected('koko') ? 'Connected' : 'Not Configured'}
                  </span>
                </div>
              </div>
              <h5 className="mb-1">Koko (Buy Now Pay Later)</h5>
              <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                Offer 3 interest-free installments using Debit/Credit cards to boost conversions.
              </p>
            </div>
            <div className="pt-2 border-top border-border">
              <button
                className="btn-dark-x w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => { setActiveModal('koko'); setShowSecret(false); }}
                type="button"
                style={{ fontSize: '13px' }}
              >
                <Settings size={15} /> Configure API & RSA Keys
              </button>
            </div>
          </div>
        </div>

        {/* 3. Payzy BNPL Card */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#ec4899' }}>
                  <CreditCard size={22} />
                </span>
                <div className="d-flex align-items-center gap-2">
                  {gatewayConfig?.payzy?.mode === 'test' && (
                    <span className="badge-x s-Shipped" style={{ fontSize: '10px' }}>Test Mode</span>
                  )}
                  <span
                    className={`badge-x ${isConnected('payzy') ? 's-Delivered' : 's-Cancelled'}`}
                    style={{ fontSize: '11px' }}
                  >
                    {isConnected('payzy') ? 'Connected' : 'Not Configured'}
                  </span>
                </div>
              </div>
              <h5 className="mb-1">Payzy (Buy Now Pay Later)</h5>
              <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                Sri Lanka's flexible BNPL platform with up to 4 interest-free installments.
              </p>
            </div>
            <div className="pt-2 border-top border-border">
              <button
                className="btn-dark-x w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => { setActiveModal('payzy'); setShowSecret(false); }}
                type="button"
                style={{ fontSize: '13px' }}
              >
                <Settings size={15} /> Configure Shop ID & Secrets
              </button>
            </div>
          </div>
        </div>

        {/* 4. WhatsApp Business API */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#25D366' }}>
                  <MessageCircle size={22} />
                </span>
                <span className="badge-x s-Delivered" style={{ fontSize: '11px' }}>Connected</span>
              </div>
              <h5 className="mb-1">WhatsApp Business Gateway</h5>
              <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                Automatic order status messages, recovery offers, and one-click customer chats.
              </p>
            </div>
            <div className="pt-2 border-top border-border text-muted" style={{ fontSize: '12px' }}>
              Port 3002 Baileys Automation Active
            </div>
          </div>
        </div>

        {/* 5. Koombiyo Courier API */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#ea580c' }}>
                  <Truck size={22} />
                </span>
                <span className="badge-x s-Delivered" style={{ fontSize: '11px' }}>Connected</span>
              </div>
              <h5 className="mb-1">Koombiyo Courier API</h5>
              <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                Direct islandwide waypoint booking, tracking sync, and COD payment reconciliation.
              </p>
            </div>
            <div className="pt-2 border-top border-border text-muted" style={{ fontSize: '12px' }}>
              Sync API Endpoint Active (/api/koombiyo-track)
            </div>
          </div>
        </div>

        {/* 6. Meta Pixel & GA4 */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#1877F2' }}>
                  <BarChart2 size={22} />
                </span>
                <span className="badge-x s-Delivered" style={{ fontSize: '11px' }}>Connected</span>
              </div>
              <h5 className="mb-1">Marketing & Analytics (Meta & GA4)</h5>
              <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                Server-side Conversions API (CAPI) and Google Analytics 4 event stream tracking.
              </p>
            </div>
            <div className="pt-2 border-top border-border text-muted" style={{ fontSize: '12px' }}>
              Standard E-commerce Tracking Enabled
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAYHERE CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      {activeModal === 'payhere' && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 9999 }}
        >
          <div
            className="card-x w-100 shadow-lg"
            style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-border mb-3">
              <h4 className="m-0 d-flex align-items-center gap-2">
                <CreditCard size={20} className="text-primary" /> PayHere Gateway Settings
              </h4>
              <button
                type="button"
                className="btn-link-x p-1 border-0 bg-transparent text-muted"
                onClick={() => setActiveModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Enable Toggle */}
              <div className="d-flex align-items-center justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Enable PayHere Gateway</div>
                  <small className="text-muted">Display PayHere Card payment option at checkout</small>
                </div>
                <input
                  type="checkbox"
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  checked={gatewayConfig?.payhere?.enabled || false}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      payhere: { ...gatewayConfig.payhere, enabled: e.target.checked },
                    })
                  }
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Environment Mode</label>
                <select
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={gatewayConfig?.payhere?.mode || 'sandbox'}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      payhere: { ...gatewayConfig.payhere, mode: e.target.value },
                    })
                  }
                >
                  <option value="sandbox">Sandbox (Testing / No real charges)</option>
                  <option value="live">Live (Production / Real transactions)</option>
                </select>
              </div>

              {/* Merchant ID */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>PayHere Merchant ID *</label>
                <input
                  type="text"
                  placeholder="e.g. 1224567"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={gatewayConfig?.payhere?.merchantId || ''}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      payhere: { ...gatewayConfig.payhere, merchantId: e.target.value },
                    })
                  }
                />
              </div>

              {/* Merchant Secret */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="text-muted" style={{ fontSize: '13px' }}>PayHere Merchant Secret *</label>
                  <button
                    type="button"
                    className="btn-link-x p-0 border-0 bg-transparent text-primary"
                    style={{ fontSize: '12px' }}
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff size={13} /> : <Eye size={13} />} {showSecret ? 'Hide' : 'Show'} Secret
                  </button>
                </div>
                <input
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter PayHere merchant secret"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={gatewayConfig?.payhere?.merchantSecret || ''}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      payhere: { ...gatewayConfig.payhere, merchantSecret: e.target.value },
                    })
                  }
                />
              </div>

              {/* App ID & Secret (Optional) */}
              <div className="row g-2">
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '12px' }}>App ID (Optional)</label>
                  <input
                    type="text"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    value={gatewayConfig?.payhere?.appId || ''}
                    onChange={(e) =>
                      setGatewayConfig({
                        ...gatewayConfig,
                        payhere: { ...gatewayConfig.payhere, appId: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '12px' }}>App Secret (Optional)</label>
                  <input
                    type="password"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    value={gatewayConfig?.payhere?.appSecret || ''}
                    onChange={(e) =>
                      setGatewayConfig({
                        ...gatewayConfig,
                        payhere: { ...gatewayConfig.payhere, appSecret: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="p-2 rounded-2 text-muted" style={{ background: 'var(--hover)', fontSize: '12px' }}>
                <b>PayHere Webhook URL:</b> <code>https://dwstore.lk/api/payments/payhere/notify</code>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top border-border">
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-dark-x d-flex align-items-center gap-2"
                  disabled={isSaving}
                  onClick={() => handleSaveGateway('payhere')}
                >
                  <Save size={15} /> {isSaving ? 'Saving...' : 'Save PayHere Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KOKO BNPL CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      {activeModal === 'koko' && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 9999 }}
        >
          <div
            className="card-x w-100 shadow-lg"
            style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-border mb-3">
              <h4 className="m-0 d-flex align-items-center gap-2">
                <Zap size={20} className="text-purple-500" /> Koko (Buy Now Pay Later) Settings
              </h4>
              <button
                type="button"
                className="btn-link-x p-1 border-0 bg-transparent text-muted"
                onClick={() => setActiveModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Enable Toggle */}
              <div className="d-flex align-items-center justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Enable Koko BNPL</div>
                  <small className="text-muted">Allow customers to pay in 3 interest-free installments</small>
                </div>
                <input
                  type="checkbox"
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  checked={gatewayConfig?.koko?.enabled || false}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      koko: { ...gatewayConfig.koko, enabled: e.target.checked },
                    })
                  }
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Environment Mode</label>
                <select
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={gatewayConfig?.koko?.mode || 'test'}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      koko: { ...gatewayConfig.koko, mode: e.target.value },
                    })
                  }
                >
                  <option value="test">Test Mode (qaapi.paykoko.com)</option>
                  <option value="live">Live Production (prodapi.paykoko.com)</option>
                </select>
              </div>

              {/* Merchant ID & API Key */}
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Koko Merchant ID *</label>
                  <input
                    type="text"
                    placeholder="Enter Koko Merchant ID"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    value={gatewayConfig?.koko?.merchantId || ''}
                    onChange={(e) =>
                      setGatewayConfig({
                        ...gatewayConfig,
                        koko: { ...gatewayConfig.koko, merchantId: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Koko API Key *</label>
                  <input
                    type="text"
                    placeholder="Enter Koko API Key"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    value={gatewayConfig?.koko?.apiKey || ''}
                    onChange={(e) =>
                      setGatewayConfig({
                        ...gatewayConfig,
                        koko: { ...gatewayConfig.koko, apiKey: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* Public Key */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>
                  Koko Public Key (PEM format)
                </label>
                <textarea
                  rows={3}
                  placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                  className="w-100 p-2 rounded-2"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                  }}
                  value={gatewayConfig?.koko?.publicKey || ''}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      koko: { ...gatewayConfig.koko, publicKey: e.target.value },
                    })
                  }
                />
              </div>

              {/* RSA Private Key */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>
                  Koko RSA Private Key (PEM format) *
                </label>
                <textarea
                  rows={4}
                  placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                  className="w-100 p-2 rounded-2"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                  }}
                  value={gatewayConfig?.koko?.privateKey || ''}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      koko: { ...gatewayConfig.koko, privateKey: e.target.value },
                    })
                  }
                />
              </div>

              <div className="p-2 rounded-2 text-muted" style={{ background: 'var(--hover)', fontSize: '12px' }}>
                <b>Koko Callback URL:</b> <code>https://dwstore.lk/api/payments/koko/notify</code>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top border-border">
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-dark-x d-flex align-items-center gap-2"
                  disabled={isSaving}
                  onClick={() => handleSaveGateway('koko')}
                >
                  <Save size={15} /> {isSaving ? 'Saving...' : 'Save Koko Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAYZY CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      {activeModal === 'payzy' && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 9999 }}
        >
          <div
            className="card-x w-100 shadow-lg"
            style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-border mb-3">
              <h4 className="m-0 d-flex align-items-center gap-2">
                <CreditCard size={20} className="text-pink-500" /> Payzy Gateway Settings
              </h4>
              <button
                type="button"
                className="btn-link-x p-1 border-0 bg-transparent text-muted"
                onClick={() => setActiveModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Enable Toggle */}
              <div className="d-flex align-items-center justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Enable Payzy Module</div>
                  <small className="text-muted">Allow customers to pay in up to 4 installments</small>
                </div>
                <input
                  type="checkbox"
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  checked={gatewayConfig?.payzy?.enabled || false}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      payzy: { ...gatewayConfig.payzy, enabled: e.target.checked },
                    })
                  }
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Environment Mode</label>
                <select
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={gatewayConfig?.payzy?.mode || 'test'}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      payzy: { ...gatewayConfig.payzy, mode: e.target.value },
                    })
                  }
                >
                  <option value="test">Test Mode (api.payzypay.xyz)</option>
                  <option value="live">Live Production (api.payzy.lk)</option>
                </select>
              </div>

              {/* Shop ID */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Payzy Shop ID *</label>
                <input
                  type="text"
                  placeholder="Enter your Payzy Shop ID"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={gatewayConfig?.payzy?.shopId || ''}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      payzy: { ...gatewayConfig.payzy, shopId: e.target.value },
                    })
                  }
                />
              </div>

              {/* Secret Key */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="text-muted" style={{ fontSize: '13px' }}>Payzy Secret Key *</label>
                  <button
                    type="button"
                    className="btn-link-x p-0 border-0 bg-transparent text-primary"
                    style={{ fontSize: '12px' }}
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff size={13} /> : <Eye size={13} />} {showSecret ? 'Hide' : 'Show'} Secret
                  </button>
                </div>
                <input
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter Payzy secret key"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={gatewayConfig?.payzy?.secretKey || ''}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      payzy: { ...gatewayConfig.payzy, secretKey: e.target.value },
                    })
                  }
                />
              </div>

              <div className="p-2 rounded-2 text-muted" style={{ background: 'var(--hover)', fontSize: '12px' }}>
                <b>Payzy Relay Response URL:</b> <code>https://dwstore.lk/api/payments/payzy/notify</code>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top border-border">
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-dark-x d-flex align-items-center gap-2"
                  disabled={isSaving}
                  onClick={() => handleSaveGateway('payzy')}
                >
                  <Save size={15} /> {isSaving ? 'Saving...' : 'Save Payzy Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
