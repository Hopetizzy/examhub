import React, { useState } from 'react';
import { AuthService } from '../services/AuthService';
import { X, Lock, Mail, User as UserIcon, Loader2, Users, GraduationCap, CheckCircle } from 'lucide-react';
import { UserRole, User } from '../types';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onViewPrivacy: () => void;
  onViewTerms: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, onViewPrivacy, onViewTerms }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    // Robust checks: Standard Regex + no spaces
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!isLogin && !acceptedTerms) {
      toast.error("You must accept the Terms & Conditions to register.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const user = await AuthService.signIn(formData.email, formData.password);
        toast.success("Welcome back!");
        onSuccess(user);
      } else {
        // Register Logic: Extract Surname
        const nameParts = formData.name.trim().split(/\s+/);
        const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        const { session } = await AuthService.signUp(formData.email, formData.password, formData.name, surname, role);

        if (session) {
          const appUser = await AuthService.getCurrentUser();
          if (appUser) {
            toast.success("Account created and logged in!");
            onSuccess(appUser);
          } else {
            toast.success("Account created successfully!");
            onClose();
          }
        } else {
          toast.success("Account created! Please CHECK YOUR EMAIL to verify before logging in.");
          onClose();
        }
      }
    } catch (err: any) {
      console.error("Auth error", err);
      if (err.message && err.message.includes("already registered")) {
        toast.error("This email is already registered. Please log in.");
      } else {
        toast.error(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Start Your Journey'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Role Selector */}
        {!isLogin && (
          <div className="p-4 bg-slate-100/50 flex gap-2">
            <button
              onClick={() => setRole('STUDENT')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition ${role === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <GraduationCap size={18} /> Student
            </button>
            <button
              onClick={() => setRole('TUTOR')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition ${role === 'TUTOR' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <Users size={18} /> Tutor
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input
                    type="text"
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder={role === 'TUTOR' ? "Business or Personal Name" : "Your Full Name"}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>


            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="email@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {/* Terms & Conditions Checkbox */}
          {!isLogin && (
            <div className="flex items-start gap-2 pt-1">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white shadow-sm transition-all hover:border-blue-500 checked:border-blue-600 checked:bg-blue-600 focus:ring-2 focus:ring-blue-200"
                />
                <CheckCircle className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" size={12} />
              </div>
              <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer select-none">
                I agree to the <span onClick={(e) => { e.preventDefault(); onViewTerms(); }} className="text-blue-600 font-bold hover:underline">Terms of Service</span> and <span onClick={(e) => { e.preventDefault(); onViewPrivacy(); }} className="text-blue-600 font-bold hover:underline">Privacy Policy</span>.
              </label>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : (role === 'TUTOR' ? 'Register as Tutor' : 'Get Started'))}
          </button>
        </form>

        <div className="p-6 bg-slate-50 text-center text-sm border-t border-slate-100">
          <span className="text-slate-500">{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-black hover:underline ml-1"
          >
            {isLogin ? 'Create one' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};
