import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  Folder,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getStorefrontUrl } from '../../config';
import { resolveImageUrl } from '../../utils/image';

export interface MediaFileItem {
  name: string;
  url: string;
  sizeBytes: number;
  sizeFormatted: string;
  modifiedTime?: string;
  folder?: string;
}

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
  multiple?: boolean;
  defaultFolder?: string;
  title?: string;
}

const AVAILABLE_FOLDERS = [
  { id: 'all', label: 'All Media Files', icon: Folder },
  { id: 'products', label: 'Products', icon: Layers },
  { id: 'categories', label: 'Categories', icon: Folder },
  { id: 'brands', label: 'Brands', icon: Folder },
  { id: 'home-customizer', label: 'Home Customizer', icon: Sparkles },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'general', label: 'General & Badges', icon: Folder },
];

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  multiple = false,
  defaultFolder = 'all',
  title = 'Choose from VPS Media Library',
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>(defaultFolder || 'all');
  const [search, setSearch] = useState<string>('');
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync defaultFolder when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolder(defaultFolder || 'all');
      setSelectedUrls([]);
      setSearch('');
      setUploadError(null);
    }
  }, [isOpen, defaultFolder]);

  // Fetch files inside the folder with search
  const fetchFiles = useCallback(async (folder: string, query: string) => {
    setLoading(true);
    setUploadError(null);
    try {
      const q = query.trim() ? `&search=${encodeURIComponent(query.trim())}` : '';
      const endpoints = [
        `${getStorefrontUrl()}/api/upload?folder=${encodeURIComponent(folder)}&limit=-1${q}&t=${Date.now()}`,
        `/api/upload?folder=${encodeURIComponent(folder)}&limit=-1${q}&t=${Date.now()}`,
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
    } catch (e: any) {
      console.warn('Media fetch error:', e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on folder or search change
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      fetchFiles(selectedFolder, search);
    }, 150);
    return () => clearTimeout(timeout);
  }, [isOpen, selectedFolder, search, fetchFiles]);

  // Upload handler inside modal
  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    const targetFolder = selectedFolder === 'all' ? 'products' : selectedFolder;

    try {
      const newlyAddedUrls: string[] = [];
      for (let i = 0; i < uploadedFiles.length; i++) {
        const f = uploadedFiles[i];
        const fd = new FormData();
        fd.append('file', f);
        fd.append('folder', targetFolder);

        const res = await fetch(`${getStorefrontUrl()}/api/upload`, {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (data.success && data.url) {
          newlyAddedUrls.push(data.url);
        } else {
          setUploadError(data.error || 'Failed to upload image.');
        }
      }

      // Refresh list
      await fetchFiles(selectedFolder, search);

      if (newlyAddedUrls.length > 0) {
        if (multiple) {
          setSelectedUrls((prev) => [...prev, ...newlyAddedUrls]);
        } else {
          setSelectedUrls([newlyAddedUrls[0]]);
        }
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleToggleSelect = (url: string) => {
    if (multiple) {
      setSelectedUrls((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    } else {
      setSelectedUrls([url]);
    }
  };

  const handleConfirm = () => {
    if (selectedUrls.length === 0) return;
    if (multiple && onSelectMultiple) {
      onSelectMultiple(selectedUrls);
    } else {
      onSelect(selectedUrls[0]);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageIcon size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {title}
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Select stored images or upload new ones directly to VPS storage
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn btn-sm btn-primary d-flex align-items-center gap-1.5"
              style={{ borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}
            >
              {isUploading ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Upload from PC</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleUploadFiles}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar: Folder Tabs + Search */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Folders Bar */}
          <div className="d-flex align-items-center gap-1.5 overflow-x-auto pb-1" style={{ maxWidth: '65%' }}>
            {AVAILABLE_FOLDERS.map((f) => {
              const isSelected = selectedFolder === f.id;
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFolder(f.id)}
                  className={`btn btn-sm d-flex align-items-center gap-1.5 text-nowrap ${
                    isSelected ? 'btn-dark' : 'btn-light border'
                  }`}
                  style={{
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    background: isSelected ? '#0f172a' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                  }}
                >
                  <Icon size={12} />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="position-relative" style={{ minWidth: '220px', flex: 1, maxWidth: '280px' }}>
            <Search
              size={14}
              className="position-absolute text-muted"
              style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images..."
              className="form-control form-control-sm ps-4"
              style={{ borderRadius: '8px', fontSize: '12px' }}
            />
          </div>
        </div>

        {/* Error message */}
        {uploadError && (
          <div className="px-4 py-2 bg-danger-subtle text-danger border-bottom d-flex align-items-center gap-2" style={{ fontSize: '12px' }}>
            <AlertCircle size={14} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Media Grid Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, minHeight: '320px', maxHeight: '55vh' }}>
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
              <RefreshCw size={24} className="spin mb-2 text-primary" />
              <span style={{ fontSize: '13px' }}>Loading media files from VPS...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <ImageIcon size={26} className="text-secondary" />
              </div>
              <strong style={{ fontSize: '14px', color: '#1e293b' }}>No images found</strong>
              <p style={{ fontSize: '12px', maxWidth: '300px', textAlign: 'center', margin: '4px 0 16px 0' }}>
                {search ? `No images matching "${search}" in this folder.` : 'This folder is currently empty. Upload your first image from PC.'}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5"
                style={{ borderRadius: '8px', fontSize: '12px' }}
              >
                <Upload size={14} />
                <span>Upload to {selectedFolder}</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px',
              }}
            >
              {files.map((file) => {
                const isSelected = selectedUrls.includes(file.url);
                return (
                  <div
                    key={file.url}
                    onClick={() => handleToggleSelect(file.url)}
                    onDoubleClick={() => {
                      onSelect(file.url);
                      onClose();
                    }}
                    style={{
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      boxShadow: isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    title={`${file.name}\nSize: ${file.sizeFormatted || ''}\nDouble-click to select immediately`}
                  >
                    {/* Selected badge */}
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          zIndex: 2,
                          background: '#2563eb',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}

                    {/* Image Preview */}
                    <div
                      style={{
                        height: '110px',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={resolveImageUrl(file.url)}
                        alt={file.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
                        }}
                      />
                    </div>

                    {/* Filename & size */}
                    <div
                      style={{
                        padding: '6px 8px',
                        borderTop: '1px solid #f1f5f9',
                        background: '#ffffff',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#334155',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {file.name}
                      </span>
                      {file.sizeFormatted && (
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {file.sizeFormatted}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {selectedUrls.length > 0 ? (
              <span className="text-primary fw-bold">
                ✓ {selectedUrls.length} image{selectedUrls.length > 1 ? 's' : ''} selected
              </span>
            ) : (
              <span>Select an image or double-click to choose</span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-light border"
              style={{ borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedUrls.length === 0}
              className="btn btn-sm btn-primary"
              style={{
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 16px',
              }}
            >
              {multiple
                ? `Choose ${selectedUrls.length > 0 ? `(${selectedUrls.length})` : ''}`
                : 'Choose Selected Image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
