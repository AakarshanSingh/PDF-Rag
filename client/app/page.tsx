'use client';

import { useState } from 'react';
import ChatComponent from './components/Chat';
import FileUploadComponent from './components/FileUpload';
import { PanelLeft, X, UploadCloud } from 'lucide-react';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className='h-screen w-screen overflow-hidden bg-[#0c0c0e] flex flex-col md:flex-row'>
      {/* ── Mobile top bar ── */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-[#1a1a1d] md:hidden shrink-0'>
        <span className='text-xs font-semibold tracking-widest uppercase text-[#555]'>
          PDF Chat
        </span>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setSidebarOpen(true)}
            className='flex items-center gap-1.5 p-1.5 px-2.5 rounded-lg bg-[#111113] border border-[#1e1e22] text-[#888] hover:text-white transition-colors'
          >
            <UploadCloud size={15} />
            <span className='text-[10px] font-bold uppercase tracking-wider'>Upload</span>
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className='p-1.5 rounded-lg bg-[#111113] border border-[#1e1e22] text-[#666]'
            aria-label='Open document panel'
          >
            <PanelLeft size={16} />
          </button>
        </div>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className='fixed inset-0 z-50 md:hidden'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            onClick={() => setSidebarOpen(false)}
          />
          {/* Panel */}
          <div className='absolute left-0 top-0 bottom-0 w-75 bg-[#0f0f11] border-r border-[#1e1e22] flex flex-col'>
            <div className='flex items-center justify-between px-4 py-3 border-b border-[#1a1a1d]'>
              <span className='text-xs font-semibold tracking-widest uppercase text-[#555]'>
                Document
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className='p-1.5 rounded-lg bg-[#111113] border border-[#1e1e22] text-[#666]'
                aria-label='Close panel'
              >
                <X size={16} />
              </button>
            </div>
            <div className='flex-1 overflow-y-auto p-4'>
              <FileUploadComponent />
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className='hidden md:flex w-90 shrink-0 flex-col h-full border-r border-[#1a1a1d] bg-[#0f0f11]'>
        <FileUploadComponent />
      </aside>

      {/* ── Chat ── */}
      <div className='flex-1 min-w-0 h-full overflow-hidden flex flex-col'>
        <ChatComponent />
      </div>
    </main>
  );
}
