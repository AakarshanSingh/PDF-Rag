'use client';

import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import * as React from 'react';

const FileUploadComponent: React.FC = () => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = React.useState<string>('');
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = React.useState<string>('');

  const uploadFile = async (file: File) => {
    setSelectedFileName(file.name);
    setUploadProgress(0);
    setStatus('idle');
    setStatusMessage('');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8000/upload/pdf');

        xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            setStatus('success');
            setStatusMessage('File uploaded successfully.');
            resolve();
            return;
          }

          setStatus('error');
          setStatusMessage('Upload failed. Please try again.');
          reject(new Error(`Upload failed with status ${xhr.status}`));
        };

        xhr.onerror = () => {
          setStatus('error');
          setStatusMessage('Unable to reach server.');
          reject(new Error('Network error during upload.'));
        };

        xhr.send(formData);
      });
    } catch {
      // Status updates are already set inside xhr handlers.
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelection = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await uploadFile(file);
    event.target.value = '';
  };

  return (
    <div className='w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl'>
      <input
        ref={fileInputRef}
        type='file'
        accept='application/pdf'
        className='hidden'
        onChange={handleFileSelection}
      />

      <div className='mb-4 flex items-center gap-3'>
        <div className='rounded-lg border border-zinc-700 bg-zinc-900 p-2'>
          <UploadCloud className='h-5 w-5 text-zinc-200' />
        </div>
        <div>
          <h3 className='text-sm font-semibold text-zinc-100'>Upload PDF File</h3>
          <p className='text-xs text-zinc-400'>Select a PDF to index for chat.</p>
        </div>
      </div>

      <Button
        type='button'
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className='w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:bg-zinc-400'
      >
        {isUploading ? 'Uploading...' : 'Choose PDF'}
      </Button>

      {selectedFileName ? (
        <div className='mt-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3'>
          <div className='mb-2 flex items-center gap-2 text-xs text-zinc-300'>
            <FileText className='h-4 w-4 text-zinc-400' />
            <span className='truncate'>{selectedFileName}</span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-zinc-800'>
            <div
              className='h-full bg-zinc-100 transition-all duration-200'
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className='mt-2 text-right text-xs text-zinc-400'>
            {uploadProgress}% uploaded
          </div>
        </div>
      ) : null}

      {status !== 'idle' ? (
        <div
          className={`mt-3 flex items-center gap-2 text-xs ${
            status === 'success' ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle2 className='h-4 w-4' />
          ) : (
            <AlertCircle className='h-4 w-4' />
          )}
          <span>{statusMessage}</span>
        </div>
      ) : null}
      <div className='mt-3 text-[11px] text-zinc-500'>
        Only PDF files are supported.
      </div>
    </div>
  );
};

export default FileUploadComponent;
