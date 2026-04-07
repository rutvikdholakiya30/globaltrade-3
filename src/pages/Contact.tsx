import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
            <span className="section-label mx-auto">Get in Touch</span>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              Contact Our Experts
            </h1>
            <p className="text-slate-500 text-sm sm:text-lg leading-relaxed">
              Have questions about international trade, logistics, or our product catalog? Our team is here to help you navigate the global market.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Let's Build Your <span className="text-brand-primary">Global Presence</span>
              </h2>
              <p className="text-sm sm:text-lg text-slate-500 leading-relaxed">
                Our team of experts is here to help you navigate the complexities of the global market with precision and efficiency.
              </p>
            </div>

            <div className="space-y-10">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2">Main Headquarters</h3>
                  <p className="text-slate-500 font-medium">123 Trade Center, Business District, Global City, 10001</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2">Direct Contact</h3>
                  <p className="text-slate-500 font-medium">+1 (555) 123-4567</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">Mon - Fri: 9:00 AM - 6:00 PM (GMT)</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2">Email Support</h3>
                  <p className="text-slate-500 font-medium">info@globaltrade.com</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">support@globaltrade.com</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[32px] bg-slate-900 text-white flex items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
              <Globe className="h-10 w-10 text-brand-accent animate-pulse relative z-10" />
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Global Network</p>
                <p className="text-xs text-slate-400 leading-relaxed">Operating across 50+ countries with 24/7 support.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-8 py-12"
                >
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-slate-900">Message Sent!</h2>
                    <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Thank you for reaching out. One of our trade specialists will contact you within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-primary"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Full Name</label>
                      <input
                        {...register('name')}
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-900"
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Email Address</label>
                      <input
                        {...register('email')}
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-900"
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Subject</label>
                    <input
                      {...register('subject')}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-900"
                      placeholder="How can we help you?"
                    />
                    {errors.subject && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.subject.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Message</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none text-slate-900"
                      placeholder="Tell us more about your inquiry..."
                    />
                    {errors.message && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-5 text-lg"
                  >
                    {submitting ? 'Sending...' : <><Send className="h-5 w-5" /> Send Message</>}
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
