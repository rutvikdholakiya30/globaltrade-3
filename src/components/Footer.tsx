import { Link } from 'react-router-dom';
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center group">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                <Globe className="h-6 w-6" />
              </div>
              <span className="ml-3 text-2xl font-extrabold tracking-tight text-slate-900">
                Global<span className="text-brand-primary">Trade</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Pioneering global logistics through precision engineering and verified supply chains. 
              Connecting markets with integrity since 2005.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="space-y-4">
              {['Home', 'Products', 'Gallery', 'Testimonials', 'About Us'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-sm text-slate-500 hover:text-brand-primary transition-colors flex items-center group"
                  >
                    {item} <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4">
              {['Contact Us', 'Terms & Conditions', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(' & ', '-').replace(' ', '-')}`} 
                    className="text-sm text-slate-500 hover:text-brand-primary transition-colors flex items-center group"
                  >
                    {item} <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Headquarters</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-brand-primary shrink-0" />
                <span className="text-sm text-slate-500 leading-relaxed">
                  123 Trade Center, Logistics Bay,<br />
                  Dubai, United Arab Emirates
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-brand-primary shrink-0" />
                <span className="text-sm text-slate-500">+971 4 123 4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-brand-primary shrink-0" />
                <span className="text-sm text-slate-500">contact@globaltrade.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium">
            © {currentYear} GlobalTrade Connect. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-8">
            <span className="text-xs text-slate-400 font-medium">ISO 9001 Certified</span>
            <span className="text-xs text-slate-400 font-medium">Verified Exporter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
