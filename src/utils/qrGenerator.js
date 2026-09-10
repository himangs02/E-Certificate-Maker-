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
 * Build the full public verification URL for a given certificate verification code.
 */
export function getVerificationUrl(verificationCode) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return `${origin}/verify/${encodeURIComponent(verificationCode)}`;
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
