import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Search,
  Package,
  FolderTree,
  CornerDownRight,
  X,
  Check,
  ChevronRight
} from 'lucide-react';
import { CategoryItem } from '../../types';

interface CategoriesViewProps {
  categories: CategoryItem[];
  onAddCategory: (cat: CategoryItem) => void;
  onUpdateCategory: (cat: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
}

interface TreeCategory {
  item: CategoryItem;
  depth: number;
  parentName?: string;
  path: string;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Hidden'>('Active');

  // Build hierarchical tree
  const treeList = useMemo(() => {
    // Lookup maps
    const byIdOrSlug = new Map<string, CategoryItem>();
    categories.forEach((c) => {
      byIdOrSlug.set(c.id, c);
      byIdOrSlug.set(c.slug, c);
    });

    // Group children by parent identifier (or 'ROOT')
    const childrenMap = new Map<string, CategoryItem[]>();
    categories.forEach((c) => {
      const p = c.parentId && c.parentId.trim() !== '' ? c.parentId : 'ROOT';
      if (!childrenMap.has(p)) {
        childrenMap.set(p, []);
      }
      childrenMap.get(p)!.push(c);
    });

    const result: TreeCategory[] = [];
    const visited = new Set<string>();

    const traverse = (parentKey: string, depth: number, currentPath: string) => {
      // Get children matching parentKey by id or by slug
      const direct = childrenMap.get(parentKey) || [];
      const parentObj = byIdOrSlug.get(parentKey);
      const bySlug = parentObj && parentObj.slug !== parentKey ? childrenMap.get(parentObj.slug) || [] : [];
      
      const allChildren = [...direct, ...bySlug.filter(c => !direct.some(d => d.id === c.id))];
      allChildren.sort((a, b) => a.name.localeCompare(b.name));

      for (const child of allChildren) {
        if (visited.has(child.id)) continue;
        visited.add(child.id);

        const parentItem = child.parentId ? byIdOrSlug.get(child.parentId) : undefined;
        const newPath = currentPath ? `${currentPath} > ${child.name}` : child.name;

        result.push({
          item: child,
          depth,
          parentName: parentItem ? parentItem.name : undefined,
          path: newPath,
        });

        traverse(child.id, depth + 1, newPath);
      }
    };

    // Traverse root categories
    traverse('ROOT', 0, '');

    // Add any orphans
    categories.forEach((c) => {
      if (!visited.has(c.id)) {
        visited.add(c.id);
        const parentItem = c.parentId ? byIdOrSlug.get(c.parentId) : undefined;
        result.push({
          item: c,
          depth: c.parentId ? 1 : 0,
          parentName: parentItem ? parentItem.name : undefined,
          path: c.name,
        });
      }
    });

    return result;
  }, [categories]);

  // Filtered by search term
  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) return treeList;
    const s = searchTerm.toLowerCase();
    return treeList.filter(
      (node) =>
        node.item.name.toLowerCase().includes(s) ||
        node.item.slug.toLowerCase().includes(s) ||
        (node.parentName && node.parentName.toLowerCase().includes(s))
    );
  }, [treeList, searchTerm]);

  const totalAssignedProducts = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
  }, [categories]);

  // Open modal for Create
  const handleOpenCreate = (parentId: string = '') => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormParentId(parentId);
    setFormDescription('');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormParentId(cat.parentId || '');
    setFormDescription(cat.description || '');
    setFormStatus(cat.status || 'Active');
    setIsModalOpen(true);
  };

  // Auto-generate slug from name if creating
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
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

    const slug = (formSlug.trim() || formName.trim().toLowerCase().replace(/\s+/g, '-'));

    if (editingCategory) {
      // Update
      const updated: CategoryItem = {
        ...editingCategory,
        name: formName.trim(),
        slug,
        parentId: formParentId.trim() ? formParentId.trim() : null,
        description: formDescription.trim(),
        status: formStatus,
      };
      onUpdateCategory(updated);
    } else {
      // Create
      const newCat: CategoryItem = {
        id: slug,
        name: formName.trim(),
        slug,
        parentId: formParentId.trim() ? formParentId.trim() : null,
        description: formDescription.trim(),
        productCount: 0,
        icon: 'layers',
        status: formStatus,
        featured: !formParentId,
      };
      onAddCategory(newCat);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (cat: CategoryItem) => {
    if (
      window.confirm(
        `Are you sure you want to delete category "${cat.name}"? Products in this category will not be deleted.`
      )
    ) {
      onDeleteCategory(cat.id);
    }
  };

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="mb-0">Product Categories ({categories.length})</h1>
            <span className="badge-x s-Active" style={{ fontSize: '11px' }}>
              Hierarchical Taxonomy
            </span>
          </div>
          <p className="text-muted mb-0">
            Organize products with parent categories, subcategories, and sub-subcategories (WooCommerce standard). Total products assigned: <strong>{totalAssignedProducts}</strong>.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn-dark-x d-flex align-items-center gap-2"
            onClick={() => handleOpenCreate('')}
            type="button"
          >
            <Plus size={16} /> Add New Category
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
              placeholder="Search category name, slug, or parent category..."
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
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Categories Table */}
      <div className="card-x">
        <div className="table-responsive">
          <table className="table table-borderless table-x align-middle mb-0">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))' }}>
                <th style={{ width: '40%' }}>Category Name</th>
                <th style={{ width: '20%' }}>Slug</th>
                <th style={{ width: '18%' }}>Parent Category</th>
                <th style={{ width: '10%' }} className="text-center">Products</th>
                <th style={{ width: '6%' }} className="text-center">Status</th>
                <th style={{ width: '6%' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTree.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    <FolderTree size={36} className="mb-2 opacity-50" />
                    <div>No categories found matching "{searchTerm}"</div>
                  </td>
                </tr>
              ) : (
                filteredTree.map(({ item, depth, parentName }) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.05))',
                      backgroundColor: depth > 0 ? 'rgba(255, 255, 255, 0.015)' : undefined,
                    }}
                  >
                    {/* Name with WooCommerce Tree Indentation */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {/* Indent lines */}
                        {depth > 0 && (
                          <span
                            className="text-muted d-inline-flex align-items-center"
                            style={{
                              marginLeft: `${(depth - 1) * 20}px`,
                              opacity: 0.6,
                            }}
                          >
                            <CornerDownRight size={14} className="me-1 text-primary" />
                            <span className="font-monospace text-xs">
                              {depth === 1 ? '—' : depth === 2 ? '——' : '———'}
                            </span>
                          </span>
                        )}

                        <span
                          className="thumb"
                          style={{
                            width: depth === 0 ? '36px' : '30px',
                            height: depth === 0 ? '36px' : '30px',
                            background: depth === 0 ? '#1e293b' : '#0f172a',
                            color: depth === 0 ? '#38bdf8' : '#94a3b8',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Layers size={depth === 0 ? 18 : 14} />
                        </span>

                        <div>
                          <span
                            className="d-block"
                            style={{
                              fontWeight: depth === 0 ? 700 : 500,
                              fontSize: depth === 0 ? '14px' : '13px',
                              color: depth === 0 ? 'var(--text-main, #ffffff)' : 'var(--text-muted, #cbd5e1)',
                            }}
                          >
                            {item.name}
                          </span>
                          {item.description && (
                            <small className="text-muted d-block text-truncate" style={{ maxWidth: '280px', fontSize: '11px' }}>
                              {item.description}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td>
                      <span className="font-monospace text-xs px-2 py-1 bg-opacity-10 bg-secondary rounded text-muted">
                        /{item.slug}
                      </span>
                    </td>

                    {/* Parent Category */}
                    <td>
                      {parentName ? (
                        <span className="badge bg-secondary bg-opacity-25 text-white-50 px-2 py-1 rounded">
                          {parentName}
                        </span>
                      ) : (
                        <span className="text-muted text-xs">— Root Category —</span>
                      )}
                    </td>

                    {/* Products Count */}
                    <td className="text-center">
                      <span className="badge bg-light text-dark fw-semibold px-2 py-1 rounded-pill">
                        <Package size={12} className="me-1 d-inline" />
                        {item.productCount || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="text-center">
                      <span className={`badge-x ${item.status === 'Active' ? 's-Delivered' : 's-Cancelled'}`} style={{ fontSize: '11px' }}>
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        {/* Quick Add Subcategory */}
                        <button
                          type="button"
                          className="icon-btn"
                          title={`Add Subcategory under ${item.name}`}
                          onClick={() => handleOpenCreate(item.id || item.slug)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            border: 'none',
                          }}
                        >
                          <Plus size={14} />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit Category"
                          onClick={() => handleOpenEdit(item)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#e2e8f0',
                            border: 'none',
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          className="icon-btn text-danger"
                          title="Delete Category"
                          onClick={() => handleDelete(item)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                          }}
                        >
                          <Trash2 size={13} />
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

      {/* Add / Edit Category Modal */}
      {/* Create / Edit Category Modal */}
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
              maxWidth: '540px',
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
                  style={{ width: '38px', height: '38px', background: '#eff6ff', color: '#2563eb' }}
                >
                  <FolderTree size={20} />
                </span>
                <div>
                  <h5 className="m-0 fw-bold" style={{ fontSize: '16px' }}>
                    {editingCategory ? 'Edit Product Category' : 'Create New Category'}
                  </h5>
                  <small className="text-muted" style={{ fontSize: '12px' }}>
                    Organize your store catalog with parent &amp; subcategories
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
              {/* Category Name */}
              <div>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderRadius: '10px', fontSize: '13px', padding: '10px 14px' }}
                  placeholder="e.g. Wireless Microphones"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  URL Slug
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text font-monospace text-muted"
                    style={{ fontSize: '12px', background: 'var(--hover)', border: '1px solid var(--border)' }}
                  >
                    dwstore.lk/category/
                  </span>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    style={{ fontSize: '13px', padding: '10px 14px' }}
                    placeholder="e.g. wireless-microphones"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                  />
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                  The URL-friendly slug. Auto-generated from name or customize as needed.
                </small>
              </div>

              {/* Parent Category Dropdown (Hierarchical) */}
              <div>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Parent Category (Hierarchy)
                </label>
                <select
                  className="form-select"
                  style={{ borderRadius: '10px', fontSize: '13px', padding: '10px 14px' }}
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                >
                  <option value="">— None (Top-level Parent Category) —</option>
                  {treeList
                    // Prevent circular reference: category cannot be its own parent or child
                    .filter(({ item }) => !editingCategory || (item.id !== editingCategory.id && item.slug !== editingCategory.slug))
                    .map(({ item, depth, path }) => (
                      <option key={item.id} value={item.id || item.slug}>
                        {'\u00A0'.repeat(depth * 3)}
                        {depth > 0 ? '↳ ' : ''}
                        {item.name}
                      </option>
                    ))}
                </select>
                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                  Assign a parent category to create a subcategory (e.g. Electronics &gt; SmartWatches).
                </small>
              </div>

              {/* Description */}
              <div>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Description (Optional)
                </label>
                <textarea
                  className="form-control"
                  style={{ borderRadius: '10px', fontSize: '13px', padding: '10px 14px' }}
                  rows={2}
                  placeholder="Brief category description for SEO & storefront browsing..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Visibility Status */}
              <div>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '13px' }}>
                  Visibility Status
                </label>
                <select
                  className="form-select"
                  style={{ borderRadius: '10px', fontSize: '13px', padding: '10px 14px' }}
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Hidden')}
                >
                  <option value="Active">Active (Visible on Storefront)</option>
                  <option value="Hidden">Hidden (Draft / Archive)</option>
                </select>
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
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
