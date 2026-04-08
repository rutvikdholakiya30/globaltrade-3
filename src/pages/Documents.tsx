import { useState, useMemo } from 'react';
import { useDocuments, useDocumentCategories } from '@/hooks/useDocuments';
import { FileText, Download, Eye, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DocumentItem } from '@/types';

export function Documents() {
  const { documents, loading: docsLoading } = useDocuments(true);
  const { categories, loading: catsLoading } = useDocumentCategories(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const loading = docsLoading || catsLoading;

  const filteredDocuments = useMemo(() => {
    if (activeCategory === 'all') return documents;
    return documents.filter(doc => doc.category_id === activeCategory);
  }, [documents, activeCategory]);

  return (
    <div className="pt-20 lg:pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-bold text-xs uppercase tracking-widest gap-2"
          >
            <Layers className="h-4 w-4" /> Resources
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight"
          >
            Digital <span className="text-brand-primary">Assets</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Access our comprehensive library of product catalogs, technical specifications, brochures, and certifications.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Sidebar Categories */}
            <div className="w-full lg:w-64 shrink-0 top-32 sticky">
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm mb-6 border-b border-slate-200 pb-4">Categories</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={cn(
                    "px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                    activeCategory === 'all' 
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  )}
                >
                  All Documents
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                      activeCategory === cat.id 
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Documents Grid */}
            <div className="flex-1 w-full">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                  <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Documents Found</h3>
                  <p className="text-slate-500">There are currently no documents available in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  <AnimatePresence mode="popLayout">
                    {filteredDocuments.map((doc, idx) => (
                      <motion.div
                        key={doc.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
                      >
                        <div className="h-40 w-full bg-blue-50/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-[1.02] transition-transform">
                          <FileText className="h-16 w-16 text-blue-500 opacity-80" />
                        </div>
                        
                        <div className="mt-auto">
                          <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase tracking-widest font-bold rounded-lg mb-4">
                            {doc.category?.name || 'Document'}
                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-900 mb-6 line-clamp-2">
                            {doc.title}
                          </h3>
                          
                          <div className="flex items-center gap-3 mt-auto pt-6 border-t border-slate-100">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                            >
                              <Eye className="h-4 w-4" /> View
                            </a>
                            <a
                              href={doc.file_url}
                              download
                              className="flex-1 py-3 bg-brand-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                            >
                              <Download className="h-4 w-4" /> Save
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
