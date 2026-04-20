'use client';
import { useState } from 'react';
import Link from 'next/link';
import apiRequest from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStatus('success');
      setMessage('If that email exists, a reset link has been sent. Check backend logs for the token.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-xl p-8 border border-[#2a2a2a]">
        <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
        <p className="text-gray-400 mb-6 text-sm">Enter your email and we'll send a reset link.</p>

        {status === 'success' && (
          <div className="mb-4 p-3 rounded bg-green-900/40 text-green-400 text-sm">{message}</div>
        )}
        {status === 'error' && (
          <div className="mb-4 p-3 rounded bg-red-900/40 text-red-400 text-sm">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#252525] border border-[#333] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/auth/login" className="text-blue-400 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
