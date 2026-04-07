import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { Lock, Mail, Globe, ArrowRight, Loader2, ShieldAlert, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-industrial-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grid Decor */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #FFB800 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Link to="/" className="inline-flex items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest hover:text-safety-amber transition-colors mb-12 group">
          <ChevronLeft className="h-3 w-3 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Terminal
        </Link>

        <div className="border border-industrial-border bg-industrial-gray/30 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-8 border-b border-industrial-border bg-industrial-gray/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center group">
                <Globe className="h-8 w-8 text-safety-amber transition-transform duration-500 group-hover:rotate-180" />
                <span className="ml-3 text-xl font-display font-bold tracking-tighter uppercase">
                  Global<span className="text-safety-amber">Trade</span>
                </span>
              </div>
              <div className="px-2 py-1 border border-safety-amber/30 text-[8px] font-mono text-safety-amber uppercase tracking-widest">
                Admin Auth
              </div>
            </div>
            
            <h1 className="text-3xl font-display font-bold uppercase tracking-tighter mb-2">Secure Access</h1>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">Authorized Personnel Only</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-widest flex items-start space-x-3"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="h-3 w-3 text-safety-amber" /> Identity / Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-industrial-black border border-industrial-border text-white text-sm font-mono focus:outline-none focus:border-safety-amber transition-all"
                  placeholder="ADMIN@GLOBALTRADE.COM"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-3 w-3 text-safety-amber" /> Access Key / Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-industrial-black border border-industrial-border text-white text-sm font-mono focus:outline-none focus:border-safety-amber transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-safety-amber text-black font-mono text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Initialize Session <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="p-6 border-t border-industrial-border bg-industrial-gray/20 flex items-center justify-between">
            <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">System Status: Online</span>
            <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Encrypted Connection</span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-6 opacity-30">
          <div className="h-px w-12 bg-industrial-border" />
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.5em]">GlobalTrade Connect</span>
          <div className="h-px w-12 bg-industrial-border" />
        </div>
      </motion.div>
    </div>
  );
}
