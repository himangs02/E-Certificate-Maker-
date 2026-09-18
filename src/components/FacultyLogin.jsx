import React, { useState, useEffect } from 'react';
import geetaLogo from '../assets/geeta_logo_transparent.png';
import { getDepartments, fetchDepartments, authenticateFaculty } from '../services/facultyDepartmentService';
import { 
  GraduationCap, 
  User, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Building2, 
  CheckCircle2, 
  Lock,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

export default function FacultyLogin({ 
  onLoginSuccess, 
  onOpenAdmin,
  onOpenVerify,
  isDark,
  onToggleTheme 
}) {
  const [departments, setDepartments] = useState(() => getDepartments());
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState(() => getDepartments()[0]?.name || 'Department of Arts & Humanities');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments().then(depts => {
      if (depts && depts.length > 0) {
        setDepartments(depts);
        setDepartment(prev => prev || depts[0].name);
      }
    }).catch(err => console.warn('Departments fetch notice:', err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authResult = await authenticateFaculty(facultyId, password);

      if (authResult.success) {
        onLoginSuccess({
          ...authResult.user,
          department: department || authResult.user.department
        });
      } else {
        setError(authResult.message || 'Invalid credentials. Please verify your Faculty ID and password.');
      }
    } catch (err) {
      setError('Login error: ' + (err.message || 'Unable to connect to database.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col justify-between transition-colors duration-200">
      {/* Top Navbar - Full Width & Wide */}
      <header className="h-20 shrink-0 border-b border-stone-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="h-full w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={geetaLogo} 
              alt="Geeta University" 
              className="h-12 sm:h-14 w-auto object-contain py-1" 
            />
            <div className="h-8 w-[1px] bg-stone-200 dark:bg-zinc-800 hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Certificate Studio
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 rounded-md border border-orange-200/80 dark:border-orange-800/60">
                  Faculty Portal
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Geeta University · Authorized Faculty Certificate Generation & Issuance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100/90 hover:bg-stone-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all border border-stone-200 dark:border-zinc-700 shadow-xs cursor-pointer"
                title="Open Admin Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span className="hidden sm:inline">Admin Portal</span>
              </button>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-stone-200 dark:hover:border-zinc-700 cursor-pointer"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-lg mx-auto my-auto px-4 py-8">
        <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 animate-fadeIn">
          {/* Header icon and title */}
          <div className="text-center space-y-1.5">
            <div className="w-13 h-13 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-2 shadow-xs border border-orange-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Faculty Studio Sign In
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Please sign in with your faculty credentials to design, generate, and issue verified Geeta University certificates.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Faculty ID / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  placeholder="Enter Faculty ID or Username (e.g. faculty or GU/FAC/001)"
                  className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Department / School
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 transition-all text-xs sm:text-sm appearance-none cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept.id || dept.name} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold shadow-xs transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In & Open Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security details & feature list */}
          <div className="pt-3 border-t border-stone-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Live QR Code Generation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Cloud Supabase Registry</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>High-Res Print PDF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Bulk CSV Generation</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-[11px] text-zinc-400 py-3">
        Geeta University · Panipat, Delhi-NCR, India · Faculty & Staff Portal
      </footer>
    </div>
  );
}
