import React, { useState } from 'react';
import { 
  Building2, 
  UserPlus, 
  Users, 
  Plus, 
  Trash2, 
  KeyRound, 
  Mail, 
  Check, 
  AlertCircle, 
  Search,
  Eye,
  EyeOff,
  Briefcase,
  Shield,
  UserCheck
} from 'lucide-react';
import { 
  getDepartments, 
  addDepartment, 
  deleteDepartment, 
  getFacultyUsers, 
  addFacultyUser, 
  deleteFacultyUser 
} from '../services/facultyDepartmentService';

export default function AdminFacultyDeptManager({ onDataChanged }) {
  const [departments, setDepartments] = useState(getDepartments());
  const [facultyList, setFacultyList] = useState(getFacultyUsers());
  
  // Modals & UI States
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddFacModal, setShowAddFacModal] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [showPassMap, setShowPassMap] = useState({});

  // New Department Form State
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    head: ''
  });
  const [deptError, setDeptError] = useState('');

  // New Faculty Form State
  const [facForm, setFacForm] = useState({
    name: '',
    facultyId: '',
    password: 'geeta@123',
    department: departments[0]?.name || 'Department of Computer Science & Engineering',
    designation: 'Assistant Professor',
    email: '',
  });
  const [facError, setFacError] = useState('');
  const [facShowPass, setFacShowPass] = useState(false);

  // --- Department Actions ---
  const handleAddDeptSubmit = (e) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      setDeptError('Department name is required');
      return;
    }
    const created = addDepartment(deptForm);
    const updated = getDepartments();
    setDepartments(updated);
    setDeptForm({ name: '', code: '', head: '' });
    setDeptError('');
    setShowAddDeptModal(false);
    if (onDataChanged) onDataChanged();
  };

  const handleDeleteDept = (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}"?`)) {
      const updated = deleteDepartment(id);
      setDepartments(updated);
      if (onDataChanged) onDataChanged();
    }
  };

  // --- Faculty Actions ---
  const handleAddFacSubmit = (e) => {
    e.preventDefault();
    if (!facForm.name.trim() || !facForm.facultyId.trim()) {
      setFacError('Faculty name and Faculty ID / Username are required');
      return;
    }
    if (!facForm.password.trim()) {
      setFacError('Please specify a password for the faculty login');
      return;
    }

    addFacultyUser(facForm);
    const updated = getFacultyUsers();
    setFacultyList(updated);
    setFacForm({
      name: '',
      facultyId: '',
      password: 'geeta@123',
      department: departments[0]?.name || '',
      designation: 'Assistant Professor',
      email: '',
    });
    setFacError('');
    setShowAddFacModal(false);
    if (onDataChanged) onDataChanged();
  };

  const handleDeleteFac = (id, name, facultyId) => {
    if (window.confirm(`Are you sure you want to remove faculty member "${name}" (${facultyId})?`)) {
      const updated = deleteFacultyUser(id);
      setFacultyList(updated);
      if (onDataChanged) onDataChanged();
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPassMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter faculty list
  const filteredFaculty = facultyList.filter(f => {
    const q = facultySearch.toLowerCase();
    const matchesSearch = 
      f.name.toLowerCase().includes(q) ||
      f.facultyId.toLowerCase().includes(q) ||
      (f.email && f.email.toLowerCase().includes(q)) ||
      (f.department && f.department.toLowerCase().includes(q));
    
    const matchesDept = selectedDeptFilter === 'ALL' || f.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* 2-Column Section: Top Summary & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT CARD: Departments Management */}
        <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    University Departments
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {departments.length} Active Academic Departments & Schools
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddDeptModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Department</span>
              </button>
            </div>

            {/* Departments List */}
            <div className="mt-3.5 max-h-56 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {departments.map((dept) => {
                const count = facultyList.filter(f => f.department === dept.name).length;
                return (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950/60 border border-stone-200/60 dark:border-zinc-800/60 text-xs hover:border-stone-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {dept.name}
                        </span>
                        {dept.code && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-stone-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                            {dept.code}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {dept.head ? `HOD: ${dept.head}` : 'Department'} · {count} Faculty {count === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteDept(dept.id, dept.name)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Add Faculty Quick Banner */}
        <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Faculty Credentials Management
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {facultyList.length} Authorized Faculty Accounts configured
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddFacModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Faculty Login</span>
              </button>
            </div>

            <div className="mt-3.5 bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 rounded-xl p-3.5 text-xs text-orange-900 dark:text-orange-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>Faculty Role & Access Control</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Credentials created here allow authorized professors and department coordinators to sign in at the main Certificate Studio (`/`) and generate validated Geeta University certificates with live security QR codes.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Authentication Type: Direct Faculty ID & Password</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">● Active</span>
          </div>
        </div>
      </div>

      {/* Faculty Accounts Directory Table */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Registered Faculty Logins
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Manage login usernames, departments, and security passwords
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                placeholder="Search faculty name, ID..."
                className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer max-w-[180px]"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-stone-200/60 dark:border-zinc-800/60 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-zinc-950/80 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-stone-200/60 dark:border-zinc-800/60">
              <tr>
                <th className="py-2.5 px-3.5">Faculty Name</th>
                <th className="py-2.5 px-3.5">Username / Faculty ID</th>
                <th className="py-2.5 px-3.5">Department</th>
                <th className="py-2.5 px-3.5">Designation</th>
                <th className="py-2.5 px-3.5">Password</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/60">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                    No faculty credentials matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((fac) => {
                  const isPassVisible = showPassMap[fac.id];
                  return (
                    <tr 
                      key={fac.id}
                      className="hover:bg-stone-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-[10px]">
                            {fac.name.charAt(0)}
                          </div>
                          <span>{fac.name}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 font-mono text-zinc-700 dark:text-zinc-300">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 border border-stone-200/60 dark:border-zinc-700/60">
                          {fac.facultyId}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                        {fac.department}
                      </td>

                      <td className="py-2.5 px-3.5 text-zinc-600 dark:text-zinc-400">
                        {fac.designation}
                      </td>

                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {isPassVisible ? fac.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(fac.id)}
                            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            title={isPassVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200/80">
                          Active
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={() => handleDeleteFac(fac.id, fac.name, fac.facultyId)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Delete Faculty Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD DEPARTMENT MODAL */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Add New Department
                </h3>
              </div>
              <button
                onClick={() => setShowAddDeptModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {deptError && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deptError}</span>
              </div>
            )}

            <form onSubmit={handleAddDeptSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Department / School Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Department of Artificial Intelligence & Robotics"
                  className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    placeholder="e.g. DAIR"
                    className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Head of Department
                  </label>
                  <input
                    type="text"
                    value={deptForm.head}
                    onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                    placeholder="e.g. Dr. Sunita Rao"
                    className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FACULTY MODAL */}
      {showAddFacModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Create Faculty Credentials
                </h3>
              </div>
              <button
                onClick={() => setShowAddFacModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {facError && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{facError}</span>
              </div>
            )}

            <form onSubmit={handleAddFacSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Faculty Full Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={facForm.name}
                    onChange={(e) => setFacForm({ ...facForm, name: e.target.value })}
                    placeholder="e.g. Dr. Aarti Sharma"
                    className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Username / Faculty ID <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={facForm.facultyId}
                    onChange={(e) => setFacForm({ ...facForm, facultyId: e.target.value })}
                    placeholder="e.g. GU/FAC/102 or aarti.sharma"
                    className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Assigned Department <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={facForm.department}
                    onChange={(e) => setFacForm({ ...facForm, department: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={facForm.designation}
                    onChange={(e) => setFacForm({ ...facForm, designation: e.target.value })}
                    placeholder="e.g. Associate Professor"
                    className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Login Password <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={facShowPass ? 'text' : 'password'}
                    required
                    value={facForm.password}
                    onChange={(e) => setFacForm({ ...facForm, password: e.target.value })}
                    placeholder="Password"
                    className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl pl-3 pr-10 py-2 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setFacShowPass(!facShowPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1"
                  >
                    {facShowPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFacModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Create Faculty Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
