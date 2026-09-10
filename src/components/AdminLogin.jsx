import React, { useState } from 'react';
import geetaLogo from '../assets/geeta_logo_transparent.png';
import { Lock, User, KeyRound, ArrowRight, ShieldCheck, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onBackToStudio }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      // Strict credential check: username must be 'admin' and password must be 'geeta@123' or 'geeta @123'
      if (cleanUser === 'admin' && (cleanPass === 'geeta@123' || cleanPass === 'geeta @123')) {
        onLoginSuccess();
      } else {
        setError('Invalid administrator credentials. Please check your username and password.');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="h-screen w-full bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col justify-between overflow-y-auto overflow-x-hidden custom-scrollbar">
      {/* Top Navbar - Full Width & Wide */}
      <header className="h-20 shrink-0 border-b border-stone-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="h-full w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={geetaLogo} alt="Geeta University" className="h-12 sm:h-14 w-auto object-contain py-1" />
            <div className="h-8 w-[1px] bg-stone-200 dark:bg-zinc-800 hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Certificate Studio Admin
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 rounded-md border border-orange-200/80 dark:border-orange-800/60">
                  Official Portal
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Geeta University · Registry & Database Management
              </p>
            </div>
          </div>

          {onBackToStudio && (
            <button
              onClick={onBackToStudio}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100/90 hover:bg-stone-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all border border-stone-200 dark:border-zinc-700 shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Open Studio</span>
            </button>
          )}
        </div>
      </header>

      {/* Login Card */}
      <main className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 animate-fadeIn">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Admin Portal Login
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your credentials to access issued certificates & QR codes
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-[11px] text-zinc-400 py-2">
        Geeta University · Protected Administrative Database System
      </footer>
    </div>
  );
}
