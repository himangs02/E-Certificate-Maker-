import React from 'react';
import { AVAILABLE_FONTS } from '../constants/defaultConfig';
import { Sliders, RotateCcw, Copy, Check, Eye, X } from 'lucide-react';

export default function CoordinateTuner({
  config,
  onChangeConfig,
  onResetDefaults,
  activeField,
  setActiveField,
  showGuides,
  setShowGuides,
  onClose
}) {
  const [copied, setCopied] = React.useState(false);

  const fieldKeys = Object.keys(config);
  const currentField = activeField || fieldKeys[0];
  const currentConfig = config[currentField] || {};

  const handleUpdate = (prop, value) => {
    onChangeConfig(prev => ({
      ...prev,
      [currentField]: {
        ...prev[currentField],
        [prop]: value
      }
    }));
  };

  const handleCopyCode = () => {
    const codeString = `export const CERTIFICATE_COORDINATES = ${JSON.stringify(config, null, 2)};`;
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 dark:border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Layout & Typography Inspector</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Position and fine-tune certificate elements</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showGuides
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showGuides ? 'Guides On' : 'Guides Off'}</span>
          </button>

          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium transition-all"
            title="Reset positions to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-all"
            title="Copy coordinates JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Field Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {fieldKeys.map((key) => {
          const item = config[key];
          const isSelected = key === currentField;
          return (
            <button
              key={key}
              onClick={() => setActiveField(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-stone-200/70 dark:hover:bg-zinc-800'
              }`}
            >
              {item.label || key}
            </button>
          );
        })}
      </div>

      {/* Control Sliders & Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* X Coordinate */}
        <div className="bg-stone-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-stone-200/80 dark:border-zinc-800/80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Horizontal Position</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200 font-medium">
              {currentConfig.x ?? 0} px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1200"
            step="1"
            value={currentConfig.x ?? 600}
            onChange={(e) => handleUpdate('x', Number(e.target.value))}
            className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
          />
        </div>

        {/* Y Coordinate */}
        <div className="bg-stone-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-stone-200/80 dark:border-zinc-800/80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Vertical Position</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200 font-medium">
              {currentConfig.y ?? 0} px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1700"
            step="1"
            value={currentConfig.y ?? 600}
            onChange={(e) => handleUpdate('y', Number(e.target.value))}
            className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
          />
        </div>

        {/* Font Size */}
        <div className="bg-stone-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-stone-200/80 dark:border-zinc-800/80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Font Size</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200 font-medium">
              {currentConfig.fontSize ?? 24} px
            </span>
          </div>
          <input
            type="range"
            min="12"
            max="90"
            step="1"
            value={currentConfig.fontSize ?? 24}
            onChange={(e) => handleUpdate('fontSize', Number(e.target.value))}
            className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
          />
        </div>

        {/* Text Color & Weight */}
        <div className="bg-stone-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-stone-200/80 dark:border-zinc-800/80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Color & Style</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={currentConfig.color || '#2D3748'}
                onChange={(e) => handleUpdate('color', e.target.value)}
                className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[10px] text-zinc-500">{currentConfig.color}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleUpdate('fontWeight', currentConfig.fontWeight === '700' ? '400' : '700')}
              className={`flex-1 py-1 rounded-md text-xs font-semibold transition-all ${
                currentConfig.fontWeight === '700'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => handleUpdate('fontStyle', currentConfig.fontStyle === 'italic' ? 'normal' : 'italic')}
              className={`flex-1 py-1 rounded-md text-xs italic font-serif transition-all ${
                currentConfig.fontStyle === 'italic'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Italic
            </button>
          </div>
        </div>
      </div>

      {/* Typography Family & Alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 dark:text-zinc-400 shrink-0">Typeface:</span>
          <select
            value={currentConfig.fontFamily || AVAILABLE_FONTS[0].value}
            onChange={(e) => handleUpdate('fontFamily', e.target.value)}
            className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
          >
            {AVAILABLE_FONTS.map(f => (
              <option key={f.label} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 dark:text-zinc-400 shrink-0">Align:</span>
          <div className="flex bg-stone-100 dark:bg-zinc-950 p-0.5 rounded-lg border border-stone-200 dark:border-zinc-800 w-full">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => handleUpdate('align', align)}
                className={`flex-1 py-1 capitalize rounded-md transition-all ${
                  (currentConfig.align || 'center') === align
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {align}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
