import React, { useState, useMemo } from 'react';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Save,
  X,
  Zap
} from 'lucide-react';
import { BrandItem, ProductItem, TabType } from '../../types';
import { CSVImportModal } from '../common/CSVImportModal';
import { downloadCSV } from '../../utils/csv';
import { resolveImageUrl } from '../../utils/image';

interface ProductsViewProps {
  products: ProductItem[];
  brands?: BrandItem[];
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (product: ProductItem) => void;
  onImportProducts?: (importedProducts: ProductItem[]) => void;
  onStartEditProduct?: (product: ProductItem) => void;
  onOpenAddProduct?: () => void;
  setActiveTab: (tab: TabType) => void;
  showNotification: (msg: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  brands = [],
  onDeleteProduct,
  onUpdateProduct,
  onImportProducts,
  onStartEditProduct,
  onOpenAddProduct,
  setActiveTab,
  showNotification,
}) => {
  const [activeTabFilter, setActiveTabFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [sortOption, setSortOption] = useState('new');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectProduct, setInspectProduct] = useState<ProductItem | null>(null);
  const [quickEditProduct, setQuickEditProduct] = useState<ProductItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Unique categories list from products
  const categoryList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Unique brands list
  const brandList = useMemo(() => {
    const set = new Set<string>();
    if (brands && brands.length > 0) {
      brands.forEach((b) => set.add(b.name));
    }
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [products, brands]);

  // Counts
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === 'Active').length;
  const lowStockCount = products.filter((p) => p.status === 'Low stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'Out of stock').length;

  // Filter & sort
  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesTab =
        activeTabFilter === 'all' || p.status.toLowerCase() === activeTabFilter.toLowerCase();
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s);
      const matchesCat = !categoryFilter || p.category === categoryFilter;
      const matchesBrand = !brandFilter || p.brand.toLowerCase() === brandFilter.toLowerCase();
      return matchesTab && matchesSearch && matchesCat && matchesBrand;
    });

    if (sortOption === 'high') {
      result = [...result].sort((a, b) => b.salePrice - a.salePrice);
    } else if (sortOption === 'low') {
      result = [...result].sort((a, b) => a.salePrice - b.salePrice);
    } else if (sortOption === 'stock') {
      result = [...result].sort((a, b) => a.stock - b.stock);
    }

    return result;
  }, [products, activeTabFilter, searchTerm, categoryFilter, brandFilter, sortOption]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'SKU', 'Title', 'Brand', 'Category', 'Regular Price (LKR)', 'Sale Price (LKR)', 'Stock', 'Status'];
    const rows = filtered.map((p) => [
      p.id,
      p.sku,
      p.name,
      p.brand,
      p.category,
      p.regularPrice,
      p.salePrice,
      p.stock,
      p.status,
    ]);
    downloadCSV(`dwstore-products-catalog-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showNotification('Product catalog exported to CSV successfully!');
  };

  const handleImportCSVData = (rows: string[][], headers: string[]) => {
    const lowerHeaders = headers.map((h) => h.trim().toLowerCase());
    const idIdx = lowerHeaders.findIndex((h) => h === 'id');
    const skuIdx = lowerHeaders.findIndex((h) => h === 'sku');
    const nameIdx = lowerHeaders.findIndex((h) => h.includes('title') || h.includes('name'));
    const brandIdx = lowerHeaders.findIndex((h) => h.includes('brand'));
    const catIdx = lowerHeaders.findIndex((h) => h.includes('category'));
    const regPriceIdx = lowerHeaders.findIndex((h) => h.includes('regular'));
    const salePriceIdx = lowerHeaders.findIndex((h) => h.includes('sale') || (h.includes('price') && !h.includes('regular')));
    const stockIdx = lowerHeaders.findIndex((h) => h.includes('stock'));
    const statusIdx = lowerHeaders.findIndex((h) => h.includes('status'));

    const imported: ProductItem[] = [];
    rows.forEach((row, idx) => {
      const name = nameIdx >= 0 && row[nameIdx] ? row[nameIdx].trim() : '';
      if (!name) return; // skip rows without name
      const id = idIdx >= 0 && row[idIdx]?.trim() ? row[idIdx].trim() : `prod-${Date.now()}-${idx}`;
      const sku = skuIdx >= 0 && row[skuIdx]?.trim() ? row[skuIdx].trim() : `SKU-${Date.now().toString().slice(-4)}-${idx}`;
      const brand = brandIdx >= 0 && row[brandIdx]?.trim() ? row[brandIdx].trim() : 'DWstore';
      const category = catIdx >= 0 && row[catIdx]?.trim() ? row[catIdx].trim() : 'General';
      const regPrice = regPriceIdx >= 0 ? parseFloat(row[regPriceIdx]?.replace(/[^0-9.]/g, '') || '0') || 0 : 0;
      const salePrice = salePriceIdx >= 0 ? parseFloat(row[salePriceIdx]?.replace(/[^0-9.]/g, '') || '0') || regPrice : regPrice;
      const stock = stockIdx >= 0 ? parseInt(row[stockIdx]?.replace(/[^0-9]/g, '') || '0', 10) : 10;
      const rawStatus = statusIdx >= 0 && row[statusIdx] ? row[statusIdx].trim() : '';
      const status: 'Active' | 'Low stock' | 'Out of stock' | 'Draft' =
        ['Active', 'Low stock', 'Out of stock', 'Draft'].includes(rawStatus)
          ? (rawStatus as any)
          : stock > 0
          ? 'Active'
          : 'Out of stock';

      const existing = products.find((p) => p.id === id || p.sku.toLowerCase() === sku.toLowerCase());
      imported.push({
        id,
        name,
        sku,
        brand,
        category,
        productType: existing?.productType || 'simple',
        regularPrice: regPrice > 0 ? regPrice : salePrice,
        salePrice,
        stock,
        status,
        salesCount: existing?.salesCount || 0,
        image: existing?.image || existing?.displayImage || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
        displayImage: existing?.displayImage || existing?.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
        rating: existing?.rating ?? 5.0,
        warrantyPeriod: existing?.warrantyPeriod || '6 Months Warranty',
        variations: existing?.variations,
        attributes: existing?.attributes,
      });
    });

    if (imported.length === 0) {
      throw new Error('No valid products found in CSV. Please verify column headers.');
    }

    if (onImportProducts) {
      onImportProducts(imported);
    }
  };

  return (
    <div className="content">
      {/* Page Head */}
      <div className="page-head">
        <div>
          <h1>Products Catalog ({totalCount} items)</h1>
          <p>Real-time WooCommerce product catalog with prices in LKR, stock levels, and SKUs.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-soft d-flex align-items-center gap-1.5" onClick={handleExportCSV} type="button">
            <Download size={16} /> Export CSV
          </button>
          <button
            className="btn-soft d-flex align-items-center gap-1.5"
            onClick={() => setIsImportModalOpen(true)}
            type="button"
          >
            <Upload size={16} /> Import CSV
          </button>
          <button
            className="btn-dark-x"
            onClick={() => (onOpenAddProduct ? onOpenAddProduct() : setActiveTab('add-product'))}
            type="button"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Metric summary cards */}
      <section className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#eef2fd', color: '#4f46e5' }}>
              <Package size={20} />
            </span>
            <div>
              <small>Total products</small>
              <b>{totalCount}</b>
              <span className="ms-note up">WooCommerce CSV</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#ecf6ef', color: '#059669' }}>
              <CheckCircle2 size={20} />
            </span>
            <div>
              <small>In Stock (Active)</small>
              <b>{activeCount}</b>
              <span className="ms-note up">Available to order</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#fdf3ea', color: '#d97706' }}>
              <AlertTriangle size={20} />
            </span>
            <div>
              <small>Low stock (&lt;10)</small>
              <b>{lowStockCount}</b>
              <span className="ms-note down">Needs restock</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#f6eff6', color: '#9333ea' }}>
              <XCircle size={20} />
            </span>
            <div>
              <small>Out of stock</small>
              <b>{outOfStockCount}</b>
              <span className="ms-note down">Archived in store</span>
            </div>
          </div>
        </div>
      </section>

      {/* Card with filter tabs & table */}
      <div className="card-x">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={activeTabFilter === 'all' ? 'on' : ''}
            onClick={() => {
              setActiveTabFilter('all');
              setCurrentPage(1);
            }}
            type="button"
          >
            All <em>{totalCount}</em>
          </button>
          <button
            className={activeTabFilter === 'active' ? 'on' : ''}
            onClick={() => {
              setActiveTabFilter('active');
              setCurrentPage(1);
            }}
            type="button"
          >
            In Stock <em>{activeCount}</em>
          </button>
          <button
            className={activeTabFilter === 'low stock' ? 'on' : ''}
            onClick={() => {
              setActiveTabFilter('low stock');
              setCurrentPage(1);
            }}
            type="button"
          >
            Low Stock <em>{lowStockCount}</em>
          </button>
          <button
            className={activeTabFilter === 'out of stock' ? 'on' : ''}
            onClick={() => {
              setActiveTabFilter('out of stock');
              setCurrentPage(1);
            }}
            type="button"
          >
            Out of Stock <em>{outOfStockCount}</em>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="ord-filters">
          <div className="search flex-grow-1">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by title, SKU, brand, or category..."
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
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            className="sel-x"
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Brands ({brandList.length})</option>
            {brandList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            className="sel-x"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="new">Default Order</option>
            <option value="high">Price: High to Low</option>
            <option value="low">Price: Low to High</option>
            <option value="stock">Stock: Low to High</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bulk-bar" style={{ display: 'flex' }}>
            <b>{selectedIds.length} products selected</b>
            <button
              className="btn-soft text-danger"
              type="button"
              onClick={() => {
                selectedIds.forEach((id) => onDeleteProduct(id));
                setSelectedIds([]);
              }}
            >
              <Trash2 size={15} /> Delete Selected
            </button>
            <button
              className="btn-soft"
              type="button"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Table */}
        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr>
                <th style={{ width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>Price (LKR)</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Sales</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const statusClass =
                    prod.status === 'Active'
                      ? 's-Delivered'
                      : prod.status === 'Low stock'
                      ? 's-Low'
                      : prod.status === 'Out of stock'
                      ? 's-Cancelled'
                      : 's-Pending';

                  const stockPercent = Math.min(100, Math.max(0, (prod.stock / 50) * 100));
                  const barColor =
                    prod.stock > 10 ? '#10b981' : prod.stock > 0 ? '#f59e0b' : '#ef4444';

                  return (
                    <tr key={prod.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(prod.id)}
                          onChange={() => handleToggleSelect(prod.id)}
                        />
                      </td>
                      <td>
                        <div className="cust">
                          <span
                            className="thumb"
                            style={{
                              background: 'var(--hover)',
                              color: 'var(--text)',
                              overflow: 'hidden',
                              position: 'relative',
                            }}
                          >
                            {prod.image ? (
                              <img
                                src={resolveImageUrl(prod.image)}
                                alt={prod.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package size={20} />
                            )}
                          </span>
                          <div style={{ maxWidth: '320px' }}>
                            <button
                              type="button"
                              className="oid border-0 bg-transparent p-0 text-start text-truncate d-block w-100"
                              onClick={() => setInspectProduct(prod)}
                              title={prod.name}
                            >
                              <b>{prod.name}</b>
                            </button>
                            <small className="d-block text-muted">
                              SKU: {prod.sku} • {prod.brand || 'DWstore'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-x s-Processing" style={{ fontSize: '11px' }}>
                          {prod.category}
                        </span>
                      </td>
                      <td>
                        <b>Rs. {prod.salePrice.toLocaleString()}</b>
                        {prod.regularPrice > prod.salePrice && (
                          <small className="d-block text-muted text-decoration-line-through">
                            Rs. {prod.regularPrice.toLocaleString()}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="bar" style={{ width: '80px' }}>
                          <i style={{ width: `${stockPercent}%`, background: barColor }} />
                        </div>
                        <small className="d-block text-muted">{prod.stock} units</small>
                      </td>
                      <td>
                        <span className={`badge-x ${statusClass}`}>{prod.status}</span>
                      </td>
                      <td>
                        <b>{prod.salesCount}</b>
                        <small className="d-block text-muted">units</small>
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            type="button"
                            className="icon-btn text-primary"
                            style={{ width: '34px', height: '34px' }}
                            onClick={() => {
                              if (onStartEditProduct) {
                                onStartEditProduct(prod);
                              } else {
                                setActiveTab('add-product');
                              }
                            }}
                            title="Full Edit (All fields, variations, shipping)"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn text-warning"
                            style={{ width: '34px', height: '34px' }}
                            onClick={() => setQuickEditProduct(prod)}
                            title="Quick Edit (Price & Stock popup)"
                          >
                            <Zap size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ width: '34px', height: '34px' }}
                            onClick={() => setInspectProduct(prod)}
                            title="View Product Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn text-danger"
                            style={{ width: '34px', height: '34px' }}
                            onClick={() => onDeleteProduct(prod.id)}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
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
            <b>{Math.min(currentPage * pageSize, filtered.length)}</b> of <b>{filtered.length}</b> products
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

      {/* Quick Edit Product Modal */}
      {quickEditProduct && (
        <div className="react-modal-backdrop" onClick={() => setQuickEditProduct(null)}>
          <div
            className="card-x"
            style={{ width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h4 className="m-0 d-flex align-items-center gap-2">
                  <Zap size={18} className="text-warning" /> Quick Edit: Price & Stock
                </h4>
                <small className="text-muted">SKU: {quickEditProduct.sku || 'N/A'} | ID: {quickEditProduct.id}</small>
              </div>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
                onClick={() => setQuickEditProduct(null)}
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const regP = parseFloat(quickEditProduct.regularPrice as any) || 0;
                const enteredSale = parseFloat(quickEditProduct.salePrice as any) || 0;
                const finalSale = enteredSale > 0 ? enteredSale : regP;
                const updated = {
                  ...quickEditProduct,
                  regularPrice: regP,
                  salePrice: finalSale,
                };
                onUpdateProduct(updated);
                setQuickEditProduct(null);
                showNotification(`Quick changes saved for ${quickEditProduct.name.slice(0, 20)}...`);
              }}
              className="py-3"
            >
              {/* Switch to Full Editor Link */}
              <div className="d-flex justify-content-between align-items-center p-2 rounded-2 mb-3" style={{ background: 'var(--hover)' }}>
                <small className="text-muted">Need to edit variations, descriptions, warranty or shipping?</small>
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 text-decoration-none fw-semibold"
                  style={{ fontSize: '12px' }}
                  onClick={() => {
                    if (onStartEditProduct) {
                      onStartEditProduct(quickEditProduct);
                    }
                    setQuickEditProduct(null);
                  }}
                >
                  Open Full Product Editor &rarr;
                </button>
              </div>

              {/* Product Title */}
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Product Title *
                </label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px' }}
                  value={quickEditProduct.name}
                  onChange={(e) => setQuickEditProduct({ ...quickEditProduct, name: e.target.value })}
                  required
                />
              </div>

              {/* Pricing Row */}
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Regular Price (LKR) *
                  </label>
                  <input
                    type="number"
                    className="w-100 p-2 rounded-2 fw-bold"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '15px' }}
                    value={quickEditProduct.regularPrice}
                    onChange={(e) =>
                      setQuickEditProduct({
                        ...quickEditProduct,
                        regularPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                  <small className="text-muted d-block mt-1">Standard customer selling price</small>
                </div>
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Sale / Promo Price (LKR)
                  </label>
                  <input
                    type="number"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px' }}
                    value={quickEditProduct.salePrice && quickEditProduct.salePrice < quickEditProduct.regularPrice ? quickEditProduct.salePrice : ''}
                    placeholder="Optional discount"
                    onChange={(e) =>
                      setQuickEditProduct({
                        ...quickEditProduct,
                        salePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <small className="text-muted d-block mt-1">If entered, regular price is crossed out</small>
                </div>
              </div>

              {/* Stock and Status Row */}
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Stock Units Available *
                  </label>
                  <input
                    type="number"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px' }}
                    value={quickEditProduct.stock}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value, 10) || 0;
                      setQuickEditProduct({
                        ...quickEditProduct,
                        stock: qty,
                        status: qty === 0 ? 'Out of stock' : qty <= 10 ? 'Low stock' : 'Active',
                      });
                    }}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Catalog Stock Status
                  </label>
                  <select
                    className="sel-x w-100"
                    value={quickEditProduct.status}
                    onChange={(e) =>
                      setQuickEditProduct({
                        ...quickEditProduct,
                        status: e.target.value as any,
                      })
                    }
                  >
                    <option value="Active">In Stock (Active)</option>
                    <option value="Low stock">Low Stock Alert</option>
                    <option value="Out of stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Category & Brand Row */}
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Category
                  </label>
                  <select
                    className="sel-x w-100"
                    value={quickEditProduct.category}
                    onChange={(e) =>
                      setQuickEditProduct({
                        ...quickEditProduct,
                        category: e.target.value,
                      })
                    }
                  >
                    {categoryList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Brand Name
                  </label>
                  <input
                    type="text"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px' }}
                    value={quickEditProduct.brand || ''}
                    onChange={(e) => setQuickEditProduct({ ...quickEditProduct, brand: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 pt-3 border-top" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setQuickEditProduct(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-dark-x d-flex align-items-center gap-2"
                >
                  <Save size={16} /> Save Quick Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Product Modal */}
      {inspectProduct && (
        <div className="react-modal-backdrop" onClick={() => setInspectProduct(null)}>
          <div
            className="card-x"
            style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h4 className="m-0">{inspectProduct.name}</h4>
                <small className="text-muted">SKU: {inspectProduct.sku} | Brand: {inspectProduct.brand || 'DWstore'}</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn-dark-x d-flex align-items-center gap-1"
                  style={{ height: '32px', fontSize: '12px' }}
                  onClick={() => {
                    if (onStartEditProduct) {
                      onStartEditProduct(inspectProduct);
                    } else {
                      setActiveTab('add-product');
                    }
                    setInspectProduct(null);
                  }}
                >
                  <Edit size={14} /> Full Edit
                </button>
                <button
                  type="button"
                  className="btn-soft d-flex align-items-center gap-1"
                  style={{ height: '32px', fontSize: '12px' }}
                  onClick={() => {
                    setQuickEditProduct(inspectProduct);
                    setInspectProduct(null);
                  }}
                >
                  <Zap size={14} className="text-warning" /> Quick Edit
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => setInspectProduct(null)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {inspectProduct.image && (
              <div className="my-3 text-center p-3 rounded-3" style={{ background: 'var(--hover)' }}>
                <img
                  src={resolveImageUrl(inspectProduct.image)}
                  alt={inspectProduct.name}
                  style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            )}

            <div className="row g-3 my-2">
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ background: 'var(--hover)' }}>
                  <small className="text-muted d-block">Sale Price</small>
                  <b className="fs-5 text-primary">Rs. {inspectProduct.salePrice.toLocaleString()}</b>
                  {inspectProduct.regularPrice > inspectProduct.salePrice && (
                    <small className="text-muted text-decoration-line-through d-block">
                      Rs. {inspectProduct.regularPrice.toLocaleString()}
                    </small>
                  )}
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ background: 'var(--hover)' }}>
                  <small className="text-muted d-block">Inventory Stock</small>
                  <b className="fs-5">{inspectProduct.stock} units</b>
                  <span className="badge-x s-Delivered mt-1">{inspectProduct.status}</span>
                </div>
              </div>
            </div>

            {inspectProduct.shortDesc && (
              <div className="mb-3">
                <h6>Short Description</h6>
                <div
                  className="p-3 rounded-3"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '13px' }}
                  dangerouslySetInnerHTML={{ __html: inspectProduct.shortDesc }}
                />
              </div>
            )}

            {inspectProduct.description && (
              <div className="mb-3">
                <h6>Full Specifications & Details</h6>
                <p style={{ fontSize: '13px', color: 'var(--muted)', whiteSpace: 'pre-line' }}>
                  {inspectProduct.description}
                </p>
              </div>
            )}

            {inspectProduct.attributes && inspectProduct.attributes.length > 0 && (
              <div className="mb-3">
                <h6>Product Attributes (Variants / Colors)</h6>
                <table className="table-x" style={{ minWidth: 'auto' }}>
                  <tbody>
                    {inspectProduct.attributes.map((attr, idx) => (
                      <tr key={idx}>
                        <td style={{ width: '35%', fontWeight: 600 }}>{attr.name}</td>
                        <td className="text-muted">{attr.values}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {inspectProduct.variations && inspectProduct.variations.length > 0 && (
              <div className="mb-3">
                <h6 className="d-flex align-items-center justify-content-between">
                  <span>Product Variations ({inspectProduct.variations.length})</span>
                  <span className="badge rounded-pill bg-purple-subtle text-purple" style={{ fontSize: '11px' }}>
                    Variable Product
                  </span>
                </h6>
                <div className="table-responsive">
                  <table className="table-x" style={{ minWidth: 'auto', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Variation</th>
                        <th>SKU</th>
                        <th>Sale Price</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspectProduct.variations.map((v) => (
                        <tr key={v.id}>
                          <td>
                            {Object.entries(v.attributes).map(([k, val]) => (
                              <span key={k} className="me-2 badge bg-light text-dark border">
                                {k}: {val}
                              </span>
                            ))}
                          </td>
                          <td><code>{v.sku || 'N/A'}</code></td>
                          <td className="fw-bold text-primary">Rs. {v.salePrice.toLocaleString()}</td>
                          <td>{v.stock} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(inspectProduct.shipping || inspectProduct.warrantyPeriod) && (
              <div className="mb-3 p-3 rounded-3" style={{ background: 'var(--hover)', fontSize: '13px' }}>
                {inspectProduct.warrantyPeriod && (
                  <div className="mb-1">
                    <b>Warranty:</b> <span className="text-muted">{inspectProduct.warrantyPeriod}</span>
                  </div>
                )}
                {inspectProduct.shipping && (
                  <div>
                    <b>Shipping:</b>{' '}
                    <span className="text-muted">
                      {inspectProduct.shipping.weight ? `${inspectProduct.shipping.weight} kg` : ''}{' '}
                      {inspectProduct.shipping.length
                        ? `(${inspectProduct.shipping.length}x${inspectProduct.shipping.width}x${inspectProduct.shipping.height} cm)`
                        : ''}{' '}
                      &bull; {inspectProduct.shipping.shippingClass || 'Standard'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Products Catalog CSV"
        description="Upload a CSV spreadsheet to bulk import or update products in DWstore catalog."
        expectedColumns={['SKU', 'Title', 'Brand', 'Category', 'Regular Price', 'Sale Price', 'Stock', 'Status']}
        sampleFilename="dwstore-sample-products.csv"
        sampleHeaders={['SKU', 'Title', 'Brand', 'Category', 'Regular Price (LKR)', 'Sale Price (LKR)', 'Stock', 'Status']}
        sampleRows={[
          ['SKU-WATCH-01', 'T800 Ultra Smartwatch', 'DWstore', 'SmartWatches', 2500, 1990, 50, 'Active'],
          ['SKU-PODS-02', 'Airpods Pro 2nd Gen Type C', 'Apple', 'Bluetooth Handfree', 3950, 3250, 25, 'Active'],
          ['SKU-PB-03', 'Aspor A323 10000mAh Power Bank', 'Aspor', 'Power Banks', 2400, 1850, 0, 'Out of stock'],
        ]}
        onImport={handleImportCSVData}
      />
    </div>
  );
};
