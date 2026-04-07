import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Send, CheckCircle2, ArrowUpRight, MessageSquare } from 'lucide-react';
import { useTestimonials, useProducts } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const getInitials = (name: string) =>
  name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Testimonials Grid - 2 cols always */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 sm:h-64 bg-slate-50 rounded-2xl sm:rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {testimonials.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                    className={cn(
                      "bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 cursor-pointer relative overflow-hidden group",
                      expandedId === t.id && "shadow-xl border-brand-primary/20"
                    )}
                  >
                    {/* Stars */}
                    <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("h-2.5 w-2.5 sm:h-4 sm:w-4", i < (t.rating || 5) ? "text-brand-primary fill-brand-primary" : "text-slate-200")} />
                      ))}
                    </div>

                    {/* Message */}
                    <p className={cn(
                      "text-slate-600 text-[10px] sm:text-base leading-relaxed mb-3 sm:mb-6 italic transition-all duration-500",
                      expandedId === t.id ? "" : "line-clamp-4"
                    )}>
                      "{t.message}"
                    </p>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-[8px] sm:text-xs shrink-0">
                        {getInitials(t.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[9px] sm:text-sm text-slate-900 truncate">{t.name}</div>
                        <div className="text-[7px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Verified Partner</div>
                      </div>
                    </div>

                    {/* Read more indicator */}
                    {expandedId !== t.id && (
                      <div className="absolute bottom-2 right-3 text-[6px] sm:text-[8px] font-black uppercase text-brand-primary/40 flex items-center gap-0.5 group-hover:text-brand-primary transition-colors">
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
            <div className="bg-slate-900 rounded-[40px] p-8 sm:p-10 space-y-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              
              <div className="space-y-3 relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">Share Your Experience</h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">Your feedback helps us improve our global services and industrial catalog.</p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 backdrop-blur-md rounded-3xl p-8 text-center space-y-6 border border-white/10"
                >
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">Thank You!</h3>
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Your Name</label>
                    <input
                      {...register('name')}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3.5 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-white placeholder:text-white/20"
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-400 text-[10px] font-bold">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setValue('rating', val)}
                          className={cn("transition-all", rating >= val ? "text-brand-accent scale-110" : "text-white/20 hover:text-white/40")}
                        >
                          <Star className={cn("h-6 w-6", rating >= val && "fill-current")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Product (Optional)</label>
                    <select
                      {...register('product_id')}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3.5 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all appearance-none text-white"
                    >
                      <option value="" className="bg-slate-900 font-bold">General Feedback</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} className="bg-slate-900 font-bold">{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Your Message</label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3.5 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all resize-none text-white placeholder:text-white/20"
                      placeholder="Tell us about your experience..."
                    />
                    {errors.message && <p className="text-red-400 text-[10px] font-bold">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-brand-primary/90 disabled:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20"
                  >
                    {submitting ? 'Submitting...' : <><Send className="h-4 w-4" /> Submit Review</>}
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
