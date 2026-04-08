import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDialog } from '@/components/Admin/ConfirmDialog';
import { Check, X, Star, Trash2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types';

export function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Deletion state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    const { data } = await supabase
      .from('testimonials')
      .select('*, product:products(title)')
      .order('created_at', { ascending: false });
    if (data) setTestimonials(data);
    setLoading(false);
  }

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('testimonials').update({ status }).eq('id', id);
    if (!error) {
      setTestimonials(testimonials.map(t => t.id === id ? { ...t, status } : t));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (!error) setTestimonials(testimonials.filter(t => t.id !== id));
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const filteredTestimonials = testimonials.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600">Review and approve partner feedback.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                filter === f ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse" />
          ))
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
            <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No testimonials found for this filter.</p>
          </div>
        ) : (
          filteredTestimonials.map((t) => (
            <motion.div
              key={t.id}
              layout
              className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8 items-start md:items-center"
            >
              <div className="flex-grow space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.name}</h3>
                    <div className="flex gap-1 text-yellow-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ml-auto md:ml-0",
                    t.status === 'approved' && "bg-green-100 text-green-600",
                    t.status === 'pending' && "bg-yellow-100 text-yellow-600",
                    t.status === 'rejected' && "bg-red-100 text-red-600",
                  )}>
                    {t.status}
                  </span>
                </div>
                <p className="text-gray-600 italic">"{t.message}"</p>
                {t.product && (
                  <p className="text-xs text-gray-400">Related Product: <span className="font-bold text-gray-600">{t.product.title}</span></p>
                )}
              </div>

              <div className="flex gap-2 shrink-0 w-full md:w-auto">
                {t.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'approved')}
                      className="flex-grow md:flex-none px-6 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'rejected')}
                      className="flex-grow md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </>
                )}
                {t.status !== 'pending' && (
                  <button
                    onClick={() => { setItemToDelete(t.id); setIsDeleteDialogOpen(true); }}
                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setItemToDelete(null); }}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        title="Delete Testimonial?"
        message="This will permanently remove the partner feedback from the system. This action cannot be undone."
      />
    </div>
  );
}
