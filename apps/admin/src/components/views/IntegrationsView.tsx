import React, { useState } from 'react';
import { Plug, CheckCircle2, MessageCircle, CreditCard, Truck, BarChart2, Check } from 'lucide-react';

interface IntegrationsViewProps {
  showNotification: (msg: string) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ showNotification }) => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'wa',
      name: 'WhatsApp Business API',
      category: 'Communication',
      desc: 'Automatic order status messages, recovery offers, and one-click customer chats.',
      connected: true,
      icon: MessageCircle,
      color: '#25D366',
    },
    {
      id: 'payhere',
      name: 'PayHere Payment Gateway',
      category: 'Payment',
      desc: 'Accept Visa, MasterCard, Genie, FriMi, and eZ Cash payments securely in LKR.',
      connected: true,
      icon: CreditCard,
      color: '#0284c7',
    },
    {
      id: 'koko',
      name: 'Koko (Buy Now Pay Later)',
      category: 'Payment',
      desc: 'Offer 3 interest-free installments to boost conversion rate by up to 35%.',
      connected: true,
      icon: CreditCard,
      color: '#8b5cf6',
    },
    {
      id: 'koombiyo',
      name: 'Koombiyo Courier API',
      category: 'Logistics',
      desc: 'Direct islandwide waypoint booking, tracking sync, and COD payment reconciliation.',
      connected: true,
      icon: Truck,
      color: '#ea580c',
    },
    {
      id: 'meta',
      name: 'Meta (Facebook & Instagram) Pixel',
      category: 'Marketing',
      desc: 'Server-side Conversions API (CAPI) tracking for accurate ad attribution.',
      connected: true,
      icon: BarChart2,
      color: '#1877F2',
    },
    {
      id: 'ga4',
      name: 'Google Analytics 4 (GA4)',
      category: 'Analytics',
      desc: 'E-commerce event stream tracking (view_item, add_to_cart, purchase).',
      connected: true,
      icon: BarChart2,
      color: '#f59e0b',
    },
  ]);

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item
      )
    );
    showNotification('Integration status updated!');
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Connected Integrations & APIs</h1>
          <p>Seamlessly integrate local payment gateways, courier tracking, and WhatsApp automation.</p>
        </div>
      </div>

      <div className="row g-3">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="col-12 col-md-6 col-xl-4">
              <div className="card-x h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="thumb" style={{ background: 'var(--hover)', color: item.color }}>
                      <Icon size={22} />
                    </span>
                    <span
                      className={`badge-x ${item.connected ? 's-Delivered' : 's-Cancelled'}`}
                      style={{ fontSize: '11px' }}
                    >
                      {item.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <h5>{item.name}</h5>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-top" style={{ borderColor: 'var(--border)' }}>
                  <button
                    type="button"
                    className={`btn-soft w-100 justify-content-center ${item.connected ? 'text-danger' : ''}`}
                    onClick={() => toggleConnection(item.id)}
                  >
                    {item.connected ? 'Disconnect Service' : 'Connect & Authorize'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
