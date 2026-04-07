import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ShoppingBag, Image, MessageSquare, ShieldCheck, ArrowUpRight, ChevronRight, Mail } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { name: 'Home', path: '/', icon: Globe },
  { name: 'Products', path: '/products', icon: ShoppingBag },
  { name: 'Gallery', path: '/gallery', icon: Image },
  { name: 'Testimonials', path: '/testimonials', icon: MessageSquare },
  { name: 'About', path: '/about-us', icon: ShieldCheck },
  { name: 'Contact', path: '/contact-us', icon: Mail },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center group">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 transition-transform group-hover:scale-110">
              <Globe className="h-6 w-6" />
            </div>
            <div className="ml-3">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Global<span className="text-brand-primary">Trade</span>
              </span>
              <div className="h-0.5 w-0 group-hover:w-full bg-brand-primary transition-all duration-300" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "nav-link",
                  location.pathname === item.path && "nav-link-active"
                )}
              >
                {item.name}
              </Link>
            ))}
            
            <Link
              to="/admin"
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-brand-primary hover:shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center gap-2"
            >
              Admin <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-500 hover:text-brand-primary transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-white border-b border-slate-100 shadow-xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-brand-primary/5 text-brand-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-brand-primary"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-4 mt-4 bg-slate-900 text-white rounded-xl text-center font-bold"
              >
                Admin Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
