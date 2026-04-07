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
        // Send email notification via SMTP
        try {
          await fetch('/api/contact-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
        } catch (emailErr) {
          console.error('Failed to send email notification:', emailErr);
        }
        
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
                  {contactInfo.addresses.map((addr, i) => (
                    <p key={i} className="text-slate-600 font-bold text-sm sm:text-base leading-relaxed uppercase tracking-tight max-w-xs">{addr}</p>
                  ))}
                </div>
              </div>

              {/* Phones List */}
              <div className="flex items-start gap-8 group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                  <Phone className="h-7 w-7" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Communication Lines</h3>
                  {contactInfo.phones.map((phone, i) => (
                    <p key={i} className="text-slate-600 font-bold text-sm sm:text-lg tracking-widest">{phone}</p>
                  ))}
                  {contactInfo.working_hours && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/5 text-brand-primary rounded-lg">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] uppercase font-black tracking-widest">{contactInfo.working_hours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Emails List */}
              <div className="flex items-start gap-8 group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                  <Mail className="h-7 w-7" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Correspondance Support</h3>
                  {contactInfo.emails.map((email, i) => (
                    <p key={i} className="text-slate-600 font-bold text-sm sm:text-base transition-colors hover:text-brand-primary cursor-pointer lowercase">{email}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-12 rounded-[40px] bg-slate-900 text-white flex items-center gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
              <Globe className="h-12 w-12 text-brand-accent animate-pulse relative z-10 shrink-0" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-brand-accent">Global Network Status</p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium uppercase tracking-widest">Operating across 50+ countries with active certified hubs in 4 key continents.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-16 rounded-[60px] border border-slate-100 shadow-2xl shadow-slate-200">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-10 py-16"
                >
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 uppercase">Message Logged!</h2>
                    <p className="text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
                      Your inquiry has been successfully transmitted to our dispatch team. Expect a strategic response within 24 operational hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-primary px-12 py-5 text-sm uppercase tracking-[0.2em]"
                  >
                    Transmit Another Log
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Transmit To
                      </label>
                      <input
                        {...register('name')}
                        className="w-full bg-slate-50 border-2 border-slate-50 px-8 py-5 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-slate-900 uppercase placeholder:text-slate-300"
                        placeholder="AUTHENTICATED NAME"
                      />
                      {errors.name && <p className="text-red-500 text-[10px] font-black uppercase mt-1 tracking-widest">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Return Path
                      </label>
                      <input
                        {...register('email')}
                        className="w-full bg-slate-50 border-2 border-slate-50 px-8 py-5 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-slate-900 lowercase placeholder:text-slate-300"
                        placeholder="contact@domain.com"
                      />
                      {errors.email && <p className="text-red-500 text-[10px] font-black uppercase mt-1 tracking-widest">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Subject Header
                    </label>
                    <input
                      {...register('subject')}
                      className="w-full bg-slate-50 border-2 border-slate-50 px-8 py-5 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-slate-900 uppercase placeholder:text-slate-300"
                      placeholder="LOGISTICAL / PROCUREMENT INQUIRY"
                    />
                    {errors.subject && <p className="text-red-500 text-[10px] font-black uppercase mt-1 tracking-widest">{errors.subject.message}</p>}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Transmission Message
                    </label>
                    <textarea
                      {...register('message')}
                      rows={6}
                      className="w-full bg-slate-50 border-2 border-slate-50 px-8 py-6 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all resize-none text-slate-900 uppercase placeholder:text-slate-300"
                      placeholder="ENTER DETAILED LOGISTICAL REQUIREMENTS..."
                    />
                    {errors.message && <p className="text-red-500 text-[10px] font-black uppercase mt-1 tracking-widest">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-6 text-sm font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-brand-primary/20 group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      {submitting ? 'Transmitting...' : <><Send className="h-5 w-5" /> Execute Transmission</>}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
