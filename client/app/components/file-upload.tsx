'use client';

import { UploadCloud } from 'lucide-react';
import * as React from 'react';

const FileUploadComponent: React.FC = () => {
  const handleFileUploadButtonClick = () => {
    console.log('clicked');
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', 'application/pdf');
    el.addEventListener('change', async (ev) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          const formData = new FormData();
          formData.append('pdf', file);

          await fetch('http://localhost:8000/upload/pdf', {
            method: 'POST',
            body: formData,
          });

          console.log('file uploaded')
        }
      }
    });

    el.click();
  };

  return (
    <div className='bg-slate-900 text-white shadow-2xl w-full flex justify-center items-center p-4 rounded-xl border-white border-2'>
      <div
        onClick={handleFileUploadButtonClick}
        className='flex justify-center items-center flex-col cursor-pointer'
      >
        <h3>Upload PDF File</h3>
        <UploadCloud />
      </div>
    </div>
  );
};

export default FileUploadComponent;
