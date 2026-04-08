import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Image as ImageIcon, X, Loader2, Upload, Video, Layers, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDialog } from '@/components/Admin/ConfirmDialog';
import { uploadImage } from '@/lib/upload';
import type { GalleryItem } from '@/types';
import { cn } from '@/lib/utils';

export function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);

  // Deletion state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | string[] | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  const handleDelete = async (target: string | string[]) => {
    const ids = Array.isArray(target) ? target : [target];
    const { error } = await supabase.from('gallery').delete().in('id', ids);
    if (!error) {
      setItems(items.filter(item => !ids.includes(item.id)));
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(item => item.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, { url: reader.result as string, type: file.type }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert('Please select files to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });

    const formData = new FormData(e.currentTarget);
    const baseCaption = formData.get('caption') as string;
    const sectionTitle = formData.get('category') as string;

    const results = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        const url = await uploadImage(file);
        results.push({
          image_url: url,
          caption: selectedFiles.length > 1 ? `${baseCaption} (${i + 1})` : baseCaption,
          video_url: isVideo(file.name) ? url : null,
          category: sectionTitle || null,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.error(`Upload failed for file ${i + 1}:`, err);
      }
    }

    if (results.length > 0) {
      const { error } = await supabase.from('gallery').insert(results);
      if (!error) {
        setIsModalOpen(false);
        fetchGallery();
        resetForm();
      } else {
        console.error('Database Sync Error:', error);
        alert(`Failed to save to gallery database: ${error.message}`);
      }
    }

    setUploading(false);
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setUploadProgress({ current: 0, total: 0 });
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$|^data:video/i);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 uppercase italic tracking-tighter">
            Gallery <span className="text-blue-600">Operations</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] sm:text-xs tracking-widest mt-2 px-1 border-l-2 border-blue-600">
            Bulk Media Management & Global Asset Logistics
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100"
        >
          <Layers className="h-5 w-5" /> Bulk Upload
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedIds.length === items.length && items.length > 0}
            onChange={handleToggleSelectAll}
            className="w-5 h-5 rounded-lg border-2 border-gray-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
          />
          <span className="text-xs font-black uppercase text-gray-500 tracking-widest">Select All Assets</span>
        </div>
        
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-4"
            >
              <p className="text-[10px] font-black uppercase text-red-600 tracking-[0.2em]">{selectedIds.length} Assets Targeted</p>
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

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "relative group aspect-square rounded-3xl overflow-hidden bg-gray-50 border shadow-sm hover:shadow-xl transition-all",
                  selectedIds.includes(item.id) ? "border-blue-500 ring-4 ring-blue-500/10" : "border-gray-100"
                )}
              >
                {/* Selection Overlay */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleToggleSelect(item.id)}
                    className="w-5 h-5 rounded-lg border-2 border-white/50 bg-black/20 backdrop-blur-md text-blue-600 focus:ring-blue-500 transition-all cursor-pointer accent-blue-600"
                  />
                </div>

                {isVideo(item.image_url) ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                    <Video className="h-10 w-10 text-white/20" />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-blue-600 text-[8px] font-black uppercase text-white rounded-lg tracking-widest">Video</div>
                  </div>
                ) : (
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
                
                <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center backdrop-blur-sm">
                  <p className="text-white text-[10px] font-black uppercase tracking-widest mb-1 line-clamp-1">{item.category || 'NO CATEGORY'}</p>
                  <p className="text-white/60 text-[8px] font-bold uppercase tracking-widest mb-4 line-clamp-1">{item.caption || 'N/A'}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setItemToDelete(item.id); setIsDeleteDialogOpen(true); }}
                      className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all transform hover:scale-110 active:scale-90"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploading && setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Bulk Upload</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest italic">Syncing assets to global servers</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={uploading}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all disabled:opacity-50"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Dropzone */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                       <Upload className="h-4 w-4 text-blue-600" /> Selection Queue
                    </label>
                    
                    <div 
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className={cn(
                        "w-full aspect-video sm:aspect-[21/9] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group",
                        selectedFiles.length > 0 ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        disabled={uploading}
                      />
                      
                      {uploading ? (
                        <div className="flex flex-col items-center gap-6 p-8">
                          <div className="relative w-24 h-24">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                              <circle 
                                cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                strokeDasharray={251}
                                strokeDashoffset={251 - (251 * (uploadProgress.current / uploadProgress.total))}
                                className="text-blue-600 transition-all duration-500" 
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-lg text-blue-600">
                              {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest animate-pulse">Processing Block {uploadProgress.current}/{uploadProgress.total}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1 italic">Verifying integrity & syncing to cloud...</p>
                          </div>
                        </div>
                      ) : selectedFiles.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-6 w-full">
                          {previews.slice(0, 11).map((prev, i) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white shadow-sm relative group/item">
                              {prev.type.startsWith('video') ? (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                  <Video className="h-4 w-4 text-white/40" />
                                </div>
                              ) : (
                                <img src={prev.url} className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                          {selectedFiles.length > 11 && (
                            <div className="aspect-square rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                              +{selectedFiles.length - 11}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center p-8">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-lg mb-4 group-hover:scale-110 group-hover:text-blue-600 transition-all">
                            <Upload className="h-8 w-8" />
                          </div>
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Tap to populate queue</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Multi-file Image & Video Support</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                         <Layers className="h-4 w-4 text-blue-600" /> Section Title
                      </label>
                      <input
                        name="category"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-base uppercase transition-all"
                        placeholder="E.G., TEXTILE IMAGES..."
                        disabled={uploading}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                         <ImageIcon className="h-4 w-4 text-blue-600" /> Batch Caption
                      </label>
                      <input
                        name="caption"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-base uppercase transition-all"
                        placeholder="ENTER BATCH CAPTION..."
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={uploading || selectedFiles.length === 0}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all disabled:opacity-20"
                    >
                      Reset Queue
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || selectedFiles.length === 0}
                      className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-100"
                    >
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> Execute Sync</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setItemToDelete(null); }}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete as string | string[])}
        title={Array.isArray(itemToDelete) ? "Bulk Delete Media?" : "Delete Media?"}
        message={Array.isArray(itemToDelete)
          ? `Are you sure you want to permanently remove ${itemToDelete.length} assets from the gallery? This action is irreversible.`
          : "Are you sure you want to remove this asset from the gallery? This action is irreversible."}
      />
    </div>
  );
}

