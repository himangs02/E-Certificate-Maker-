import React, { useState, useEffect } from 'react';
import { fetchCertificates, deleteCertificate } from '../services/supabase';
import { generateQrDataUrl, getVerificationUrl } from '../utils/qrGenerator';
import { getDepartments, getFacultyUsers } from '../services/facultyDepartmentService';
import AdminFacultyDeptManager from './AdminFacultyDeptManager';
import geetaLogo from '../assets/geeta_logo_transparent.png';
import { 
  Building2, 
  Search, 
  RefreshCw, 
  LogOut, 
  ArrowLeft, 
  QrCode, 
  Download, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  ShieldCheck, 
  X,
  Users,
  Award,
  Calendar,
  UserCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Database
} from 'lucide-react';

export default function AdminDashboard({ onLogout, onBackToStudio, onOpenVerify }) {
  const [adminTab, setAdminTab] = useState('certificates'); // 'certificates' | 'faculty-depts'
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [sortBy, setSortBy] = useState('dept-asc'); // 'dept-asc' | 'dept-desc' | 'date-desc' | 'date-asc' | 'name-asc'
  const [selectedQr, setSelectedQr] = useState(null); // { cert, qrDataUrl }
  const [copiedCode, setCopiedCode] = useState(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  
  const [deptCount, setDeptCount] = useState(() => getDepartments().length);
  const [facCount, setFacCount] = useState(() => getFacultyUsers().length);

  const refreshMetaCounts = () => {
    setDeptCount(getDepartments().length);
    setFacCount(getFacultyUsers().length);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCertificates();
      setCertificates(data || []);
      refreshMetaCounts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (cert) => {
    if (window.confirm(`Are you sure you want to delete certificate for "${cert.recipient_name}" (${cert.verification_code})?`)) {
      await deleteCertificate(cert.id, cert.verification_code);
      setCertificates(prev => prev.filter(c => c.id !== cert.id && c.verification_code !== cert.verification_code));
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleInspectQr = async (cert) => {
    const url = getVerificationUrl(cert.verification_code);
    const dataUrl = await generateQrDataUrl(url, { size: 400 });
    setSelectedQr({ cert, dataUrl, url });
  };

  const handleDownloadQr = (cert, dataUrl) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${(cert.recipient_name || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_')}_QR_${cert.verification_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCsv = () => {
    if (filteredAndSorted.length === 0) return;
    const headers = ['Verification Code', 'Certificate ID', 'Recipient Name', 'Designation', 'Department', 'Achievement', 'Issue Date', 'Ref Number', 'Created At'];
    const rows = filteredAndSorted.map(c => [
      `"${c.verification_code || ''}"`,
      `"${c.certificate_id || ''}"`,
      `"${c.recipient_name || ''}"`,
      `"${c.designation || ''}"`,
      `"${c.department || ''}"`,
      `"${(c.action_achievement || '').replace(/"/g, '""')}"`,
      `"${c.issue_date || ''}"`,
      `"${c.ref_number || ''}"`,
      `"${c.created_at || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Geeta_Issued_Certificates_${selectedDepartment !== 'ALL' ? selectedDepartment.replace(/[^a-zA-Z0-9]/g, '_') + '_' : ''}${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic unique list of departments
  const allDepartmentOptions = Array.from(
    new Set([
      ...getDepartments().map(d => d.name),
      ...certificates.map(c => c.department).filter(Boolean)
    ])
  ).sort();

  // Filter & Department Wise Sorting Logic
  const filteredAndSorted = certificates
    .filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        (c.recipient_name && c.recipient_name.toLowerCase().includes(q)) ||
        (c.verification_code && c.verification_code.toLowerCase().includes(q)) ||
        (c.department && c.department.toLowerCase().includes(q)) ||
        (c.action_achievement && c.action_achievement.toLowerCase().includes(q)) ||
        (c.ref_number && c.ref_number.toLowerCase().includes(q));

      const matchesDept = selectedDepartment === 'ALL' || c.department === selectedDepartment;
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      if (sortBy === 'dept-asc') {
        const cmp = (a.department || '').localeCompare(b.department || '');
        if (cmp !== 0) return cmp;
        return (a.recipient_name || '').localeCompare(b.recipient_name || '');
      }
      if (sortBy === 'dept-desc') {
        const cmp = (b.department || '').localeCompare(a.department || '');
        if (cmp !== 0) return cmp;
        return (a.recipient_name || '').localeCompare(b.recipient_name || '');
      }
      if (sortBy === 'name-asc') {
        return (a.recipient_name || '').localeCompare(b.recipient_name || '');
      }
      if (sortBy === 'date-asc') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      // 'date-desc' (newest first)
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const toggleDeptSort = () => {
    if (sortBy === 'dept-asc') {
      setSortBy('dept-desc');
    } else {
      setSortBy('dept-asc');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col">
      {/* Top Admin Header */}
      <header className="h-20 shrink-0 border-b border-stone-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8">
        <div className="h-full w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={geetaLogo} alt="Geeta University" className="h-12 sm:h-14 w-auto object-contain py-1" />
            <div className="h-8 w-[1px] bg-stone-200 dark:bg-zinc-800 hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Admin Registry Portal
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 rounded-md border border-orange-200/80">
                  Official Portal
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Manage issued e-certificates, departments & faculty login credentials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setShowSqlModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 transition-all cursor-pointer shadow-xs"
              title="View & Copy Supabase SQL Table Schema"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Database Setup</span>
            </button>

            <button
              onClick={onBackToStudio}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100/90 hover:bg-stone-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-stone-200 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Certificate Studio</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-900/60 transition-all cursor-pointer shadow-xs"
              title="Sign out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Metric Cards (Database Node card completely removed) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Total Issued Certificates</span>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{certificates.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Academic Departments</span>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{deptCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Registered Faculty Accounts</span>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{facCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2.5 border-b border-stone-200/80 dark:border-zinc-800/80 pb-3">
          <button
            onClick={() => setAdminTab('certificates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'certificates'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-stone-200/80 dark:border-zinc-800/80 hover:bg-stone-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Issued Certificates Registry ({certificates.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('faculty-depts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'faculty-depts'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-stone-200/80 dark:border-zinc-800/80 hover:bg-stone-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Departments & Faculty Credentials</span>
          </button>
        </div>

        {/* VIEW 1: Faculty & Department Manager */}
        {adminTab === 'faculty-depts' && (
          <AdminFacultyDeptManager 
            onDataChanged={refreshMetaCounts}
          />
        )}

        {/* VIEW 2: Certificate Registry */}
        {adminTab === 'certificates' && (
          <>
            {/* Action, Filter & Sorting Bar */}
            <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipient, code, department, achievement..."
                  className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-all"
                />
              </div>

              {/* Controls: Department Filter, Sort Selector, CSV Export */}
              <div className="flex flex-wrap items-center gap-2 justify-end">
                {/* Department Filter */}
                <div className="relative flex items-center">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 cursor-pointer max-w-[210px] shadow-2xs"
                  >
                    <option value="ALL">All Departments ({certificates.length})</option>
                    {allDepartmentOptions.map((deptName) => {
                      const count = certificates.filter(c => c.department === deptName).length;
                      return (
                        <option key={deptName} value={deptName}>
                          {deptName} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Sort Order Selector (Department Wise Sorting Included) */}
                <div className="relative flex items-center">
                  <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 cursor-pointer shadow-2xs"
                  >
                    <option value="dept-asc">🏢 Department (A → Z)</option>
                    <option value="dept-desc">🏢 Department (Z → A)</option>
                    <option value="date-desc">📅 Newest Date First</option>
                    <option value="date-asc">📅 Oldest Date First</option>
                    <option value="name-asc">👤 Recipient Name (A → Z)</option>
                  </select>
                </div>

                {/* CSV Export */}
                <button
                  onClick={handleExportCsv}
                  disabled={filteredAndSorted.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-stone-200 dark:border-zinc-700 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50/80 dark:bg-zinc-950/60 border-b border-stone-200/80 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">QR / Code</th>
                      <th 
                        onClick={() => setSortBy(sortBy === 'name-asc' ? 'date-desc' : 'name-asc')}
                        className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        title="Click to sort by Recipient Name"
                      >
                        <div className="flex items-center gap-1">
                          <span>Recipient</span>
                          {sortBy === 'name-asc' && <ArrowUp className="w-3 h-3 text-orange-500" />}
                        </div>
                      </th>
                      <th 
                        onClick={toggleDeptSort}
                        className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        title="Click to sort Department wise (A-Z / Z-A)"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-orange-600 dark:text-orange-400 font-bold">Department / Class</span>
                          {sortBy === 'dept-asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-orange-500" />
                          ) : sortBy === 'dept-desc' ? (
                            <ArrowDown className="w-3.5 h-3.5 text-orange-500" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4">Achievement / Purpose</th>
                      <th 
                        onClick={() => setSortBy(sortBy === 'date-desc' ? 'date-asc' : 'date-desc')}
                        className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        title="Click to sort by Issue Date"
                      >
                        <div className="flex items-center gap-1">
                          <span>Issue Date & Ref</span>
                          {sortBy === 'date-desc' && <ArrowDown className="w-3 h-3 text-orange-500" />}
                          {sortBy === 'date-asc' && <ArrowUp className="w-3 h-3 text-orange-500" />}
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading records from Supabase...
                    </td>
                  </tr>
                ) : filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400">
                      {searchQuery || selectedDepartment !== 'ALL' ? 'No certificates match your filter/search criteria.' : 'No certificates issued yet. Generate one in the Studio!'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map((cert) => (
                    <tr key={cert.id || cert.verification_code} className="hover:bg-stone-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      {/* QR & Verification Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleInspectQr(cert)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all shrink-0"
                            title="Click to view & download high-res QR code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                                {cert.verification_code}
                              </span>
                              <button
                                onClick={() => handleCopyCode(cert.verification_code)}
                                className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                                title="Copy verification code"
                              >
                                {copiedCode === cert.verification_code ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-zinc-400">Scan-Ready</span>
                          </div>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="py-3 px-4">
                        <strong className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs block">
                          {cert.recipient_name}
                        </strong>
                        <span className="text-[11px] text-zinc-500">{cert.designation || '—'}</span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                        {cert.department || '—'}
                      </td>

                      {/* Achievement */}
                      <td className="py-3 px-4 max-w-xs truncate text-zinc-600 dark:text-zinc-400" title={cert.action_achievement}>
                        {cert.action_achievement || '—'}
                      </td>

                      {/* Issue Date & Ref */}
                      <td className="py-3 px-4">
                        <span className="block text-zinc-800 dark:text-zinc-200">{cert.issue_date || '—'}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{cert.ref_number || cert.certificate_id}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenVerify && onOpenVerify(cert.verification_code)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all"
                            title="Open verification view"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(cert)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                            title="Delete certificate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}
  </main>

      {/* High-Res QR Code Modal */}
      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl w-full max-w-sm shadow-xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Verification QR Code</h3>
              <button
                onClick={() => setSelectedQr(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 inline-block shadow-inner mx-auto">
              <img src={selectedQr.dataUrl} alt="Certificate QR" className="w-48 h-48 mx-auto" />
            </div>

            <div>
              <strong className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                {selectedQr.cert.recipient_name}
              </strong>
              <span className="text-xs font-mono text-zinc-500 block mt-0.5">
                Code: {selectedQr.cert.verification_code}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadQr(selectedQr.cert, selectedQr.dataUrl)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedQr.url);
                  alert('Verification link copied to clipboard!');
                }}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-medium transition-all"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Database Setup SQL Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 px-6 border-b border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Supabase Database Setup</h3>
                  <p className="text-xs text-zinc-500">Run this SQL in your Supabase SQL Editor to enable persistent cross-device verification</p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300">
                <strong>Quick Setup:</strong> Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a>, go to <strong>SQL Editor</strong>, paste this script, and click <strong>Run</strong>.
              </div>

              <div className="relative">
                <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60 custom-scrollbar leading-relaxed">
{`CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  certificate_id TEXT,
  verification_code TEXT UNIQUE NOT NULL,
  qr_code TEXT,
  recipient_name TEXT,
  designation TEXT,
  department TEXT,
  action_achievement TEXT,
  organized_by_date TEXT,
  appreciation_paragraph TEXT,
  issue_date TEXT,
  ref_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Verified & Active'
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public verification read"
  ON public.certificates FOR SELECT USING (true);

CREATE POLICY "Allow public certificate insert and upsert"
  ON public.certificates FOR ALL USING (true) WITH CHECK (true);`}
                </pre>
                <button
                  onClick={() => {
                    const sql = `CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  certificate_id TEXT,
  verification_code TEXT UNIQUE NOT NULL,
  qr_code TEXT,
  recipient_name TEXT,
  designation TEXT,
  department TEXT,
  action_achievement TEXT,
  organized_by_date TEXT,
  appreciation_paragraph TEXT,
  issue_date TEXT,
  ref_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Verified & Active'
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public verification read"
  ON public.certificates FOR SELECT USING (true);

CREATE POLICY "Allow public certificate insert and upsert"
  ON public.certificates FOR ALL USING (true) WITH CHECK (true);`;
                    navigator.clipboard.writeText(sql);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold shadow-xs border border-stone-700 transition-all cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-end bg-stone-50/50 dark:bg-zinc-950/30">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
