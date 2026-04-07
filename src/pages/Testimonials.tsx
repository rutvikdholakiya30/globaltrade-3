import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useTestimonials, useProducts } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  rating: z.number().min(1).max(5),
  product_id: z.string().optional(),
});

type TestimonialForm = z.infer<typeof testimonialSchema>;

export function Testimonials() {
  const { testimonials, loading } = useTestimonials();
  const { products } = useProducts();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: { rating: 5 },
  });

  const rating = watch('rating');

  const onSubmit = async (data: TestimonialForm) => {
    setSubmitting(true);
    try {
      const insertData = {
        ...data,
        product_id: data.product_id === "" ? null : data.product_id
      };

      const { error } = await supabase.from('testimonials').insert([insertData]);
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
            <span className="section-label mx-auto">Social Proof</span>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              Partner Feedback
            </h1>
            <p className="text-slate-500 text-sm sm:text-lg leading-relaxed">
              Hear from businesses that have grown with our global trade solutions and premium industrial equipment.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Testimonials List */}
          <div className="lg:col-span-8 space-y-12">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-40 sm:h-64 bg-slate-50 rounded-2xl sm:rounded-[40px] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-12">
                {testimonials.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                    className={cn(
                      "bg-white p-4 sm:p-10 md:p-12 rounded-2xl sm:rounded-[40px] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 space-y-2 sm:space-y-8 relative group overflow-hidden cursor-pointer",
                      expandedId === t.id && "shadow-2xl shadow-brand-primary/5 border-brand-primary/20"
                    )}
                  >
                    <div className="absolute top-4 right-4 sm:top-10 sm:right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <MessageSquare className="h-6 w-6 sm:h-20 sm:w-20" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-1 relative z-10">
                      <div className="flex gap-0.5 sm:gap-1.5 text-brand-accent">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("h-2.5 w-2.5 sm:h-5 sm:w-5", i < t.rating ? "fill-current" : "text-slate-100")} />
                        ))}
                      </div>
                      <span className="text-[6px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className={cn(
                      "text-slate-900 text-[10px] sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight relative z-10 transition-all duration-500",
                      expandedId === t.id ? "" : "line-clamp-4 sm:line-clamp-none"
                    )}>
                      "{t.message}"
                    </p>

                    <div className="flex items-center gap-2 sm:gap-6 pt-3 sm:pt-10 border-t border-slate-50 relative z-10">
                      <div className="w-6 h-6 sm:w-16 sm:h-16 bg-brand-primary/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-brand-primary font-extrabold text-[8px] sm:text-2xl">
                        {t.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-lg font-extrabold text-slate-900 truncate">{t.name}</p>
                        {t.product && (
                          <div className="flex items-center gap-0.5 mt-0.5 sm:mt-1">
                            <CheckCircle2 className="h-2 w-2 sm:h-3.5 sm:w-3.5 text-emerald-500 shrink-0" />
                            <p className="text-[6px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">Verified Partner</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Indicator for extra content on mobile */}
                    {!expandedId && (
                      <div className="sm:hidden absolute bottom-2 right-3 text-[6px] font-black uppercase text-brand-primary/40 flex items-center gap-1">
                        Read more <ArrowUpRight className="h-1.5 w-1.5" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Form */}
          <aside className="lg:col-span-4 h-fit lg:sticky lg:top-32">
            <div className="bg-slate-900 rounded-[40px] p-10 space-y-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              
              <div className="space-y-3 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Share Your Experience</h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">Your feedback helps us improve our global services and industrial catalog.</p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 backdrop-blur-md rounded-3xl p-8 text-center space-y-6 border border-white/10"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Thank You!</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Your review has been submitted and is pending admin approval.</p>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-brand-accent uppercase tracking-widest hover:underline"
                  >
                    Submit another review
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Your Name</label>
                    <input
                      {...register('name')}
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-white placeholder:text-white/20"
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-400 text-[10px] font-bold uppercase mt-1">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Rating</label>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setValue('rating', val)}
                          className={cn(
                            "transition-all",
                            rating >= val ? "text-brand-accent scale-110" : "text-white/20 hover:text-white/40"
                          )}
                        >
                          <Star className={cn("h-7 w-7", rating >= val && "fill-current")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Product (Optional)</label>
                    <select
                      {...register('product_id')}
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all appearance-none text-white"
                    >
                      <option value="" className="bg-slate-900 font-bold">General Feedback</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} className="bg-slate-900 font-bold">{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Your Message</label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all resize-none text-white placeholder:text-white/20"
                      placeholder="Tell us about your experience..."
                    />
                    {errors.message && <p className="text-red-400 text-[10px] font-bold uppercase mt-1">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-brand-primary/90 disabled:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20"
                  >
                    {submitting ? 'Submitting...' : <><Send className="h-5 w-5" /> Submit Review</>}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
