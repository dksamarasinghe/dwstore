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
  QrCode,
  Smartphone,
  RefreshCw,
  LogOut,
  Landmark,
  Banknote,
  Percent,
  Plus,
  Trash2,
  Sparkles,
  Mail,
  Send,
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
      discountEnabled: false,
      discountType: 'percentage',
      discountValue: 0,
      discountBadge: '',
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
      discountEnabled: false,
      discountType: 'percentage',
      discountValue: 0,
      discountBadge: '',
    },
    payzy: {
      enabled: false,
      title: 'Payzy (Buy Now Pay Later)',
      description: 'Pay in up to 4 interest-free installments with Payzy.',
      mode: 'test',
      shopId: '',
      secretKey: '',
      discountEnabled: false,
      discountType: 'percentage',
      discountValue: 0,
      discountBadge: '',
    },
    bank: {
      enabled: true,
      title: 'Direct Bank Transfer / Deposit',
      description: 'Transfer directly into our bank account and WhatsApp the slip.',
      accounts: [
        {
          id: '1',
          bankName: 'Commercial Bank of Ceylon',
          accountName: 'DWstore (Pvt) Ltd',
          accountNumber: '8010023456',
          branch: 'Colombo',
        },
      ],
      instructions: '* Please transfer the total amount and send the deposit receipt / screenshot to our WhatsApp (+94 75 669 3358) with your Order ID after placing the order.',
      discountEnabled: false,
      discountType: 'percentage',
      discountValue: 0,
      discountBadge: '',
    },
    cod: {
      enabled: true,
      title: 'Cash on Delivery (COD)',
      description: 'Pay cash to the courier delivery rider when your package arrives at your doorstep.',
      discountEnabled: false,
      discountType: 'percentage',
      discountValue: 0,
      discountBadge: '',
    },
  });

  const [activeModal, setActiveModal] = useState<'payhere' | 'koko' | 'payzy' | 'bank' | 'cod' | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // WhatsApp Gateway Live State
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<{
    online: boolean;
    isConnected: boolean;
    phone: string | null;
    status: string;
    qr: string | null;
  }>({
    online: false,
    isConnected: false,
    phone: null,
    status: 'checking',
    qr: null,
  });
  const [isLoggingOutWhatsApp, setIsLoggingOutWhatsApp] = useState(false);

  // Email Integration State (Resend API)
  const [emailConfig, setEmailConfig] = useState({
    enabled: true,
    resendApiKey: '',
    fromEmail: 'DWstore.lk <orders@dwstore.lk>',
    adminEmail: 'support@dwstore.lk',
    customerEmailNotifications: true,
    adminEmailNotifications: true,
    hasApiKey: false,
  });
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('support@dwstore.lk');
  const [showResendKey, setShowResendKey] = useState(false);

  // Fetch gateway configs & email config on mount
  useEffect(() => {
    fetch(`${getStorefrontUrl()}/api/integrations/payment-gateways`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.gateways) {
          setGatewayConfig(data.gateways);
        }
      })
      .catch(() => {});

    fetch(`${getStorefrontUrl()}/api/integrations/email`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.config) {
          setEmailConfig(data.config);
          setTestEmailAddress(data.config.adminEmail || 'support@dwstore.lk');
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveEmailConfig = async () => {
    setIsSavingEmail(true);
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/integrations/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig),
      });
      const data = await res.json();
      if (data?.success) {
        showNotification('Resend Email configuration saved successfully!');
        setEmailModalOpen(false);
      } else {
        showNotification('Failed to save email settings: ' + (data?.error || 'Unknown error'));
      }
    } catch (err: any) {
      showNotification('Error saving email settings: ' + err.message);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleTestEmail = async () => {
    if (!emailConfig.resendApiKey && !emailConfig.hasApiKey) {
      showNotification('Please enter a Resend API Key first!');
      return;
    }
    setIsTestingEmail(true);
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/integrations/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          resendApiKey: emailConfig.resendApiKey,
          fromEmail: emailConfig.fromEmail,
          testEmail: testEmailAddress || emailConfig.adminEmail,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        showNotification(data.message || 'Test email dispatched successfully via Resend!');
      } else {
        showNotification('Test email failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (err: any) {
      showNotification('Error sending test email: ' + err.message);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const fetchWhatsAppStatus = async () => {
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/whatsapp`);
      const data = await res.json();
      if (data) {
        setWhatsappStatus({
          online: Boolean(data.online),
          isConnected: Boolean(data.isConnected),
          phone: data.phone || null,
          status: data.status || 'offline',
          qr: data.qr || null,
        });
      }
    } catch (e) {
      setWhatsappStatus((prev) => ({ ...prev, online: false, isConnected: false }));
    }
  };

  // Poll WhatsApp status every 2.5 seconds when modal is open
  useEffect(() => {
    fetchWhatsAppStatus();
    if (!whatsappModalOpen) return;
    const interval = setInterval(fetchWhatsAppStatus, 2500);
    return () => clearInterval(interval);
  }, [whatsappModalOpen]);

  const handleLogoutWhatsApp = async () => {
    setIsLoggingOutWhatsApp(true);
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      await res.json();
      showNotification('WhatsApp account disconnected. A new QR code is ready to scan.');
      fetchWhatsAppStatus();
    } catch (err: any) {
      showNotification('Failed to disconnect WhatsApp: ' + err.message);
    } finally {
      setIsLoggingOutWhatsApp(false);
    }
  };

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
    if (gw?.enabled === false) return false;
    if (key === 'payhere') return Boolean(gw?.merchantId && gw?.merchantSecret);
    if (key === 'koko') return Boolean(gw?.merchantId && gw?.apiKey && gw?.privateKey);
    if (key === 'payzy') return Boolean(gw?.shopId && gw?.secretKey);
    if (key === 'bank') return Boolean(gw?.accounts && gw?.accounts.length > 0 && gw?.accounts[0].accountNumber);
    if (key === 'cod') return Boolean(gw?.enabled !== false);
    return false;
  };

  const hasActiveDiscount = (key: string) => {
    const gw = gatewayConfig[key];
    return Boolean(gw?.discountEnabled && Number(gw?.discountValue) > 0);
  };

  const renderDiscountSection = (gatewayKey: string, gatewayName: string) => {
    const gw = gatewayConfig[gatewayKey] || {};
    return (
      <div className="p-3 rounded-2 border border-border" style={{ background: 'var(--hover)' }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px' }} className="d-flex align-items-center gap-1.5">
              <Percent size={14} className="text-success" /> Promotional Discount (Optional)
            </div>
            <small className="text-muted">Give customers an instant discount when choosing {gatewayName}</small>
          </div>
          <input
            type="checkbox"
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            checked={gw.discountEnabled || false}
            onChange={(e) =>
              setGatewayConfig({
                ...gatewayConfig,
                [gatewayKey]: { ...gw, discountEnabled: e.target.checked },
              })
            }
          />
        </div>

        {gw.discountEnabled && (
          <div className="d-flex flex-column gap-2 pt-2 border-top border-border">
            <div className="row g-2">
              <div className="col-6">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px' }}>Discount Type</label>
                <select
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12.5px' }}
                  value={gw.discountType || 'percentage'}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      [gatewayKey]: { ...gw, discountType: e.target.value },
                    })
                  }
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (LKR)</option>
                </select>
              </div>
              <div className="col-6">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px' }}>
                  Discount Value ({gw.discountType === 'fixed' ? 'LKR' : '%'}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder={gw.discountType === 'fixed' ? 'e.g. 500' : 'e.g. 5'}
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12.5px' }}
                  value={gw.discountValue ?? ''}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      [gatewayKey]: { ...gw, discountValue: parseFloat(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="d-block mb-1 text-muted" style={{ fontSize: '12px' }}>Custom Promotional Badge (Optional)</label>
              <input
                type="text"
                placeholder={`e.g. Save ${gw.discountType === 'fixed' ? 'LKR ' + (gw.discountValue || 0) : (gw.discountValue || 0) + '%'} with ${gatewayName}`}
                className="w-100 p-2 rounded-2"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12.5px' }}
                value={gw.discountBadge || ''}
                onChange={(e) =>
                  setGatewayConfig({
                    ...gatewayConfig,
                    [gatewayKey]: { ...gw, discountBadge: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Connected Integrations & Payment Gateways</h1>
          <p>Configure credentials, secret keys, bank accounts, and promotional discounts for Sri Lankan payment methods.</p>
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
                <div className="d-flex align-items-center gap-1.5 flex-wrap justify-content-end">
                  {hasActiveDiscount('payhere') && (
                    <span className="badge-x" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <Percent size={10} className="me-1" />
                      {gatewayConfig.payhere.discountType === 'fixed' ? `LKR ${gatewayConfig.payhere.discountValue} OFF` : `${gatewayConfig.payhere.discountValue}% OFF`}
                    </span>
                  )}
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
                <div className="d-flex align-items-center gap-1.5 flex-wrap justify-content-end">
                  {hasActiveDiscount('koko') && (
                    <span className="badge-x" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <Percent size={10} className="me-1" />
                      {gatewayConfig.koko.discountType === 'fixed' ? `LKR ${gatewayConfig.koko.discountValue} OFF` : `${gatewayConfig.koko.discountValue}% OFF`}
                    </span>
                  )}
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
                <div className="d-flex align-items-center gap-1.5 flex-wrap justify-content-end">
                  {hasActiveDiscount('payzy') && (
                    <span className="badge-x" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <Percent size={10} className="me-1" />
                      {gatewayConfig.payzy.discountType === 'fixed' ? `LKR ${gatewayConfig.payzy.discountValue} OFF` : `${gatewayConfig.payzy.discountValue}% OFF`}
                    </span>
                  )}
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

        {/* 4. Direct Bank Transfer / Deposit Card */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#2563eb' }}>
                  <Landmark size={22} />
                </span>
                <div className="d-flex align-items-center gap-1.5 flex-wrap justify-content-end">
                  {hasActiveDiscount('bank') && (
                    <span className="badge-x" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <Percent size={10} className="me-1" />
                      {gatewayConfig.bank.discountType === 'fixed' ? `LKR ${gatewayConfig.bank.discountValue} OFF` : `${gatewayConfig.bank.discountValue}% OFF`}
                    </span>
                  )}
                  <span
                    className={`badge-x ${isConnected('bank') ? 's-Delivered' : 's-Cancelled'}`}
                    style={{ fontSize: '11px' }}
                  >
                    {isConnected('bank') ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
              <h5 className="mb-1">Direct Bank Transfer / Deposit</h5>
              <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                Display your bank accounts (Commercial, Sampath, etc.) and instructions at checkout with custom discounts.
              </p>
            </div>
            <div className="pt-2 border-top border-border">
              <button
                className="btn-dark-x w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => setActiveModal('bank')}
                type="button"
                style={{ fontSize: '13px' }}
              >
                <Settings size={15} /> Configure Bank Accounts & Discounts
              </button>
            </div>
          </div>
        </div>

        {/* 5. Cash on Delivery (COD) Card */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#059669' }}>
                  <Banknote size={22} />
                </span>
                <div className="d-flex align-items-center gap-1.5 flex-wrap justify-content-end">
                  {hasActiveDiscount('cod') && (
                    <span className="badge-x" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <Percent size={10} className="me-1" />
                      {gatewayConfig.cod.discountType === 'fixed' ? `LKR ${gatewayConfig.cod.discountValue} OFF` : `${gatewayConfig.cod.discountValue}% OFF`}
                    </span>
                  )}
                  <span
                    className={`badge-x ${isConnected('cod') ? 's-Delivered' : 's-Cancelled'}`}
                    style={{ fontSize: '11px' }}
                  >
                    {isConnected('cod') ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
              <h5 className="mb-1">Cash on Delivery (COD)</h5>
              <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                Allow customers to pay cash directly to the courier rider upon package arrival, with optional promo discounts.
              </p>
            </div>
            <div className="pt-2 border-top border-border">
              <button
                className="btn-dark-x w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => setActiveModal('cod')}
                type="button"
                style={{ fontSize: '13px' }}
              >
                <Settings size={15} /> Configure COD & Discounts
              </button>
            </div>
          </div>
        </div>

        {/* 6. WhatsApp Business Gateway */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#25D366' }}>
                  <MessageCircle size={22} />
                </span>
                <span
                  className={`badge-x ${whatsappStatus.isConnected ? 's-Delivered' : 's-Shipped'}`}
                  style={{ fontSize: '11px' }}
                >
                  {whatsappStatus.isConnected ? `Linked (+${whatsappStatus.phone || 'Active'})` : 'Ready to Link'}
                </span>
              </div>
              <h5 className="mb-1">WhatsApp Business Gateway</h5>
              <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                Automatic order status messages, recovery offers, and one-click customer chats.
              </p>
            </div>
            <div className="pt-2 border-top border-border">
              <button
                className="btn-dark-x w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => setWhatsappModalOpen(true)}
                type="button"
                style={{
                  fontSize: '13px',
                  background: whatsappStatus.isConnected ? undefined : 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: whatsappStatus.isConnected ? undefined : '#ffffff',
                  border: 'none',
                }}
              >
                <QrCode size={15} /> {whatsappStatus.isConnected ? 'Manage WhatsApp Link' : 'Scan QR Code to Link'}
              </button>
            </div>
          </div>
        </div>

        {/* 7. Koombiyo Courier API */}
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

        {/* 8. Marketing & Analytics (Meta & GA4) */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#6366f1' }}>
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

        {/* 9. Resend Email Gateway */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="thumb" style={{ background: 'var(--hover)', color: '#2563eb' }}>
                  <Mail size={22} />
                </span>
                <div className="d-flex align-items-center gap-1.5 flex-wrap justify-content-end">
                  <span className="badge-x" style={{ fontSize: '10px', background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
                    dwstore.lk Verified
                  </span>
                  <span
                    className={`badge-x ${emailConfig.hasApiKey || emailConfig.resendApiKey ? 's-Delivered' : 's-Shipped'}`}
                    style={{ fontSize: '11px' }}
                  >
                    {emailConfig.hasApiKey || emailConfig.resendApiKey ? 'Connected' : 'Setup Key'}
                  </span>
                </div>
              </div>
              <h5 className="mb-1">Resend Email Gateway</h5>
              <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                Automated order confirmation receipts to customers & new order alerts to store admin from <b>orders@dwstore.lk</b>.
              </p>
            </div>
            <div className="pt-2 border-top border-border">
              <button
                className="btn-dark-x w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => setEmailModalOpen(true)}
                type="button"
                style={{ fontSize: '13px' }}
              >
                <Settings size={15} /> Configure Resend API & Alerts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WHATSAPP MODAL POPUP */}
      {/* ========================================================================= */}
      {whatsappModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 9999 }}
        >
          <div
            className="card-x w-100 shadow-lg"
            style={{ maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-border mb-3">
              <h4 className="m-0 d-flex align-items-center gap-2">
                <MessageCircle size={20} className="text-success" /> WhatsApp Business Gateway
              </h4>
              <button
                type="button"
                className="btn-link-x p-1 border-0 bg-transparent text-muted"
                onClick={() => setWhatsappModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {whatsappStatus.isConnected ? (
              <div className="py-4 d-flex flex-column align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '68px', height: '68px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
                >
                  <CheckCircle2 size={40} />
                </div>
                <h5 className="mb-1 text-success">WhatsApp Account Connected!</h5>
                <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                  Linked Device: <b className="text-foreground">+{whatsappStatus.phone || 'Your WhatsApp Number'}</b>
                </p>
                <div className="p-3 rounded-2 text-start w-100 mb-4" style={{ background: 'var(--hover)', fontSize: '12.5px' }}>
                  <div className="d-flex align-items-center gap-2 text-success mb-1">
                    <Check size={14} /> Automated order confirmation messages active
                  </div>
                  <div className="d-flex align-items-center gap-2 text-success mb-1">
                    <Check size={14} /> Courier dispatch tracking alerts active
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <Check size={14} /> Free Baileys WebSocket connection active
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-danger-x w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                  disabled={isLoggingOutWhatsApp}
                  onClick={handleLogoutWhatsApp}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '6px',
                  }}
                >
                  <LogOut size={15} /> {isLoggingOutWhatsApp ? 'Disconnecting...' : 'Disconnect WhatsApp Account'}
                </button>
              </div>
            ) : whatsappStatus.qr ? (
              <div className="py-2 d-flex flex-column align-items-center">
                <div className="text-muted mb-3" style={{ fontSize: '13px' }}>
                  Open WhatsApp on your phone &gt; <b>Settings (or ⋮)</b> &gt; <b>Linked Devices</b> &gt; <b>Link a Device</b> and point camera here:
                </div>

                <div
                  className="p-3 rounded-3 mb-3 shadow-sm d-inline-block"
                  style={{ background: '#ffffff', border: '3px solid #25D366' }}
                >
                  <img
                    src={whatsappStatus.qr}
                    alt="Scan WhatsApp QR"
                    style={{ width: '250px', height: '250px', display: 'block' }}
                  />
                </div>

                <div className="d-flex align-items-center gap-2 text-muted mb-3" style={{ fontSize: '12px' }}>
                  <RefreshCw size={13} className="spinner-border spinner-border-sm" />
                  Waiting for phone scan... (Auto-syncs live)
                </div>

                <button
                  type="button"
                  className="btn-soft w-100"
                  onClick={fetchWhatsAppStatus}
                >
                  <RefreshCw size={14} /> Refresh QR Code
                </button>
              </div>
            ) : (
              <div className="py-5 d-flex flex-column align-items-center text-center">
                <RefreshCw size={32} className="spinner-border text-success mb-3" />
                <h5>Starting WhatsApp Gateway Session...</h5>
                <p className="text-muted" style={{ fontSize: '13px' }}>
                  Connecting to Baileys service. The QR code will appear in a moment.
                </p>
                <button
                  type="button"
                  className="btn-soft mt-3"
                  onClick={fetchWhatsAppStatus}
                >
                  Check Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

              {/* Promotional Discount */}
              {renderDiscountSection('payhere', 'PayHere Card Payment')}

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

              {/* Promotional Discount */}
              {renderDiscountSection('koko', 'Koko BNPL')}

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

              {/* Promotional Discount */}
              {renderDiscountSection('payzy', 'Payzy BNPL')}

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

      {/* ========================================================================= */}
      {/* DIRECT BANK TRANSFER / DEPOSIT CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      {activeModal === 'bank' && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 9999 }}
        >
          <div
            className="card-x w-100 shadow-lg"
            style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-border mb-3">
              <h4 className="m-0 d-flex align-items-center gap-2">
                <Landmark size={20} className="text-primary" /> Direct Bank Transfer / Deposit Settings
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
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Enable Direct Bank Transfer</div>
                  <small className="text-muted">Display bank deposit option and account details at checkout</small>
                </div>
                <input
                  type="checkbox"
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  checked={gatewayConfig?.bank?.enabled !== false}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      bank: { ...gatewayConfig.bank, enabled: e.target.checked },
                    })
                  }
                />
              </div>

              {/* Promotional Discount */}
              {renderDiscountSection('bank', 'Direct Bank Transfer')}

              {/* Bank Accounts List */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="text-muted fw-bold" style={{ fontSize: '13px' }}>Bank Accounts *</label>
                  <button
                    type="button"
                    className="btn-soft d-flex align-items-center gap-1 py-1 px-2.5"
                    style={{ fontSize: '11.5px' }}
                    onClick={() => {
                      const accounts = gatewayConfig?.bank?.accounts || [];
                      setGatewayConfig({
                        ...gatewayConfig,
                        bank: {
                          ...gatewayConfig.bank,
                          accounts: [
                            ...accounts,
                            {
                              id: Date.now().toString(),
                              bankName: '',
                              accountName: '',
                              accountNumber: '',
                              branch: '',
                            },
                          ],
                        },
                      });
                    }}
                  >
                    <Plus size={13} /> Add Another Bank Account
                  </button>
                </div>

                <div className="d-flex flex-column gap-2.5">
                  {(gatewayConfig?.bank?.accounts || []).map((acc: any, index: number) => (
                    <div key={acc.id || index} className="p-3 rounded-2 border border-border" style={{ background: 'var(--hover)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ fontSize: '12.5px', fontWeight: 600 }} className="text-primary">
                          Bank Account #{index + 1}
                        </span>
                        {(gatewayConfig?.bank?.accounts || []).length > 1 && (
                          <button
                            type="button"
                            className="btn-link-x p-0 border-0 bg-transparent text-danger d-flex align-items-center gap-1"
                            style={{ fontSize: '11px' }}
                            onClick={() => {
                              const accounts = gatewayConfig.bank.accounts.filter((_: any, i: number) => i !== index);
                              setGatewayConfig({
                                ...gatewayConfig,
                                bank: { ...gatewayConfig.bank, accounts },
                              });
                            }}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        )}
                      </div>

                      <div className="row g-2">
                        <div className="col-12 col-sm-6">
                          <label className="d-block mb-1 text-muted" style={{ fontSize: '11px' }}>Bank Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Commercial Bank of Ceylon"
                            className="w-100 p-2 rounded-2"
                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                            value={acc.bankName || ''}
                            onChange={(e) => {
                              const accounts = [...(gatewayConfig.bank.accounts || [])];
                              accounts[index] = { ...accounts[index], bankName: e.target.value };
                              setGatewayConfig({
                                ...gatewayConfig,
                                bank: { ...gatewayConfig.bank, accounts },
                              });
                            }}
                          />
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="d-block mb-1 text-muted" style={{ fontSize: '11px' }}>Account Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. DWstore (Pvt) Ltd"
                            className="w-100 p-2 rounded-2"
                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                            value={acc.accountName || ''}
                            onChange={(e) => {
                              const accounts = [...(gatewayConfig.bank.accounts || [])];
                              accounts[index] = { ...accounts[index], accountName: e.target.value };
                              setGatewayConfig({
                                ...gatewayConfig,
                                bank: { ...gatewayConfig.bank, accounts },
                              });
                            }}
                          />
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="d-block mb-1 text-muted" style={{ fontSize: '11px' }}>Account Number *</label>
                          <input
                            type="text"
                            placeholder="e.g. 8010023456"
                            className="w-100 p-2 rounded-2"
                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                            value={acc.accountNumber || ''}
                            onChange={(e) => {
                              const accounts = [...(gatewayConfig.bank.accounts || [])];
                              accounts[index] = { ...accounts[index], accountNumber: e.target.value };
                              setGatewayConfig({
                                ...gatewayConfig,
                                bank: { ...gatewayConfig.bank, accounts },
                              });
                            }}
                          />
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="d-block mb-1 text-muted" style={{ fontSize: '11px' }}>Branch</label>
                          <input
                            type="text"
                            placeholder="e.g. Colombo / Borella"
                            className="w-100 p-2 rounded-2"
                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                            value={acc.branch || ''}
                            onChange={(e) => {
                              const accounts = [...(gatewayConfig.bank.accounts || [])];
                              accounts[index] = { ...accounts[index], branch: e.target.value };
                              setGatewayConfig({
                                ...gatewayConfig,
                                bank: { ...gatewayConfig.bank, accounts },
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions / Notes */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>
                  Deposit Instructions & WhatsApp Receipt Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please transfer the total amount and WhatsApp the deposit slip..."
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                  value={gatewayConfig?.bank?.instructions || ''}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      bank: { ...gatewayConfig.bank, instructions: e.target.value },
                    })
                  }
                />
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
                  onClick={() => handleSaveGateway('bank')}
                >
                  <Save size={15} /> {isSaving ? 'Saving...' : 'Save Bank Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASH ON DELIVERY (COD) CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      {activeModal === 'cod' && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 9999 }}
        >
          <div
            className="card-x w-100 shadow-lg"
            style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-border mb-3">
              <h4 className="m-0 d-flex align-items-center gap-2">
                <Banknote size={20} className="text-success" /> Cash on Delivery (COD) Settings
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
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Enable Cash on Delivery</div>
                  <small className="text-muted">Allow customers to pay cash to the rider upon delivery</small>
                </div>
                <input
                  type="checkbox"
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  checked={gatewayConfig?.cod?.enabled !== false}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      cod: { ...gatewayConfig.cod, enabled: e.target.checked },
                    })
                  }
                />
              </div>

              {/* Promotional Discount */}
              {renderDiscountSection('cod', 'Cash on Delivery')}

              {/* Description */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Checkout Description Note</label>
                <textarea
                  rows={2}
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                  value={gatewayConfig?.cod?.description || ''}
                  onChange={(e) =>
                    setGatewayConfig({
                      ...gatewayConfig,
                      cod: { ...gatewayConfig.cod, description: e.target.value },
                    })
                  }
                />
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
                  onClick={() => handleSaveGateway('cod')}
                >
                  <Save size={15} /> {isSaving ? 'Saving...' : 'Save COD Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESEND EMAIL MODAL POPUP */}
      {/* ========================================================================= */}
      {emailModalOpen && (
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
                <Mail size={20} className="text-primary" /> Resend Email Integration
              </h4>
              <button
                type="button"
                className="btn-link-x p-1 border-0 bg-transparent text-muted"
                onClick={() => setEmailModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Verified Domain Banner */}
            <div
              className="p-3 rounded-3 mb-3 d-flex align-items-center gap-3"
              style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '36px', height: '36px', background: '#10b981', color: '#fff' }}
              >
                <CheckCircle2 size={20} />
              </div>
              <div style={{ fontSize: '12.5px' }}>
                <b className="text-success d-block mb-0.5">dwstore.lk Domain Verified on Resend</b>
                <span className="text-muted">
                  DKIM &amp; SPF verified in Tokyo (ap-northeast-1). You can send live transactional emails from <b>orders@dwstore.lk</b>.
                </span>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Resend API Key */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12.5px', fontWeight: 600 }}>
                  Resend API Key (re_...) *
                </label>
                <div className="position-relative">
                  <input
                    type={showResendKey ? 'text' : 'password'}
                    placeholder="re_123456789_abcdef..."
                    className="w-100 p-2 rounded-2"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: '13px',
                      paddingRight: '40px',
                    }}
                    value={emailConfig.resendApiKey}
                    onChange={(e) => setEmailConfig({ ...emailConfig, resendApiKey: e.target.value })}
                  />
                  <button
                    type="button"
                    className="position-absolute top-50 end-0 translate-middle-y me-2 p-1 border-0 bg-transparent text-muted"
                    onClick={() => setShowResendKey(!showResendKey)}
                  >
                    {showResendKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <small className="text-muted d-block mt-1">
                  Get your free API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary">resend.com/api-keys</a> (3,000 free emails/month).
                </small>
              </div>

              {/* Sender Email */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12.5px', fontWeight: 600 }}>
                  Sender Display Name &amp; Email
                </label>
                <input
                  type="text"
                  placeholder="DWstore.lk <orders@dwstore.lk>"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px' }}
                  value={emailConfig.fromEmail}
                  onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                />
                <small className="text-muted d-block mt-1">
                  Must use your verified domain address (e.g. <code>DWstore.lk &lt;orders@dwstore.lk&gt;</code>).
                </small>
              </div>

              {/* Admin Notification Email */}
              <div>
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12.5px', fontWeight: 600 }}>
                  Admin Notification Email
                </label>
                <input
                  type="email"
                  placeholder="support@dwstore.lk"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px' }}
                  value={emailConfig.adminEmail}
                  onChange={(e) => setEmailConfig({ ...emailConfig, adminEmail: e.target.value })}
                />
                <small className="text-muted d-block mt-1">
                  Receives an immediate notification with full customer &amp; item details whenever an order is placed.
                </small>
              </div>

              {/* Notification Toggles */}
              <div className="p-3 rounded-2 border border-border" style={{ background: 'var(--hover)' }}>
                <b className="d-block mb-2" style={{ fontSize: '13px' }}>Automatic Email Triggers:</b>
                <div className="d-flex flex-column gap-2" style={{ fontSize: '13px' }}>
                  <label className="d-flex align-items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailConfig.customerEmailNotifications}
                      onChange={(e) => setEmailConfig({ ...emailConfig, customerEmailNotifications: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Send instant Order Confirmation receipt to Customer</span>
                  </label>
                  <label className="d-flex align-items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailConfig.adminEmailNotifications}
                      onChange={(e) => setEmailConfig({ ...emailConfig, adminEmailNotifications: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Send instant New Order Alert to Admin</span>
                  </label>
                </div>
              </div>

              {/* Test Email Section */}
              <div className="p-3 rounded-2 border border-border" style={{ background: 'var(--hover)' }}>
                <b className="d-block mb-2" style={{ fontSize: '13px' }}>Dispatch Test Email:</b>
                <div className="d-flex gap-2">
                  <input
                    type="email"
                    placeholder="Recipient email (e.g. your personal email)"
                    className="flex-grow-1 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12.5px' }}
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-soft d-flex align-items-center gap-1.5"
                    disabled={isTestingEmail}
                    onClick={handleTestEmail}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Send size={14} className={isTestingEmail ? 'animate-spin' : ''} />
                    {isTestingEmail ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="d-flex justify-content-end gap-2 pt-2 border-top border-border">
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setEmailModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-dark-x d-flex align-items-center gap-2"
                  disabled={isSavingEmail}
                  onClick={handleSaveEmailConfig}
                >
                  <Save size={15} /> {isSavingEmail ? 'Saving...' : 'Save Email Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
