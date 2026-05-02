'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Logging in...');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      toast.success('Logged in successfully', { id: toastId });
      login(data.token, data.user);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleDemoLogin = async () => {
    const toastId = toast.loading('Logging in as demo user...');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@example.com', password: 'password123' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Demo login failed');
      }

      toast.success('Logged in successfully', { id: toastId });
      login(data.token, data.user);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-[#111113] p-8 rounded-xl border border-[#1e1e22] w-full max-w-md">
        <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">Login</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#0e0e10] border border-[#222] text-white focus:outline-none focus:border-[#6b8cff]"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#0e0e10] border border-[#222] text-white focus:outline-none focus:border-[#6b8cff]"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 rounded-lg bg-[#f0f0f0] text-[#0c0c0e] font-semibold hover:bg-[#e8e8e8] transition-colors mb-4"
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full p-3 rounded-lg bg-transparent border border-[#3e3e42] text-[#e0e0e0] font-semibold hover:bg-[#2a2a2e] transition-colors mb-4"
        >
          Login as Demo User
        </button>
        <p className="text-sm text-gray-400 text-center">
          Don't have an account? <Link href="/signup" className="text-[#6b8cff] hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
