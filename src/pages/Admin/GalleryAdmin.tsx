import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Image as ImageIcon, X, Loader2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadImage } from '@/lib/upload';
import type { GalleryItem } from '@/types';

export function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (!error) setItems(items.filter(item => item.id !== id));
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

    if (!image_url) {
      alert('Please select an image or provide a URL.');
      setUploading(false);
      return;
    }

    const data = {
      image_url,
      caption: formData.get('caption') as string,
    };

    const { error } = await supabase.from('gallery').insert([data]);
    if (!error) {
      setIsModalOpen(false);
      fetchGallery();
      setPreviewUrl(null);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Manage images for your operations and products.</p>
        </div>
        <button
          onClick={() => {
            setPreviewUrl(null);
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus className="h-5 w-5" /> Add Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
          ))
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="relative group aspect-square rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm"
            >
              <img src={item.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                <p className="text-white text-xs font-medium mb-4 line-clamp-2">{item.caption || 'No caption'}</p>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all transform hover:scale-110"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add Image</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700">Image Source</label>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full aspect-video rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-gray-300" />
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Upload className="h-4 w-4" /> Select File from Device
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Or Image URL</label>
                  <input
                    name="image_url"
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Caption (Optional)</label>
                  <input
                    name="caption"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                    placeholder="Describe the image..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-blue-800 transition-all shadow-lg shadow-blue-100"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Add to Gallery'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
