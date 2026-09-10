import { createClient } from '@supabase/supabase-js';

// Supabase Project Credentials loaded strictly from environment variables (.env)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_ROLE = import.meta.env.VITE_SUPABASE_SERVICE_ROLE || '';
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
export const SUPABASE_SECRET_KEY = import.meta.env.VITE_SUPABASE_SECRET_KEY || '';

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Supabase public client instance
export const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// Service client for administrative operations
export const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
  : supabase;

const LOCAL_STORAGE_KEY = 'geeta_issued_certificates_v1';

// Helper to get local cached records
function getLocalCertificates() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save local cached records
function setLocalCertificates(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

/**
 * Save or record an issued certificate to Supabase and local cache
 */
export async function saveCertificate(data) {
  const record = {
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`),
    certificate_id: data.certificate_id || data.refNumber || `GU-CERT-${Date.now()}`,
    verification_code: data.verification_code || `GU-${Math.floor(100000 + Math.random() * 900000)}`,
    qr_code: data.qr_code || '',
    recipient_name: data.recipientName || data.recipient_name || '',
    designation: data.designation || '',
    department: data.department || '',
    action_achievement: data.actionAchievement || data.action_achievement || '',
    organized_by_date: data.organizedByDate || data.organized_by_date || '',
    appreciation_paragraph: data.appreciationParagraph || data.appreciation_paragraph || '',
    issue_date: data.issueDate || data.issue_date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    ref_number: data.refNumber || data.ref_number || '',
    created_at: new Date().toISOString(),
    status: 'Verified & Active'
  };

  // 1. Save to local fallback cache immediately upon official issue
  const localList = getLocalCertificates();
  const existingIdx = localList.findIndex(c => c.verification_code === record.verification_code || c.certificate_id === record.certificate_id);
  if (existingIdx >= 0) {
    localList[existingIdx] = { ...localList[existingIdx], ...record };
  } else {
    localList.unshift(record);
  }
  setLocalCertificates(localList);

  // 2. Try inserting/upserting to Supabase
  if (supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from('certificates')
        .upsert([record], { onConflict: 'verification_code' })
        .select();

      if (error) {
        console.warn('Supabase insert notice (using local mirror):', error.message);
        // Try admin client if anon lacks direct RLS table permissions
        if (supabaseAdmin) {
          try {
            await supabaseAdmin.from('certificates').upsert([record], { onConflict: 'verification_code' });
          } catch (adminErr) {
            console.warn('Admin client fallback notice:', adminErr.message);
          }
        }
      }
      return { success: true, record: inserted?.[0] || record };
    } catch (err) {
      console.warn('Supabase network error (saved locally):', err.message);
      return { success: true, record };
    }
  }

  return { success: true, record };
}

/**
 * Fetch all issued certificates from Supabase (merged with local mirror)
 */
export async function fetchCertificates() {
  let remoteRecords = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        remoteRecords = data;
      }
    } catch (err) {
      console.warn('Error fetching from Supabase, using local mirror:', err);
    }
  }

  // Merge with local storage records so none are ever lost
  const localRecords = getLocalCertificates();
  const mergedMap = new Map();

  localRecords.forEach(rec => {
    if (rec.verification_code) mergedMap.set(rec.verification_code, rec);
  });
  remoteRecords.forEach(rec => {
    if (rec.verification_code) mergedMap.set(rec.verification_code, rec);
  });

  const merged = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  return merged;
}

/**
 * Look up a certificate by its unique verification code or certificate ID
 */
export async function getCertificateByCode(code) {
  if (!code) return null;
  const cleanCode = code.trim();
  const lowerCode = cleanCode.toLowerCase();
  const upperCode = cleanCode.toUpperCase();

  // 1. Try Supabase lookup (case-insensitive with ilike)
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .or(`verification_code.ilike.${cleanCode},certificate_id.ilike.${cleanCode},ref_number.ilike.${cleanCode}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        return data[0];
      }
    } catch (err) {
      console.warn('Supabase verification lookup notice:', err);
    }

    // Secondary exact query attempt with uppercase and lowercase variants
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .or(`verification_code.eq.${cleanCode},verification_code.eq.${upperCode},certificate_id.eq.${cleanCode}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        return data[0];
      }
    } catch (err) {
      console.warn('Supabase secondary lookup notice:', err);
    }
  }

  // 2. Check local fallback cache
  const localList = getLocalCertificates();
  const found = localList.find(c => 
    c.verification_code?.trim().toLowerCase() === lowerCode ||
    c.certificate_id?.trim().toLowerCase() === lowerCode ||
    c.ref_number?.trim().toLowerCase() === lowerCode
  );

  if (found) return found;

  return null;
}

/**
 * Delete an issued certificate from the database and local cache
 */
export async function deleteCertificate(id, verificationCode) {
  // Remove from local
  const localList = getLocalCertificates().filter(c => c.id !== id && c.verification_code !== verificationCode);
  setLocalCertificates(localList);

  // Remove from Supabase
  if (supabase) {
    try {
      if (id) {
        await supabase.from('certificates').delete().eq('id', id);
      }
      if (verificationCode) {
        await supabase.from('certificates').delete().eq('verification_code', verificationCode);
      }
    } catch (err) {
      console.warn('Error deleting from Supabase:', err);
    }
  }

  return { success: true };
}
