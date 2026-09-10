import React, { useState } from 'react';
import { X, Users, Play, Download, CheckCircle2, AlertCircle, FileSpreadsheet, QrCode } from 'lucide-react';
import { renderCertificate } from '../utils/canvasRenderer';
import { CANVAS_DIMENSIONS } from '../constants/defaultConfig';
import { generateVerificationCode, getVerificationUrl, createQrImageElement } from '../utils/qrGenerator';
import { saveCertificate } from '../services/supabase';
import JSZip from 'jszip';

const SAMPLE_CSV = `Recipient Name,Designation,Department,Action / Achievement,Organized By & Date,Date,Ref Number
Mr. Rahul Sharma,B.A. 2nd Semester,Department of Arts & Humanities,for securing 1st Position in Tech Innovation Competition,organized by Department of Creative Arts & Media on September 15, 2026.,15-09-2026,GU/Pas/2026/042
Dr. Priya Sharma,Assistant Professor,School of Management,in appreciation of your valuable contribution in Annual Management Fest – Bizz Fiesta 2026,organized by School of Management on 28 August 2026.,28-08-2026,GU/Vol/2026/118
Ms. Ananya Roy,B.Tech CSE 3rd Year,Department of Computer Science & Engg,for securing 2nd Position in CodeSprint 2026,organized by Coding Club on October 10, 2026.,10-10-2026,GU/Pas/2026/043
Mr. Amit Verma,Research Scholar,Department of Physics,in appreciation of presenting paper in International Physics Conclave,organized by Dept of Physics on November 04, 2026.,04-11-2026,GU/Vol/2026/119`;

export default function BatchGeneratorModal({ isOpen, onClose, baseImage, config, defaultParagraph }) {
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const rowCount = Math.max(0, csvText.trim().split('\n').filter(l => l.trim()).length - 1);

  const handleProcessBatch = async () => {
    setIsProcessing(true);
    setProgress(0);
    setStatusMessage('Reading CSV records & generating QR security codes...');

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        alert('Please provide a valid CSV with at least one record.');
        setIsProcessing(false);
        return;
      }

      // Parse headers
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        const verification_code = generateVerificationCode();
        records.push({
          recipientName: parts[0]?.trim() || '',
          designation: parts[1]?.trim() || '',
          department: parts[2]?.trim() || '',
          actionAchievement: parts[3]?.trim() || '',
          organizedByDate: parts[4]?.trim() || '',
          appreciationParagraph: defaultParagraph || 'Your enthusiasm and spirit of participation are sincerely appreciated.',
          issueDate: parts[5]?.trim() || '',
          refNumber: parts[6]?.trim() || '',
          verification_code,
        });
      }

      const zip = new JSZip();
      const folder = zip.folder('Certificates');

      const offCanvas = document.createElement('canvas');
      offCanvas.width = CANVAS_DIMENSIONS.width;
      offCanvas.height = CANVAS_DIMENSIONS.height;
      const offCtx = offCanvas.getContext('2d');

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        setStatusMessage(`Generating & Syncing (${i + 1} of ${records.length}): ${record.recipientName}`);

        // Generate QR code image
        const qrUrl = getVerificationUrl(record.verification_code);
        const qrImg = await createQrImageElement(qrUrl, { size: 256 });
        
        // Draw certificate with dynamic QR code
        renderCertificate(offCtx, baseImage, record, config, { showGuides: false, qrImage: qrImg });
        
        // Save to Supabase Registry
        saveCertificate({
          ...record,
          qr_code: qrUrl
        }).catch(err => console.warn('Supabase batch save background notice:', err));

        const dataUrl = offCanvas.toDataURL('image/jpeg', 0.95);
        const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
        const filename = `${(record.recipientName || `Certificate_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_')}_Certificate.jpg`;
        folder.file(filename, base64Data, { base64: true });

        setProgress(Math.round(((i + 1) / records.length) * 100));
        await new Promise(r => setTimeout(r, 40));
      }

      setStatusMessage('Packaging ZIP archive...');
      const content = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `Batch_Certificates_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatusMessage('Complete! All certificates & QR records saved.');
    } catch (err) {
      console.error(err);
      setStatusMessage('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="p-4 px-6 border-b border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Batch Certificate Generator</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Generate and package bulk certificates from CSV list</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-700 dark:text-zinc-300 font-medium">
                CSV Input Data
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">
                {rowCount} {rowCount === 1 ? 'record' : 'records'} detected
              </span>
            </div>
            <textarea
              rows={8}
              value={csvText}
              disabled={isProcessing}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl p-3 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 disabled:opacity-50"
            />
            <p className="mt-1.5 text-[11px] text-zinc-400">
              Columns: Name, Designation, Department, Achievement, Organized By & Date, Issue Date, Ref No.
            </p>
          </div>

          {/* Progress / Status */}
          {statusMessage && (
            <div className="p-3 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300 text-xs">
                <span>{statusMessage}</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-zinc-900 dark:bg-zinc-100 h-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-stone-50/50 dark:bg-zinc-950/30">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-medium transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleProcessBatch}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Generate & Download ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
