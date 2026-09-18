-- ==============================================================================
-- GEETA UNIVERSITY E-CERTIFICATE MAKER — SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- to create all official tables with Row Level Security (RLS) policies.
-- ==============================================================================

-- ==============================================================================
-- 1. CERTIFICATES TABLE
-- ==============================================================================
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

-- Indexes for certificates
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code 
  ON public.certificates (verification_code);

CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id 
  ON public.certificates (certificate_id);

CREATE INDEX IF NOT EXISTS idx_certificates_department 
  ON public.certificates (department);

-- Enable RLS for certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public verification read" ON public.certificates;
CREATE POLICY "Allow public verification read"
  ON public.certificates FOR SELECT
  USING (true);

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


-- ==============================================================================
-- 2. DEPARTMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.departments (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  code TEXT,
  head TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_name 
  ON public.departments (name);

-- Enable RLS for departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public departments read" ON public.departments;
CREATE POLICY "Allow public departments read"
  ON public.departments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public departments insert and upsert" ON public.departments;
CREATE POLICY "Allow public departments insert and upsert"
  ON public.departments FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public departments update" ON public.departments;
CREATE POLICY "Allow public departments update"
  ON public.departments FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public departments delete" ON public.departments;
CREATE POLICY "Allow public departments delete"
  ON public.departments FOR DELETE
  USING (true);


-- ==============================================================================
-- 3. FACULTY CREDENTIALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.faculty_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  faculty_id TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  department TEXT,
  designation TEXT,
  email TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faculty_users_faculty_id 
  ON public.faculty_users (faculty_id);

CREATE INDEX IF NOT EXISTS idx_faculty_users_email 
  ON public.faculty_users (email);

-- Enable RLS for faculty_users
ALTER TABLE public.faculty_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public faculty_users read" ON public.faculty_users;
CREATE POLICY "Allow public faculty_users read"
  ON public.faculty_users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public faculty_users insert and upsert" ON public.faculty_users;
CREATE POLICY "Allow public faculty_users insert and upsert"
  ON public.faculty_users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public faculty_users update" ON public.faculty_users;
CREATE POLICY "Allow public faculty_users update"
  ON public.faculty_users FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public faculty_users delete" ON public.faculty_users;
CREATE POLICY "Allow public faculty_users delete"
  ON public.faculty_users FOR DELETE
  USING (true);


-- ==============================================================================
-- 4. INITIAL SEED DATA
-- ==============================================================================

-- Seed Certificates
INSERT INTO public.certificates (
  id, certificate_id, verification_code, recipient_name, designation, department, action_achievement, organized_by_date, issue_date, ref_number, status
) VALUES (
  'cert_demo_01', 'GU-CERT-2026-001', 'GU-2026-89421A', 'Mr. Rahul Sharma', 'B.A. 2nd Semester', 'Department of Arts & Humanities', 'For Securing 1st Position in Inter-University Tech Innovation & Cultural Conclave 2026', 'Organized by Department of Creative Arts & Media on September 15, 2026', 'September 15, 2026', 'GU/Pas/2026/042', 'Verified & Active'
) ON CONFLICT (verification_code) DO NOTHING;

-- Seed Departments
INSERT INTO public.departments (id, name, code, head) VALUES
  ('dept-1', 'Department of Arts & Humanities', 'AH', 'Dr. S. K. Verma'),
  ('dept-2', 'Department of Computer Science & Engineering', 'CSE', 'Dr. Amit Patel'),
  ('dept-3', 'Department of Management Studies', 'DMS', 'Dr. Neha Gupta'),
  ('dept-4', 'Department of Allied Health Sciences', 'AHS', 'Dr. Rajesh Kumar'),
  ('dept-5', 'Department of Agriculture & Bio-Sciences', 'ABS', 'Dr. Priya Singh'),
  ('dept-6', 'Department of Creative Arts & Media', 'CAM', 'Dr. Vikram Seth'),
  ('dept-7', 'Department of Law & Legal Studies', 'LAW', 'Prof. Meenakshi Roy'),
  ('dept-8', 'Department of Pharmaceutical Sciences', 'PHARM', 'Dr. R. C. Sharma')
ON CONFLICT (name) DO NOTHING;

-- Seed Initial Faculty Logins
INSERT INTO public.faculty_users (id, name, faculty_id, password, department, designation, email, status) VALUES
  ('fac-1', 'Faculty Member', 'faculty', 'geeta@123', 'Department of Arts & Humanities', 'Assistant Professor', 'faculty@geetauniversity.edu.in', 'Active'),
  ('fac-2', 'Dr. Rahul Sharma', 'GU/FAC/001', 'geeta@123', 'Department of Computer Science & Engineering', 'Associate Professor', 'rahul.sharma@geetauniversity.edu.in', 'Active')
ON CONFLICT (faculty_id) DO NOTHING;
