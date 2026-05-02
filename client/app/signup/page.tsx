'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const toastId = toast.loading('Creating your account...');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success(data.message || 'Registration successful. Please verify your email.', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleDemoLogin = async () => {
    const toastId = toast.loading('Logging in as demo user...');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
        <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">Sign Up</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#0e0e10] border border-[#222] text-white focus:outline-none focus:border-[#6b8cff]"
            required
          />
        </div>
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#0e0e10] border border-[#222] text-white focus:outline-none focus:border-[#6b8cff]"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#0e0e10] border border-[#222] text-white focus:outline-none focus:border-[#6b8cff]"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 rounded-lg bg-[#f0f0f0] text-[#0c0c0e] font-semibold hover:bg-[#e8e8e8] transition-colors mb-4"
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full p-3 rounded-lg bg-transparent border border-[#3e3e42] text-[#e0e0e0] font-semibold hover:bg-[#2a2a2e] transition-colors mb-4"
        >
          Login as Demo User
        </button>
        <p className="text-sm text-gray-400 text-center">
          Already have an account? <Link href="/login" className="text-[#6b8cff] hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
