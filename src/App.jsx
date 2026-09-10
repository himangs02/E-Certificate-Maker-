import React, { useState, useEffect } from 'react';
import CertificateForm from './components/CertificateForm';
import CertificatePreview from './components/CertificatePreview';
import CoordinateTuner from './components/CoordinateTuner';
import BatchGeneratorModal from './components/BatchGeneratorModal';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import CertificateVerification from './components/CertificateVerification';
import FacultyLogin from './components/FacultyLogin';
import { DEFAULT_TEXT_CONFIG } from './constants/defaultConfig';
import { PRESETS } from './constants/presets';
import { createDefaultTemplateDataUrl } from './utils/defaultTemplateGenerator';
import { generateVerificationCode, getVerificationUrl } from './utils/qrGenerator';
import { saveCertificate } from './services/supabase';
import geetaLogo from './assets/geeta_logo_transparent.png';
import { 
  Award, 
  Sun, 
  Moon, 
  FileSpreadsheet, 
  RotateCcw, 
  SlidersHorizontal, 
  Check,
  ShieldCheck,
  QrCode,
  LogOut,
  GraduationCap
} from 'lucide-react';

export default function App() {
  // 0. Routing State: 'studio' | 'admin' | 'verify'
  const [route, setRoute] = useState('studio');
  const [verifyCode, setVerifyCode] = useState('');
  
  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('geeta_admin_auth') === 'true';
  });

  // Faculty Auth State
  const [isFacultyLoggedIn, setIsFacultyLoggedIn] = useState(() => {
    return sessionStorage.getItem('geeta_faculty_auth') === 'true';
  });
  const [facultyUser, setFacultyUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('geeta_faculty_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 1. Certificate Form State with unique verification code
  const [formData, setFormData] = useState(() => ({
    ...PRESETS[0].data,
    verification_code: generateVerificationCode(),
  }));

  // 2. Coordinate & Styling Config State
  const [config, setConfig] = useState(DEFAULT_TEXT_CONFIG);

  // 3. Base Template Image
  const [baseImage, setBaseImage] = useState(null);
  const [templateInfo, setTemplateInfo] = useState({
    name: 'Geeta University Certificate of Appreciation',
    isCustom: false,
  });

  // 4. UI States
  const [activeField, setActiveField] = useState('recipientName');
  const [showGuides, setShowGuides] = useState(false);
  const [showTuner, setShowTuner] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sync route from URL on mount and browser back/forward (Preserving exact code casing)
  useEffect(() => {
    const parseUrlRoute = () => {
      const originalPath = window.location.pathname;
      const path = originalPath.toLowerCase();
      const params = new URLSearchParams(window.location.search);

      if (path === '/admin' || path.startsWith('/admin/') || params.get('admin') === 'true') {
        setRoute('admin');
      } else if (path.startsWith('/verify/') || params.has('verify') || path === '/verify') {
        let rawCode = '';
        if (path.startsWith('/verify/')) {
          // Extract from original path to preserve exact uppercase casing
          rawCode = originalPath.substring(8).trim();
        } else if (params.has('verify')) {
          rawCode = params.get('verify') || '';
        }
        const targetCode = decodeURIComponent(rawCode).trim();
        setVerifyCode(targetCode);
        setRoute('verify');
      } else {
        setRoute('studio');
      }
    };

    parseUrlRoute();
    window.addEventListener('popstate', parseUrlRoute);
    return () => window.removeEventListener('popstate', parseUrlRoute);
  }, []);

  // Sync URL when route state changes
  const navigateTo = (newRoute, param = '') => {
    setRoute(newRoute);
    if (newRoute === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (newRoute === 'verify') {
      setVerifyCode(param);
      window.history.pushState({}, '', `/verify/${encodeURIComponent(param)}`);
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('geeta_admin_auth', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('geeta_admin_auth');
    navigateTo('studio');
  };

  const handleFacultyLoginSuccess = (userData) => {
    setIsFacultyLoggedIn(true);
    setFacultyUser(userData);
    sessionStorage.setItem('geeta_faculty_auth', 'true');
    if (userData) {
      sessionStorage.setItem('geeta_faculty_user', JSON.stringify(userData));
      // Optionally update default department if user selected one
      if (userData.department && !formData.recipientDepartment) {
        setFormData(prev => ({
          ...prev,
          recipientDepartment: userData.department
        }));
      }
    }
  };

  const handleFacultyLogout = () => {
    setIsFacultyLoggedIn(false);
    setFacultyUser(null);
    sessionStorage.removeItem('geeta_faculty_auth');
    sessionStorage.removeItem('geeta_faculty_user');
  };

  // Sync dark class on html tag
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Load default base template on startup
  useEffect(() => {
    const defaultDataUrl = createDefaultTemplateDataUrl();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = defaultDataUrl;
    img.onload = () => {
      setBaseImage(img);
    };
  }, []);

  // Handle Preset Switch (generates fresh verification code)
  const handleApplyPreset = (preset) => {
    setFormData({
      ...preset.data,
      verification_code: generateVerificationCode(),
    });
  };

  // Regenerate security verification code & QR
  const handleRegenerateCode = () => {
    const newCode = generateVerificationCode();
    setFormData(prev => ({
      ...prev,
      verification_code: newCode
    }));
  };

  // Handle Custom Template Image Upload
  const handleUploadImage = (dataUrl, fileName) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = dataUrl;
    img.onload = () => {
      setBaseImage(img);
      setTemplateInfo({
        name: fileName || 'Custom Template',
        isCustom: true,
      });
    };
  };

  // Handle Reset to Default Template
  const handleResetToDefaultTemplate = () => {
    const defaultDataUrl = createDefaultTemplateDataUrl();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = defaultDataUrl;
    img.onload = () => {
      setBaseImage(img);
      setTemplateInfo({
        name: 'Geeta University Certificate of Appreciation',
        isCustom: false,
      });
    };
  };

  // Reset coordinates to factory defaults
  const handleResetDefaults = () => {
    setConfig(DEFAULT_TEXT_CONFIG);
  };

  // --- ROUTE 1: ADMIN PORTAL (/admin) ---
  if (route === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToStudio={() => navigateTo('studio')}
        />
      );
    }
    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
        onBackToStudio={() => navigateTo('studio')}
        onOpenVerify={(code) => navigateTo('verify', code)}
      />
    );
  }

  // --- ROUTE 2: PUBLIC CERTIFICATE VERIFICATION (/verify/:code) ---
  if (route === 'verify') {
    return (
      <CertificateVerification
        verificationCode={verifyCode}
        onBackToStudio={() => navigateTo('studio')}
      />
    );
  }

  // --- ROUTE 3: MAIN CERTIFICATE STUDIO GENERATOR (/) ---
  // If faculty is not logged in, show Faculty Login Page
  if (!isFacultyLoggedIn) {
    return (
      <FacultyLogin
        onLoginSuccess={handleFacultyLoginSuccess}
        onOpenAdmin={() => navigateTo('admin')}
        onOpenVerify={(code) => navigateTo('verify', code)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col transition-colors duration-200">
      {/* Top Navigation Bar with Official Geeta University Logo */}
      <header className="h-20 shrink-0 border-b border-stone-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/95 backdrop-blur-md z-40 transition-colors shadow-xs px-4 sm:px-6 lg:px-8">
        <div className="h-full w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Geeta University Official Logo */}
            <div className="flex items-center">
              <img 
                src={geetaLogo} 
                alt="Geeta University Logo" 
                className="h-12 sm:h-14 w-auto object-contain py-1"
              />
            </div>

            <div className="h-8 w-[1px] bg-stone-200 dark:bg-zinc-800 hidden sm:block"></div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Certificate Studio
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 rounded-md border border-orange-200/80 dark:border-orange-800/60">
                  Official Portal
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Geeta University · Precision typography, security QR & print-ready generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Live Verification Code Badge */}
            <div 
              onClick={handleRegenerateCode}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 text-xs font-mono cursor-pointer hover:bg-orange-500/15 transition-all"
              title="Click to generate a new random security code & QR"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{formData.verification_code}</span>
            </div>

            {/* Admin Portal Slug Button */}
            <button
              onClick={() => navigateTo('admin')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100/90 hover:bg-stone-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-stone-200 dark:border-zinc-700 transition-all shadow-xs cursor-pointer"
              title="Open /admin Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span className="hidden sm:inline">Admin Portal</span>
            </button>

            {/* Layout Inspector Toggle */}
            <button
              onClick={() => setShowTuner(!showTuner)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                showTuner
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'bg-stone-100/90 hover:bg-stone-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-stone-200 dark:border-zinc-700'
              }`}
              title="Toggle Layout & Typography Inspector"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showTuner ? 'Close Inspector' : 'Adjust Layout'}</span>
            </button>

            {/* Batch CSV Modal */}
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100/90 hover:bg-stone-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all border border-stone-200 dark:border-zinc-700 cursor-pointer"
              title="Bulk generate multiple certificates from CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-500" />
              <span>Batch CSV</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-stone-200 dark:hover:border-zinc-700 cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>

            {/* Faculty User Info & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-zinc-800">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {facultyUser?.name || 'Faculty Member'}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight truncate max-w-[130px]">
                  {facultyUser?.department ? facultyUser.department.replace('Department of ', '') : 'Faculty Studio'}
                </span>
              </div>

              <button
                onClick={handleFacultyLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-900/50 transition-all shadow-xs cursor-pointer"
                title="Sign out from Faculty Studio"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Single Page Workspace - Zero window scrolling */}
      <main className="flex-1 min-h-0 w-full p-3 sm:p-4 overflow-hidden">
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden">
          {/* Left Column: Form Input (5 Cols) - Smooth internal scroll if screen is very short */}
          <div className="lg:col-span-5 h-full overflow-y-auto pr-1.5 custom-scrollbar flex flex-col min-h-0">
            <CertificateForm
              formData={formData}
              setFormData={setFormData}
              onApplyPreset={handleApplyPreset}
              templateImageInfo={templateInfo}
              onUploadImage={handleUploadImage}
              onResetToDefaultTemplate={handleResetToDefaultTemplate}
              activeField={activeField}
              setActiveField={setActiveField}
              showTuner={showTuner}
              setShowTuner={setShowTuner}
              config={config}
              onChangeConfig={setConfig}
            />
          </div>

          {/* Right Column: Live Certificate Canvas & Pinned Export Bar (7 Cols) - Never scrolls */}
          <div className="lg:col-span-7 h-full flex flex-col min-h-0 overflow-hidden">
            <CertificatePreview
              formData={formData}
              config={config}
              onChangeConfig={setConfig}
              baseImage={baseImage}
              showGuides={showGuides}
              setShowGuides={setShowGuides}
              activeField={activeField}
              setActiveField={setActiveField}
              onOpenBatchModal={() => setIsBatchModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Inspector Modal */}
      {showTuner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar">
            <CoordinateTuner
              config={config}
              onChangeConfig={setConfig}
              onResetDefaults={handleResetDefaults}
              activeField={activeField}
              setActiveField={setActiveField}
              showGuides={showGuides}
              setShowGuides={setShowGuides}
              onClose={() => setShowTuner(false)}
            />
          </div>
        </div>
      )}

      {/* Batch Generator Modal */}
      <BatchGeneratorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        baseImage={baseImage}
        config={config}
        defaultParagraph={formData.appreciationParagraph}
      />
    </div>
  );
}
