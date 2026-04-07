import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Edit2, Trash2, ExternalLink, Image as ImageIcon, MoreVertical, Check, X, Upload, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, cn, slugify } from '@/lib/utils';
import { uploadImage } from '@/lib/upload';
import type { Product, Category } from '@/types';

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

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [pRes, cRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*), images:product_images(*)').order('created_at', { ascending: false }),
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
    
    // If we removed the main image, set the first remaining one as main
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (productImages.length === 0) {
      alert('Please add at least one image.');
      return;
    }
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
      const mainImage = processedImages.find(img => img.isMain) || processedImages[0];
      const galleryImages = processedImages.filter(img => !img.isMain);

      const productData = {
        title: formData.get('title') as string,
        price: parseFloat(formData.get('price') as string),
        category_id: formData.get('category_id') as string,
        description: formData.get('description') as string,
        main_image: mainImage.url,
        status: formData.get('status') === 'true',
        slug: slugify(formData.get('title') as string),
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

      // Handle Gallery Images
      const currentGalleryIds = editingProduct?.images?.map(img => img.id) || [];
      const newGalleryIds = galleryImages.filter(img => img.id).map(img => img.id);
      const idsToDelete = currentGalleryIds.filter(id => !newGalleryIds.includes(id));

      if (idsToDelete.length > 0) {
        await supabase.from('product_images').delete().in('id', idsToDelete);
      }

      const imagesToInsert = galleryImages
        .filter(img => !img.id) // Only insert new ones
        .map(img => ({ product_id: productId, image_url: img.url }));
      
      if (imagesToInsert.length > 0) {
        await supabase.from('product_images').insert(imagesToInsert);
      }

      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Operation failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
                <p className="text-gray-600">Add, edit, or remove items from your global catalog.</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductImages([]);
                  setIsFormOpen(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <Plus className="h-5 w-5" /> Add Product
              </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-6 py-8"><div className="h-8 bg-gray-100 rounded w-full" /></td>
                        </tr>
                      ))
                    ) : filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                              <img src={product.main_image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{product.title}</p>
                              <p className="text-xs text-gray-500">ID: {product.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                            {product.category?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(product.price)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(product)}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold transition-all",
                              product.status ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            )}
                          >
                            {product.status ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                const images = [
                                  { url: product.main_image, isMain: true },
                                  ...(product.images?.map(img => ({ id: img.id, url: img.image_url, isMain: false })) || [])
                                ];
                                setProductImages(images);
                                setIsFormOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <Link
                              to={`/product/${product.slug}`}
                              target="_blank"
                              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                            >
                              <ExternalLink className="h-4 w-4" />
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
            className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-sm text-gray-500">Fill in the details below to update your catalog.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Product Title</label>
                  <input
                    name="title"
                    required
                    defaultValue={editingProduct?.title}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                    placeholder="e.g. Industrial Steel Coil"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Price (USD)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.price}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Category</label>
                  <select
                    name="category_id"
                    required
                    defaultValue={editingProduct?.category_id}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-black font-medium"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Status</label>
                  <select
                    name="status"
                    defaultValue={editingProduct?.status?.toString() || 'true'}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-black font-medium"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700">Product Images (Max 9)</label>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{productImages.length}/9</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                  {productImages.map((img, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "relative aspect-square rounded-2xl overflow-hidden bg-gray-50 group border-2 transition-all",
                        img.isMain ? "border-blue-500 ring-4 ring-blue-50" : "border-gray-100"
                      )}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        {!img.isMain && (
                          <button
                            type="button"
                            onClick={() => setAsMain(index)}
                            className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
                          >
                            Set as Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {img.isMain && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md shadow-lg">
                          MAIN IMAGE
                        </div>
                      )}
                    </div>
                  ))}

                  {productImages.length < 9 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <Plus className="h-8 w-8" />
                      </div>
                      <span className="text-xs font-bold mt-2 uppercase tracking-wider">Add Image</span>
                    </button>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <ImageIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Tip:</strong> You can upload up to 9 images. The image marked as <strong>"MAIN IMAGE"</strong> will be shown as the primary photo in the catalog.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Description</label>
                <textarea
                  name="description"
                  rows={6}
                  defaultValue={editingProduct?.description}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black font-medium"
                  placeholder="Describe the product features, usage, and benefits..."
                />
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
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
