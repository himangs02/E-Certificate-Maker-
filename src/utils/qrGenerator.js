import QRCode from 'qrcode';

/**
 * Generate a random unique verification code for Geeta University certificates.
 * Example: GU-2026-89421A
 */
export function generateVerificationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `GU-${year}-${rand}`;
}

/**
 * Safely encode certificate details into a compact URL-safe base64 string
 */
export function encodeCertificateData(data) {
  if (!data) return '';
  try {
    const compact = {
      n: data.recipientName || data.recipient_name || '',
      des: data.designation || '',
      dep: data.department || data.recipientDepartment || '',
      a: data.actionAchievement || data.action_achievement || '',
      org: data.organizedByDate || data.organized_by_date || '',
      dt: data.issueDate || data.issue_date || '',
      r: data.refNumber || data.ref_number || '',
      v: data.verification_code || data.verificationCode || ''
    };
    const jsonStr = JSON.stringify(compact);
    if (typeof window !== 'undefined' && window.btoa) {
      return encodeURIComponent(window.btoa(unescape(encodeURIComponent(jsonStr))));
    } else if (typeof Buffer !== 'undefined') {
      return encodeURIComponent(Buffer.from(jsonStr, 'utf-8').toString('base64'));
    }
    return '';
  } catch (err) {
    console.warn('Error encoding certificate data:', err);
    return '';
  }
}

/**
 * Safely decode certificate details from URL-safe base64 string
 */
export function decodeCertificateData(encoded) {
  if (!encoded) return null;
  try {
    const decodedStr = decodeURIComponent(encoded);
    let jsonStr = '';
    if (typeof window !== 'undefined' && window.atob) {
      jsonStr = decodeURIComponent(escape(window.atob(decodedStr)));
    } else if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(decodedStr, 'base64').toString('utf-8');
    }
    if (!jsonStr) return null;
    const compact = JSON.parse(jsonStr);
    return {
      recipient_name: compact.n || '',
      designation: compact.des || '',
      department: compact.dep || '',
      action_achievement: compact.a || '',
      organized_by_date: compact.org || '',
      issue_date: compact.dt || '',
      ref_number: compact.r || '',
      verification_code: compact.v || '',
      status: 'Verified & Active',
      created_at: new Date().toISOString()
    };
  } catch (err) {
    console.warn('Error decoding certificate data:', err);
    return null;
  }
}

/**
 * Build the full public verification URL for a given certificate verification code and optional payload.
 */
export function getVerificationUrl(verificationCode, data = null) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const cleanCode = encodeURIComponent((verificationCode || 'GU-VERIFY').trim());
  const payload = data ? encodeCertificateData(data) : '';
  return payload 
    ? `${origin}/verify/${cleanCode}?d=${payload}`
    : `${origin}/verify/${cleanCode}`;
}

/**
 * Generate a QR Code as a Data URL from a text or verification URL.
 */
export async function generateQrDataUrl(text, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: options.size || 256,
    color: {
      dark: '#1E293B', // Dark charcoal/slate
      light: '#FFFFFF' // Clean white background
    },
    ...options
  };

  try {
    return await QRCode.toDataURL(text, defaultOptions);
  } catch (err) {
    console.error('QR Code generation error:', err);
    return null;
  }
}

/**
 * Preloads a QR Code into an HTMLImageElement for canvas rendering.
 */
export async function createQrImageElement(text, options = {}) {
  const dataUrl = await generateQrDataUrl(text, options);
  if (!dataUrl) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = dataUrl;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}
