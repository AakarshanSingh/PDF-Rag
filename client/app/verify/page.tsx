'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    let activeToastId: string | number | undefined;
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      toast.error('Invalid or missing verification token.');
      return;
    }

    const verifyToken = async () => {
      activeToastId = toast.loading('Verifying your email...');
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/auth/verify?token=${token}`, {
          method: 'GET',
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        setStatus('success');
        setMessage(data.message);
        toast.success(data.message, { id: activeToastId });
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message);
        toast.error(err.message, { id: activeToastId });
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="bg-[#111113] p-8 rounded-xl border border-[#1e1e22] w-full max-w-md text-center">
      <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-4">Email Verification</h2>
      
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#6b8cff] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-500 mb-6">{message}</p>
          <Link
            href="/login"
            className="w-full p-3 rounded-lg bg-[#f0f0f0] text-[#0c0c0e] font-semibold hover:bg-[#e8e8e8] transition-colors cursor-pointer inline-block text-center"
          >
            Go to Login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-500 mb-6">{message}</p>
          <Link
            href="/signup"
            className="w-full p-3 rounded-lg bg-[#2a2a2e] text-[#e0e0e0] font-semibold hover:bg-[#333338] transition-colors cursor-pointer inline-block text-center border border-[#3e3e42]"
          >
            Back to Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="bg-[#111113] p-8 rounded-xl border border-[#1e1e22] w-full max-w-md text-center">
          <div className="flex flex-col items-center">
             <div className="w-8 h-8 border-4 border-[#6b8cff] border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
