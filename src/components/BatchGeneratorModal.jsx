import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Users,
  FileText,
  Trash2,
  Layers,
  Sparkles,
  FileType,
  FileCheck,
  RefreshCcw,
  Check
} from 'lucide-react';
import { renderCertificate } from '../utils/canvasRenderer';
import { CANVAS_DIMENSIONS } from '../constants/defaultConfig';
import { generateVerificationCode, getVerificationUrl, createQrImageElement } from '../utils/qrGenerator';
import { generateCanvasPDFArrayBuffer } from '../utils/pdfExporter';
import { saveCertificate } from '../services/supabase';

// Sample pre-loaded records for demonstration
const INITIAL_DEMO_RECORDS = [
  {
    recipientName: 'Mr. Rahul Sharma',
    designation: 'B.A. 2nd Semester',
    department: 'School of Humanities & Social Sciences',
    actionAchievement: 'for securing 1st Position in Tech Innovation Competition',
    organizedByDate: 'organized by School of Humanities & Social Sciences on September 15, 2026.',
    issueDate: '15-09-2026',
    refNumber: 'GU/Pas/2026/042'
  },
  {
    recipientName: 'Ms. Ananya Roy',
    designation: 'B.Tech CSE 3rd Year',
    department: 'School of Computer Science & Engineering',
    actionAchievement: 'for securing 1st Position in CodeSprint Hackathon 2026',
    organizedByDate: 'organized by School of Computer Science & Engineering on October 10, 2026.',
    issueDate: '10-10-2026',
    refNumber: 'GU/Pas/2026/043'
  },
  {
    recipientName: 'Dr. Priya Sharma',
    designation: 'Assistant Professor',
    department: 'SP Bansal School of Business',
    actionAchievement: 'in appreciation of your valuable contribution in Annual Management Fest – Bizz Fiesta 2026',
    organizedByDate: 'organized by SP Bansal School of Business on 28 August 2026.',
    issueDate: '28-08-2026',
    refNumber: 'GU/Vol/2026/118'
  },
  {
    recipientName: 'Mr. Amit Verma',
    designation: 'Research Scholar',
    department: 'School of Sciences',
    actionAchievement: 'in appreciation of presenting paper in International Science Conclave',
    organizedByDate: 'organized by School of Sciences on November 04, 2026.',
    issueDate: '04-11-2026',
    refNumber: 'GU/Vol/2026/119'
  }
];

export default function BatchGeneratorModal({
  isOpen,
  onClose,
  baseImage,
  config,
  formData = {},
  defaultParagraph
}) {
  const fileInputRef = useRef(null);
  const [records, setRecords] = useState(INITIAL_DEMO_RECORDS);
  const [fileName, setFileName] = useState('Sample_Students_List.xlsx');
  const [outputFormat, setOutputFormat] = useState('pdf'); // 'pdf' | 'png' | 'jpg'
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStudent, setCurrentStudent] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  // Fallback defaults from current studio form
  const fallbackDept = formData.department || 'School of Computer Science & Engineering';
  const fallbackAchievement = formData.actionAchievement || 'for outstanding performance and active participation';
  const fallbackOrganized = formData.organizedByDate || 'organized by Geeta University on September 15, 2026.';
  const fallbackDate = formData.issueDate || new Date().toLocaleDateString('en-GB');
  const fallbackParagraph = defaultParagraph || formData.appreciationParagraph || 'Your dedication, enthusiasm and commitment towards excellence are sincerely appreciated.';

  /**
   * Smart column mapper that handles varied header naming in user Excel files
   */
  const parseRowsToRecords = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    return rows.map((row, index) => {
      // Find key matching fuzzy patterns
      const findVal = (keywords) => {
        for (const k of Object.keys(row)) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const kw of keywords) {
            if (cleanK.includes(kw)) {
              const val = row[k];
              return val !== undefined && val !== null ? String(val).trim() : '';
            }
          }
        }
        return '';
      };

      // 1. Recipient Name
      let name = findVal(['studentname', 'fullname', 'recipientname', 'candidatename', 'name', 'student', 'participant', 'attendee']);
      if (!name) {
        // Fallback to first non-empty column in row
        const firstNonEmpty = Object.values(row).find(v => v && String(v).trim().length > 0);
        name = firstNonEmpty ? String(firstNonEmpty).trim() : `Student ${index + 1}`;
      }

      // 2. Designation / Class / Roll No
      const designation = findVal(['designation', 'class', 'course', 'rollno', 'roll', 'semester', 'sem', 'regno', 'year']) || 'Student';

      // 3. Department / School
      const department = findVal(['department', 'school', 'dept', 'branch', 'faculty']) || fallbackDept;

      // 4. Achievement / Purpose
      const actionAchievement = findVal(['actionachievement', 'achievement', 'action', 'purpose', 'event', 'competition', 'position', 'award', 'title']) || fallbackAchievement;

      // 5. Organized By & Date
      const organizedByDate = findVal(['organizedbydate', 'organizedby', 'organized', 'eventdate', 'host']) || fallbackOrganized;

      // 6. Issue Date
      const issueDate = findVal(['issuedate', 'date', 'issue', 'dated']) || fallbackDate;

      // 7. Ref Number
      const refNumber = findVal(['refnumber', 'refno', 'ref', 'serialno', 'serial', 'certno', 'id']) || `GU/Pas/2026/${String(index + 1).padStart(3, '0')}`;

      return {
        recipientName: name,
        designation,
        department,
        actionAchievement,
        organizedByDate,
        appreciationParagraph: fallbackParagraph,
        issueDate,
        refNumber,
      };
    }).filter(r => r.recipientName && r.recipientName.trim().length > 0);
  };

  /**
   * Handle file upload (Excel .xlsx, .xls or CSV)
   */
  const handleFileUpload = (file) => {
    if (!file) return;
    setErrorMsg('');
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Grab first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          setErrorMsg('The uploaded spreadsheet contains no readable sheets.');
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rows.length === 0) {
          setErrorMsg('No student records found in the uploaded file. Please make sure the sheet has headers and data.');
          return;
        }

        const parsed = parseRowsToRecords(rows);
        if (parsed.length === 0) {
          setErrorMsg('Could not detect any valid student rows. Please check the Excel format.');
          return;
        }

        setRecords(parsed);
      } catch (err) {
        console.error(err);
        setErrorMsg('Error reading file: ' + (err.message || 'Invalid file format. Please upload a valid .xlsx, .xls, or .csv file.'));
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read the selected file.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  /**
   * Download pre-formatted official Excel template (.xlsx)
   */
  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        'Student Name': 'Mr. Rahul Sharma',
        'Designation / Class': 'B.A. 2nd Semester',
        'Department / School': 'School of Humanities & Social Sciences',
        'Achievement / Event': 'for securing 1st Position in Tech Innovation Competition',
        'Organized By & Date': 'organized by School of Humanities & Social Sciences on September 15, 2026.',
        'Issue Date': '15-09-2026',
        'Ref Number': 'GU/Pas/2026/042'
      },
      {
        'Student Name': 'Ms. Ananya Roy',
        'Designation / Class': 'B.Tech CSE 3rd Year',
        'Department / School': 'School of Computer Science & Engineering',
        'Achievement / Event': 'for securing 1st Position in CodeSprint Hackathon 2026',
        'Organized By & Date': 'organized by School of Computer Science & Engineering on October 10, 2026.',
        'Issue Date': '10-10-2026',
        'Ref Number': 'GU/Pas/2026/043'
      },
      {
        'Student Name': 'Mr. Amit Verma',
        'Designation / Class': 'Research Scholar',
        'Department / School': 'School of Sciences',
        'Achievement / Event': 'in appreciation of presenting research paper in International Science Conclave',
        'Organized By & Date': 'organized by School of Sciences on November 04, 2026.',
        'Issue Date': '04-11-2026',
        'Ref Number': 'GU/Vol/2026/119'
      },
      {
        'Student Name': 'Dr. Priya Sharma',
        'Designation / Class': 'Assistant Professor',
        'Department / School': 'SP Bansal School of Business',
        'Achievement / Event': 'in appreciation of your valuable contribution in Annual Management Fest',
        'Organized By & Date': 'organized by SP Bansal School of Business on 28 August 2026.',
        'Issue Date': '28-08-2026',
        'Ref Number': 'GU/Vol/2026/118'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    // Set nice column widths
    ws['!cols'] = [
      { wch: 24 }, // Student Name
      { wch: 22 }, // Designation
      { wch: 38 }, // Department
      { wch: 55 }, // Achievement
      { wch: 55 }, // Organized By
      { wch: 14 }, // Date
      { wch: 18 }  // Ref Number
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students List');
    XLSX.writeFile(wb, 'Geeta_University_Students_Batch_Template.xlsx');
  };

  /**
   * Remove single student from queue
   */
  const handleRemoveRecord = (idx) => {
    setRecords(prev => prev.filter((_, i) => i !== idx));
  };

  /**
   * Reset to demo records
   */
  const handleResetDemo = () => {
    setRecords(INITIAL_DEMO_RECORDS);
    setFileName('Sample_Students_List.xlsx');
    setErrorMsg('');
  };

  /**
   * Execute bulk generation of certificates and ZIP download
   */
  const handleProcessBatch = async () => {
    if (records.length === 0) {
      alert('Please upload or provide at least one student record.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatusMessage(`Preparing bulk generation for ${records.length} students...`);
    setErrorMsg('');

    try {
      const zip = new JSZip();
      const folderName = outputFormat === 'pdf' ? 'PDF_Certificates' : 'Image_Certificates';
      const folder = zip.folder(folderName);

      const offCanvas = document.createElement('canvas');
      offCanvas.width = CANVAS_DIMENSIONS.width;
      offCanvas.height = CANVAS_DIMENSIONS.height;
      const offCtx = offCanvas.getContext('2d');

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const verification_code = generateVerificationCode();
        const fullRecord = {
          ...record,
          verification_code,
          appreciationParagraph: record.appreciationParagraph || fallbackParagraph
        };

        setCurrentStudent(fullRecord.recipientName);
        setStatusMessage(`Generating certificate (${i + 1} of ${records.length}): ${fullRecord.recipientName}`);

        // 1. Generate live unique QR code
        const qrUrl = getVerificationUrl(verification_code);
        const qrImg = await createQrImageElement(qrUrl, { size: 256 });

        // 2. Render onto canvas
        renderCertificate(offCtx, baseImage, fullRecord, config, { showGuides: false, qrImage: qrImg });

        // 3. Save to Supabase Registry in background
        saveCertificate({
          ...fullRecord,
          qr_code: qrUrl
        }).catch(err => console.warn('Supabase batch save background notice:', err));

        // 4. Export format
        const safeName = (fullRecord.recipientName || `Student_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');

        if (outputFormat === 'pdf') {
          const pdfBuffer = generateCanvasPDFArrayBuffer(offCtx.canvas);
          if (pdfBuffer) {
            folder.file(`${safeName}_Certificate.pdf`, pdfBuffer);
          }
        } else if (outputFormat === 'png') {
          const dataUrl = offCanvas.toDataURL('image/png', 0.95);
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          folder.file(`${safeName}_Certificate.png`, base64Data, { base64: true });
        } else {
          // JPG
          const dataUrl = offCanvas.toDataURL('image/jpeg', 0.96);
          const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
          folder.file(`${safeName}_Certificate.jpg`, base64Data, { base64: true });
        }

        const pct = Math.round(((i + 1) / records.length) * 100);
        setProgress(pct);

        // Small tick to keep UI responsive
        await new Promise(r => setTimeout(r, 20));
      }

      setStatusMessage('Bundling and packaging ZIP archive...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Trigger download
      const cleanEventName = (fallbackAchievement || 'Certificates').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = `Batch_Certificates_${cleanEventName}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setStatusMessage(`Completed successfully! All ${records.length} certificates packaged in ZIP.`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error generating certificates: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800/90 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">

        {/* Top Header */}
        <div className="p-4 sm:px-6 border-b border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Bulk Excel Certificate Generator
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                  .xlsx / .xls / .csv
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Upload student list from Excel to generate hundreds of certificates & download in one ZIP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1 custom-scrollbar">

          {/* Top Row: File Dropzone & Template Helper */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Upload Box (8 Cols) */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`md:col-span-8 border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragOver
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-stone-300 dark:border-zinc-700 hover:border-emerald-500/80 bg-stone-50/70 dark:bg-zinc-950/60'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
                className="hidden"
              />

              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
                <Upload className="w-5 h-5" />
              </div>

              <strong className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
                Click to browse or Drag & Drop Excel spreadsheet
              </strong>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Supports Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) and <strong>.csv</strong> files
              </p>

              {fileName && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium border border-emerald-300 dark:border-emerald-800">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Loaded: {fileName} ({records.length} students)</span>
                </div>
              )}
            </div>

            {/* Template Card & Options (4 Cols) */}
            <div className="md:col-span-4 bg-stone-50 dark:bg-zinc-950/70 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold mb-1">

                  <span>Need an Excel Template?</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Download our pre-structured Excel template with student name and department headers ready to fill.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadSampleExcel}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700 rounded-xl font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Download Sample .xlsx</span>
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Output Format Selector & Controls */}
          <div className="bg-stone-50/80 dark:bg-zinc-950/60 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                ZIP Output Format:
              </span>
              <div className="flex bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOutputFormat('pdf')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${outputFormat === 'pdf'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  Print PDF (.zip)
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat('png')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${outputFormat === 'png'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  PNG Images (.zip)
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat('jpg')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${outputFormat === 'jpg'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  JPG Images (.zip)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                {records.length} {records.length === 1 ? 'student' : 'students'} queued
              </span>
              <button
                type="button"
                onClick={handleResetDemo}
                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-stone-200/60 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                title="Reset to sample dataset"
              >
                <RefreshCcw className="w-3 h-3" />
                <span>Reset Sample</span>
              </button>
            </div>
          </div>

          {/* Parsed Students Table Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                Parsed Student Records Preview ({records.length})
              </span>
              <span className="text-[11px] text-zinc-400">
                Each certificate will receive a unique verified security QR code
              </span>
            </div>

            <div className="border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs max-h-56 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-zinc-950/80 border-b border-stone-200/80 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-semibold sticky top-0 z-10 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">#</th>
                    <th className="py-2.5 px-3.5">Student Name</th>
                    <th className="py-2.5 px-3.5">Designation / Class</th>
                    <th className="py-2.5 px-3.5">Department / School</th>
                    <th className="py-2.5 px-3.5">Achievement / Event</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        No students loaded. Upload an Excel file or click "Reset Sample" above.
                      </td>
                    </tr>
                  ) : (
                    records.map((r, i) => (
                      <tr key={i} className="hover:bg-stone-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-2 px-3.5 font-mono text-zinc-400 text-[11px]">
                          {i + 1}
                        </td>
                        <td className="py-2 px-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                          {r.recipientName}
                        </td>
                        <td className="py-2 px-3.5 text-zinc-600 dark:text-zinc-400">
                          {r.designation}
                        </td>
                        <td className="py-2 px-3.5 text-zinc-600 dark:text-zinc-400 max-w-[180px] truncate">
                          {r.department}
                        </td>
                        <td className="py-2 px-3.5 text-zinc-600 dark:text-zinc-400 max-w-[220px] truncate">
                          {r.actionAchievement}
                        </td>
                        <td className="py-2 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRecord(i)}
                            className="p-1 text-zinc-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                            title="Remove student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Progress Bar during Batch Processing */}
          {isProcessing && (
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-semibold flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>{statusMessage}</span>
                </span>
                <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
                  {progress}%
                </span>
              </div>

              <div className="w-full bg-emerald-200 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 dark:bg-emerald-400 h-full transition-all duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                <span>Generating high-res graphics & QR codes</span>
                <span>Current: {currentStudent}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {!isProcessing && statusMessage && statusMessage.startsWith('Completed') && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-stone-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 bg-stone-50/60 dark:bg-zinc-950/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-semibold transition-all cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleProcessBatch}
            disabled={isProcessing || records.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Generating {progress}%...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>Generate & Download ZIP ({records.length} Certificates)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
