import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Edit2, Trash2, ExternalLink, Image as ImageIcon, MoreVertical, Check, X, Upload, Loader2, List, Settings, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, cn, slugify } from '@/lib/utils';
import { uploadImage } from '@/lib/upload';
import type { Product, Category, ProductSpecification } from '@/types';

export function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productImages, setProductImages] = useState<{ id?: string; url: string; file?: File; isMain: boolean }[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isVideoMain, setIsVideoMain] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // New States for Specs (Features array will be merged into specs)
  const [specifications, setSpecifications] = useState<Partial<ProductSpecification>[]>([{ spec_key: '', spec_value: '' }]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [pRes, cRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*), images:product_images(*), specifications:product_specifications(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name')
    ]);
    if (pRes.data) setProducts(pRes.data);
    if (cRes.data) setCategories(cRes.data);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(products.filter(p => p.id !== id));
  };

  const handleToggleStatus = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ status: !product.status })
      .eq('id', product.id);
    
    if (!error) {
      setProducts(products.map(p => p.id === product.id ? { ...p, status: !p.status } : p));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + productImages.length > 9) {
      alert('You can only add up to 9 images in total.');
      return;
    }

    const newImages = files.map((file, index) => ({
      url: URL.createObjectURL(file),
      file,
      isMain: productImages.length === 0 && index === 0
    }));

    setProductImages([...productImages, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = [...productImages];
    const removed = newImages.splice(index, 1)[0];
    if (removed.file) {
      URL.revokeObjectURL(removed.url);
    }
    
    if (removed.isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    
    setProductImages(newImages);
  };

  const setAsMain = (index: number) => {
    setProductImages(productImages.map((img, i) => ({
      ...img,
      isMain: i === index
    })));
  };

  // Specification Handlers
  const addSpec = () => setSpecifications([...specifications, { spec_key: '', spec_value: '' }]);
  const removeSpec = (index: number) => setSpecifications(specifications.filter((_, i) => i !== index));
  const updateSpec = (index: number, field: 'spec_key' | 'spec_value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const uploadPromises = productImages.map(async (img) => {
        if (img.file) {
          const url = await uploadImage(img.file);
          return { ...img, url, file: undefined };
        }
        return img;
      });

      const processedImages = await Promise.all(uploadPromises);
      const mainImage = processedImages.find(img => img.isMain) || (processedImages.length > 0 ? processedImages[0] : null);
      const galleryImages = processedImages.filter(img => !img.isMain);

      // Filter empty specs
      const cleanSpecs = specifications.filter(s => s.spec_key?.trim() && s.spec_value?.trim());

      const priceVal = formData.get('price') as string;
      const parsedPrice = priceVal ? parseFloat(priceVal) : null;

      const title = (formData.get('title') as string) || `Untitled Product ${Date.now()}`;

      let uploadedVideoUrl = editingProduct?.video_url || null;
      if (videoFile) {
        uploadedVideoUrl = await uploadImage(videoFile); // uploadImage function works for videos too since it uses the Storage API
      } else if (videoPreview === null) {
        uploadedVideoUrl = null; // Video was removed
      }

      const productData = {
        title: title,
        price: parsedPrice, // Can be null now
        category_id: (formData.get('category_id') as string) || null,
        description: (formData.get('description') as string) || '',
        main_image: mainImage?.url || null,
        video_url: uploadedVideoUrl,
        is_video_main: isVideoMain,
        status: formData.get('status') === 'true',
        slug: slugify(title),
      };

      let productId = editingProduct?.id;

      if (productId) {
        const { error } = await supabase.from('products').update(productData).eq('id', productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert([productData]).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // Handle Specifications
      if (productId) {
        // Delete old specs if editing
        if (editingProduct?.id) {
          await supabase.from('product_specifications').delete().eq('product_id', productId);
        }
        // Insert new specs
        const specsToInsert = cleanSpecs.map(s => ({
          product_id: productId,
          spec_key: s.spec_key,
          spec_value: s.spec_value
        }));
        if (specsToInsert.length > 0) {
          await supabase.from('product_specifications').insert(specsToInsert);
        }
      }

      // Handle Gallery Images
      const currentGalleryIds = editingProduct?.images?.map(img => img.id) || [];
      const newGalleryIds = galleryImages.filter(img => img.id).map(img => img.id);
      const idsToDelete = currentGalleryIds.filter(id => !newGalleryIds.includes(id));

      if (idsToDelete.length > 0) {
        await supabase.from('product_images').delete().in('id', idsToDelete);
      }

      const imagesToInsert = galleryImages
        .filter(img => !img.id)
        .map(img => ({ product_id: productId, image_url: img.url }));
      
      if (imagesToInsert.length > 0) {
        await supabase.from('product_images').insert(imagesToInsert);
      }

      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Submit failed:', err);
      alert(`Operation failed: ${err.message || 'Unknown error'}. Please check if you have updated your Supabase database schema with the video_url column.`);
    } finally {
      setUploading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 text-black">
      <AnimatePresence mode="wait">
        {!isFormOpen ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display italic uppercase tracking-tighter">Inventory <span className="text-blue-600">Control</span></h1>
                <p className="text-gray-500 font-medium uppercase text-[9px] sm:text-[10px] tracking-widest mt-1">Global Logistics Management System</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductImages([]);
                  setVideoFile(null);
                  setVideoPreview(null);
                  setIsVideoMain(false);
                  setSpecifications([{ spec_key: '', spec_value: '' }]);
                  setIsFormOpen(true);
                }}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 group"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" /> Add New Asset
              </button>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="SEARCH MANIFEST / ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 sm:py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold placeholder:text-gray-300 uppercase text-[10px] sm:text-xs tracking-widest"
                />
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 sm:px-8 py-4 sm:py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Asset Information</th>
                      <th className="px-6 sm:px-8 py-4 sm:py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Sector</th>
                      <th className="px-6 sm:px-8 py-4 sm:py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Unit Value</th>
                      <th className="px-6 sm:px-8 py-4 sm:py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Deployment</th>
                      <th className="px-6 sm:px-8 py-4 sm:py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50/50">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-8 py-10"><div className="h-12 bg-gray-50 rounded-2xl w-full" /></td>
                        </tr>
                      ))
                    ) : filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 sm:px-8 py-4 sm:py-6">
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[20px] overflow-hidden bg-gray-100 shrink-0 border border-gray-100 group-hover:scale-105 transition-transform">
                              <img src={product.main_image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="max-w-[200px] truncate">
                              <p className="font-bold text-gray-900 sm:text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{product.title}</p>
                              <p className="text-[9px] sm:text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-1">SN: {product.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 sm:px-8 py-4 sm:py-6">
                          <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-600 text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-widest whitespace-nowrap">
                            {product.category?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 sm:px-8 py-4 sm:py-6 font-display font-black text-slate-900 sm:text-xl whitespace-nowrap">
                          {product.price ? formatPrice(product.price) : 'Inquiry'}
                        </td>
                        <td className="px-6 sm:px-8 py-4 sm:py-6">
                          <button
                            onClick={() => handleToggleStatus(product)}
                            className={cn(
                              "px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                              product.status ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}
                          >
                            {product.status ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 sm:px-8 py-4 sm:py-6">
                          <div className="flex items-center gap-2 sm:gap-3 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity justify-end">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setSpecifications(product.specifications?.length ? product.specifications : [{ spec_key: '', spec_value: '' }]);
                                setIsVideoMain(product.is_video_main || false);
                                const images = [
                                  { url: product.main_image, isMain: true },
                                  ...(product.images?.map(img => ({ id: img.id, url: img.image_url, isMain: false })) || [])
                                ];
                                setProductImages(images.filter(img => img.url));
                                setVideoFile(null);
                                setVideoPreview(product.video_url || null);
                                setIsFormOpen(true);
                              }}
                              className="p-2.5 sm:p-3 bg-white text-gray-400 shadow-sm border border-gray-100 hover:text-blue-600 hover:border-blue-100 rounded-xl transition-all hover:scale-110"
                            >
                              <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2.5 sm:p-3 bg-white text-gray-400 shadow-sm border border-gray-100 hover:text-red-600 hover:border-red-100 rounded-xl transition-all hover:scale-110"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <Link
                              to={`/product/${product.slug}`}
                              target="_blank"
                              className="p-2.5 sm:p-3 bg-white text-gray-400 shadow-sm border border-gray-100 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
                            >
                              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl sm:rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-6 sm:p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl sm:text-4xl font-display font-black text-gray-900 uppercase italic tracking-tighter">
                  {editingProduct ? 'Modify' : 'Initialize'} <span className="text-blue-600">Asset</span>
                </h2>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 sm:mt-2">Manifest Configuration Utility</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-3 sm:p-5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl sm:rounded-2xl transition-all active:scale-95 shadow-sm"
              >
                <X className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-12 space-y-8 sm:space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 text-slate-500">Asset Identity / Title (Required for Manifest)</label>
                  <input
                    name="title"
                    required
                    defaultValue={editingProduct?.title}
                    className="w-full px-5 py-3.5 sm:px-6 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-base sm:text-lg uppercase transition-all"
                    placeholder="E.G. TITANIUM STRUCTURE..."
                  />
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 text-slate-500">Market Valuation (Optional - Blank for Inquiry)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct?.price}
                    className="w-full px-5 py-3.5 sm:px-6 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-black text-base sm:text-lg transition-all"
                    placeholder="E.G. 1250.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 text-slate-500">Asset Sector / Category (Optional)</label>
                  <select
                    name="category_id"
                    defaultValue={editingProduct?.category_id}
                    className="w-full px-5 py-3.5 sm:px-6 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-xs sm:text-sm uppercase appearance-none cursor-pointer transition-all"
                  >
                    <option value="">N/A (SELECT SECTOR)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 text-slate-500">Availability Status</label>
                  <select
                    name="status"
                    defaultValue={editingProduct?.status?.toString() || 'true'}
                    className="w-full px-5 py-3.5 sm:px-6 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-xs sm:text-sm uppercase appearance-none cursor-pointer transition-all"
                  >
                    <option value="true">ACTIVE [VISIBLE]</option>
                    <option value="false">INACTIVE [ARCHIVED]</option>
                  </select>
                </div>
              </div>

              {/* Unified Visual Assets - Grid Density Reduced by another 50% for high volume */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 text-slate-500">Visual Manifest (Optional)</label>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{productImages.length + (videoPreview ? 1 : 0)}/10 ASSETS</span>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 sm:gap-3">
                  {/* Video Asset as first item in the same grid */}
                  {videoPreview && (
                    <div 
                      className={cn(
                        "relative aspect-square rounded-md sm:rounded-lg overflow-hidden bg-black group border transition-all",
                        isVideoMain ? "border-blue-500 ring-1 ring-blue-50" : "border-gray-100"
                      )}
                    >
                      <video src={videoPreview} className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                        {!isVideoMain && (
                          <button
                            type="button"
                            onClick={() => { setIsVideoMain(true); setProductImages(prev => prev.map(img => ({ ...img, isMain: false }))); }}
                            className="w-full py-1 bg-white text-blue-600 rounded text-[6px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg"
                          >
                            Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => { setVideoFile(null); setVideoPreview(null); setIsVideoMain(false); }}
                          className="w-full py-1 bg-red-500 text-white rounded text-[6px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg"
                        >
                          Delete
                        </button>
                      </div>

                      {isVideoMain && (
                        <div className="absolute top-1 left-1 px-1 py-0.5 bg-blue-600 text-white text-[5px] font-black uppercase tracking-widest rounded shadow-xl">
                          PRIMARY VIDEO
                        </div>
                      )}
                      {!isVideoMain && (
                        <div className="absolute top-1 left-1 px-1 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[5px] font-black uppercase tracking-widest rounded">
                          VIDEO
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Assets */}
                  {productImages.map((img, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "relative aspect-square rounded-md sm:rounded-lg overflow-hidden bg-gray-50 group border transition-all",
                        img.isMain && !isVideoMain ? "border-blue-500 ring-1 ring-blue-50" : "border-gray-100"
                      )}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                        {(!img.isMain || isVideoMain) && (
                          <button
                            type="button"
                            onClick={() => { setAsMain(index); setIsVideoMain(false); }}
                            className="w-full py-1 bg-white text-blue-600 rounded text-[6px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg"
                          >
                            Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="w-full py-1 bg-red-500 text-white rounded text-[6px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg text-center flex justify-center"
                        >
                          <Trash2 className="h-2 w-2" />
                        </button>
                      </div>

                      {img.isMain && !isVideoMain && (
                        <div className="absolute top-1 left-1 px-1 py-0.5 bg-blue-600 text-white text-[5px] font-black uppercase tracking-widest rounded shadow-xl">
                          PRIMARY
                        </div>
                      )}
                    </div>
                  ))}

                  {productImages.length < 9 && (
                    <div className="flex gap-2">
                       <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-md sm:rounded-lg border border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all group p-0.5"
                      >
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-[6px] font-bold mt-0.5 uppercase tracking-widest text-slate-400">IMG</span>
                      </button>

                      {!videoPreview && (
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="aspect-square rounded-md sm:rounded-lg border border-dashed border-gray-100 flex flex-col items-center justify-center text-blue-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all group p-0.5"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-[6px] font-bold mt-0.5 uppercase tracking-widest text-blue-400">VID</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setVideoFile(file);
                      setVideoPreview(URL.createObjectURL(file));
                      if (productImages.length === 0) setIsVideoMain(true);
                    }
                  }}
                  accept="video/*"
                  className="hidden"
                />
              </div>

              {/* Specifications */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-blue-600 shrink-0" />
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-slate-500">Technical Data Sheet (Optional)</label>
                </div>
                <div className="space-y-6">
                  {specifications.map((spec, index) => (
                    <div key={index} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start group p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all">
                      <div className="lg:col-span-4 space-y-1.5">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity / Label</label>
                        <input
                          value={spec.spec_key}
                          onChange={(e) => updateSpec(index, 'spec_key', e.target.value)}
                          placeholder="E.G. MATERIAL / SIZE"
                          className="w-full px-4 py-2.5 sm:px-5 sm:py-3 bg-white border border-gray-100 rounded-xl text-[9px] sm:text-[11px] font-bold uppercase focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                        />
                      </div>
                      <div className="lg:col-span-7 space-y-1.5">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Specification Content</label>
                        <textarea
                          rows={3}
                          value={spec.spec_value}
                          onChange={(e) => updateSpec(index, 'spec_value', e.target.value)}
                          placeholder="ENTER VALUES..."
                          className="w-full px-4 py-2.5 sm:px-5 sm:py-3 bg-white border border-gray-100 rounded-xl text-[9px] sm:text-[11px] font-bold uppercase focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all resize-none"
                        />
                      </div>
                      <div className="lg:col-span-1 pt-6 flex justify-end">
                        <button 
                          type="button" 
                          onClick={() => removeSpec(index)}
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={addSpec}
                    className="w-full p-6 border-2 border-dashed border-gray-100 rounded-[2rem] text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/50 transition-all"
                  >
                    + APPEND TECHNICAL PARAMETER
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 text-slate-500">Public Brief / Overview (Optional)</label>
                <textarea
                  name="description"
                  rows={6}
                  defaultValue={editingProduct?.description}
                  className="w-full px-6 py-5 sm:px-8 sm:py-6 bg-gray-50 border border-gray-100 rounded-2xl sm:rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-none text-slate-900 font-medium text-base sm:text-lg transition-all"
                  placeholder="PROVIDE IN-DEPTH OVERVIEW..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-10 sm:pt-12 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-full sm:flex-grow py-4 sm:py-5 bg-gray-100 text-gray-500 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                >
                  Terminate
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full sm:flex-grow py-4 sm:py-5 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 disabled:bg-blue-800 flex items-center justify-center gap-3"
                >
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : (editingProduct ? 'Commit Changes' : 'Initialize Asset')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
