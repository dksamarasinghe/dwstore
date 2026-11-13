import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  Grid,
  List,
  Eye,
  Download,
  ExternalLink,
  HardDrive,
  RefreshCw,
  X,
  Layers,
  Tags,
  ShoppingBag,
  LayoutTemplate,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { getStorefrontUrl } from '../../config';
import { resolveImageUrl } from '../../utils/image';

interface MediaFileItem {
  name: string;
  url: string;
  size: number;
  sizeFormatted: string;
  createdAt: string | Date;
  folder: string;
}

interface FolderStat {
  name: string;
  count: number;
  sizeBytes: number;
  sizeFormatted: string;
}

interface MediaLibraryViewProps {
  showNotification: (msg: string) => void;
}

const FOLDER_CONFIGS: Record<string, { label: string; icon: any; desc: string }> = {
  all: {
    label: 'All Media Files',
    icon: HardDrive,
    desc: 'Browse all images and uploaded media across the entire website',
  },
  products: {
    label: 'Products',
    icon: ShoppingBag,
    desc: 'Main catalog images, product galleries & variation photos',
  },
  categories: {
    label: 'Categories',
    icon: Layers,
    desc: 'Category circle images, category icons & showcase banners',
  },
  brands: {
    label: 'Brands',
    icon: Tags,
    desc: 'Manufacturer SVG & PNG brand logos for ticker and filters',
  },
  'home-customizer': {
    label: 'Home Customizer',
    icon: LayoutTemplate,
    desc: 'Hero cards, promo slider banners & bento grid cards',
  },
  gallery: {
    label: 'Gallery',
    icon: ImageIcon,
    desc: 'General lifestyle and promotional marketing images',
  },
  general: {
    label: 'General & Badges',
    icon: FileText,
    desc: 'Site logos, courier waybill assets & payment method logos',
  },
};

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({ showNotification }) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('products');
  const [folders, setFolders] = useState<FolderStat[]>([]);
  const [overallStats, setOverallStats] = useState<{ totalFiles: number; totalSizeFormatted: string }>({
    totalFiles: 0,
    totalSizeFormatted: '0 B',
  });
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaFileItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MediaFileItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch folder statistics overview
  const fetchFoldersOverview = async () => {
    try {
      const endpoints = ['/api/upload?action=folders', `${getStorefrontUrl()}/api/upload?action=folders`];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.folders)) {
              setFolders(data.folders);
              if (data.stats) {
                setOverallStats({
                  totalFiles: data.stats.totalFiles || 0,
                  totalSizeFormatted: data.stats.totalSizeFormatted || '0 B',
                });
              }
              return;
            }
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Could not fetch folder overview:', e);
    }
  };

  // Fetch files inside the currently selected folder
  const fetchFolderFiles = async (folderName: string) => {
    setLoading(true);
    try {
      const endpoints = [
        `/api/upload?folder=${encodeURIComponent(folderName)}&limit=150`,
        `${getStorefrontUrl()}/api/upload?folder=${encodeURIComponent(folderName)}&limit=150`,
      ];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.files)) {
              setFiles(data.files);
              setLoading(false);
              return;
            }
          }
        } catch {}
      }
      setFiles([]);
    } catch (e) {
      console.error('Error fetching files:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoldersOverview();
  }, []);

  useEffect(() => {
    fetchFolderFiles(selectedFolder);
  }, [selectedFolder]);

  // Handle image upload from PC
  const handleUploadFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', selectedFolder);

      const endpoints = ['/api/upload', `${getStorefrontUrl()}/api/upload`];
      let uploadedData: any = null;

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { method: 'POST', body: fd });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              uploadedData = data;
              break;
            }
          }
        } catch {}
      }

      if (uploadedData) {
        showNotification(`Successfully uploaded "${file.name}" to ${selectedFolder}!`);
        await fetchFolderFiles(selectedFolder);
        await fetchFoldersOverview();
      } else {
        showNotification('Failed to upload image. Please check file size.');
      }
    } catch (e: any) {
      showNotification(`Upload error: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle image delete
  const handleDeleteFile = async (item: MediaFileItem) => {
    try {
      const endpoints = ['/api/upload', `${getStorefrontUrl()}/api/upload`];
      let deleted = false;

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder: item.folder, filename: item.name, url: item.url }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              deleted = true;
              break;
            }
          }
        } catch {}
      }

      if (deleted) {
        showNotification(`Deleted "${item.name}" successfully.`);
        setDeleteConfirmItem(null);
        if (previewItem?.name === item.name) setPreviewItem(null);
        await fetchFolderFiles(selectedFolder);
        await fetchFoldersOverview();
      } else {
        showNotification('Could not delete file from server.');
      }
    } catch (e: any) {
      showNotification(`Delete error: ${e.message}`);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    showNotification(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, search]);

  const currentFolderStat = folders.find((f) => f.name === selectedFolder);

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-head d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary fw-bold" style={{ fontSize: '11px' }}>
              <HardDrive size={13} className="inline me-1" /> VPS Media Storage
            </span>
            <span className="badge bg-success-subtle text-success fw-bold" style={{ fontSize: '11px' }}>
              ● 100% High Speed
            </span>
          </div>
          <h1 className="fw-black text-body m-0 mt-1" style={{ fontSize: '24px', letterSpacing: '-0.5px' }}>
            Media &amp; Asset Library
          </h1>
          <p className="text-muted m-0 mt-1" style={{ fontSize: '13px' }}>
            Browse, upload, organize, and copy image links for products, categories, brands, and home customizer.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            style={{ borderRadius: '10px', fontSize: '13px' }}
            onClick={() => {
              fetchFoldersOverview();
              fetchFolderFiles(selectedFolder);
              showNotification('Refreshed media files.');
            }}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            style={{ borderRadius: '10px', fontSize: '13px' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={16} />
            <span>{uploading ? 'Uploading...' : `Upload to ${FOLDER_CONFIGS[selectedFolder]?.label || selectedFolder}`}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4"
            className="d-none"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadFile(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-x p-3 h-100 d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-primary"
              style={{ width: '48px', height: '48px', background: 'rgba(37,99,235,0.1)' }}
            >
              <ImageIcon size={24} />
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>
                TOTAL STORE MEDIA
              </small>
              <b className="fs-5 text-body">{overallStats.totalFiles.toLocaleString()} Items</b>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-x p-3 h-100 d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-info"
              style={{ width: '48px', height: '48px', background: 'rgba(6,182,212,0.1)' }}
            >
              <HardDrive size={24} />
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>
                DISK USAGE
              </small>
              <b className="fs-5 text-body">{overallStats.totalSizeFormatted}</b>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-x p-3 h-100 d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-warning"
              style={{ width: '48px', height: '48px', background: 'rgba(245,158,11,0.1)' }}
            >
              <FolderOpen size={24} />
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>
                SELECTED FOLDER
              </small>
              <b className="fs-5 text-body">
                {currentFolderStat ? currentFolderStat.count : files.length} Files
              </b>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-x p-3 h-100 d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-success"
              style={{ width: '48px', height: '48px', background: 'rgba(16,185,129,0.1)' }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>
                MEDIA DELIVERY
              </small>
              <b className="fs-5 text-success">Optimized &amp; Cached</b>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Folders + Right Gallery Grid */}
      <div className="row g-4">
        {/* Left: Folders Sidebar */}
        <div className="col-12 col-lg-3">
          <div className="card-x p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="fw-bold text-muted text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                Media Directories ({Object.keys(FOLDER_CONFIGS).length})
              </span>
            </div>

            <div className="d-flex flex-column gap-1">
              {Object.entries(FOLDER_CONFIGS).map(([folderKey, conf]) => {
                const stat = folders.find((f) => f.name === folderKey);
                const isSelected = selectedFolder === folderKey;
                const IconComponent = conf.icon;

                return (
                  <button
                    key={folderKey}
                    type="button"
                    className={`d-flex align-items-center justify-content-between p-2.5 rounded-3 text-start border-0 transition ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-transparent text-body hover-bg'
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedFolder(folderKey)}
                  >
                    <div className="d-flex align-items-center gap-2.5" style={{ minWidth: 0 }}>
                      <IconComponent
                        size={17}
                        className={isSelected ? 'text-white' : 'text-primary'}
                      />
                      <div style={{ minWidth: 0 }}>
                        <strong className="d-block text-truncate" style={{ fontSize: '13px' }}>
                          {conf.label}
                        </strong>
                        <small
                          className={`d-block text-truncate ${isSelected ? 'text-white-50' : 'text-muted'}`}
                          style={{ fontSize: '10px' }}
                        >
                          /media/{folderKey}/
                        </small>
                      </div>
                    </div>

                    <span
                      className={`badge rounded-pill ${
                        isSelected ? 'bg-white text-primary' : 'bg-secondary-subtle text-body'
                      }`}
                      style={{ fontSize: '11px' }}
                    >
                      {stat ? stat.count : 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Drag & Drop Upload Zone in Sidebar */}
            <div
              className={`mt-4 p-3 rounded-3 text-center border-2 border-dashed transition ${
                isDragging ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle bg-light'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleUploadFile(file);
              }}
              style={{ cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="text-muted mb-1" />
              <b className="d-block text-body" style={{ fontSize: '12px' }}>
                Drop image here to upload
              </b>
              <small className="text-muted d-block" style={{ fontSize: '10px' }}>
                Directly saves to /media/{selectedFolder}/
              </small>
            </div>
          </div>
        </div>

        {/* Right: Files Explorer */}
        <div className="col-12 col-lg-9">
          <div className="card-x p-3 mb-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
              <div className="position-relative flex-grow-1">
                <Search
                  size={16}
                  className="position-absolute text-muted"
                  style={{ top: '10px', left: '12px' }}
                />
                <input
                  type="text"
                  className="form-control ps-5"
                  style={{ borderRadius: '10px', fontSize: '13px', height: '38px' }}
                  placeholder={`Search ${filteredFiles.length} files in "${FOLDER_CONFIGS[selectedFolder]?.label || selectedFolder}"...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <span className="text-muted fw-semibold" style={{ fontSize: '12px' }}>
                  {filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'}
                </span>

                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    type="button"
                    className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Files Gallery */}
          {loading ? (
            <div className="card-x p-5 text-center text-muted">
              <RefreshCw size={28} className="spin mb-2 text-primary" />
              <p className="m-0 fw-semibold">Loading media from VPS storage...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="card-x p-5 text-center text-muted">
              <FolderOpen size={48} className="mb-2 opacity-40 text-muted" />
              <h5 className="text-body fw-bold">No images found in this folder</h5>
              <p className="text-muted" style={{ fontSize: '13px' }}>
                {search ? `No images matched "${search}".` : `Upload your first image to "${FOLDER_CONFIGS[selectedFolder]?.label}".`}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm px-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} className="me-1 inline" /> Upload Image
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="row g-3">
              {filteredFiles.map((file) => {
                const resolved = resolveImageUrl(file.url);
                return (
                  <div key={file.name} className="col-6 col-sm-4 col-md-3 col-xl-2">
                    <div
                      className="card-x h-100 p-2 position-relative overflow-hidden group shadow-xs hover-shadow"
                      style={{ transition: 'all 0.2s', borderRadius: '12px' }}
                    >
                      {/* Image Thumbnail Container */}
                      <div
                        className="rounded-2 overflow-hidden position-relative bg-light d-flex align-items-center justify-content-center"
                        style={{
                          height: '110px',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setPreviewItem(file)}
                      >
                        <img
                          src={resolved}
                          alt={file.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          loading="lazy"
                        />
                      </div>

                      {/* File Details */}
                      <div className="pt-2 px-1">
                        <strong
                          className="d-block text-truncate text-body"
                          style={{ fontSize: '11px', lineHeight: '1.2' }}
                          title={file.name}
                        >
                          {file.name}
                        </strong>
                        <div className="d-flex align-items-center justify-content-between mt-1">
                          <small className="text-muted" style={{ fontSize: '10px' }}>
                            {file.sizeFormatted}
                          </small>
                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-link p-0 text-muted hover-primary"
                              title="Copy URL"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(file.url, 'Relative URL');
                              }}
                            >
                              {copiedUrl === file.url ? (
                                <Check size={12} className="text-success" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-link p-0 text-danger hover-opacity"
                              title="Delete file"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmItem(file);
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="card-x p-0 overflow-hidden">
              <div className="table-responsive">
                <table className="table align-middle m-0 table-hover">
                  <thead className="table-light text-muted" style={{ fontSize: '11px' }}>
                    <tr>
                      <th style={{ width: '50px' }}>Preview</th>
                      <th>Filename</th>
                      <th>Folder Path</th>
                      <th>Size</th>
                      <th style={{ width: '140px' }} className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '12px' }}>
                    {filteredFiles.map((file) => (
                      <tr key={file.name}>
                        <td>
                          <div
                            className="rounded-2 overflow-hidden bg-light d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px', border: '1px solid var(--border)' }}
                          >
                            <img
                              src={resolveImageUrl(file.url)}
                              alt={file.name}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              loading="lazy"
                            />
                          </div>
                        </td>
                        <td>
                          <b className="d-block text-body font-monospace">{file.name}</b>
                        </td>
                        <td>
                          <span className="badge bg-light text-muted font-monospace">{file.url}</span>
                        </td>
                        <td>{file.sizeFormatted}</td>
                        <td className="text-end">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary p-1 px-2"
                              style={{ fontSize: '11px' }}
                              onClick={() => copyToClipboard(file.url, 'Relative URL')}
                            >
                              <Copy size={11} className="me-1 inline" /> Copy URL
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger p-1 px-2"
                              style={{ fontSize: '11px' }}
                              onClick={() => setDeleteConfirmItem(file)}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.75)',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="card-x p-4 text-body shadow-2xl"
            style={{ maxWidth: '640px', width: '100%', borderRadius: '16px', background: '#fff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <div style={{ minWidth: 0 }}>
                <b className="d-block text-truncate fs-6">{previewItem.name}</b>
                <small className="text-muted font-monospace">{previewItem.url}</small>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setPreviewItem(null)}
              />
            </div>

            <div
              className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-center mb-3"
              style={{ maxHeight: '360px', overflow: 'hidden' }}
            >
              <img
                src={resolveImageUrl(previewItem.url)}
                alt={previewItem.name}
                style={{ maxHeight: '320px', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>

            <div className="row g-2 mb-3" style={{ fontSize: '12px' }}>
              <div className="col-6">
                <span className="text-muted d-block">Folder:</span>
                <b>{previewItem.folder}</b>
              </div>
              <div className="col-6">
                <span className="text-muted d-block">File Size:</span>
                <b>{previewItem.sizeFormatted}</b>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 pt-2 border-top">
              <button
                type="button"
                className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 flex-grow-1"
                onClick={() => copyToClipboard(previewItem.url, 'Relative URL')}
              >
                <Copy size={13} />
                <span>Copy Relative Path ({previewItem.url})</span>
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5"
                onClick={() => copyToClipboard(`${getStorefrontUrl()}${previewItem.url}`, 'Full URL')}
              >
                <ExternalLink size={13} />
                <span>Copy Full Domain URL</span>
              </button>

              <button
                type="button"
                className="btn btn-danger btn-sm d-flex align-items-center gap-1.5"
                onClick={() => {
                  setDeleteConfirmItem(previewItem);
                }}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div
          className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.75)',
            zIndex: 10000,
          }}
          onClick={() => setDeleteConfirmItem(null)}
        >
          <div
            className="card-x p-4 text-body shadow-2xl"
            style={{ maxWidth: '420px', width: '100%', borderRadius: '16px', background: '#fff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center gap-3 mb-3 text-danger">
              <AlertCircle size={32} />
              <h5 className="m-0 fw-bold">Delete Media File?</h5>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
              Are you sure you want to permanently delete <b>"{deleteConfirmItem.name}"</b> from the VPS? Any products or banners referencing this path will revert to placeholders.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setDeleteConfirmItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteFile(deleteConfirmItem)}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
