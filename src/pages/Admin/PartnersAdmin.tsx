import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, X, Upload, Loader2, Image as ImageIcon, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDialog } from '@/components/Admin/ConfirmDialog';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/lib/upload';
import type { Partner } from '@/types';

export function PartnersAdmin() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partial<Partner> | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Deletion state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    const { data } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
    if (data) setPartners(data);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (!error) setPartners(partners.filter(p => p.id !== id));
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    const file = fileInputRef.current?.files?.[0];
    
    let logo_url = formData.get('logo_url') as string;

    if (file) {
      try {
        logo_url = await uploadImage(file);
      } catch (err) {
        console.error('Upload failed:', err);
        alert('Logo upload failed. Please try again.');
        setUploading(false);
        return;
      }
    }

    const data = {
      name: formData.get('name') as string || null,
      logo_url: logo_url || null,
      status: formData.get('status') === 'true',
    };

    if (!data.name && !data.logo_url) {
      alert('Please provide at least a name or a logo.');
      setUploading(false);
      return;
    }

    if (editingPartner?.id) {
      const { error } = await supabase.from('partners').update(data).eq('id', editingPartner.id);
      if (error) {
        console.error('Update failed:', error);
        alert('Update failed: ' + error.message);
      } else {
        setIsFormOpen(false);
        fetchPartners();
      }
    } else {
      const { error } = await supabase.from('partners').insert([data]);
      if (error) {
        console.error('Insert failed:', error);
        alert('Insert failed: ' + error.message);
      } else {
        setIsFormOpen(false);
        fetchPartners();
      }
    }
    setUploading(false);
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {!isFormOpen ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Our Partners</h1>
                <p className="text-gray-600">Manage the companies you work with.</p>
              </div>
              <button
                onClick={() => {
                  setEditingPartner(null);
                  setPreviewUrl(null);
                  setIsFormOpen(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <Plus className="h-5 w-5" /> Add Partner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse" />
                ))
              ) : (
                partners.map((partner) => (
                  <motion.div
                    key={partner.id}
                    layout
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                        {partner.logo_url ? (
                          <img src={partner.logo_url} alt="" className="w-full h-full object-contain p-2" />
                        ) : (
                          <Users className="h-8 w-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{partner.name || 'Unnamed Partner'}</h3>
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-widest mt-1",
                          partner.status ? "text-green-500" : "text-red-500"
                        )}>
                          {partner.status ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingPartner(partner);
                          setPreviewUrl(partner.logo_url || null);
                          setIsFormOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setItemToDelete(partner.id); setIsDeleteDialogOpen(true); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {!loading && partners.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400">No partners added yet</h3>
                <p className="text-gray-400">Click the button above to add your first partner.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                </h2>
                <p className="text-sm text-gray-500">Add a company logo and name to display on your homepage.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Partner Name (Optional)</label>
                <input
                  name="name"
                  defaultValue={editingPartner?.name}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">Partner Logo (Optional)</label>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-grow space-y-4 w-full">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border-dashed border-2"
                    >
                      <Upload className="h-5 w-5" /> Select Logo File
                    </button>
                    <input
                      name="logo_url"
                      defaultValue={editingPartner?.logo_url}
                      onChange={(e) => setPreviewUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-black font-medium"
                      placeholder="Or Logo URL"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Status</label>
                <select
                  name="status"
                  defaultValue={editingPartner?.status?.toString() || 'true'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-black font-medium"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-grow py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-grow py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-blue-800 flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingPartner ? 'Update Partner' : 'Add Partner')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setItemToDelete(null); }}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        title="Delete Partner?"
        message="This partner will be permanently removed from your display manifest. This action cannot be undone."
      />
    </div>
  );
}
