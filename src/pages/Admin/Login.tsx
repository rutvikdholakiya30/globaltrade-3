import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { Lock, Mail, Globe, ArrowRight, Loader2, ShieldAlert, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin/dashboard');
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-brand-primary/10 selection:text-brand-primary">
      {/* Soft Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-brand-accent/5 rounded-full blur-[100px]" />
        
        {/* Subtle Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Link to="/" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-brand-primary transition-colors mb-8 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Terminal
        </Link>

        <div className="glass-card overflow-hidden shadow-2xl shadow-slate-200/50 border-white/40 bg-white/70 backdrop-blur-xl rounded-[32px]">
          {/* Header */}
          <div className="p-10 border-b border-slate-100 bg-white/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center group">
                <Globe className="h-8 w-8 text-brand-primary transition-transform duration-500 group-hover:rotate-180" />
                <span className="ml-3 text-2xl font-display font-black tracking-tighter uppercase text-slate-900">
                  Global<span className="text-brand-primary">Trade</span>
                </span>
              </div>
              <div className="px-3 py-1 bg-brand-primary/5 rounded-full text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                Admin Area
              </div>
            </div>
            
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-2">Secure Access</h1>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Authorized Personnel Only</p>
          </div>

          {/* Form */}
          <div className="p-10 bg-white/30">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-start gap-3"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-primary" /> Identity / Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-base font-medium focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all placeholder:text-slate-300"
                    placeholder="admin@globaltrade.net"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-4 w-4 text-brand-primary" /> Access Key / Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-base font-medium focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all placeholder:text-slate-300 pr-12"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-secondary hover:shadow-xl hover:shadow-brand-primary/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Initialize Connection 
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure-SSL</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center space-x-6 opacity-30">
          <div className="h-px w-12 bg-slate-200" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Global Systems</span>
          <div className="h-px w-12 bg-slate-200" />
        </div>
      </motion.div>
    </div>
  );
}
