import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Calendar,
  BookOpen,
  Hash,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  UserCheck,
  Shield,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const BRANCH_OPTIONS = [
  'Civil Engineering | UG |',
  'Mechanical Engineering | UG |',
  'Computer Science & Engineering | UG |',
  'Electrical & Electronics Engineering |UG|',
  'Artificial Intelligence & Machine Learning |UG|',
  'Aeronautical Engineering|UG|',
  'Computer Science & Engineering |PG|',
  'Power System |PG|',
] as const;

export const AuthScreen: React.FC<{ initialMode?: 'login' | 'register' }> = ({
  initialMode = 'login',
}) => {
  const { loginUser, registerUser, loginAsDemoUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');

  const [branch, setBranch] = useState<string>(BRANCH_OPTIONS[2]); // Default CS UG
  const [email, setEmail] = useState('');
  const [passoutYear, setPassoutYear] = useState('2026');
  const [dob, setDob] = useState('2003-05-15');
  const [rollNumber, setRollNumber] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [registrationNumber, setRegistrationNumber] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Auto-fill admin credentials
  const fillAdminCredentials = () => {
    setMode('login');
    setLoginIdentifier('admin_nce');
    setLoginPassword('Admin@2026');
    setStatusMessage({
      type: 'success',
      text: 'Admin credentials auto-filled. Click "Log In as Admin" to enter.',
    });
  };

  // Validation Helpers
  const handleFullNameChange = (val: string) => {
    if (val === '' || /^[a-zA-Z\s]*$/.test(val)) {
      setFullName(val);
      setFullNameError('');
    } else {
      setFullNameError('Only alphabets (A-Z) and spaces are allowed.');
    }
  };

  const validateUsername = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9._]/g, '');
    setUsername(clean);

    if (clean.length === 0) {
      setUsernameError('Username is required.');
    } else if (clean.length > 30) {
      setUsernameError('Username must be 30 characters or fewer.');
    } else if (clean.startsWith('.') || clean.endsWith('.')) {
      setUsernameError('Username cannot start or end with a period.');
    } else if (clean.includes('..')) {
      setUsernameError('Username cannot contain consecutive periods.');
    } else {
      setUsernameError('');
    }
  };

  const hasMinLength = password.length >= 8;
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasMinLength && hasDigit && hasSpecialChar;
  const isPasswordMatching = password.length > 0 && password === confirmPassword;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!loginIdentifier || !loginPassword) {
      setStatusMessage({ type: 'error', text: 'Please enter your Username/Email/Reg No. and Password.' });
      return;
    }

    const res = loginUser(loginIdentifier, loginPassword);
    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!fullName.trim() || !/^[a-zA-Z\s]+$/.test(fullName)) {
      setStatusMessage({ type: 'error', text: 'Full Name must contain only alphabets and spaces.' });
      return;
    }

    if (!username.trim() || usernameError) {
      setStatusMessage({ type: 'error', text: usernameError || 'Please enter a valid Instagram-style handle.' });
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    if (!passoutYear.trim() || !dob) {
      setStatusMessage({ type: 'error', text: 'Please provide Passout Year and Date of Birth.' });
      return;
    }

    if (role === 'student') {
      if (!rollNumber.trim() || !registrationNumber.trim()) {
        setStatusMessage({ type: 'error', text: 'Please provide Roll Number and Registration Number for Student registration.' });
        return;
      }
    }

    if (!isPasswordValid) {
      setStatusMessage({
        type: 'error',
        text: 'Password must be at least 8 characters with at least one digit and one special character.',
      });
      return;
    }

    if (!isPasswordMatching) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    const finalRollNo = role === 'student' ? rollNumber.trim() : 'N/A (Alumni)';
    const finalRegNo = role === 'student' ? registrationNumber.trim() : 'N/A (Alumni)';

    const res = registerUser({
      name: fullName.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      role,
      department: branch,
      gradYear: passoutYear.trim(),
      bio: role === 'student'
        ? `Student at NCE | Roll No: ${finalRollNo} | Reg No: ${finalRegNo}`
        : `Alumni of NCE (${passoutYear.trim()}) | ${branch}`,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80`,
      rollNumber: finalRollNo,
      registrationNumber: finalRegNo,
      dob,
      password,
    });

    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.message });
    } else {
      setStatusMessage({
        type: 'success',
        text: res.message,
      });
      // Switch to login tab so the user can attempt login when approved by Admin
      setMode('login');
      setLoginIdentifier(username.trim());
      setLoginPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-2 sm:p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Responsive Layout Box */}
      <div className="w-full max-w-4xl bg-[#181B20]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col md:flex-row relative z-10 max-h-[94vh] md:max-h-[88vh]">
        
        {/* Left Side Branding & Admin Info Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-4 sm:p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                <GraduationCap className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
                  <span className="text-indigo-400">NCE</span>connect
                </h1>
                <p className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase text-indigo-300">
                  Campus Official Network
                </p>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white leading-tight mb-2 md:mb-3">
              Official Student & Alumni Hub
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4 md:mb-6">
              Connect across all engineering branches. Share research, campus updates, and tag peers with Instagram-style handles.
            </p>

            <div className="space-y-2.5 hidden sm:block">
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-white/5 p-2.5 rounded-2xl border border-white/5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Verified Roll & Registration Number identification.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-white/5 p-2.5 rounded-2xl border border-white/5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Advisors can promote members to Admin status.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Area (Login / Register Switcher) */}
        <div className="md:w-7/12 p-4 sm:p-6 md:p-8 flex flex-col justify-start overflow-y-auto custom-scrollbar flex-1">
          {/* Top Mode Tabs */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-2xl border border-white/10 mb-4 shrink-0">
            <button
              onClick={() => {
                setMode('login');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Log In</span>
            </button>
            <button
              onClick={() => {
                setMode('register');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Status Message Banner */}
          {statusMessage && (
            <div
              className={`p-3 mb-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* 1. LOGIN FORM MODE */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 my-auto">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Username / Email / Registration No.</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin_nce or REG-ADMIN-001"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 sm:p-3 pr-10 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Log In to NCEconnect</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  New student or alumni?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setStatusMessage(null);
                    }}
                    className="text-indigo-400 hover:underline font-bold"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* 2. REGISTRATION FORM MODE */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Role Option Toggle */}
              <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    role === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Current Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('alumni')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    role === 'alumni' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Alumni Graduate
                </button>
              </div>

              {/* Requirement 1: Full Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-0.5">
                  1. Full Name * <span className="text-[10px] text-slate-400 font-normal">(Alphabets & spaces)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Mehta"
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  className={`w-full text-xs p-2 rounded-xl bg-slate-900/90 border text-white focus:outline-none ${
                    fullNameError ? 'border-rose-500 focus:ring-rose-500' : 'border-white/10 focus:border-indigo-500'
                  }`}
                />
                {fullNameError && <p className="text-[10px] text-rose-400 mt-0.5">{fullNameError}</p>}
              </div>

              {/* Requirement 2: Branch selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-0.5">
                  2. Branch Selection *
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                >
                  {BRANCH_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requirement 3: Email ID & Requirement 4: Passout year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-indigo-400" />
                    <span>3. Email ID *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@nce.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-0.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-indigo-400" />
                    <span>4. Passout Year *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026"
                    value={passoutYear}
                    onChange={(e) => setPassoutYear(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Requirement 5: Date of birth & (Roll Number for students only) */}
              <div className={`grid grid-cols-1 ${role === 'student' ? 'sm:grid-cols-2' : ''} gap-2.5`}>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    <span>5. Date of Birth *</span>
                  </label>
                  <input
                    type="date"
                    required
                    max="2012-12-31"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {role === 'student' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-0.5 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-indigo-400" />
                      <span>6. Roll Number *</span>
                    </label>
                    <input
                      type="text"
                      required={role === 'student'}
                      placeholder="e.g. 21001103012"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Requirement: Create Username (Instagram rules) */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-0.5">
                  {role === 'student' ? '7. Create Username *' : '6. Create Username *'} <span className="text-[10px] text-slate-400 font-normal">(Tag handle)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400">@</span>
                  <input
                    type="text"
                    required
                    placeholder="aarav_mehta"
                    value={username}
                    onChange={(e) => validateUsername(e.target.value)}
                    className={`w-full text-xs p-2 pl-6 rounded-xl bg-slate-900/90 border text-white focus:outline-none ${
                      usernameError ? 'border-rose-500' : 'border-white/10 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {usernameError && <p className="text-[10px] text-rose-400 mt-0.5">{usernameError}</p>}
              </div>

              {/* Requirement: Create password & Confirm password */}
              <div className="space-y-1.5 border-t border-b border-white/10 py-2">
                <label className="text-[11px] font-bold text-slate-300 block">
                  {role === 'student' ? '8. Create Password & Confirm Password *' : '7. Create Password & Confirm Password *'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs p-2 pr-7 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full text-xs p-2 rounded-xl bg-slate-900/90 border text-white focus:outline-none ${
                        confirmPassword && !isPasswordMatching
                          ? 'border-rose-500'
                          : 'border-white/10 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Password validation indicators */}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-slate-400 pt-0.5">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400 font-bold' : ''}`}>
                    {hasMinLength ? <Check className="w-2.5 h-2.5" /> : '•'} Min 8 chars
                  </span>
                  <span className={`flex items-center gap-1 ${hasDigit ? 'text-emerald-400 font-bold' : ''}`}>
                    {hasDigit ? <Check className="w-2.5 h-2.5" /> : '•'} 1 digit
                  </span>
                  <span className={`flex items-center gap-1 ${hasSpecialChar ? 'text-emerald-400 font-bold' : ''}`}>
                    {hasSpecialChar ? <Check className="w-2.5 h-2.5" /> : '•'} 1 special char
                  </span>
                </div>
              </div>

              {/* Requirement: Registration Number (Students only) */}
              {role === 'student' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-0.5">
                    9. Registration Number *
                  </label>
                  <input
                    type="text"
                    required={role === 'student'}
                    placeholder="e.g. REG-2021-00452"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Submit Registration Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  <span>Register & Create Account</span>
                </button>
              </div>

              <div className="text-center pt-0.5">
                <p className="text-xs text-slate-400">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setStatusMessage(null);
                    }}
                    className="text-indigo-400 hover:underline font-bold"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
