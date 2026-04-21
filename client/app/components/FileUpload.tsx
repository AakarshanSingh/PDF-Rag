'use client';

import * as React from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api';
import { toast } from 'sonner';
import { UploadCloud, File, CheckCircle, XCircle, Loader } from 'lucide-react';

type DocStatus = 'idle' | 'queued' | 'indexing' | 'indexed' | 'failed';
type UploadStatus = 'idle' | 'success' | 'error';

const STATUS_LABEL: Record<DocStatus, string> = {
  idle: '',
  queued: 'In queue...',
  indexing: 'Indexing...',
  indexed: 'Ready to chat',
  failed: 'Failed',
};
const STATUS_COLOR: Record<DocStatus, string> = {
  idle: '#555',
  queued: '#888',
  indexing: '#6b8cff',
  indexed: '#4ade80',
  failed: '#f87171',
};
const STATUS_WIDTH: Record<DocStatus, string> = {
  idle: '0%',
  queued: '33%',
  indexing: '66%',
  indexed: '100%',
  failed: '100%',
};

const FileUploadComponent: React.FC = () => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = React.useState('');
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<UploadStatus>('idle');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [docStatus, setDocStatus] = React.useState<DocStatus>('idle');
  const [isDragging, setIsDragging] = React.useState(false);

  const { getToken } = useAuth();
  const apiClient = React.useMemo(() => createApiClient(getToken), [getToken]);

  const pollStatus = React.useCallback(
    async (documentId: string) => {
      setDocStatus('queued');
      const id = window.setInterval(async () => {
        try {
          const s: DocStatus = await apiClient.getDocumentStatus(documentId);
          setDocStatus(s);
          if (s === 'indexed') {
            toast.success('PDF ready.');
            window.clearInterval(id);
          }
          if (s === 'failed') {
            toast.error('Indexing failed.');
            window.clearInterval(id);
          }
        } catch {
          toast.error('Could not check status.');
          window.clearInterval(id);
        }
      }, 2000);
    },
    [apiClient],
  );

  const uploadFile = React.useCallback(
    async (file: File) => {
      setFileName(file.name);
      setProgress(0);
      setUploadStatus('idle');
      setErrorMsg('');
      setDocStatus('idle');
      setIsUploading(true);
      const tid = toast.loading('Uploading...');
      try {
        const result = await apiClient.uploadPdf(file, setProgress);
        setProgress(100);
        setUploadStatus('success');
        toast.dismiss(tid);
        toast.success('Upload complete.');
        await pollStatus(result.documentId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed.';
        setUploadStatus('error');
        setErrorMsg(msg);
        toast.dismiss(tid);
        toast.error(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [apiClient, pollStatus],
  );

  const handleChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await uploadFile(file);
      e.target.value = '';
    },
    [uploadFile],
  );

  const handleDrop = React.useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (file.type !== 'application/pdf') {
        toast.error('Please drop a PDF file.');
        return;
      }
      await uploadFile(file);
    },
    [uploadFile],
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = React.useCallback(() => setIsDragging(false), []);
  const openPicker = React.useCallback(() => fileInputRef.current?.click(), []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
        gap: 14,
      }}
    >
      <style>{`
        .drop-zone { transition: background 0.15s, border-color 0.15s; }
        .drop-zone:hover, .drop-zone.drag { background: #141416 !important; border-color: #333 !important; }
        .up-btn:not(:disabled):hover { background: #e8e8e8 !important; }
        .up-btn:not(:disabled):active { transform: scale(.98); }
        .up-btn:disabled { opacity: .4; cursor: default; }
        .progress-fill { transition: width 0.4s cubic-bezier(.4,0,.2,1), background 0.3s; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <input
        ref={fileInputRef}
        type='file'
        accept='application/pdf'
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#444',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 3,
            }}
          >
            Document
          </p>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#e0e0e0',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Upload PDF
          </h2>
        </div>
        <UserButton />
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone${isDragging ? ' drag' : ''}`}
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          flex: 1,
          minHeight: 120,
          border: '1.5px dashed #1e1e22',
          borderRadius: 14,
          background: '#0e0e10',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: '#161618',
            border: '0.5px solid #222',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UploadCloud size={18} color='#555' />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              color: '#666',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 3,
            }}
          >
            Drop PDF or <span style={{ color: '#aaa' }}>browse</span>
          </p>
          <p style={{ color: '#3a3a3e', fontSize: 12 }}>PDF only · Max 10MB</p>
        </div>
      </div>

      {/* File row */}
      {fileName && (
        <div
          style={{
            background: '#111113',
            border: '0.5px solid #1e1e22',
            borderRadius: 11,
            padding: '10px 12px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: progress < 100 ? 10 : 0,
            }}
          >
            <File size={13} color='#555' />
            <span
              style={{
                fontSize: 12,
                color: '#999',
                fontWeight: 500,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fileName}
            </span>
            {uploadStatus === 'success' && (
              <CheckCircle size={13} color='#4ade80' />
            )}
            {uploadStatus === 'error' && <XCircle size={13} color='#f87171' />}
          </div>
          {progress < 100 && isUploading && (
            <div
              style={{
                height: 2,
                background: '#1e1e22',
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              <div
                className='progress-fill'
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#f0f0f0',
                  borderRadius: 99,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Indexing status */}
      {docStatus !== 'idle' && (
        <div
          style={{
            background: '#111113',
            border: '0.5px solid #1e1e22',
            borderRadius: 11,
            padding: '10px 12px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {docStatus === 'indexing' && (
                <Loader
                  size={12}
                  color='#6b8cff'
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              )}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: STATUS_COLOR[docStatus],
                }}
              >
                {STATUS_LABEL[docStatus]}
              </span>
            </div>
            <span style={{ fontSize: 10, color: '#333' }}>Processing</span>
          </div>
          <div
            style={{
              height: 2,
              background: '#1e1e22',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              className='progress-fill'
              style={{
                height: '100%',
                width: STATUS_WIDTH[docStatus],
                background: STATUS_COLOR[docStatus],
                borderRadius: 99,
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {uploadStatus === 'error' && errorMsg && (
        <div
          style={{
            background: '#1a0f0f',
            border: '0.5px solid #2e1a1a',
            borderRadius: 10,
            padding: '10px 12px',
            flexShrink: 0,
          }}
        >
          <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>
            {errorMsg}
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        className='up-btn'
        onClick={openPicker}
        disabled={isUploading}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 11,
          border: 'none',
          background: '#f0f0f0',
          color: '#0c0c0e',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          transition: 'background 0.15s, transform 0.1s',
          flexShrink: 0,
        }}
      >
        {isUploading ? (
          <>
            <Loader
              size={14}
              style={{ animation: 'spin 1s linear infinite' }}
            />{' '}
            Uploading...
          </>
        ) : (
          <>
            <UploadCloud size={14} /> Choose PDF
          </>
        )}
      </button>
    </div>
  );
};

export default FileUploadComponent;
