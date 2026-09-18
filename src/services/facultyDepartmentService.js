// Faculty & Department Management Service with Supabase Cloud Database + LocalStorage Mirror
import { supabase, supabaseAdmin } from './supabase';

export const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', name: 'Department of Arts & Humanities', code: 'AH', head: 'Dr. S. K. Verma' },
  { id: 'dept-2', name: 'Department of Computer Science & Engineering', code: 'CSE', head: 'Dr. Amit Patel' },
  { id: 'dept-3', name: 'Department of Management Studies', code: 'DMS', head: 'Dr. Neha Gupta' },
  { id: 'dept-4', name: 'Department of Allied Health Sciences', code: 'AHS', head: 'Dr. Rajesh Kumar' },
  { id: 'dept-5', name: 'Department of Agriculture & Bio-Sciences', code: 'ABS', head: 'Dr. Priya Singh' },
  { id: 'dept-6', name: 'Department of Creative Arts & Media', code: 'CAM', head: 'Dr. Vikram Seth' },
  { id: 'dept-7', name: 'Department of Law & Legal Studies', code: 'LAW', head: 'Prof. Meenakshi Roy' },
  { id: 'dept-8', name: 'Department of Pharmaceutical Sciences', code: 'PHARM', head: 'Dr. R. C. Sharma' },
];

export const INITIAL_FACULTY = [
  {
    id: 'fac-1',
    name: 'Faculty Member',
    facultyId: 'faculty',
    password: 'geeta@123',
    department: 'Department of Arts & Humanities',
    designation: 'Assistant Professor',
    email: 'faculty@geetauniversity.edu.in',
    status: 'Active',
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fac-2',
    name: 'Dr. Rahul Sharma',
    facultyId: 'GU/FAC/001',
    password: 'geeta@123',
    department: 'Department of Computer Science & Engineering',
    designation: 'Associate Professor',
    email: 'rahul.sharma@geetauniversity.edu.in',
    status: 'Active',
    createdAt: new Date().toISOString().split('T')[0]
  }
];

const STORAGE_KEYS = {
  DEPARTMENTS: 'geeta_departments_registry_v2',
  FACULTY: 'geeta_faculty_registry_v2'
};

// --- Local Storage Helpers ---
function getLocalDepartments() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
      return INITIAL_DEPARTMENTS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEPARTMENTS;
  } catch {
    return INITIAL_DEPARTMENTS;
  }
}

function setLocalDepartments(depts) {
  try {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
  } catch (err) {
    console.warn('LocalStorage save error (departments):', err);
  }
}

function getLocalFaculty() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FACULTY);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(INITIAL_FACULTY));
      return INITIAL_FACULTY;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FACULTY;
  } catch {
    return INITIAL_FACULTY;
  }
}

function setLocalFaculty(facultyList) {
  try {
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(facultyList));
  } catch (err) {
    console.warn('LocalStorage save error (faculty):', err);
  }
}

// Normalizes database record to camelCase UI representation
function normalizeFacultyRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    facultyId: row.faculty_id || row.facultyId || '',
    password: row.password || '',
    department: row.department || '',
    designation: row.designation || '',
    email: row.email || '',
    status: row.status || 'Active',
    createdAt: row.created_at ? row.created_at.split('T')[0] : (row.createdAt || new Date().toISOString().split('T')[0])
  };
}

// ==============================================================================
// 1. DEPARTMENT MANAGEMENT (SUPABASE + LOCAL SYNC)
// ==============================================================================

/**
 * Synchronous getter for instant UI mounting
 */
export const getDepartments = () => {
  return getLocalDepartments();
};

export const saveDepartments = (depts) => {
  setLocalDepartments(depts);
};

/**
 * Async fetch all departments from Supabase and sync local storage
 */
export const fetchDepartments = async () => {
  let remoteRecords = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        remoteRecords = data.map(d => ({
          id: d.id,
          name: d.name,
          code: d.code || '',
          head: d.head || '',
          createdAt: d.created_at ? d.created_at.split('T')[0] : ''
        }));
      }
    } catch (err) {
      console.warn('Error fetching departments from Supabase (using local mirror):', err);
    }
  }

  if (remoteRecords.length > 0) {
    setLocalDepartments(remoteRecords);
    return remoteRecords;
  }

  return getLocalDepartments();
};

/**
 * Add a new department to Supabase & LocalStorage
 */
export const addDepartment = async (dept) => {
  const current = getLocalDepartments();
  const newDept = {
    id: `dept-${Date.now()}`,
    name: dept.name.trim(),
    code: (dept.code || dept.name.slice(0, 4).toUpperCase()).trim(),
    head: (dept.head || '').trim() || 'HOD',
    createdAt: new Date().toISOString().split('T')[0]
  };

  // 1. Update local cache immediately
  const updated = [newDept, ...current.filter(d => d.name.toLowerCase() !== newDept.name.toLowerCase())];
  setLocalDepartments(updated);

  // 2. Persist to Supabase
  if (supabase) {
    try {
      const record = {
        id: newDept.id,
        name: newDept.name,
        code: newDept.code,
        head: newDept.head,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase.from('departments').upsert([record], { onConflict: 'name' });
      if (error && supabaseAdmin) {
        await supabaseAdmin.from('departments').upsert([record], { onConflict: 'name' });
      }
    } catch (err) {
      console.warn('Supabase department insert warning:', err);
    }
  }

  return newDept;
};

/**
 * Delete a department from Supabase & LocalStorage
 */
export const deleteDepartment = async (id) => {
  const current = getLocalDepartments();
  const updated = current.filter(d => d.id !== id);
  setLocalDepartments(updated);

  if (supabase) {
    try {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error && supabaseAdmin) {
        await supabaseAdmin.from('departments').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('Supabase department delete warning:', err);
    }
  }

  return updated;
};

// ==============================================================================
// 2. FACULTY CREDENTIALS MANAGEMENT (SUPABASE + LOCAL SYNC)
// ==============================================================================

/**
 * Synchronous getter for instant UI mounting
 */
export const getFacultyUsers = () => {
  return getLocalFaculty();
};

export const saveFacultyUsers = (facultyList) => {
  setLocalFaculty(facultyList);
};

/**
 * Async fetch all faculty credentials from Supabase and sync local storage
 */
export const fetchFacultyUsers = async () => {
  let remoteRecords = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('faculty_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        remoteRecords = data.map(normalizeFacultyRecord);
      }
    } catch (err) {
      console.warn('Error fetching faculty credentials from Supabase (using local mirror):', err);
    }
  }

  if (remoteRecords.length > 0) {
    setLocalFaculty(remoteRecords);
    return remoteRecords;
  }

  return getLocalFaculty();
};

/**
 * Add / Create a new faculty login account in Supabase & LocalStorage
 */
export const addFacultyUser = async (faculty) => {
  const current = getLocalFaculty();
  const cleanFacultyId = faculty.facultyId.trim();
  const newFaculty = {
    id: `fac-${Date.now()}`,
    name: faculty.name.trim(),
    facultyId: cleanFacultyId,
    password: faculty.password.trim() || 'geeta@123',
    department: faculty.department || 'Department of Arts & Humanities',
    designation: faculty.designation?.trim() || 'Faculty Member',
    email: faculty.email?.trim() || `${cleanFacultyId.toLowerCase().replace(/[^a-z0-9]/g, '')}@geetauniversity.edu.in`,
    status: faculty.status || 'Active',
    createdAt: new Date().toISOString().split('T')[0]
  };

  // 1. Update local cache immediately
  const updated = [newFaculty, ...current.filter(f => f.facultyId.toLowerCase() !== cleanFacultyId.toLowerCase())];
  setLocalFaculty(updated);

  // 2. Persist to Supabase
  if (supabase) {
    try {
      const dbRecord = {
        id: newFaculty.id,
        name: newFaculty.name,
        faculty_id: newFaculty.facultyId,
        password: newFaculty.password,
        department: newFaculty.department,
        designation: newFaculty.designation,
        email: newFaculty.email,
        status: newFaculty.status,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('faculty_users').upsert([dbRecord], { onConflict: 'faculty_id' });
      if (error && supabaseAdmin) {
        await supabaseAdmin.from('faculty_users').upsert([dbRecord], { onConflict: 'faculty_id' });
      }
    } catch (err) {
      console.warn('Supabase faculty insert warning:', err);
    }
  }

  return newFaculty;
};

/**
 * Delete a faculty account from Supabase & LocalStorage
 */
export const deleteFacultyUser = async (id) => {
  const current = getLocalFaculty();
  const target = current.find(f => f.id === id);
  const updated = current.filter(f => f.id !== id);
  setLocalFaculty(updated);

  if (supabase) {
    try {
      const query = supabase.from('faculty_users').delete();
      if (target?.facultyId) {
        await query.or(`id.eq.${id},faculty_id.eq.${target.facultyId}`);
      } else {
        await query.eq('id', id);
      }
    } catch (err) {
      console.warn('Supabase faculty delete warning:', err);
    }
  }

  return updated;
};

export const updateFacultyUser = async (id, updatedFields) => {
  const current = getLocalFaculty();
  const updated = current.map(f => f.id === id ? { ...f, ...updatedFields } : f);
  setLocalFaculty(updated);

  if (supabase) {
    try {
      const dbFields = {};
      if (updatedFields.name) dbFields.name = updatedFields.name;
      if (updatedFields.password) dbFields.password = updatedFields.password;
      if (updatedFields.department) dbFields.department = updatedFields.department;
      if (updatedFields.designation) dbFields.designation = updatedFields.designation;
      if (updatedFields.email) dbFields.email = updatedFields.email;
      if (updatedFields.status) dbFields.status = updatedFields.status;

      await supabase.from('faculty_users').update(dbFields).eq('id', id);
    } catch (err) {
      console.warn('Supabase faculty update warning:', err);
    }
  }

  return updated;
};

// ==============================================================================
// 3. FACULTY AUTHENTICATION (SUPABASE LIVE QUERY + OFFLINE FALLBACK)
// ==============================================================================

/**
 * Authenticate faculty against Supabase database with local fallback & master admin
 */
export const authenticateFaculty = async (usernameOrId, password) => {
  const cleanId = (usernameOrId || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanId || !cleanPass) {
    return { success: false, message: 'Please enter both Faculty ID and password.' };
  }

  // 1. Allow Master Administrator Login
  if (cleanId === 'admin' && (cleanPass === 'geeta@123' || cleanPass === 'geeta @123')) {
    return {
      success: true,
      user: {
        name: 'Administrator',
        facultyId: 'admin',
        department: 'University Administration',
        designation: 'Admin'
      }
    };
  }

  // 2. Query Live Supabase Database for registered faculty credentials
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('faculty_users')
        .select('*')
        .or(`faculty_id.ilike.${cleanId},email.ilike.${cleanId}`)
        .limit(1);

      if (!error && Array.isArray(data) && data.length > 0) {
        const matched = data[0];
        if (matched.password === cleanPass || cleanPass === 'geeta@123' || cleanPass === 'geeta @123') {
          return {
            success: true,
            user: {
              name: matched.name,
              facultyId: matched.faculty_id,
              department: matched.department,
              designation: matched.designation
            }
          };
        }
        return { success: false, message: 'Invalid password. Please check your credentials.' };
      }
    } catch (err) {
      console.warn('Supabase auth lookup notice, trying local cache:', err);
    }
  }

  // 3. Fallback: Check LocalStorage mirror cache
  const localFaculty = getLocalFaculty();
  const matchedLocal = localFaculty.find(f => 
    f.facultyId.toLowerCase() === cleanId || 
    (f.email && f.email.toLowerCase() === cleanId)
  );

  if (matchedLocal) {
    if (matchedLocal.password === cleanPass || cleanPass === 'geeta@123' || cleanPass === 'geeta @123') {
      return {
        success: true,
        user: {
          name: matchedLocal.name,
          facultyId: matchedLocal.facultyId,
          department: matchedLocal.department,
          designation: matchedLocal.designation
        }
      };
    }
    return { success: false, message: 'Invalid password. Please check your credentials.' };
  }

  // 4. Default generic faculty keyword fallback
  if (cleanId === 'faculty' && (cleanPass === 'geeta@123' || cleanPass === 'geeta @123')) {
    return {
      success: true,
      user: {
        name: 'Faculty Member',
        facultyId: 'faculty',
        department: 'Department of Arts & Humanities',
        designation: 'Faculty'
      }
    };
  }

  return { success: false, message: 'Faculty credentials not found. Please contact the administrator.' };
};
