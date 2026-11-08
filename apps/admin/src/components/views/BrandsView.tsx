import React, { useState, useMemo } from 'react';
import {
  Tags,
  Plus,
  Trash2,
  Edit2,
  Search,
  Package,
  ExternalLink,
  Image as ImageIcon,
  Check,
  Star,
  X,
  Upload
} from 'lucide-react';
import { BrandItem } from '../../types';

interface BrandsViewProps {
  brands: BrandItem[];
  onAddBrand: (brand: BrandItem) => void;
  onUpdateBrand: (brand: BrandItem) => void;
  onDeleteBrand: (id: string) => void;
  showNotification: (msg: string) => void;
}

export const BrandsView: React.FC<BrandsViewProps> = ({
  brands,
  onAddBrand,
  onUpdateBrand,
  onDeleteBrand,
  showNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formFeatured, setFormFeatured] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Upload logo to VPS Media (/media/brands/)
  const handleUploadBrandLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'brands');
      const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormLogo(data.url);
        showNotification('Brand logo uploaded to VPS media (/media/brands/) successfully!');
      } else {
        showNotification(data.error || 'Logo upload failed');
      }
    } catch (err: any) {
      showNotification('Error uploading logo: ' + err.message);
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  // Filtered brands
  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return brands;
    const s = searchTerm.toLowerCase();
    return brands.filter(
      (b) => b.name.toLowerCase().includes(s) || b.slug.toLowerCase().includes(s)
    );
  }, [brands, searchTerm]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormName('');
    setFormSlug('');
    setFormLogo('');
    setFormTag('');
    setFormFeatured(true);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (brand: BrandItem) => {
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormSlug(brand.slug);
    setFormLogo(brand.logo || '');
    setFormTag(brand.description || '');
    setFormFeatured(brand.featured ?? true);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingBrand) {
      setFormSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const slug = formSlug.trim() || formName.trim().toLowerCase().replace(/\s+/g, '-');

    if (editingBrand) {
      const updated: BrandItem = {
        ...editingBrand,
        name: formName.trim(),
        slug,
        logo: formLogo.trim(),
        description: formTag.trim(),
        featured: formFeatured,
      };
      onUpdateBrand(updated);
      showNotification(`Brand "${updated.name}" updated successfully!`);
    } else {
      const newBrand: BrandItem = {
        id: slug,
        name: formName.trim(),
        slug,
        logo: formLogo.trim(),
        description: formTag.trim(),
        productCount: 0,
        featured: formFeatured,
        status: 'Active',
      };
      onAddBrand(newBrand);
      showNotification(`Brand "${newBrand.name}" added successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (brand: BrandItem) => {
    if (window.confirm(`Are you sure you want to remove brand "${brand.name}"?`)) {
      onDeleteBrand(brand.id);
    }
  };

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="mb-0">Brands Directory ({brands.length})</h1>
            <span className="badge-x s-Delivered" style={{ fontSize: '11px' }}>
              Storefront Sync
            </span>
          </div>
          <p className="text-muted mb-0">
            Manage manufacturer brands and logos. Featured brands automatically display in the storefront homepage ticker.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn-dark-x d-flex align-items-center gap-2"
            onClick={handleOpenCreate}
            type="button"
          >
            <Plus size={16} /> Add New Brand
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-x mb-4">
        <div className="ord-filters d-flex align-items-center gap-3">
          <div className="search flex-grow-1">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search brands by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <button
              className="btn btn-sm btn-outline-secondary"
              type="button"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Brands Table */}
      <div className="card-x">
        <div className="table-responsive">
          <table className="table table-borderless table-x align-middle mb-0">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))' }}>
                <th style={{ width: '80px' }}>Logo</th>
                <th style={{ width: '35%' }}>Brand Name</th>
                <th style={{ width: '25%' }}>Slug</th>
                <th style={{ width: '15%' }} className="text-center">Products</th>
                <th style={{ width: '15%' }} className="text-center">Homepage Display</th>
                <th style={{ width: '10%' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    <Tags size={36} className="mb-2 opacity-50" />
                    <div>No brands found matching "{searchTerm}"</div>
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr
                    key={brand.id}
                    style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.05))' }}
                  >
                    {/* Brand Logo / Avatar */}
                    <td>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(0,0,0,0.08)',
                          overflow: 'hidden',
                        }}
                      >
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                            }}
                            onError={(e) => {
                              // Fallback on broken image
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="fw-bold text-dark text-xs uppercase">
                            {brand.name.slice(0, 3)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Brand Name */}
                    <td>
                      <div>
                        <strong className="d-block" style={{ fontSize: '14px', color: 'var(--text-main, #ffffff)' }}>
                          {brand.name}
                        </strong>
                        {brand.description && (
                          <small className="text-muted d-block text-xs">{brand.description}</small>
                        )}
                      </div>
                    </td>

                    {/* Slug */}
                    <td>
                      <span className="font-monospace text-xs px-2 py-1 bg-opacity-10 bg-secondary rounded text-muted">
                        /{brand.slug}
                      </span>
                    </td>

                    {/* Product count */}
                    <td className="text-center">
                      <span className="badge bg-light text-dark fw-semibold px-2 py-1 rounded-pill">
                        <Package size={12} className="me-1 d-inline" />
                        {brand.productCount || 0}
                      </span>
                    </td>

                    {/* Homepage feature */}
                    <td className="text-center">
                      {brand.featured ? (
                        <span className="badge bg-primary bg-opacity-25 text-primary text-xs px-2 py-1 rounded">
                          <Star size={11} className="me-1 d-inline fill-current" />
                          Visible on Home
                        </span>
                      ) : (
                        <span className="text-muted text-xs">Catalog only</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit Brand"
                          onClick={() => handleOpenEdit(brand)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#e2e8f0',
                            border: 'none',
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn text-danger"
                          title="Delete Brand"
                          onClick={() => handleDelete(brand)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Brand Modal */}
      {isModalOpen && (
        <div
          className="react-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          style={{ zIndex: 1050 }}
        >
          <div
            className="card-x p-0 overflow-hidden"
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              margin: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border)',
              background: 'var(--card-bg, #ffffff)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="d-flex align-items-center justify-content-between p-3 px-4 border-bottom"
              style={{ borderColor: 'var(--border)', background: 'var(--card-bg, #ffffff)' }}
            >
              <div className="d-flex align-items-center gap-2.5">
                <span
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: '38px', height: '38px', background: '#e0f2fe', color: '#0284c7' }}
                >
                  <Tags size={20} />
                </span>
                <div>
                  <h5 className="m-0 fw-bold" style={{ fontSize: '16px' }}>
                    {editingBrand ? 'Edit Brand Details' : 'Add New Brand'}
                  </h5>
                  <small className="text-muted" style={{ fontSize: '12px' }}>
                    Manage manufacturer brand names and homepage slider logos
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }} className="p-4 d-flex flex-column gap-3">
              {/* Brand Name */}
              <div>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Brand Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderRadius: '10px', fontSize: '13px', padding: '10px 14px' }}
                  placeholder="e.g. Anker / Baseus / Remax"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Brand URL Slug
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text font-monospace text-muted"
                    style={{ fontSize: '12px', background: 'var(--hover)', border: '1px solid var(--border)' }}
                  >
                    dwstore.lk/brand/
                  </span>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    style={{ fontSize: '13px', padding: '10px 14px' }}
                    placeholder="e.g. anker"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                  />
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                  Used for brand catalog URL and SEO filter routing.
                </small>
              </div>

              {/* Brand Logo - VPS Self-Hosted Upload & URL */}
              <div>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Brand Logo Image (VPS Media Storage)
                </label>

                {/* Upload Action Button */}
                <div className="d-flex align-items-center gap-2 mb-2">
                  <label
                    className="btn btn-primary d-inline-flex align-items-center gap-1.5"
                    style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Upload size={14} />
                    {isUploadingLogo ? 'Uploading to VPS...' : 'Upload Logo from Computer'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadBrandLogo}
                      style={{ display: 'none' }}
                      disabled={isUploadingLogo}
                    />
                  </label>
                  {formLogo && (
                    <button
                      type="button"
                      className="btn btn-light border text-danger"
                      style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '8px' }}
                      onClick={() => setFormLogo('')}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="input-group">
                  <span
                    className="input-group-text text-muted"
                    style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
                  >
                    <ImageIcon size={15} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    style={{ fontSize: '13px', padding: '8px 12px' }}
                    placeholder="/media/brands/logo.png or image URL"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                  />
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                  Stored in <code>/media/brands/</code> on your server.
                </small>

                {/* Logo Live Preview */}
                {formLogo && (
                  <div
                    className="p-2.5 rounded-3 d-flex align-items-center gap-3 mt-2"
                    style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className="rounded-2 d-flex align-items-center justify-content-center bg-white p-1"
                      style={{ width: '48px', height: '48px', border: '1px solid var(--border)' }}
                    >
                      <img
                        src={formLogo}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <b className="d-block text-body" style={{ fontSize: '12px' }}>Logo Live Preview</b>
                      <small className="text-muted" style={{ fontSize: '11px' }}>
                        Displayed on storefront header navigation &amp; brand bar.
                      </small>
                    </div>
                  </div>
                )}
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Tagline / Specialization (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderRadius: '10px', fontSize: '13px', padding: '10px 14px' }}
                  placeholder="e.g. Fast Charging, Audio Gear, Premium Accessories"
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                />
              </div>

              {/* Homepage Feature Toggle */}
              <div
                className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
              >
                <div>
                  <b className="d-block" style={{ fontSize: '13px' }}>Feature on Storefront Homepage</b>
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    Showcase this brand's logo in the homepage trusted brand slider
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="featuredSwitch"
                    style={{ width: '42px', height: '22px', cursor: 'pointer' }}
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div
                className="d-flex align-items-center justify-content-end gap-2 pt-3 mt-2 border-top"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  type="button"
                  className="btn btn-light border px-3 fw-semibold"
                  style={{ fontSize: '13px' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-dark px-4 fw-bold d-flex align-items-center gap-2"
                  style={{ fontSize: '13px', background: '#0f172a', borderColor: '#0f172a', color: '#fff' }}
                >
                  <Check size={16} />
                  <span>{editingBrand ? 'Save Changes' : 'Create Brand'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
