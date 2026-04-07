import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Globe, Clock, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useContactInfo } from '@/hooks/useData';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { contactInfo, loading: contactLoading } = useContactInfo();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([data]);
      if (!error) {
        setSubmitted(true);
        reset();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <span className="section-label mx-auto">International Outreach</span>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 uppercase italic">
              Connect With <span className="text-brand-primary">Global Experts</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-lg leading-relaxed font-medium">
              Strategically positioned across key global trade hubs to facilitate your international procurement and logistical requirements.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-16">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight uppercase">
                Global <span className="text-brand-primary">Operational Manifest</span>
              </h2>
              <p className="text-sm sm:text-lg text-slate-500 leading-relaxed font-medium">
                Our team is deployed across multiple time zones to provide seamless 24/7 logistical oversight and trade compliance support.
              </p>
            </div>

            <div className="space-y-12">
              {/* Addresses List */}
              <div className="flex items-start gap-8 group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                  <MapPin className="h-7 w-7" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Branch Headquarters</h3>
                  <div className="space-y-3">
                    {contactInfo.addresses.map((addr, i) => (
                      <p key={i} className="text-slate-600 font-bold text-sm sm:text-base leading-relaxed uppercase tracking-tight max-w-xs">{addr}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phones & Hours List */}
              <div className="flex items-start gap-8 group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                  <Phone className="h-7 w-7" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Communication Lines</h3>
                    {contactInfo.phones.map((phone, i) => (
                      <p key={i} className="text-slate-600 font-bold text-sm sm:text-lg tracking-widest">{phone}</p>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Operational Hours</h3>
                    <div className="space-y-2">
                      {contactInfo.working_hours.map((hour, i) => (
                        <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/5 text-brand-primary rounded-lg mr-2 mb-2">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] uppercase font-black tracking-widest">{hour}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emails List */}
              <div className="flex items-start gap-8 group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                  <Mail className="h-7 w-7" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Correspondance Support</h3>
                  <div className="space-y-3">
                    {contactInfo.emails.map((email, i) => (
                      <p key={i} className="text-slate-600 font-bold text-sm sm:text-base transition-colors hover:text-brand-primary cursor-pointer lowercase">{email}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-12 rounded-[40px] bg-slate-900 text-white flex items-center gap-8 relative overflow-hidden group">
              <Globe className="h-12 w-12 text-brand-accent animate-pulse relative z-10 shrink-0" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-brand-accent">Global Network Status</p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium uppercase tracking-widest">Operating across 50+ countries with active certified hubs in 4 key continents.</p>
              </div>
            </div>
          </div>

          {/* Contact Form - CONVERTED TO BLUE BOX */}
          <div className="lg:col-span-7">
            <div className="bg-brand-primary p-8 md:p-16 rounded-[60px] shadow-[0_20px_50px_rgba(37,99,235,0.3)] border border-white/10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />
              
              <div className="relative z-10">
                {submitted ? (
                  <div className="text-center space-y-10 py-16">
                    <CheckCircle2 className="h-16 w-16 text-white mx-auto animate-bounce" />
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Transmission <span className="text-brand-accent">Logged!</span></h2>
                    <p className="text-white/60 font-medium">Your request has been prioritized in our global queue.</p>
                    <button onClick={() => setSubmitted(false)} className="px-12 py-5 bg-white text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-xl">Send Another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" /> Transmit To
                        </label>
                        <input {...register('name')} className="w-full bg-white/10 border-2 border-white/5 px-8 py-5 rounded-3xl text-sm font-bold focus:outline-none focus:border-white focus:bg-white/20 transition-all text-white placeholder:text-white/20 uppercase" placeholder="NAME" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" /> Return Path
                        </label>
                        <input {...register('email')} className="w-full bg-white/10 border-2 border-white/5 px-8 py-5 rounded-3xl text-sm font-bold focus:outline-none focus:border-white focus:bg-white/20 transition-all text-white placeholder:text-white/20 lowercase" placeholder="EMAIL" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" /> Subject Header
                      </label>
                      <input {...register('subject')} className="w-full bg-white/10 border-2 border-white/5 px-8 py-5 rounded-3xl text-sm font-bold focus:outline-none focus:border-white focus:bg-white/20 transition-all text-white placeholder:text-white/20 uppercase" placeholder="SUBJECT" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" /> Transmission Message
                      </label>
                      <textarea {...register('message')} rows={5} className="w-full bg-white/10 border-2 border-white/5 px-8 py-6 rounded-3xl text-sm font-bold focus:outline-none focus:border-white focus:bg-white/20 transition-all resize-none text-white placeholder:text-white/20 uppercase" placeholder="ENTER MESSAGE..." />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-6 bg-white text-brand-primary font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-brand-accent hover:text-white transition-all transform active:scale-95 disabled:opacity-50">
                      {submitting ? 'Transmitting...' : 'Execute Transmission'}
                    </button>
                    <div className="text-center pt-4 opacity-50">
                      <p className="text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <Send className="h-3 w-3" /> Secure End-to-End Encryption Enabled
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
