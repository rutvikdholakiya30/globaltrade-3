import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, FileText, Check, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { Page } from '@/types';

export function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    const { data } = await supabase.from('pages').select('*').order('title');
    if (data) setPages(data);
    setLoading(false);
  }

  const handleToggleStatus = async (page: Page) => {
    const { error } = await supabase.from('pages').update({ is_active: !page.is_active }).eq('id', page.id);
    if (!error) {
      setPages(pages.map(p => p.id === page.id ? { ...p, is_active: !p.is_active } : p));
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPage) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      content: formData.get('content') as string,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('pages').update(data).eq('id', editingPage.id);
    if (!error) {
      setEditingPage(null);
      fetchPages();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Static Pages (CMS)</h1>
        <p className="text-gray-600">Manage content for About, Gallery, Terms, and Privacy pages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-3xl animate-pulse" />
            ))
          ) : (
            pages.map((page) => (
              <motion.div
                key={page.id}
                layout
                className={cn(
                  "bg-white p-6 rounded-3xl border transition-all flex items-center justify-between group",
                  editingPage?.id === page.id ? "border-blue-600 ring-4 ring-blue-50" : "border-gray-100 shadow-sm"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{page.title}</h3>
                    <p className="text-xs text-gray-400">/{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(page)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                      page.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}
                  >
                    {page.is_active ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => setEditingPage(page)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {editingPage ? (
              <motion.div
                key={editingPage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl sticky top-24"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Edit: {editingPage.title}</h2>
                  <button onClick={() => setEditingPage(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex justify-between">
                      Content (Markdown)
                      <a href={`/${editingPage.slug}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                        Preview <ExternalLink className="h-3 w-3" />
                      </a>
                    </label>
                    <textarea
                      name="content"
                      required
                      rows={15}
                      defaultValue={editingPage.content}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Save Changes
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center">
                <FileText className="h-16 w-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Select a page to edit</h3>
                <p className="text-gray-400 mt-2">Choose a static page from the list to modify its content using Markdown.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
