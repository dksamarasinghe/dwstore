import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { parseCSV, downloadCSV } from '../../utils/csv';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  expectedColumns: string[];
  sampleFilename: string;
  sampleHeaders: string[];
  sampleRows: (string | number)[][];
  onImport: (rows: string[][], headers: string[]) => Promise<{ count: number; message?: string } | void> | { count: number; message?: string } | void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  expectedColumns,
  sampleFilename,
  sampleHeaders,
  sampleRows,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const processFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid .csv file.');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const allRows = parseCSV(text);
        if (allRows.length < 2) {
          setError('The uploaded CSV file is empty or missing data rows.');
          setParsedHeaders([]);
          setParsedRows([]);
          return;
        }
        const headers = allRows[0];
        const dataRows = allRows.slice(1);
        setParsedHeaders(headers);
        setParsedRows(dataRows);
      } catch (err: any) {
        setError(`Failed to parse CSV: ${err.message || 'Invalid format'}`);
      }
    };
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSample = () => {
    downloadCSV(sampleFilename, sampleHeaders, sampleRows);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) {
      setError('No data rows to import.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onImport(parsedRows, parsedHeaders);
      setFile(null);
      setParsedRows([]);
      setParsedHeaders([]);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to import data. Please check CSV format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {title}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              {description}
            </p>
          </div>
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

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Download Sample Template Banner */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Need a reference format?
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Download a pre-formatted sample CSV template with columns: {expectedColumns.slice(0, 4).join(', ')}...
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2563eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <Download size={14} /> Download Sample
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #93c5fd',
              background: '#eff6ff',
              borderRadius: '12px',
              padding: '28px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#dbeafe',
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <Upload size={22} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a' }}>
              {file ? file.name : 'Click to browse or drag & drop CSV file'}
            </div>
            <div style={{ fontSize: '12px', color: '#60a5fa', marginTop: '4px' }}>
              {file
                ? `${(file.size / 1024).toFixed(1)} KB · ${parsedRows.length} rows detected`
                : 'Supports .csv files formatted in UTF-8'}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Parsed Preview */}
          {parsedRows.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  Preview (Showing 3 of {parsedRows.length} rows)
                </div>
                <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <CheckCircle2 size={14} /> Ready to import
                </div>
              </div>
              <div
                style={{
                  overflowX: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  maxHeight: '180px',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {parsedHeaders.slice(0, 6).map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#475569',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 3).map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {row.slice(0, 6).map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              padding: '8px 12px',
                              color: '#334155',
                              whiteSpace: 'nowrap',
                              maxWidth: '180px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={loading || parsedRows.length === 0}
            style={{
              background: parsedRows.length > 0 ? '#2563eb' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: parsedRows.length > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Upload size={14} />
            {loading ? 'Importing...' : `Import ${parsedRows.length > 0 ? parsedRows.length : ''} Rows`}
          </button>
        </div>
      </div>
    </div>
  );
};
