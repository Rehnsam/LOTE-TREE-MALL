
import React, { useState } from 'react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@vision.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen aviation-gradient flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[48px] p-10 shadow-2xl relative z-10">
          <div className="flex justify-center mb-8">
            <Logo showText={false} className="h-20" />
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Employee Portal</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Vision Aviation Academy</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3 animate-in shake duration-300">
                <span>⚠️</span> {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="name@vision.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between px-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
                <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-600 transition-colors">Remember Me</span>
              </label>
              <button type="button" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors">Forgot Access?</button>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#d91b1b] text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Secure Login ✈️</>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-12 px-6 leading-relaxed">
            Restricted access. This terminal is for authorized academy employees only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
