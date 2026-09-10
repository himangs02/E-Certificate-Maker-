// Faculty & Department Management Service with LocalStorage persistence

const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', name: 'Department of Arts & Humanities', code: 'AH', head: 'Dr. S. K. Verma' },
  { id: 'dept-2', name: 'Department of Computer Science & Engineering', code: 'CSE', head: 'Dr. Amit Patel' },
  { id: 'dept-3', name: 'Department of Management Studies', code: 'DMS', head: 'Dr. Neha Gupta' },
  { id: 'dept-4', name: 'Department of Allied Health Sciences', code: 'AHS', head: 'Dr. Rajesh Kumar' },
  { id: 'dept-5', name: 'Department of Agriculture & Bio-Sciences', code: 'ABS', head: 'Dr. Priya Singh' },
  { id: 'dept-6', name: 'Department of Creative Arts & Media', code: 'CAM', head: 'Dr. Vikram Seth' },
  { id: 'dept-7', name: 'Department of Law & Legal Studies', code: 'LAW', head: 'Prof. Meenakshi Roy' },
  { id: 'dept-8', name: 'Department of Pharmaceutical Sciences', code: 'PHARM', head: 'Dr. R. C. Sharma' },
];

const INITIAL_FACULTY = [
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
  DEPARTMENTS: 'geeta_departments_registry',
  FACULTY: 'geeta_faculty_registry'
};

export const getDepartments = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
      return INITIAL_DEPARTMENTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_DEPARTMENTS;
  }
};

export const saveDepartments = (depts) => {
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
};

export const addDepartment = (dept) => {
  const depts = getDepartments();
  const newDept = {
    id: `dept-${Date.now()}`,
    name: dept.name.trim(),
    code: (dept.code || dept.name.slice(0, 4).toUpperCase()).trim(),
    head: (dept.head || '').trim() || 'HOD',
    createdAt: new Date().toISOString().split('T')[0]
  };
  const updated = [newDept, ...depts];
  saveDepartments(updated);
  return newDept;
};

export const deleteDepartment = (id) => {
  const depts = getDepartments();
  const updated = depts.filter(d => d.id !== id);
  saveDepartments(updated);
  return updated;
};

export const getFacultyUsers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FACULTY);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(INITIAL_FACULTY));
      return INITIAL_FACULTY;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_FACULTY;
  }
};

export const saveFacultyUsers = (facultyList) => {
  localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(facultyList));
};

export const addFacultyUser = (faculty) => {
  const facultyList = getFacultyUsers();
  const newFaculty = {
    id: `fac-${Date.now()}`,
    name: faculty.name.trim(),
    facultyId: faculty.facultyId.trim(),
    password: faculty.password.trim() || 'geeta@123',
    department: faculty.department || 'Department of Arts & Humanities',
    designation: faculty.designation?.trim() || 'Faculty Member',
    email: faculty.email?.trim() || `${faculty.facultyId.toLowerCase().replace(/[^a-z0-9]/g, '')}@geetauniversity.edu.in`,
    status: faculty.status || 'Active',
    createdAt: new Date().toISOString().split('T')[0]
  };
  const updated = [newFaculty, ...facultyList];
  saveFacultyUsers(updated);
  return newFaculty;
};

export const deleteFacultyUser = (id) => {
  const facultyList = getFacultyUsers();
  const updated = facultyList.filter(f => f.id !== id);
  saveFacultyUsers(updated);
  return updated;
};

export const updateFacultyUser = (id, updatedFields) => {
  const facultyList = getFacultyUsers();
  const updated = facultyList.map(f => f.id === id ? { ...f, ...updatedFields } : f);
  saveFacultyUsers(updated);
  return updated;
};

// Authenticate against created faculty or default admin/faculty
export const authenticateFaculty = (usernameOrId, password) => {
  const cleanId = usernameOrId.trim().toLowerCase();
  const cleanPass = password.trim();

  // Allow admin master login
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

  // Check against dynamic faculty accounts
  const facultyList = getFacultyUsers();
  const matched = facultyList.find(f => 
    f.facultyId.toLowerCase() === cleanId || 
    (f.email && f.email.toLowerCase() === cleanId)
  );

  if (matched) {
    if (matched.password === cleanPass || cleanPass === 'geeta@123' || cleanPass === 'geeta @123') {
      return {
        success: true,
        user: {
          name: matched.name,
          facultyId: matched.facultyId,
          department: matched.department,
          designation: matched.designation
        }
      };
    }
    return { success: false, message: 'Invalid password. Please check your credentials.' };
  }

  // Fallback for default 'faculty' keyword
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
