import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Unlink,
  Image as ImageIcon,
  Table,
  Minus,
  RemoveFormatting,
  Undo2,
  Redo2,
  Code,
  Eye,
  Upload,
  FolderOpen,
  Globe,
  Plus
} from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';
import { getStorefrontUrl } from '../../config';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  onUploadImage?: (file: File) => Promise<string | null>;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Type full specifications, overview, image embeds, and warranty guidelines...',
  minHeight = '280px',
  onUploadImage,
}) => {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [showImageDropdown, setShowImageDropdown] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // Sync value from props into editor innerHTML only if different (prevents cursor jump)
  useEffect(() => {
    if (editorRef.current && mode === 'visual') {
      const currentContent = editorRef.current.innerHTML;
      if (value !== currentContent && !(value === '' && currentContent === '<br>')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, mode]);

  // Save current cursor selection before opening modals
  const saveSelection = () => {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedSelectionRef.current = sel.getRangeAt(0);
      }
    }
  };

  // Restore cursor selection
  const restoreSelection = () => {
    if (savedSelectionRef.current && window.getSelection) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelectionRef.current);
    }
  };

  // Exec command wrapper
  const execCmd = (command: string, arg: string | undefined = undefined) => {
    if (mode !== 'visual') return;
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, arg);
    handleEditorInput();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const clean = html === '<br>' || html === '<p><br></p>' ? '' : html;
      onChange(clean);
    }
  };

  const handleInsertHtml = (htmlSnippet: string) => {
    if (mode === 'visual') {
      editorRef.current?.focus();
      restoreSelection();
      document.execCommand('insertHTML', false, htmlSnippet);
      handleEditorInput();
    } else {
      onChange((value || '') + '\n' + htmlSnippet);
    }
  };

  // Insert Link
  const handleOpenLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : '';
    setLinkText(selectedText);
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const handleApplyLink = () => {
    if (!linkUrl.trim()) return;
    restoreSelection();
    const url = linkUrl.trim().startsWith('http') || linkUrl.trim().startsWith('/')
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`;
    const txt = linkText.trim() || url;
    const aHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#2563eb; text-decoration:underline;">${txt}</a>`;
    handleInsertHtml(aHtml);
    setShowLinkModal(false);
  };

  // Insert Image via URL
  const handleApplyImageUrl = () => {
    if (!customImageUrl.trim()) return;
    const imgHtml = `<p><img src="${customImageUrl.trim()}" alt="Product Overview" style="max-width:100%; height:auto; border-radius:8px; margin:12px 0; display:block;" /></p>`;
    handleInsertHtml(imgHtml);
    setCustomImageUrl('');
    setShowImageUrlModal(false);
    setShowImageDropdown(false);
  };

  // Insert Image from Media Library
  const handleSelectMediaImage = (url: string) => {
    const imgHtml = `<p><img src="${url}" alt="Product Overview" style="max-width:100%; height:auto; border-radius:8px; margin:12px 0; display:block;" /></p>`;
    handleInsertHtml(imgHtml);
    setIsMediaModalOpen(false);
    setShowImageDropdown(false);
  };

  // Upload image from PC directly
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let uploadedUrl: string | null = null;
      if (onUploadImage) {
        uploadedUrl = await onUploadImage(file);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');
        const res = await fetch(`${getStorefrontUrl()}/api/upload`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedUrl = data.url;
        }
      }

      if (uploadedUrl) {
        const imgHtml = `<p><img src="${uploadedUrl}" alt="${file.name}" style="max-width:100%; height:auto; border-radius:8px; margin:12px 0; display:block;" /></p>`;
        handleInsertHtml(imgHtml);
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setIsUploading(false);
      setShowImageDropdown(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Insert Specs Table
  const handleInsertTable = () => {
    const tableHtml = `
<table style="width:100%; border-collapse:collapse; margin:16px 0; border:1px solid #e5e7eb; font-size:14px;">
  <thead>
    <tr style="background:#f8fafc;">
      <th style="border:1px solid #e5e7eb; padding:10px 14px; text-align:left; width:35%;">Specification</th>
      <th style="border:1px solid #e5e7eb; padding:10px 14px; text-align:left;">Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #e5e7eb; padding:8px 14px; font-weight:600;">Brand / Model</td>
      <td style="border:1px solid #e5e7eb; padding:8px 14px;">Original Quality Official</td>
    </tr>
    <tr>
      <td style="border:1px solid #e5e7eb; padding:8px 14px; font-weight:600;">Battery / Power</td>
      <td style="border:1px solid #e5e7eb; padding:8px 14px;">Long-lasting Battery Life</td>
    </tr>
    <tr>
      <td style="border:1px solid #e5e7eb; padding:8px 14px; font-weight:600;">Package Includes</td>
      <td style="border:1px solid #e5e7eb; padding:8px 14px;">1x Device, 1x Charging Cable, Manual, Warranty Card</td>
    </tr>
  </tbody>
</table>
<p><br></p>`;
    handleInsertHtml(tableHtml);
  };

  // Word count & Char count
  const rawText = value ? value.replace(/<[^>]*>/g, '').trim() : '';
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = rawText.length;

  return (
    <div
      className="rich-text-editor-container rounded-3 overflow-hidden shadow-sm"
      style={{
        border: '1px solid var(--border)',
        background: 'var(--card-bg, #ffffff)',
      }}
    >
      {/* 1. Main Dark Sleek Toolbar */}
      <div
        className="rte-toolbar d-flex flex-wrap align-items-center justify-content-between p-2 gap-1"
        style={{
          background: '#18181b',
          color: '#f4f4f5',
          borderBottom: '1px solid #27272a',
        }}
      >
        {/* Left Toolbar Controls */}
        <div className="d-flex flex-wrap align-items-center gap-1">
          {/* Format / Heading Dropdown */}
          <select
            className="form-select form-select-sm text-white border-0 me-1"
            style={{
              background: '#27272a',
              fontSize: '12px',
              padding: '4px 8px',
              width: '120px',
              borderRadius: '6px',
            }}
            onChange={(e) => {
              if (e.target.value) {
                execCmd('formatBlock', e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Heading / Style
            </option>
            <option value="<p>">Normal Text</option>
            <option value="<h1>">Heading 1</option>
            <option value="<h2>">Heading 2</option>
            <option value="<h3>">Heading 3</option>
            <option value="<h4>">Heading 4</option>
            <option value="<blockquote>">Blockquote</option>
          </select>

          {/* Bold */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Bold (Ctrl+B)"
            onClick={() => execCmd('bold')}
          >
            <Bold size={15} />
          </button>

          {/* Italic */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Italic (Ctrl+I)"
            onClick={() => execCmd('italic')}
          >
            <Italic size={15} />
          </button>

          {/* Underline */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Underline (Ctrl+U)"
            onClick={() => execCmd('underline')}
          >
            <Underline size={15} />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Strikethrough"
            onClick={() => execCmd('strikeThrough')}
          >
            <Strikethrough size={15} />
          </button>

          <span style={{ width: '1px', height: '18px', background: '#3f3f46', margin: '0 3px' }} />

          {/* Bulleted List */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Bullet List"
            onClick={() => execCmd('insertUnorderedList')}
          >
            <List size={15} />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Numbered List"
            onClick={() => execCmd('insertOrderedList')}
          >
            <ListOrdered size={15} />
          </button>

          <span style={{ width: '1px', height: '18px', background: '#3f3f46', margin: '0 3px' }} />

          {/* Align Left */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Align Left"
            onClick={() => execCmd('justifyLeft')}
          >
            <AlignLeft size={15} />
          </button>

          {/* Align Center */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Align Center"
            onClick={() => execCmd('justifyCenter')}
          >
            <AlignCenter size={15} />
          </button>

          {/* Align Right */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Align Right"
            onClick={() => execCmd('justifyRight')}
          >
            <AlignRight size={15} />
          </button>

          <span style={{ width: '1px', height: '18px', background: '#3f3f46', margin: '0 3px' }} />

          {/* Insert Link */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Insert Link"
            onClick={handleOpenLinkModal}
          >
            <Link2 size={15} />
          </button>

          {/* Unlink */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Remove Link"
            onClick={() => execCmd('unlink')}
          >
            <Unlink size={15} />
          </button>

          {/* Insert Image Button with Dropdown */}
          <div className="position-relative d-inline-block">
            <button
              type="button"
              className="btn btn-sm btn-dark text-white p-1 px-2 border-0 d-flex align-items-center gap-1"
              style={{
                background: showImageDropdown ? '#3b82f6' : '#27272a',
                borderRadius: '4px',
              }}
              title="Insert Image (Media Library, PC Upload, or URL)"
              onClick={() => {
                saveSelection();
                setShowImageDropdown(!showImageDropdown);
              }}
            >
              <ImageIcon size={15} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Image</span>
            </button>

            {showImageDropdown && (
              <div
                className="position-absolute shadow-lg rounded-2 py-2 mt-1"
                style={{
                  top: '100%',
                  left: 0,
                  zIndex: 1050,
                  background: '#1f2937',
                  border: '1px solid #374151',
                  minWidth: '220px',
                }}
              >
                {/* 1. Media Library */}
                <button
                  type="button"
                  className="w-100 text-start px-3 py-2 btn-dark text-white border-0 bg-transparent d-flex align-items-center gap-2 hover-bg"
                  style={{ fontSize: '13px' }}
                  onClick={() => {
                    setIsMediaModalOpen(true);
                    setShowImageDropdown(false);
                  }}
                >
                  <FolderOpen size={16} className="text-warning" />
                  <span>Choose from Media Library</span>
                </button>

                {/* 2. Upload from PC */}
                <button
                  type="button"
                  className="w-100 text-start px-3 py-2 btn-dark text-white border-0 bg-transparent d-flex align-items-center gap-2 hover-bg"
                  style={{ fontSize: '13px' }}
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading}
                >
                  <Upload size={16} className="text-info" />
                  <span>{isUploading ? 'Uploading Image...' : 'Upload Image from PC'}</span>
                </button>

                {/* 3. Image URL */}
                <button
                  type="button"
                  className="w-100 text-start px-3 py-2 btn-dark text-white border-0 bg-transparent d-flex align-items-center gap-2 hover-bg"
                  style={{ fontSize: '13px' }}
                  onClick={() => {
                    setShowImageUrlModal(true);
                    setShowImageDropdown(false);
                  }}
                >
                  <Globe size={16} className="text-success" />
                  <span>Insert Image by URL</span>
                </button>
              </div>
            )}
          </div>

          {/* Insert Specs Table */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0 d-flex align-items-center gap-1"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Insert Specs Table"
            onClick={handleInsertTable}
          >
            <Table size={15} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Table</span>
          </button>

          {/* Divider Line */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Horizontal Divider Line"
            onClick={() => execCmd('insertHorizontalRule')}
          >
            <Minus size={15} />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Clear Formatting"
            onClick={() => execCmd('removeFormat')}
          >
            <RemoveFormatting size={15} />
          </button>
        </div>

        {/* Right Toolbar Controls (Undo/Redo & Mode Switch) */}
        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Undo"
            onClick={() => execCmd('undo')}
          >
            <Undo2 size={14} />
          </button>

          <button
            type="button"
            className="btn btn-sm btn-dark text-white p-1 px-2 border-0"
            style={{ background: '#27272a', borderRadius: '4px' }}
            title="Redo"
            onClick={() => execCmd('redo')}
          >
            <Redo2 size={14} />
          </button>

          {/* Visual vs HTML Mode Switch */}
          <div
            className="d-inline-flex rounded-2 p-0.5 ms-2"
            style={{ background: '#27272a', border: '1px solid #3f3f46' }}
          >
            <button
              type="button"
              className={`btn btn-sm px-2 py-0.5 border-0 d-flex align-items-center gap-1 ${
                mode === 'visual' ? 'bg-primary text-white fw-bold' : 'text-muted'
              }`}
              style={{ fontSize: '11px', borderRadius: '4px' }}
              onClick={() => setMode('visual')}
            >
              <Eye size={12} />
              <span>Visual</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm px-2 py-0.5 border-0 d-flex align-items-center gap-1 ${
                mode === 'html' ? 'bg-primary text-white fw-bold' : 'text-muted'
              }`}
              style={{ fontSize: '11px', borderRadius: '4px' }}
              onClick={() => setMode('html')}
            >
              <Code size={12} />
              <span>HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden File Input for direct PC image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* 2. Editor Body */}
      {mode === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="rich-text-editor-body p-3"
          style={{
            minHeight,
            maxHeight: '650px',
            overflowY: 'auto',
            outline: 'none',
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'inherit',
            background: 'var(--bg, #ffffff)',
          }}
          data-placeholder={placeholder}
          onInput={handleEditorInput}
          onBlur={handleEditorInput}
        />
      ) : (
        <textarea
          rows={12}
          className="w-100 p-3 font-monospace"
          style={{
            minHeight,
            background: '#09090b',
            color: '#22c55e',
            fontSize: '13px',
            lineHeight: 1.5,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
          }}
          placeholder="Paste or write HTML tags directly (<h1>, <p>, <img>, <table>, etc.)..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* 3. Bottom Information Bar */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-1.5 border-top"
        style={{
          background: 'var(--hover, #f8fafc)',
          borderColor: 'var(--border)',
          fontSize: '12px',
          color: 'var(--text-muted, #64748b)',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <span>
            Mode: <b>{mode === 'visual' ? 'WYSIWYG Visual Editor' : 'HTML Code Editor'}</b>
          </span>
          <span>
            Words: <b>{wordCount}</b>
          </span>
          <span>
            Chars: <b>{charCount}</b>
          </span>
        </div>
        <div>
          <small className="text-muted">
            Formatting &amp; images render directly in Storefront Description tab
          </small>
        </div>
      </div>

      {/* Media Picker Modal */}
      {isMediaModalOpen && (
        <MediaPickerModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          title="Select Image to Embed in Description"
          defaultFolder="products"
          onSelect={(url) => handleSelectMediaImage(url)}
        />
      )}

      {/* Link Insertion Modal */}
      {showLinkModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}
          onClick={() => setShowLinkModal(false)}
        >
          <div
            className="p-4 rounded-3 shadow-lg"
            style={{ background: 'var(--card-bg, #ffffff)', width: '100%', maxWidth: '420px', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h6 className="fw-bold mb-3">Insert Hyperlink</h6>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '13px' }}>Link URL (e.g. https://...)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="https://dwstore.lk/..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '13px' }}>Display Text</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Click here for details"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowLinkModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleApplyLink}
                disabled={!linkUrl.trim()}
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image by URL Modal */}
      {showImageUrlModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}
          onClick={() => setShowImageUrlModal(false)}
        >
          <div
            className="p-4 rounded-3 shadow-lg"
            style={{ background: 'var(--card-bg, #ffffff)', width: '100%', maxWidth: '420px', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h6 className="fw-bold mb-3">Insert Image by URL</h6>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '13px' }}>Image URL</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="https://... or /media/products/..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                autoFocus
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowImageUrlModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleApplyImageUrl}
                disabled={!customImageUrl.trim()}
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
