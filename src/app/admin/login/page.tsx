'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, User, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wood-950 flex flex-col justify-center items-center px-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-tr from-wood-950 via-wood-900 to-wood-950 opacity-90" />
      
      {/* Back to site link */}
      <div className="relative z-10 w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-amber-200/80 hover:text-amber-300 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>මුල් පිටුවට යන්න (Back to Website)</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md bg-wood-900/90 border border-wood-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-amber-400/80 shadow-2xl shadow-amber-950/80 bg-wood-950 ring-2 ring-amber-500/30">
            <Image
              src="/logo.jpg"
              alt="Ceylon Wood Creations"
              width={96}
              height={96}
              className="w-full h-full object-cover rounded-full"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold brand-font text-amber-300">
            Ceylon Wood Creations
          </h1>
          <p className="text-xs text-amber-100/60 uppercase tracking-widest">
            Admin Security Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-amber-200/80 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-amber-500/70 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-wood-950/80 border border-wood-700/80 text-amber-50 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-amber-200/80 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-amber-500/70 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-wood-950/80 border border-wood-700/80 text-amber-50 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition duration-200 text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ආරක්ෂිතව පිවිසෙමින්...</span>
              </>
            ) : (
              <span>Login to Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-wood-800 text-center">
          <p className="text-[11px] text-amber-200/40">
            ආරක්ෂිත හේතුන් මත සියලු Login උත්සාහයන් සටහන් කරනු ලැබේ.
          </p>
        </div>

      </div>
    </div>
  );
}
