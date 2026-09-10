import React, { useEffect, useState } from 'react';
import { getCertificateByCode, saveCertificate } from '../services/supabase';
import { decodeCertificateData } from '../utils/qrGenerator';
import geetaLogo from '../assets/geeta_logo_transparent.png';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  User, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Hash, 
  FileCheck2, 
  Search, 
  ArrowLeft, 
  ExternalLink,
  QrCode,
  AlertTriangle
} from 'lucide-react';

export default function CertificateVerification({ verificationCode, onBackToStudio }) {
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState(null);
  const [searchCode, setSearchCode] = useState(verificationCode || '');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (verificationCode) {
      loadCertificate(verificationCode);
    } else {
      setLoading(false);
    }
  }, [verificationCode]);

  const loadCertificate = async (codeToFind) => {
    setLoading(true);
    setSearched(true);
    try {
      const cleanCode = (codeToFind || '').trim();
      const data = cleanCode ? await getCertificateByCode(cleanCode) : null;
      setCert(data);
      if (data?.verification_code) {
        setSearchCode(data.verification_code);
      }
    } catch (err) {
      console.error('Error loading certificate:', err);
      setCert(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCode.trim()) {
      loadCertificate(searchCode.trim(), null);
    }
  };

  return (
    <div className="h-screen w-full bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col justify-between overflow-y-auto overflow-x-hidden custom-scrollbar selection:bg-orange-500/20">
      {/* Top Header - Wide & Full-Width */}
      <header className="h-20 shrink-0 border-b border-stone-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="h-full w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={geetaLogo} alt="Geeta University" className="h-12 sm:h-14 w-auto object-contain py-1" />
            <div className="h-8 w-[1px] bg-stone-200 dark:bg-zinc-800 hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Certificate Verification Portal
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200/80">
                  Registry Verified
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Official Geeta University Academic Registry
              </p>
            </div>
          </div>

          {onBackToStudio && (
            <button
              onClick={onBackToStudio}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100/90 hover:bg-stone-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all border border-stone-200 dark:border-zinc-700 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Open Studio</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-10 text-center shadow-xs space-y-3">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Verifying certificate against Supabase Registry...
            </p>
          </div>
        ) : cert ? (
          /* Certificate Found & Verified */
          <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
            {/* Verification Header Banner */}
            <div className="bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Official Document Verified
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {cert.recipient_name || cert.recipientName}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  Code: <strong className="text-zinc-800 dark:text-zinc-200">{cert.verification_code || verificationCode}</strong>
                </p>
              </div>
            </div>

            {/* Certificate Details Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
                <div>
                  <span className="text-zinc-400 text-[11px] block">Designation / Class</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                    {cert.designation || 'Participant'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[11px] block">Department / School</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                    {cert.department || 'Geeta University'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 text-[11px] block mb-0.5">Achievement / Event</span>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-stone-50 dark:bg-zinc-950 p-3 rounded-xl border border-stone-200/60 dark:border-zinc-800">
                  {cert.action_achievement || cert.actionAchievement || 'Certificate of Appreciation'}
                </p>
              </div>

              {cert.organized_by_date && (
                <div>
                  <span className="text-zinc-400 text-[11px] block mb-0.5">Organized By</span>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    {cert.organized_by_date}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800 text-[11px]">
                <div>
                  <span className="text-zinc-400 block">Issue Date</span>
                  <strong className="text-zinc-700 dark:text-zinc-300 font-mono">
                    {cert.issue_date || cert.issueDate || 'September 15, 2026'}
                  </strong>
                </div>
                <div>
                  <span className="text-zinc-400 block">Serial / Ref No.</span>
                  <strong className="text-zinc-700 dark:text-zinc-300 font-mono">
                    {cert.ref_number || cert.refNumber || 'GU/Pas/2026/042'}
                  </strong>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-zinc-400 block">Authority</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Dr. Manoj Manuja, VC
                  </strong>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="bg-stone-50 dark:bg-zinc-950/60 p-4 px-6 border-t border-stone-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
                <span>Digitally Authenticated by Geeta University Registry</span>
              </div>

              {onBackToStudio && (
                <button
                  onClick={onBackToStudio}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-xs"
                >
                  Generate More Certificates
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Not Found or Search State */
          <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 text-center shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              {searched ? <AlertTriangle className="w-6 h-6" /> : <QrCode className="w-6 h-6" />}
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {searched ? 'Certificate Not Issued or Not Found' : 'Verify a Geeta University Certificate'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {searched
                  ? 'No issued record matches this verification code. A certificate becomes officially verified only after it has been downloaded by authorized faculty.'
                  : 'Enter the unique verification code printed below the QR code to verify authenticity.'}
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="e.g. GU-2026-89421A"
                className="flex-1 bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-[11px] text-zinc-400 py-4 border-t border-stone-200/80 dark:border-zinc-800/80 mt-6">
        © {new Date().getFullYear()} Geeta University, Panipat, Delhi NCR. All rights reserved. Official e-Certificate Verification Registry.
      </footer>
    </div>
  );
}
