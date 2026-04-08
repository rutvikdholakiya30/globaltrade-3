import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useMemberships } from '@/hooks/useData';
import { uploadImage } from '@/lib/upload';
import { Plus, Trash2, Edit2, X, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDialog } from '@/components/Admin/ConfirmDialog';
import type { Membership } from '@/types';

export function MembershipsAdmin() {
  const { memberships, loading, setMemberships } = useMembershipsAPI();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Membership | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // New States for Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const order = parseInt(formData.get('order') as string) || 0;
    const status = formData.get('status') === 'true';

    try {
      let logo_url = editingItem?.logo_url || '';
      
      if (file) {
        logo_url = await uploadImage(file, 'images');
      }

      const itemData = { name, logo_url, order, status };

      if (editingItem) {
        const { error, data } = await supabase.from('memberships').update(itemData).eq('id', editingItem.id).select().single();
        if (error) throw error;
        setMemberships(memberships.map(m => m.id === editingItem.id ? data : m));
      } else {
        if (!logo_url) throw new Error("A logo/icon is required.");
        const { error, data } = await supabase.from('memberships').insert([itemData]).select().single();
        if (error) throw error;
        setMemberships([...memberships, data].sort((a, b) => a.order - b.order));
      }

      setIsModalOpen(false);
      setEditingItem(null);
      setFile(null);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('memberships').delete().eq('id', id);
    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else {
      setMemberships(memberships.filter(m => m.id !== id));
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 uppercase italic tracking-tighter">
            Memberships <span className="text-blue-600">Admin</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] sm:text-xs tracking-widest mt-2 px-1 border-l-2 border-blue-600">
            Manage Government Memberships & Accreditations
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFile(null);
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-blue-700 transition-all"
        >
          <Plus className="h-5 w-5" /> Add Membership
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-gray-900 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Icon</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Name</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Order</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <img src={item.logo_url} alt={item.name} className="h-10 w-10 object-contain" />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4">{item.order}</td>
                <td className="px-6 py-4 flex items-center justify-end gap-2">
                  <button onClick={() => { setEditingItem(item); setFile(null); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-lg border border-gray-200">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => { setItemToDelete(item.id); setIsDeleteDialogOpen(true); }} className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-gray-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {memberships.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !uploading && setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Membership' : 'Add Membership'}</h3>
                <button onClick={() => setIsModalOpen(false)} disabled={uploading}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Name</label>
                  <input name="name" defaultValue={editingItem?.name} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Order</label>
                  <input type="number" name="order" defaultValue={editingItem?.order} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Icon/Logo {editingItem && '(Leave empty to keep current)'}</label>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required={!editingItem} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
                <div>
                   <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                    <input type="checkbox" name="status" defaultChecked={editingItem?.status ?? true} value="true" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                    <span className="font-bold text-gray-700 uppercase tracking-widest text-xs">Active</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={uploading} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">Cancel</button>
                  <button type="submit" disabled={uploading} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center gap-2">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Save</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setItemToDelete(null); }}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        title="Delete Membership?"
        message="This action is irreversible. This accreditation/membership will be permanently removed from the public manifest."
      />
    </div>
  );
}

// Internal hook for Admin management (includes setter)
function useMembershipsAPI() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .order('order');
    if (!error && data) setMemberships(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { memberships, loading, setMemberships };
}
