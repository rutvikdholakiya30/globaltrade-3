import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, X, Layers, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDialog } from '@/components/Admin/ConfirmDialog';
import { slugify, cn } from '@/lib/utils';
import { uploadImage } from '@/lib/upload';
import type { Category } from '@/types';

export function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Deletion state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) setCategories(categories.filter(c => c.id !== id));
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
    
    let image_url = formData.get('image_url') as string;

    if (file) {
      try {
        image_url = await uploadImage(file);
      } catch (err) {
        console.error('Upload failed:', err);
        alert('Image upload failed. Please try again.');
        setUploading(false);
        return;
      }
    }

    const data = {
      name: formData.get('name') as string,
      image_url,
      status: formData.get('status') === 'true',
      slug: slugify(formData.get('name') as string),
    };

    if (editingCategory?.id) {
      const { error } = await supabase.from('categories').update(data).eq('id', editingCategory.id);
      if (error) {
        console.error('Update failed:', error);
        alert('Update failed: ' + error.message);
      } else {
        setIsFormOpen(false);
        fetchCategories();
      }
    } else {
      const { error } = await supabase.from('categories').insert([data]);
      if (error) {
        console.error('Insert failed:', error);
        alert('Insert failed: ' + error.message);
      } else {
        setIsFormOpen(false);
        fetchCategories();
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
                <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                <p className="text-gray-600">Organize your products into logical groups.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setPreviewUrl(null);
                  setIsFormOpen(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <Plus className="h-5 w-5" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />
                ))
              ) : (
                categories.map((category) => (
                  <motion.div
                    key={category.id}
                    layout
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        {category.image_url ? (
                          <img src={category.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Layers className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{category.name}</h3>
                        <p className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          category.status ? "text-green-500" : "text-red-500"
                        )}>
                          {category.status ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setPreviewUrl(category.image_url || null);
                          setIsFormOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setItemToDelete(category.id); setIsDeleteDialogOpen(true); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
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
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <p className="text-sm text-gray-500">Categorize your products for better organization.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Category Name</label>
                <input
                  name="name"
                  required
                  defaultValue={editingCategory?.name}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                  placeholder="e.g. Raw Materials"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">Category Image</label>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
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
                      <Upload className="h-5 w-5" /> Select File
                    </button>
                    <input
                      name="image_url"
                      defaultValue={editingCategory?.image_url}
                      onChange={(e) => setPreviewUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-black font-medium"
                      placeholder="Or Image URL"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Status</label>
                <select
                  name="status"
                  defaultValue={editingCategory?.status?.toString() || 'true'}
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
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingCategory ? 'Update Category' : 'Create Category')}
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
        title="Delete Category?"
        message="This action may affect products currently assigned to this category. This deletion is permanent."
      />
    </div>
  );
}
