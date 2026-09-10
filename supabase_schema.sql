-- ==============================================================================
-- GEETA UNIVERSITY E-CERTIFICATE MAKER — SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- to create the official certificates table with Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. Create Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
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

-- 2. Create index for lightning-fast verification searches
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code 
  ON public.certificates (verification_code);

CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id 
  ON public.certificates (certificate_id);

CREATE INDEX IF NOT EXISTS idx_certificates_department 
  ON public.certificates (department);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 4. Allow public read access (Anyone scanning QR or verifying on website can view certificate)
DROP POLICY IF EXISTS "Allow public verification read" ON public.certificates;
CREATE POLICY "Allow public verification read"
  ON public.certificates FOR SELECT
  USING (true);

-- 5. Allow inserts & upserts for issued certificates
DROP POLICY IF EXISTS "Allow public certificate insert and upsert" ON public.certificates;
CREATE POLICY "Allow public certificate insert and upsert"
  ON public.certificates FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow certificate updates" ON public.certificates;
CREATE POLICY "Allow certificate updates"
  ON public.certificates FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow certificate deletes" ON public.certificates;
CREATE POLICY "Allow certificate deletes"
  ON public.certificates FOR DELETE
  USING (true);

-- 6. Insert initial seed verification record for testing
INSERT INTO public.certificates (
  id, certificate_id, verification_code, recipient_name, designation, department, action_achievement, organized_by_date, issue_date, ref_number, status
) VALUES (
  'cert_demo_01', 'GU-CERT-2026-001', 'GU-2026-89421A', 'Mr. Rahul Sharma', 'B.A. 2nd Semester', 'Department of Arts & Humanities', 'For Securing 1st Position in Inter-University Tech Innovation & Cultural Conclave 2026', 'Organized by Department of Creative Arts & Media on September 15, 2026', 'September 15, 2026', 'GU/Pas/2026/042', 'Verified & Active'
) ON CONFLICT (verification_code) DO NOTHING;
