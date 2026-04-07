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
    <div className="min-h-screen bg-industrial-black flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-safety-amber/30 selection:text-safety-amber font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated Gradient Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-safety-amber/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-blue-500/10 blur-[100px] rounded-full"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], x: [0, 50, 0], y: [0, 100, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-indigo-500/10 blur-[110px] rounded-full"
        />
        
        {/* Mesh Grid */}
        <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(#1B1E24 1px, transparent 1px), linear-gradient(90deg, #1B1E24 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-industrial-black via-transparent to-industrial-black" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <Link to="/" className="inline-flex items-center text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] hover:text-safety-amber transition-all duration-500 mb-10 group">
          <ChevronLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          <span className="relative overflow-hidden inline-block text-gray-400 group-hover:text-safety-amber">
            Back to Home
            <span className="absolute bottom-0 left-0 w-full h-px bg-safety-amber -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </span>
        </Link>

        <div className="glass-panel overflow-hidden relative border-t-0 p-[1px] group">
            {/* Animated border glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-industrial-border/50 via-safety-amber/20 to-industrial-border/50 z-[-1]" />
          
          <div className="bg-[#0A0C10]/90 backdrop-blur-3xl h-full w-full">
            {/* Header */}
            <div className="p-10 border-b border-industrial-border/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Globe className="h-32 w-32 -mr-16 -mt-16" />
                </div>
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center group/logo cursor-default"
                >
                    <div className="relative">
                    <Globe className="h-10 w-10 text-safety-amber transition-transform duration-700 group-hover/logo:rotate-[360deg]" />
                    <div className="absolute inset-0 bg-safety-amber/40 blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-700" />
                    </div>
                    <span className="ml-4 text-2xl font-display font-black tracking-tighter uppercase text-white">
                    Global<span className="text-safety-amber">Trade</span>
                    </span>
                </motion.div>
                <div className="px-3 py-1.5 border border-safety-amber/20 bg-safety-amber/5 rounded-sm text-[8px] font-mono text-safety-amber uppercase tracking-[0.2em]">
                    v4.0 Admin
                </div>
                </div>
                
                <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-3 leading-none italic text-white flex items-center gap-2">
                Secure <span className="text-safety-amber">Login</span>
                </h1>
                <div className="flex items-center gap-3">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">
                    Authorization Protocol
                </p>
                <div className="flex-1 h-px bg-gradient-to-r from-industrial-border/30 to-transparent" />
                </div>
            </div>

            {/* Form */}
            <div className="p-10 pt-8 relative z-10">
                <form onSubmit={handleLogin} className="space-y-8">
                {error && (
                    <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-mono uppercase tracking-[0.1em] flex items-start gap-4"
                    >
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                    </motion.div>
                )}

                <div className="space-y-3">
                    <label htmlFor="email" className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.25em] flex items-center gap-3 cursor-pointer group/label">
                    <Mail className="h-3.5 w-3.5 text-safety-amber group-hover/label:scale-110 transition-transform" /> 
                    <span className="group-hover/label:text-safety-amber transition-colors">Admin Identity</span>
                    </label>
                    <div className="relative group/input">
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-premium"
                        placeholder="ADMIN@GLOBALTRADE.NET"
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-safety-amber group-focus-within/input:w-full transition-all duration-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <label htmlFor="password" className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.25em] flex items-center gap-3 cursor-pointer group/label">
                    <Lock className="h-3.5 w-3.5 text-safety-amber group-hover/label:scale-110 transition-transform" /> 
                    <span className="group-hover/label:text-safety-amber transition-colors">Access Token</span>
                    </label>
                    <div className="relative group/input">
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-premium"
                        placeholder="••••••••••••"
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-safety-amber group-focus-within/input:w-full transition-all duration-500" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-premium group/btn"
                >
                    {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                    <>
                        Authorize Session 
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                    </>
                    )}
                </button>
                </form>
            </div>

            {/* Footer Status */}
            <div className="px-10 py-6 border-t border-industrial-border/30 bg-black/40 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.2em]">Secure Node: ACTIVE</span>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-3 w-3 text-gray-600" />
                    <span className="text-[8px] font-mono text-gray-600 uppercase tracking-[0.2em]">Encrypted-TLS</span>
                </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 opacity-20 group cursor-default">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-industrial-border" />
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.8em] group-hover:tracking-[1em] transition-all duration-700">
            Global Trade Connect
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-industrial-border" />
        </div>
      </motion.div>
    </div>
  );
}
