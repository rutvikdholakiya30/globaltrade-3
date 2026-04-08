import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingBag, 
  Layers, 
  MessageSquare, 
  Mail, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice, cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    testimonials: 0,
    messages: 0,
  });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSession, setLastSession] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);

  useEffect(() => {
    async function logAccess() {
      try {
        // Check if we've already logged a session for this browser tab
        const currentSessionFlag = sessionStorage.getItem('admin_session_logged');
        
        if (currentSessionFlag) {
          // If already logged in this tab, fetch the log BEFORE that one (offset 1)
          const { data: previous } = await supabase
            .from('admin_access_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .range(1, 1) // Get the 2nd most recent (the true previous session)
            .single();
          
          if (previous) setLastSession(previous);
          return;
        }

        // Fetch location data from ipapi.co
        const res = await fetch('https://ipapi.co/json/');
        const locationData = await res.json();
        
        const sessionInfo = {
          ip_address: locationData.ip,
          location: `${locationData.city}, ${locationData.country_name}`,
          user_agent: navigator.userAgent
        };

        setCurrentSession(sessionInfo);

        // Fetch the LATEST session (this is the true previous session before we insert the new one)
        const { data: previous } = await supabase
          .from('admin_access_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (previous) setLastSession(previous);

        // Log the current session and mark as logged in this tab
        await supabase.from('admin_access_logs').insert([sessionInfo]);
        sessionStorage.setItem('admin_session_logged', 'true');
      } catch (err) {
        console.error('Failed to log access session:', err);
      }
    }

    async function fetchStats() {
      const [
        { count: pCount },
        { count: cCount },
        { count: tCount },
        { count: mCount },
        { data: messages }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      setStats({
        products: pCount || 0,
        categories: cCount || 0,
        testimonials: tCount || 0,
        messages: mCount || 0,
      });
      setRecentMessages(messages || []);
      setLoading(false);
    }
    
    logAccess();
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Products', value: stats.products, icon: ShoppingBag, color: 'blue', trend: '+12%' },
    { name: 'Categories', value: stats.categories, icon: Layers, color: 'green', trend: '+2' },
    { name: 'Pending Reviews', value: stats.testimonials, icon: MessageSquare, color: 'purple', trend: '5 new' },
    { name: 'New Messages', value: stats.messages, icon: Mail, color: 'orange', trend: '+8%' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50">
          <Clock className="h-4 w-4 text-blue-600" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-3 rounded-2xl transition-transform group-hover:scale-110",
                stat.color === 'blue' && "bg-blue-50 text-blue-600",
                stat.color === 'green' && "bg-green-50 text-green-600",
                stat.color === 'purple' && "bg-purple-50 text-purple-600",
                stat.color === 'orange' && "bg-orange-50 text-orange-600",
              )}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" /> {stat.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Inquiries</h2>
            <Link to="/admin/messages" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                    {msg.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{msg.name}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{msg.subject || 'No Subject'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</p>
                  <Link to="/admin/messages" className="text-xs font-bold text-blue-600 mt-1">Reply</Link>
                </div>
              </div>
            ))}
            {recentMessages.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                No recent messages found.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Security */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-gray-200">
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/products" className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/5">
                <span className="font-medium">Manage Products</span>
                <ArrowUpRight className="h-5 w-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </Link>
              <Link to="/admin/categories" className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/5">
                <span className="font-medium">Manage Categories</span>
                <ArrowUpRight className="h-5 w-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </Link>
              <Link to="/admin/gallery" className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/5">
                <span className="font-medium">Upload to Gallery</span>
                <ArrowUpRight className="h-5 w-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </Link>
            </div>
          </div>

          <div className={cn(
            "rounded-[2.5rem] p-8 text-white shadow-xl transition-all duration-500",
            lastSession ? "bg-blue-600 shadow-blue-100" : "bg-blue-600 shadow-blue-100"
          )}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">Security Monitor</h2>
              <div className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Live</div>
            </div>
            
            {lastSession ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Previous Admin Access</p>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-4 w-4 text-blue-200" />
                    <span className="text-sm font-bold">{new Date(lastSession.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-blue-200 rotate-90" />
                    <span className="text-xs font-medium">{lastSession.location || 'Unknown Location'}</span>
                  </div>
                  <p className="text-[10px] text-blue-200/60 mt-2 font-mono">{lastSession.ip_address}</p>
                </div>
                <p className="text-[10px] text-blue-100 italic">If this wasn't you, please change your password in settings.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-blue-100 text-sm leading-relaxed">Your session is being monitored for security. This allows you to track unauthorized logins.</p>
                <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Shield Active
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




