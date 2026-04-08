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

  // Deletion and Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | string[] | null>(null);

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

  const handleUpdateStatus = async (id: string | string[], status: 'approved' | 'rejected') => {
    const ids = Array.isArray(id) ? id : [id];
    const { error } = await supabase.from('testimonials').update({ status }).in('id', ids);
    if (!error) {
      setTestimonials(testimonials.map(t => ids.includes(t.id) ? { ...t, status } : t));
      if (Array.isArray(id)) setSelectedIds([]);
    }
  };

  const handleDelete = async (target: string | string[]) => {
    const ids = Array.isArray(target) ? target : [target];
    const { error } = await supabase.from('testimonials').delete().in('id', ids);
    if (!error) {
      setTestimonials(testimonials.filter(t => !ids.includes(t.id)));
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredTestimonials.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTestimonials.map(t => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedIds.length === filteredTestimonials.length && filteredTestimonials.length > 0}
            onChange={handleToggleSelectAll}
            className="w-5 h-5 rounded-lg border-2 border-gray-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
          />
          <span className="text-xs font-black uppercase text-gray-500 tracking-widest">Select All {filter !== 'all' ? filter : ''} Testimonials</span>
        </div>
        
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-wrap items-center gap-4"
            >
              <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100">
                <button
                  onClick={() => handleUpdateStatus(selectedIds, 'approved')}
                  className="px-4 py-2 bg-white text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-50 transition-all border border-gray-100"
                >
                  Approve Selected
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedIds, 'rejected')}
                  className="px-4 py-2 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                >
                  Reject Selected
                </button>
              </div>
              <button
                onClick={() => { setItemToDelete(selectedIds); setIsDeleteDialogOpen(true); }}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100"
              >
                <Trash2 className="h-4 w-4" /> Bulk Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="p-3 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
              className={cn(
                "bg-white p-8 rounded-[2rem] border transition-all flex flex-col md:flex-row gap-8 items-start md:items-center relative group",
                selectedIds.includes(t.id) ? "border-blue-500 bg-blue-50/30" : "border-gray-100 shadow-sm hover:shadow-md"
              )}
            >
              <div className="absolute top-8 left-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(t.id)}
                  onChange={() => handleToggleSelect(t.id)}
                  className="w-5 h-5 rounded-lg border-2 border-gray-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
              </div>
              <div className="pl-6 flex-grow space-y-4">
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
        onConfirm={() => itemToDelete && handleDelete(itemToDelete as string | string[])}
        title={Array.isArray(itemToDelete) ? "Delete Multiple Testimonials?" : "Delete Testimonial?"}
        message={Array.isArray(itemToDelete)
          ? `Are you sure you want to permanently remove ${itemToDelete.length} testimonials from the system? This action is irreversible.`
          : "This will permanently remove the partner feedback from the system. This action cannot be undone."}
      />
    </div>
  );
}
