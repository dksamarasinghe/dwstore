import React, { useState, useMemo } from 'react';
import { Warehouse, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Search, Package } from 'lucide-react';
import { ProductItem } from '../../types';

interface InventoryViewProps {
  products: ProductItem[];
  onUpdateStock: (productId: string, newStock: number) => void;
  showNotification: (msg: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onUpdateStock,
  showNotification,
}) => {
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const lowStockItems = products.filter((p) => p.stock > 0 && p.stock <= 10);
  const outOfStockItems = products.filter((p) => p.stock === 0);
  const inStockItems = products.filter((p) => p.stock > 0);
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock || 0) * (p.salePrice || 0), 0);

  // Unique categories
  const categoryList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  const displayed = useMemo(() => {
    return products.filter((p) => {
      if (filter === 'low' && (p.stock === 0 || p.stock > 10)) return false;
      if (filter === 'out' && p.stock > 0) return false;

      const s = searchTerm.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s);
      const matchesCat = !categoryFilter || p.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [products, filter, searchTerm, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(displayed.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayed.slice(start, start + pageSize);
  }, [displayed, currentPage]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Inventory & Warehouse Valuation</h1>
          <p>Real-time inventory levels, stock quantities in Pannipitiya / Borella Hub, and LKR valuation.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#eef2fd', color: '#4f46e5' }}>
              <Warehouse size={20} />
            </span>
            <div>
              <small>Total Units in Stock</small>
              <b>{totalStockUnits.toLocaleString()} units</b>
              <span className="ms-note up">{inStockItems.length} active SKUs</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#ecf6ef', color: '#059669' }}>
              <CheckCircle2 size={20} />
            </span>
            <div>
              <small>Stock Valuation</small>
              <b>Rs. {totalInventoryValue.toLocaleString()}</b>
              <span className="ms-note up">Real retail value</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#fdf3ea', color: '#d97706' }}>
              <AlertTriangle size={20} />
            </span>
            <div>
              <small>Low Stock (&lt;10)</small>
              <b>{lowStockItems.length} items</b>
              <span className="ms-note down">Needs reorder</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#f6eff6', color: '#9333ea' }}>
              <Package size={20} />
            </span>
            <div>
              <small>Out of Stock</small>
              <b>{outOfStockItems.length} items</b>
              <span className="ms-note down">Unavailable</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table Card */}
      <div className="card-x">
        <div className="tabs">
          <button
            className={filter === 'all' ? 'on' : ''}
            onClick={() => {
              setFilter('all');
              setCurrentPage(1);
            }}
          >
            All Inventory <em>{products.length}</em>
          </button>
          <button
            className={filter === 'low' ? 'on' : ''}
            onClick={() => {
              setFilter('low');
              setCurrentPage(1);
            }}
          >
            Low Stock <em>{lowStockItems.length}</em>
          </button>
          <button
            className={filter === 'out' ? 'on' : ''}
            onClick={() => {
              setFilter('out');
              setCurrentPage(1);
            }}
          >
            Out of Stock <em>{outOfStockItems.length}</em>
          </button>
        </div>

        {/* Filter controls */}
        <div className="ord-filters">
          <div className="search flex-grow-1">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search inventory by title or SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="sel-x"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories ({categoryList.length})</option>
            {categoryList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Price (LKR)</th>
                <th>Stock Quantity</th>
                <th>Status</th>
                <th>Quick Restock</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No items match the selected filter.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const stockPercent = Math.min(100, Math.max(0, (p.stock / 50) * 100));
                  const barColor = p.stock > 10 ? '#10b981' : p.stock > 0 ? '#f59e0b' : '#ef4444';
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ maxWidth: '340px' }}>
                          <b className="d-block text-truncate">{p.name}</b>
                          <small className="text-muted">SKU: {p.sku}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge-x s-Processing" style={{ fontSize: '11px' }}>
                          {p.category}
                        </span>
                      </td>
                      <td>
                        <b>Rs. {p.salePrice.toLocaleString()}</b>
                      </td>
                      <td>
                        <div className="bar" style={{ width: '80px' }}>
                          <i style={{ width: `${stockPercent}%`, background: barColor }} />
                        </div>
                        <b>{p.stock} units</b>
                      </td>
                      <td>
                        <span
                          className={`badge-x ${
                            p.stock > 10 ? 's-Delivered' : p.stock > 0 ? 's-Low' : 's-Cancelled'
                          }`}
                        >
                          {p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn-reorder"
                            onClick={() => {
                              onUpdateStock(p.id, p.stock + 10);
                              showNotification(`Added +10 units to ${p.name.slice(0, 20)}...`);
                            }}
                          >
                            +10 Units
                          </button>
                          <button
                            type="button"
                            className="btn-reorder"
                            onClick={() => {
                              onUpdateStock(p.id, p.stock + 50);
                              showNotification(`Added +50 units to ${p.name.slice(0, 20)}...`);
                            }}
                          >
                            +50 Units
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top" style={{ borderColor: 'var(--border)' }}>
          <small className="text-muted">
            Showing <b>{(currentPage - 1) * pageSize + 1}</b> -{' '}
            <b>{Math.min(currentPage * pageSize, displayed.length)}</b> of <b>{displayed.length}</b> items
          </small>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn-soft"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ height: '34px', padding: '0 10px' }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-soft"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{ height: '34px', padding: '0 10px' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
