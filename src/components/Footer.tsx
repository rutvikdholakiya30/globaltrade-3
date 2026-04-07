import { Link } from 'react-router-dom';
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, ArrowUpRight } from 'lucide-react';
import { useContactInfo } from '@/hooks/useData';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { contactInfo } = useContactInfo();

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
            <div className="flex flex-wrap gap-3">
              {contactInfo.social_links && Object.entries(contactInfo.social_links).map(([platform, url]) => {
                if (!url) return null;
                const icons: Record<string, any> = {
                  facebook: Facebook,
                  twitter: Twitter,
                  linkedin: Linkedin,
                  instagram: Instagram,
                  youtube: Youtube
                };
                const Icon = icons[platform] || Globe;
                return (
                  <a 
                    key={platform} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all group"
                  >
                    <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </a>
                );
              })}
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
                    to={item === 'Contact Us' ? '/contact-us' : `/${item.toLowerCase().replace(' & ', '-').replace(' ', '-')}`} 
                    className="text-sm text-slate-500 hover:text-brand-primary transition-colors flex items-center group"
                  >
                    {item} <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Contact Info */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Operational Presence</h4>
            
            <div className="space-y-6">
              {/* Primary Address */}
              {contactInfo.addresses[0] && (
                <div className="flex items-start space-x-3 group">
                  <MapPin className="h-4 w-4 text-brand-primary shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                    {contactInfo.addresses[0]}
                  </span>
                </div>
              )}

              {/* Primary Phone */}
              {contactInfo.phones[0] && (
                <div className="flex items-center space-x-3 group pt-2 border-t border-slate-100">
                  <Phone className="h-4 w-4 text-brand-primary shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-[11px] sm:text-xs text-slate-500 font-bold tracking-widest">{contactInfo.phones[0]}</span>
                </div>
              )}

              {/* Primary Email */}
              {contactInfo.emails[0] && (
                <div className="flex items-center space-x-3 group pt-2 border-t border-slate-100">
                  <Mail className="h-4 w-4 text-brand-primary shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium lowercase tracking-tight break-all">{contactInfo.emails[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium">
            © {currentYear} GlobalTrade Connect. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-8">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">ISO 9001 Certified System</span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Verified Global Exporter</span>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-300 font-medium tracking-widest uppercase">
            Developed by{' '}
            <a
              href="https://codefixer.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary font-bold hover:underline hover:text-brand-primary/80 transition-colors"
            >
              CodeFixer
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
