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
  const [selectedPDF, setSelectedPDF] = useState<DocumentItem | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loading = docsLoading || catsLoading;

  const filteredDocuments = useMemo(() => {
    if (activeCategory === 'all') return documents;
    return documents.filter(doc => doc.category_id === activeCategory);
  }, [documents, activeCategory]);

  const handleDownload = async (url: string, filename: string) => {
    setDownloading(url);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link in new tab if blob fetch fails
      window.open(url, '_blank');
    } finally {
      setDownloading(null);
    }
  };

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
                    {filteredDocuments.map((doc) => (
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
                            <button
                              onClick={() => setSelectedPDF(doc)}
                              className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                            >
                              <Eye className="h-4 w-4" /> View
                            </button>
                            <button
                              onClick={() => handleDownload(doc.file_url, doc.title)}
                              disabled={downloading === doc.file_url}
                              className="flex-1 py-3 bg-brand-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                            >
                              {downloading === doc.file_url ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              Save
                            </button>
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

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {selectedPDF && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPDF(null)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{selectedPDF.title}</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedPDF.category?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDownload(selectedPDF.file_url, selectedPDF.title)}
                    disabled={downloading === selectedPDF.file_url}
                    className="hidden sm:flex px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs uppercase tracking-widest items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {downloading === selectedPDF.file_url ? (
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download
                  </button>
                  <button
                    onClick={() => setSelectedPDF(null)}
                    className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg"
                  >
                    <Eye className="h-6 w-6 rotate-45" />
                  </button>
                </div>
              </div>

              {/* Viewer Content */}
              <div className="flex-1 bg-slate-200 relative overflow-hidden">
                <iframe
                  src={`${selectedPDF.file_url}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-none"
                  title={selectedPDF.title}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
