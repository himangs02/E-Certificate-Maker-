import React, { useRef, useState } from 'react';
import { PRESETS } from '../constants/presets';
import { 
  User, 
  GraduationCap, 
  Building2, 
  Trophy, 
  Calendar, 
  FileText, 
  Hash, 
  Upload, 
  BookOpen,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Award,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const APPRECIATION_TEMPLATES = [
  {
    icon: Award,
    label: 'Excellence & Success',
    text: 'Your dedication, enthusiasm and commitment towards excellence are sincerely appreciated. We congratulate you on this achievement and wish you continued success in all your future endeavours.'
  },
  {
    icon: GraduationCap,
    label: 'Leadership & Service',
    text: 'Your leadership, dedication and meticulous efforts contributed significantly to the successful execution of the activity. We sincerely appreciate your commitment and valuable contribution to the University community.'
  },
  {
    icon: Users,
    label: 'Active Participation',
    text: 'Your enthusiasm, active involvement and spirit of participation are sincerely appreciated. We encourage you to continue engaging in such activities and contributing positively to the University community.'
  }
];

export default function CertificateForm({
  formData,
  setFormData,
  onApplyPreset,
  templateImageInfo,
  onUploadImage,
  onResetToDefaultTemplate,
  activeField,
  setActiveField,
  showTuner,
  setShowTuner,
  config,
  onChangeConfig
}) {
  const fileInputRef = useRef(null);
  const [showAdvancedTemplate, setShowAdvancedTemplate] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadImage(event.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3 text-zinc-800 dark:text-zinc-200">
      {/* 1. Quick Presets / Examples - Human BookOpen Icon */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-xl p-2.5 sm:p-3 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Sample Presets
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">Click to autofill</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {PRESETS.map((preset) => {
            const isSelected = formData.recipientName === preset.data.recipientName && 
                               formData.actionAchievement === preset.data.actionAchievement;
            return (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset)}
                className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                    : 'bg-stone-50/70 hover:bg-stone-100 dark:bg-zinc-950/60 dark:hover:bg-zinc-800/70 border-stone-200/70 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[11px] font-semibold truncate">{preset.name}</span>
                  {isSelected && <Check className="w-3 h-3 shrink-0 text-emerald-400" />}
                </div>
                <span className="text-[10px] opacity-75 truncate">{preset.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Certificate Details Form - Compact & Single-Page Optimized */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3.5 transition-colors">
        
        {/* Group 1: Recipient Information */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                Recipient Details
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {/* Recipient Name with Font Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Full Name <span className="text-orange-600 font-bold">*</span>
                </label>
                {config?.recipientName && onChangeConfig && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400">Font:</span>
                    <select
                      value={config.recipientName.fontFamily || "'Montserrat', sans-serif"}
                      onChange={(e) => {
                        const newFont = e.target.value;
                        onChangeConfig(prev => ({
                          ...prev,
                          recipientName: { ...prev.recipientName, fontFamily: newFont, fontStyle: 'normal' },
                          designation: { ...prev.designation, fontFamily: newFont, fontStyle: 'normal' },
                          department: { ...prev.department, fontFamily: newFont, fontStyle: 'normal' }
                        }));
                      }}
                      className="text-[10px] bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md px-1.5 py-0.5 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                    >
                      <option value="'Montserrat', sans-serif">Montserrat (Modern Clean)</option>
                      <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                      <option value="'Inter', sans-serif">Inter (Minimalist)</option>
                      <option value="'Outfit', sans-serif">Outfit (Geometric)</option>
                      <option value="'Cormorant Garamond', serif">Cormorant Garamond</option>
                    </select>
                  </div>
                )}
              </div>
              <input
                type="text"
                value={formData.recipientName}
                onFocus={() => setActiveField('recipientName')}
                onChange={(e) => handleInputChange('recipientName', e.target.value)}
                placeholder="e.g. Mr. Rahul Sharma or Dr. Priya Sharma"
                className={`w-full bg-stone-50/60 dark:bg-zinc-950/70 border rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all focus:outline-none ${
                  activeField === 'recipientName'
                    ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 bg-white dark:bg-zinc-950'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                }`}
              />
            </div>

            {/* Designation & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-zinc-400" />
                  <span>Designation or Class</span>
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onFocus={() => setActiveField('designation')}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="e.g. B.A. 2nd Semester"
                  className={`w-full bg-stone-50/60 dark:bg-zinc-950/70 border rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all focus:outline-none ${
                    activeField === 'designation'
                      ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 bg-white dark:bg-zinc-950'
                      : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-zinc-400" />
                  <span>Department or School</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onFocus={() => setActiveField('department')}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g. Dept of Arts & Humanities"
                  className={`w-full bg-stone-50/60 dark:bg-zinc-950/70 border rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all focus:outline-none ${
                    activeField === 'department'
                      ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 bg-white dark:bg-zinc-950'
                      : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Group 2: Event & Achievement */}
        <div className="pt-2.5 border-t border-stone-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                Achievement & Event
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {/* Action / Achievement Line */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Achievement / Purpose Line
              </label>
              <input
                type="text"
                value={formData.actionAchievement}
                onFocus={() => setActiveField('actionAchievement')}
                onChange={(e) => handleInputChange('actionAchievement', e.target.value)}
                placeholder="e.g. for securing 1st Position in Tech Innovation Competition"
                className={`w-full bg-stone-50/60 dark:bg-zinc-950/70 border rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all focus:outline-none ${
                  activeField === 'actionAchievement'
                    ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 bg-white dark:bg-zinc-950'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                }`}
              />
            </div>

            {/* Organized By & Event Date */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Organized By & Event Date Line
              </label>
              <input
                type="text"
                value={formData.organizedByDate}
                onFocus={() => setActiveField('organizedByDate')}
                onChange={(e) => handleInputChange('organizedByDate', e.target.value)}
                placeholder="e.g. organized by Department of Creative Arts & Media on September 15, 2026."
                className={`w-full bg-stone-50/60 dark:bg-zinc-950/70 border rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all focus:outline-none ${
                  activeField === 'organizedByDate'
                    ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 bg-white dark:bg-zinc-950'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                }`}
              />
            </div>

            {/* Appreciation Paragraph */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-zinc-400" />
                  <span>Message of Appreciation</span>
                </label>
                <span className="text-[10px] text-zinc-400">Templates:</span>
              </div>

              {/* Clean horizontal suggestion pills */}
              <div className="flex flex-wrap gap-1 mb-1.5">
                {APPRECIATION_TEMPLATES.map((tmpl, idx) => {
                  const IconComponent = tmpl.icon;
                  const isCurrent = formData.appreciationParagraph === tmpl.text;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInputChange('appreciationParagraph', tmpl.text)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all border ${
                        isCurrent
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 dark:bg-zinc-950/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-stone-200 dark:border-zinc-800'
                      }`}
                    >
                      <IconComponent className="w-3 h-3 opacity-80" />
                      <span>{tmpl.label}</span>
                    </button>
                  );
                })}
              </div>

              <textarea
                rows={2}
                value={formData.appreciationParagraph}
                onFocus={() => setActiveField('appreciationParagraph')}
                onChange={(e) => handleInputChange('appreciationParagraph', e.target.value)}
                placeholder="Enter 2-3 lines of appreciation text..."
                className={`w-full bg-stone-50/60 dark:bg-zinc-950/70 border rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 leading-relaxed transition-all focus:outline-none ${
                  activeField === 'appreciationParagraph'
                    ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 bg-white dark:bg-zinc-950'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Group 3: Issue Meta */}
        <div className="pt-2.5 border-t border-stone-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                Date & Certificate Number
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-400" />
                <span>Issue Date</span>
              </label>
              <input
                type="text"
                value={formData.issueDate}
                onFocus={() => setActiveField('issueDate')}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                placeholder="e.g. September 15, 2026"
                className={`w-full bg-stone-50/60 dark:bg-zinc-950/70 border rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all focus:outline-none ${
                  activeField === 'issueDate'
                    ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 bg-white dark:bg-zinc-950'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3 text-zinc-400" />
                <span>Reference / Serial No.</span>
              </label>
              <input
                type="text"
                value={formData.refNumber}
                onFocus={() => setActiveField('refNumber')}
                onChange={(e) => handleInputChange('refNumber', e.target.value)}
                placeholder="e.g. GU/Pas/2026/042"
                className={`w-full bg-stone-50/60 dark:bg-zinc-950/70 border rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all focus:outline-none ${
                  activeField === 'refNumber'
                    ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 bg-white dark:bg-zinc-950'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Group 4: Background Template Customization (Collapsible) */}
        <div className="pt-2 border-t border-stone-200/80 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={() => setShowAdvancedTemplate(!showAdvancedTemplate)}
            className="w-full flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors py-0.5"
          >
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                <ImageIcon className="w-3 h-3" />
              </div>
              <span className="font-medium text-zinc-800 dark:text-zinc-200 text-xs">
                Background Template Image
              </span>
              <span className="text-[10px] text-zinc-400 font-normal">
                ({templateImageInfo.isCustom ? 'Custom' : 'Official Blank'})
              </span>
            </span>
            {showAdvancedTemplate ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvancedTemplate && (
            <div className="mt-2 p-2.5 bg-stone-50 dark:bg-zinc-950/60 rounded-lg border border-stone-200/80 dark:border-zinc-800/80 space-y-2 animate-fadeIn">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium transition-all shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Upload Custom Background</span>
                </button>

                {templateImageInfo.isCustom && (
                  <button
                    type="button"
                    onClick={onResetToDefaultTemplate}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-stone-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium hover:bg-stone-300/80 dark:hover:bg-zinc-700 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                )}
              </div>

              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active: <strong className="font-medium text-zinc-700 dark:text-zinc-300">{templateImageInfo.name}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
