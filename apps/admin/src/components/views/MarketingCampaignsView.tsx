import React from 'react';
import { Megaphone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const MarketingCampaignsView: React.FC = () => {
  const campaigns = [
    {
      id: 'cmp-1',
      title: 'T900 Ultra 2 Weekend Flash Deal',
      channel: 'WhatsApp Broadcast',
      recipients: 1250,
      sentDate: '2026-10-25',
      status: 'Completed',
      conversionRate: '8.4%',
      revenueGenerated: 208950,
    },
    {
      id: 'cmp-2',
      title: 'Sony Soundbar Mega Restock Alert',
      channel: 'SMS Gateway',
      recipients: 840,
      sentDate: '2026-10-20',
      status: 'Completed',
      conversionRate: '4.2%',
      revenueGenerated: 478000,
    },
    {
      id: 'cmp-3',
      title: 'New Year Early Bird Smartwatch Catalog',
      channel: 'WhatsApp & Email',
      recipients: 3400,
      sentDate: 'Scheduled Nov 10',
      status: 'Draft',
      conversionRate: '-',
      revenueGenerated: 0,
    },
  ];

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Marketing & WhatsApp Campaigns</h1>
          <p>Send bulk promotional alerts, new arrival announcements, and seasonal discount broadcasts.</p>
        </div>
      </div>

      <div className="card-x">
        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>Channel</th>
                <th>Recipients</th>
                <th>Date</th>
                <th>Conversion</th>
                <th>Revenue Generated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>{c.title}</b>
                  </td>
                  <td>
                    <span className="badge-x s-Processing" style={{ fontSize: '11px' }}>
                      {c.channel}
                    </span>
                  </td>
                  <td>{c.recipients.toLocaleString()} buyers</td>
                  <td>{c.sentDate}</td>
                  <td>
                    <b>{c.conversionRate}</b>
                  </td>
                  <td>
                    <b className="text-primary">
                      {c.revenueGenerated > 0 ? `Rs. ${c.revenueGenerated.toLocaleString()}` : '-'}
                    </b>
                  </td>
                  <td>
                    <span
                      className={`badge-x ${c.status === 'Completed' ? 's-Delivered' : 's-Pending'}`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
