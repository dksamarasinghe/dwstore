import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Plus, Trash2, Mail, Shield } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Store Manager' | 'Order Dispatcher' | 'Customer Support';
  status: 'Active' | 'Invited';
}

export const TeamView: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 'tm-1', name: 'Dumidu Wickramarachchi', email: 'dumidu@dwstore.lk', role: 'Super Admin', status: 'Active' },
    { id: 'tm-2', name: 'Kasun Bandara', email: 'kasun@dwstore.lk', role: 'Store Manager', status: 'Active' },
    { id: 'tm-3', name: 'Sanduni Weerasinghe', email: 'sanduni@dwstore.lk', role: 'Customer Support', status: 'Active' },
    { id: 'tm-4', name: 'Ruwan Kumara', email: 'dispatch@dwstore.lk', role: 'Order Dispatcher', status: 'Active' },
  ]);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Team Members & Staff Roles</h1>
          <p>Control admin dashboard access and configure granular staff permissions.</p>
        </div>
      </div>

      <div className="card-x">
        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="cust">
                      <span className="mini-av" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                        {m.name.substring(0, 2).toUpperCase()}
                      </span>
                      <b>{m.name}</b>
                    </div>
                  </td>
                  <td>{m.email}</td>
                  <td>
                    <span className="badge-x s-Processing">{m.role}</span>
                  </td>
                  <td>
                    <small className="text-muted">
                      {m.role === 'Super Admin'
                        ? 'Full Access (All Modules)'
                        : m.role === 'Store Manager'
                        ? 'Products, Orders, Discounts'
                        : m.role === 'Order Dispatcher'
                        ? 'Orders, Shipments, Courier'
                        : 'Customer Support & Reviews'}
                    </small>
                  </td>
                  <td>
                    <span className="badge-x s-Delivered">{m.status}</span>
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
