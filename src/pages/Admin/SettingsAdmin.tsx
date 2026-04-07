import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Save, 
  Shield, 
  Mail, 
  Server, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Clock, 
  Plus, 
  Trash2,
  Globe,
  Key,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { ContactInfo } from '@/types';

export function SettingsAdmin() {
  const [smtpSettings, setSmtpSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    admin_email: '',
    sender_name: '',
    reply_header: '',
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    addresses: [''],
    phones: [''],
    emails: [''],
    working_hours: ['']
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const [smtpRes, contactRes] = await Promise.all([
        supabase.from('settings').select('*').eq('id', 'smtp_config').single(),
        supabase.from('pages').select('content').eq('slug', 'site-contact-settings').single()
      ]);

      if (smtpRes.data) {
        setSmtpSettings({
          smtp_host: smtpRes.data.smtp_host || '',
          smtp_port: smtpRes.data.smtp_port || '',
          smtp_user: smtpRes.data.smtp_user || '',
          smtp_pass: smtpRes.data.smtp_pass || '',
          admin_email: smtpRes.data.admin_email || '',
          sender_name: smtpRes.data.sender_name || 'GlobalTrade Support',
          reply_header: smtpRes.data.reply_header || 'GlobalTrade Support Response',
        });
      }

      if (contactRes.data && contactRes.data.content) {
        try {
          const parsed = JSON.parse(contactRes.data.content);
          setContactInfo({
            addresses: parsed.addresses || [''],
            phones: parsed.phones || [''],
            emails: parsed.emails || [''],
            working_hours: Array.isArray(parsed.working_hours) ? parsed.working_hours : [''],
          });
        } catch (e) {
          console.error('Failed to parse contact settings:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('settings').upsert({ id: 'smtp_config', ...smtpSettings, updated_at: new Date().toISOString() });
      if (error) throw error;
      setMessage({ type: 'success', text: 'SMTP Settings updated!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('pages').upsert({
        title: 'Site Contact Settings',
        slug: 'site-contact-settings',
        content: JSON.stringify(contactInfo),
        is_active: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Contact Manifest synchronized!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setSaving(false);
    }
  };

  const updateList = (type: keyof ContactInfo, index: number, value: string) => {
    const newList = [...contactInfo[type]];
    newList[index] = value;
    setContactInfo({ ...contactInfo, [type]: newList });
  };

  const addToList = (type: keyof ContactInfo) => {
    setContactInfo({ ...contactInfo, [type]: [...contactInfo[type], ''] });
  };

  const removeFromList = (type: keyof ContactInfo, index: number) => {
    const newList = contactInfo[type].filter((_, i) => i !== index);
    setContactInfo({ ...contactInfo, [type]: newList.length ? newList : [''] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 uppercase italic tracking-tighter">System <span className="text-blue-600">Configuration</span></h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] sm:text-xs tracking-widest mt-2 px-1 border-l-2 border-blue-600">Global Manifest & Connectivity Settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-12 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                <MapPin className="h-7 min-w-[28px]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Contact Manifest</h2>
                <p className="text-sm text-gray-500 font-medium italic">Global branch offices, communication lines, and operational windows</p>
              </div>
            </div>
            <button
              onClick={handleSaveContact}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-100"
            >
              {saving ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <><Save className="h-5 w-5" /> Sync Manifest</>}
            </button>
          </div>

          <div className="p-8 sm:p-12 space-y-12">
            {/* Dynamic Addresses */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Physical Branch Locations
                </label>
                <button onClick={() => addToList('addresses')} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">+ Append Address</button>
              </div>
              <div className="space-y-4">
                {contactInfo.addresses.map((addr, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <input
                      type="text"
                      value={addr}
                      onChange={(e) => updateList('addresses', idx, e.target.value.toUpperCase())}
                      placeholder="ENTER ADDRESS (LINE 1, LINE 2, CITY, ZIP)..."
                      className="flex-grow px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-900 font-bold text-xs sm:text-sm uppercase transition-all"
                    />
                    <button onClick={() => removeFromList('addresses', idx)} className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Dynamic Phones */}
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Phone className="h-4 w-4 text-emerald-600" /> Direct Communication Lines
                  </label>
                  <button onClick={() => addToList('phones')} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">+ Append Phone</button>
                </div>
                <div className="space-y-4">
                  {contactInfo.phones.map((phone, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => updateList('phones', idx, e.target.value)}
                        placeholder="+91 12345 67890"
                        className="flex-grow px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-900 font-bold text-xs sm:text-sm transition-all"
                      />
                      <button onClick={() => removeFromList('phones', idx)} className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Emails */}
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Mail className="h-4 w-4 text-emerald-600" /> Administrative Correspondence
                  </label>
                  <button onClick={() => addToList('emails')} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">+ Append Email</button>
                </div>
                <div className="space-y-4">
                  {contactInfo.emails.map((email, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateList('emails', idx, e.target.value.toLowerCase())}
                        placeholder="info@globaltrade.com"
                        className="flex-grow px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-900 font-bold text-xs sm:text-sm lowercase transition-all"
                      />
                      <button onClick={() => removeFromList('emails', idx)} className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Working Hours */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Clock className="h-4 w-4 text-emerald-600" /> Operational Windows / Hours
                </label>
                <button onClick={() => addToList('working_hours')} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">+ Append Schedule</button>
              </div>
              <div className="space-y-4">
                {contactInfo.working_hours.map((hour, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <input
                      type="text"
                      value={hour}
                      onChange={(e) => updateList('working_hours', idx, e.target.value.toUpperCase())}
                      placeholder="E.G. MON - FRI: 9:00 AM - 6:00 PM (GMT)"
                      className="flex-grow px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-900 font-bold text-xs sm:text-sm uppercase transition-all"
                    />
                    <button onClick={() => removeFromList('working_hours', idx)} className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Existing SMTP Section */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
          <div className="p-8 sm:p-12 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                <Server className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Security & Protocol</h2>
                <p className="text-sm text-gray-500 font-medium italic">Internal correspondence servers & alert routing</p>
              </div>
            </div>
            <button
              onClick={handleSaveSmtp}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
            >
              {saving ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <><Save className="h-5 w-5" /> Sync Protocol</>}
            </button>
          </div>

          <div className="p-8 sm:p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                  <Server className="h-4 w-4 text-blue-600" /> SMTP Gateway Host
                </label>
                <input
                  type="text"
                  value={smtpSettings.smtp_host}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_host: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-sm"
                  placeholder="smtp.example.com"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                  <Shield className="h-4 w-4 text-blue-600" /> Communication Port
                </label>
                <input
                  type="text"
                  value={smtpSettings.smtp_port}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_port: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-sm"
                  placeholder="587"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                  <User className="h-4 w-4 text-blue-600" /> SMTP Auth User
                </label>
                <input
                  type="text"
                  value={smtpSettings.smtp_user}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_user: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-sm"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                  <Key className="h-4 w-4 text-blue-600" /> SMTP Auth Password
                </label>
                <input
                  type="password"
                  value={smtpSettings.smtp_pass}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_pass: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                  <Mail className="h-4 w-4 text-blue-600" /> Notification Target
                </label>
                <input
                  type="email"
                  value={smtpSettings.admin_email}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, admin_email: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-sm"
                  placeholder="admin@globaltrade.com"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                  <User className="h-4 w-4 text-blue-600" /> Public Sender Identity
                </label>
                <input
                  type="text"
                  value={smtpSettings.sender_name}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, sender_name: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-sm"
                  placeholder="GlobalTrade Support"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                  <Mail className="h-4 w-4 text-blue-600" /> Correspondence Header
                </label>
                <input
                  type="text"
                  value={smtpSettings.reply_header}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, reply_header: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-sm"
                  placeholder="Reply Header"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "fixed bottom-8 right-8 p-6 rounded-[2rem] flex items-center gap-4 font-black uppercase text-xs tracking-widest shadow-2xl z-50",
            message.type === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          )}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          {message.text}
        </motion.div>
      )}
    </div>
  );
}
