import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Users,
  Eye,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
  Truck,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { OrderItem, ProductItem, ReviewItem, TabType } from '../../types';

interface DashboardViewProps {
  orders: OrderItem[];
  products: ProductItem[];
  reviews: ReviewItem[];
  setActiveTab: (tab: TabType) => void;
  setSelectedOrder: (order: OrderItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  products,
  reviews,
  setActiveTab,
  setSelectedOrder,
}) => {
  // Timeframe filter for KPI boxes
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'all' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-30');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Chart timeframe filter
  const [chartRange, setChartRange] = useState<'7days' | '30days' | 'year'>('7days');

  // Filter orders according to selected KPI timeframe
  const filteredKpiOrders = useMemo(() => {
    if (timeFilter === 'all') return orders;

    // Latest date in orders dataset is roughly late October 2026
    const latestOrderDate = orders.length > 0 && orders[0].createdAt
      ? new Date(orders[0].createdAt)
      : new Date('2026-10-22');

    if (timeFilter === 'day') {
      const targetStr = latestOrderDate.toISOString().slice(0, 10);
      return orders.filter((o) => o.createdAt && o.createdAt.startsWith(targetStr));
    }

    if (timeFilter === 'week') {
      const past7 = new Date(latestOrderDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orders.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d >= past7 && d <= latestOrderDate;
      });
    }

    if (timeFilter === 'month') {
      const past30 = new Date(latestOrderDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      return orders.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d >= past30 && d <= latestOrderDate;
      });
    }

    if (timeFilter === 'custom') {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59);
      return orders.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
    }

    return orders;
  }, [orders, timeFilter, customStartDate, customEndDate]);

  // Computed metrics for KPI cards
  const validKpiOrders = filteredKpiOrders.filter((o) => o?.status !== 'cancelled');
  const kpiGrossSales = validKpiOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const kpiCompletedOrders = filteredKpiOrders.filter(
    (o) => o?.status === 'delivered' || o?.status === 'completed'
  ).length;
  const kpiAvgOrderValue = Math.round(kpiGrossSales / Math.max(1, validKpiOrders.length));

  // Return & Warranty Financial Loss calculation dynamically filtered by timeFilter
  const returnedKpiOrders = useMemo(() => {
    return filteredKpiOrders.filter((o) => o?.status === 'returned' || Boolean(o?.returnRecord));
  }, [filteredKpiOrders]);

  const kpiTotalReturnLoss = useMemo(() => {
    return returnedKpiOrders.reduce((sum, o) => {
      if (o.returnRecord?.totalLoss !== undefined) return sum + o.returnRecord.totalLoss;
      return sum + (o.shippingCost || 400);
    }, 0);
  }, [returnedKpiOrders]);

  const kpiShippingLoss = useMemo(() => {
    return returnedKpiOrders.reduce((sum, o) => {
      return sum + (o.returnRecord?.shippingLoss ?? (o.shippingCost || 400));
    }, 0);
  }, [returnedKpiOrders]);

  const kpiProductLoss = useMemo(() => {
    return returnedKpiOrders.reduce((sum, o) => {
      return sum + (o.returnRecord?.productLoss || 0);
    }, 0);
  }, [returnedKpiOrders]);

  const kpiReturnCount = returnedKpiOrders.length;

  const kpiVisitors = useMemo(() => {
    if (timeFilter === 'day') return { live: '48 Live', note: '580 visits today' };
    if (timeFilter === 'week') return { live: '142 Active', note: '4,120 visits this week' };
    if (timeFilter === 'month') return { live: '468 Active', note: '18,940 visits this month' };
    if (timeFilter === 'custom') return { live: 'Custom Span', note: `${filteredKpiOrders.length * 16} est. visits` };
    return { live: '52 Live', note: 'Colombo, Kandy & Islandwide' };
  }, [timeFilter, filteredKpiOrders]);

  // Overall counts for fulfillment widget
  const allDeliveredCount = orders.filter((o) => o?.status === 'delivered' || o?.status === 'completed').length;
  const allPendingCount = orders.filter((o) => o?.status === 'pending' || o?.status === 'on-hold').length;
  const allProcessingCount = orders.filter((o) => o?.status === 'processing').length;

  // Chart data based on chartRange
  const chartBars = useMemo(() => {
    if (chartRange === '7days') {
      // Last 7 days
      const days = [
        { label: 'Mon', count: 12, sales: 58400 },
        { label: 'Tue', count: 18, sales: 86900 },
        { label: 'Wed', count: 15, sales: 72100 },
        { label: 'Thu', count: 24, sales: 114500 },
        { label: 'Fri', count: 32, sales: 156000 },
        { label: 'Sat', count: 46, sales: 224000 },
        { label: 'Sun', count: 38, sales: 182500 },
      ];
      const maxSales = Math.max(...days.map((d) => d.sales));
      return days.map((d) => ({
        ...d,
        heightPct: Math.round((d.sales / maxSales) * 100),
        amountText: `Rs. ${(d.sales / 1000).toFixed(0)}k`,
      }));
    }

    if (chartRange === '30days') {
      const weeks = [
        { label: 'Oct 1-5', count: 68, sales: 328000 },
        { label: 'Oct 6-10', count: 82, sales: 395000 },
        { label: 'Oct 11-15', count: 74, sales: 356000 },
        { label: 'Oct 16-20', count: 96, sales: 462000 },
        { label: 'Oct 21-25', count: 115, sales: 554000 },
        { label: 'Oct 26-30', count: 89, sales: 428000 },
      ];
      const maxSales = Math.max(...weeks.map((d) => d.sales));
      return weeks.map((w) => ({
        ...w,
        heightPct: Math.round((w.sales / maxSales) * 100),
        amountText: `Rs. ${(w.sales / 1000).toFixed(0)}k`,
      }));
    }

    // Year breakdown (12 months)
    const months = [
      { label: 'Jan', count: 45, sales: 215000 },
      { label: 'Feb', count: 58, sales: 278000 },
      { label: 'Mar', count: 72, sales: 345000 },
      { label: 'Apr', count: 88, sales: 420000 },
      { label: 'May', count: 96, sales: 460000 },
      { label: 'Jun', count: 84, sales: 402000 },
      { label: 'Jul', count: 104, sales: 498000 },
      { label: 'Aug', count: 118, sales: 566000 },
      { label: 'Sep', count: 135, sales: 648000 },
      { label: 'Oct', count: 142, sales: 682000 },
      { label: 'Nov', count: 110, sales: 528000 },
      { label: 'Dec', count: 154, sales: 740000 },
    ];
    const maxSales = Math.max(...months.map((d) => d.sales));
    return months.map((m) => ({
      ...m,
      heightPct: Math.round((m.sales / maxSales) * 100),
      amountText: `Rs. ${(m.sales / 1000).toFixed(0)}k`,
    }));
  }, [chartRange]);

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <h1 className="d-flex align-items-center gap-2">
            DWstore Executive Dashboard <Sparkles size={22} className="text-warning" />
          </h1>
          <p>Real-time analytics, revenue metrics & order fulfillment for DWstore.lk (1,041 Real Orders)</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn-soft"
            onClick={() => setActiveTab('analytics')}
            type="button"
          >
            <TrendingUp size={16} /> Store Analytics
          </button>
          <button
            className="btn-dark-x"
            onClick={() => setActiveTab('add-product')}
            type="button"
          >
            <Package size={16} /> + Add Product
          </button>
        </div>
      </div>

      {/* Timeframe Filter Control Bar for KPI Cards */}
      <div className="card-x mb-4 p-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <b style={{ fontSize: '13px' }}>Filter Metrics By Period:</b>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="seg">
              <button
                type="button"
                className={timeFilter === 'day' ? 'on' : ''}
                onClick={() => {
                  setTimeFilter('day');
                  setShowCustomPicker(false);
                }}
              >
                Today (Day)
              </button>
              <button
                type="button"
                className={timeFilter === 'week' ? 'on' : ''}
                onClick={() => {
                  setTimeFilter('week');
                  setShowCustomPicker(false);
                }}
              >
                This Week
              </button>
              <button
                type="button"
                className={timeFilter === 'month' ? 'on' : ''}
                onClick={() => {
                  setTimeFilter('month');
                  setShowCustomPicker(false);
                }}
              >
                This Month
              </button>
              <button
                type="button"
                className={timeFilter === 'all' ? 'on' : ''}
                onClick={() => {
                  setTimeFilter('all');
                  setShowCustomPicker(false);
                }}
              >
                All-Time (1,041 Orders)
              </button>
              <button
                type="button"
                className={timeFilter === 'custom' ? 'on' : ''}
                onClick={() => {
                  setTimeFilter('custom');
                  setShowCustomPicker(!showCustomPicker);
                }}
              >
                Custom Date...
              </button>
            </div>
          </div>
        </div>

        {/* Custom Date Inputs Dropdown/Row */}
        {(timeFilter === 'custom' || showCustomPicker) && (
          <div className="d-flex flex-wrap align-items-center gap-3 pt-3 mt-3 border-top" style={{ borderColor: 'var(--border)' }}>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '13px' }}>From:</span>
              <input
                type="date"
                className="p-1 px-2 rounded-2"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px' }}
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setTimeFilter('custom');
                }}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '13px' }}>To:</span>
              <input
                type="date"
                className="p-1 px-2 rounded-2"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px' }}
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setTimeFilter('custom');
                }}
              />
            </div>
            <small className="text-muted">
              Filtering <b>{filteredKpiOrders.length}</b> orders between {customStartDate} and {customEndDate}
            </small>
          </div>
        )}
      </div>

      {/* 4 Khamba KPI Cards (k1, k2, k3, k4) dynamically filtered */}
      <section className="row g-3 mb-4">
        {/* KPI 1 */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="kpi k1">
            <div className="lbl">
              <span>Gross Sales (LKR)</span>
              <span className="ico text-amber-700">
                <CreditCard size={18} />
              </span>
            </div>
            <div className="val">Rs. {kpiGrossSales.toLocaleString()}</div>
            <div className="foot">
              <span className="chg up">
                <ArrowUpRight size={14} /> {filteredKpiOrders.length} Orders
              </span>
              <span className="text-capitalize">{timeFilter} period</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="kpi k2">
            <div className="lbl">
              <span>Completed Orders</span>
              <span className="ico text-emerald-700">
                <ShoppingBag size={18} />
              </span>
            </div>
            <div className="val">{kpiCompletedOrders.toLocaleString()}</div>
            <div className="foot">
              <span className="chg up">
                <ArrowUpRight size={14} /> {filteredKpiOrders.length - kpiCompletedOrders} pending
              </span>
              <span>
                {Math.round((kpiCompletedOrders / Math.max(1, filteredKpiOrders.length)) * 100)}% Fulfilled
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="kpi k3">
            <div className="lbl">
              <span>Average Order Value</span>
              <span className="ico text-indigo-700">
                <TrendingUp size={18} />
              </span>
            </div>
            <div className="val">Rs. {kpiAvgOrderValue.toLocaleString()}</div>
            <div className="foot">
              <span className="chg up">
                <ArrowUpRight size={14} /> Basket Size
              </span>
              <span>Per customer</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="kpi k4">
            <div className="lbl">
              <span>Live Visitors</span>
              <span className="ico text-fuchsia-700">
                <Users size={18} />
              </span>
            </div>
            <div className="val">{kpiVisitors.live}</div>
            <div className="foot">
              <span className="chg up" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                ● Active
              </span>
              <span>{kpiVisitors.note}</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Return & Warranty Loss Card */}
        <div className="col-12 col-sm-6 col-xl">
          <div
            className="kpi"
            style={{
              background: 'var(--card)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              cursor: 'pointer',
              borderRadius: '12px',
            }}
            onClick={() => setActiveTab('returns')}
            title="Click to view all warranty claims & return losses"
          >
            <div className="lbl">
              <span className="text-danger fw-bold">Return & Warranty Loss</span>
              <span
                className="ico text-danger"
                style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}
              >
                <RotateCcw size={18} />
              </span>
            </div>
            <div className="val text-danger">Rs. {kpiTotalReturnLoss.toLocaleString()}</div>
            <div className="foot">
              <span
                className="chg down"
                style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}
              >
                <ArrowDownRight size={14} /> {kpiReturnCount} Claims
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {timeFilter} period
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Revenue Trend & Quick Fulfillment */}
      <div className="row g-3 mb-4">
        {/* Left Column: Revenue / Sales Overview Card */}
        <div className="col-12 col-xl-8">
          <div className="card-x h-100">
            <div className="card-head">
              <div>
                <h5>Weekly Sales & Order Flow</h5>
                <small className="text-muted">
                  Interactive flow breakdown for {chartRange === '7days' ? 'Last 7 Days' : chartRange === '30days' ? 'Last 30 Days' : 'Full Year 2026'}
                </small>
              </div>
              <div className="seg">
                <button
                  className={chartRange === '7days' ? 'on' : ''}
                  onClick={() => setChartRange('7days')}
                  type="button"
                >
                  7 Days
                </button>
                <button
                  className={chartRange === '30days' ? 'on' : ''}
                  onClick={() => setChartRange('30days')}
                  type="button"
                >
                  30 Days
                </button>
                <button
                  className={chartRange === 'year' ? 'on' : ''}
                  onClick={() => setChartRange('year')}
                  type="button"
                >
                  Year
                </button>
              </div>
            </div>

            {/* Custom Interactive Visual Bar Chart with dynamic heights */}
            <div style={{ padding: '16px 0 24px' }}>
              <div className="d-flex align-items-end justify-content-between gap-2" style={{ height: '210px' }}>
                {chartBars.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-grow-1 d-flex flex-column align-items-center gap-2 group"
                    style={{ position: 'relative' }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                      {item.amountText}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: chartRange === 'year' ? '28px' : '48px',
                        height: `${Math.max(16, (item.heightPct / 100) * 155)}px`,
                        background:
                          idx === chartBars.length - 2 || idx === chartBars.length - 1
                            ? 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)'
                            : 'var(--hover)',
                        borderRadius: '8px 8px 4px 4px',
                        transition: 'all 0.3s ease-in-out',
                        border: idx >= chartBars.length - 2 ? '1px solid #818cf8' : '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                      title={`${item.label}: ${item.count} orders (${item.amountText})`}
                    />
                    <span style={{ fontSize: chartRange === 'year' ? '11px' : '12px', fontWeight: 600, color: 'var(--text)' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary metrics row inside card */}
            <div className="row g-2 pt-3 border-top" style={{ borderColor: 'var(--border)' }}>
              <div className="col-4">
                <small className="text-muted d-block">Cash on Delivery (COD)</small>
                <b className="fs-6">62% of Orders</b>
              </div>
              <div className="col-4">
                <small className="text-muted d-block">Koko / Mintpay BNPL</small>
                <b className="fs-6">26% of Orders</b>
              </div>
              <div className="col-4">
                <small className="text-muted d-block">Online Card / Bank</small>
                <b className="fs-6">12% of Orders</b>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fulfillment & Store Health */}
        <div className="col-12 col-xl-4">
          <div className="card-x h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="card-head">
                <h5>Fulfillment Pipeline</h5>
                <button
                  className="link-x border-0 bg-transparent"
                  onClick={() => setActiveTab('orders')}
                  type="button"
                >
                  Manage Orders ({orders.length})
                </button>
              </div>

              <div className="d-flex flex-column gap-3 mb-3">
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--hover)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <span className="mini-av" style={{ background: '#fef3c7', color: '#b45309' }}>
                      <Clock size={16} />
                    </span>
                    <div>
                      <b>Pending Confirmation</b>
                      <small className="d-block text-muted">{allPendingCount} orders pending call</small>
                    </div>
                  </div>
                  <span className="badge-x s-Pending">{allPendingCount}</span>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--hover)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <span className="mini-av" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                      <Truck size={16} />
                    </span>
                    <div>
                      <b>Packing & Dispatch</b>
                      <small className="d-block text-muted">{allProcessingCount} ready for courier</small>
                    </div>
                  </div>
                  <span className="badge-x s-Processing">{allProcessingCount}</span>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--hover)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <span className="mini-av" style={{ background: '#d1fae5', color: '#047857' }}>
                      <CheckCircle2 size={16} />
                    </span>
                    <div>
                      <b>Delivered / Completed</b>
                      <small className="d-block text-muted">{allDeliveredCount.toLocaleString()} orders fulfilled</small>
                    </div>
                  </div>
                  <span className="badge-x s-Delivered">{allDeliveredCount}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-3 mt-auto" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted d-block">Customer Satisfaction</small>
                  <b className="fs-5">4.9 / 5.0</b>
                </div>
                <div className="d-flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
              <small className="text-muted d-block mt-1">Based on 112+ verified Google reviews (Borella / Pannipitiya)</small>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Selling Products */}
      <div className="row g-3">
        {/* Recent Orders Table */}
        <div className="col-12 col-xl-8">
          <div className="card-x">
            <div className="card-head">
              <div>
                <h5>Recent Customer Orders</h5>
                <small className="text-muted">Live synced orders with WhatsApp contact</small>
              </div>
              <button
                className="link-x border-0 bg-transparent"
                onClick={() => setActiveTab('orders')}
                type="button"
              >
                View all {orders.length} orders →
              </button>
            </div>

            <div className="table-responsive">
              <table className="table-x">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => {
                    const status = (order?.status || 'pending').toLowerCase();
                    const statusClass =
                      status === 'delivered' || status === 'completed'
                        ? 's-Delivered'
                        : status === 'shipped'
                        ? 's-Shipped'
                        : status === 'processing' || status === 'pending'
                        ? 's-Processing'
                        : 's-Cancelled';

                    const customerName = order?.customerName || 'Customer';
                    const customerPhone = order?.customerPhone || '';
                    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
                    const totalVal = order?.total || 0;

                    return (
                      <tr key={order?.orderId || Math.random()}>
                        <td>
                          <button
                            type="button"
                            className="oid border-0 bg-transparent p-0 text-start"
                            onClick={() => {
                              setSelectedOrder(order);
                              setActiveTab('orders');
                            }}
                          >
                            <b>#{order?.orderId}</b>
                          </button>
                          <small className="d-block text-muted">{order?.createdAt}</small>
                        </td>
                        <td>
                          <div className="cust">
                            <span className="mini-av" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                              {customerName.substring(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <b>{customerName}</b>
                              <small className="d-block text-muted">{order?.city || 'Sri Lanka'}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <b>Rs. {totalVal.toLocaleString()}</b>
                          <small className="d-block text-muted">{order?.items?.length || 1} items</small>
                        </td>
                        <td>
                          <span className={`badge-x ${order?.paymentStatus === 'Paid' ? 's-Paid' : 's-Unpaid'}`}>
                            {order?.paymentStatus || 'Unpaid'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-x ${statusClass}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                  `Hello ${customerName}, this is DWstore.lk regarding your order #${order?.orderId}.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="icon-btn"
                                style={{ width: '32px', height: '32px', color: '#25D366' }}
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={15} />
                              </a>
                            )}
                            <button
                              type="button"
                              className="icon-btn"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => {
                                setSelectedOrder(order);
                                setActiveTab('orders');
                              }}
                              title="View Order Details"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="col-12 col-xl-4">
          <div className="card-x">
            <div className="card-head">
              <div>
                <h5>Top Selling Gadgets</h5>
                <small className="text-muted">High demand products from catalog</small>
              </div>
              <button
                className="link-x border-0 bg-transparent"
                onClick={() => setActiveTab('products')}
                type="button"
              >
                All {products.length} products →
              </button>
            </div>

            <div className="d-flex flex-column gap-2">
              {products.slice(0, 5).map((p) => (
                <div key={p.id} className="row-item">
                  <span
                    className="thumb"
                    style={{
                      background: 'var(--hover)',
                      color: 'var(--text)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package size={20} />
                    )}
                  </span>
                  <div className="meta" style={{ maxWidth: '200px' }}>
                    <b className="text-truncate d-block" title={p.name}>{p.name}</b>
                    <small className="text-muted">{p.category} • SKU {p.sku}</small>
                  </div>
                  <div className="end">
                    <b>Rs. {p.salePrice.toLocaleString()}</b>
                    <small className="text-success">{p.salesCount || 12} sold</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-3 border-top text-center" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                className="btn-soft w-100 justify-content-center"
                onClick={() => setActiveTab('inventory')}
              >
                <Layers size={16} /> Check Inventory Levels ({products.length} Items)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
