import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Image as ImageIcon, 
  MessageSquare, 
  FileText, 
  Mail, 
  LogOut, 
  Menu, 
  X,
  Globe,
  Bell,
  Users,
  ShieldCheck
} from 'lucide-react';
import { ConfirmDialog } from '@/components/Admin/ConfirmDialog';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: ShoppingBag },
  { name: 'Categories', path: '/admin/categories', icon: Layers },
  { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
  { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
  { name: 'Pages', path: '/admin/pages', icon: FileText },
  { name: 'Messages', path: '/admin/messages', icon: Mail },
  { name: 'Partners', path: '/admin/partners', icon: Users },
  { name: 'Memberships', path: '/admin/memberships', icon: ShieldCheck },
  { name: 'Documents', path: '/admin/documents', icon: FileText },
  { name: 'Settings', path: '/admin/settings', icon: ShieldCheck },
];

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
      setUser(session?.user);
    });

    // Fetch initial count
    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:contact_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  // Close sidebar on navigation for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  async function fetchUnreadCount() {
    const { count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true });
    
    if (count !== null) setUnreadCount(count);
  }

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">GlobalTrade</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-grow px-4 space-y-2 mt-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  location.pathname === item.path
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  location.pathname === item.path ? "text-white" : "text-gray-400 group-hover:text-white"
                )} />
                <span>{item.name}</span>
                {item.name === 'Messages' && unreadCount > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setIsLogoutDialogOpen(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all font-bold uppercase tracking-widest text-[10px]"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
      
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out?"
        message="Are you sure you want to log out of the administrative dashboard? You will need to sign in again to manage content."
      />

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={cn("p-2 text-gray-600 lg:hidden", isSidebarOpen && "hidden")}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
