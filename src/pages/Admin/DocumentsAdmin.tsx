import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useDocuments, useDocumentCategories } from '@/hooks/useDocuments';
import { uploadImage } from '@/lib/upload';
import { Plus, Trash2, Edit2, X, Loader2, FileText, CheckCircle2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DocumentItem, DocumentCategory } from '@/types';

export function DocumentsAdmin() {
  const [activeTab, setActiveTab] = useState<'documents' | 'categories'>('documents');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 uppercase italic tracking-tighter">
            Documents <span className="text-blue-600">Admin</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] sm:text-xs tracking-widest mt-2 px-1 border-l-2 border-blue-600">
            Manage PDFs, Brochures, and Categories
          </p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'documents'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> PDF Documents
          </div>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'categories'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Categories
          </div>
        </button>
      </div>

      {activeTab === 'documents' ? <DocumentsManager /> : <CategoriesManager />}
    </div>
  );
}

function DocumentsManager() {
  const { documents, loading, setDocuments } = useDocuments(false);
  const { categories } = useDocumentCategories(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const category_id = formData.get('category_id') as string;
    const status = formData.get('status') === 'true';

    try {
      let file_url = editingDoc?.file_url || '';
      
      if (file) {
        // Upload the PDF to the 'documents' bucket
        file_url = await uploadImage(file, 'documents');
      }

      const docData = { title, category_id, status, file_url };

      if (editingDoc) {
        const { error, data } = await supabase.from('documents').update(docData).eq('id', editingDoc.id).select('*, category:document_categories(*)').single();
        if (error) throw error;
        setDocuments(documents.map(d => d.id === editingDoc.id ? data : d));
      } else {
        if (!file) throw new Error("A PDF file is required.");
        const { error, data } = await supabase.from('documents').insert([docData]).select('*, category:document_categories(*)').single();
        if (error) throw error;
        setDocuments([data, ...documents]);
      }

      setIsModalOpen(false);
      setEditingDoc(null);
      setFile(null);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (!error) {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  if (loading) return <div>Loading documents...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingDoc(null);
            setFile(null);
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-blue-700 transition-all"
        >
          <Plus className="h-5 w-5" /> Add Document
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-gray-900 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Title</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Category</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">File</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{doc.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] uppercase font-bold tracking-widest rounded-md">
                    {doc.category?.name || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    View PDF
                  </a>
                </td>
                <td className="px-6 py-4 flex items-center justify-end gap-2">
                  <button onClick={() => { setEditingDoc(doc); setFile(null); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-lg border border-gray-200">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-gray-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">No documents found.</td>
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
                <h3 className="text-xl font-bold text-gray-900">{editingDoc ? 'Edit Document' : 'Upload Document'}</h3>
                <button onClick={() => setIsModalOpen(false)} disabled={uploading}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Title</label>
                  <input name="title" defaultValue={editingDoc?.title} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category</label>
                  <select name="category_id" defaultValue={editingDoc?.category_id} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">PDF File {editingDoc && '(Leave empty to keep current)'}</label>
                  <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required={!editingDoc} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
                <div>
                   <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                    <input type="checkbox" name="status" defaultChecked={editingDoc?.status ?? true} value="true" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                    <span className="font-bold text-gray-700 uppercase tracking-widest text-xs">Visible to Public</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={uploading} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">Cancel</button>
                  <button type="submit" disabled={uploading} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center gap-2">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Save Document</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoriesManager() {
  const { categories, loading, setCategories } = useDocumentCategories(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<DocumentCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const status = formData.get('status') === 'true';

    try {
      if (editingCat) {
        const { error, data } = await supabase.from('document_categories').update({ name, slug, status }).eq('id', editingCat.id).select().single();
        if (error) throw error;
        setCategories(categories.map(c => c.id === editingCat.id ? data : c));
      } else {
        const { error, data } = await supabase.from('document_categories').insert([{ name, slug, status }]).select().single();
        if (error) throw error;
        setCategories([...categories, data]);
      }
      setIsModalOpen(false);
      setEditingCat(null);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Associated documents will also be deleted.')) return;
    const { error } = await supabase.from('document_categories').delete().eq('id', id);
    if (!error) setCategories(categories.filter(c => c.id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => { setEditingCat(null); setIsModalOpen(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700">
          <Plus className="h-5 w-5" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-gray-900 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Name</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Slug</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-b border-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{cat.slug}</td>
                <td className="px-6 py-4 flex items-center justify-end gap-2">
                  <button onClick={() => { setEditingCat(cat); setIsModalOpen(true); }} className="p-2 hover:text-blue-600 bg-white border border-gray-200 rounded-lg">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 hover:text-red-600 bg-white border border-gray-200 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !saving && setIsModalOpen(false)} />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-6 z-10">
              <h3 className="text-xl font-bold mb-6">{editingCat ? 'Edit Category' : 'New Category'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Category Name</label>
                  <input name="name" defaultValue={editingCat?.name} required className="w-full px-4 py-3 bg-gray-50 border rounded-xl" />
                </div>
                <div>
                   <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                    <input type="checkbox" name="status" defaultChecked={editingCat?.status ?? true} value="true" className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                    <span className="font-bold text-gray-700 uppercase tracking-widest text-xs">Active</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={saving} className="px-4 py-2 bg-gray-100 rounded-xl font-bold">Cancel</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
