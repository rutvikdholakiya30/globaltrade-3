import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts, useCategories } from '@/hooks/useData';
import { Search, Filter, LayoutGrid, List, ChevronRight, ArrowUpRight, Package, Box } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categorySlug = searchParams.get('category');
  const { categories } = useCategories();
  const activeCategory = categories.find(c => c.slug === categorySlug);
  const { products, loading } = useProducts(activeCategory?.id);

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-50 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-brand-primary">Inventory</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-2 sm:mb-4">
                {activeCategory ? activeCategory.name : 'Global Catalog'}
              </h1>
              <p className="text-slate-500 text-sm sm:text-lg">
                Discover our curated selection of high-performance industrial equipment and verified global shipments.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group flex-grow md:flex-grow-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-slate-200 px-12 py-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary w-full md:w-80 transition-all text-slate-900 shadow-sm"
                />
              </div>
              <div className="hidden md:flex bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2.5 rounded-xl transition-all", 
                    viewMode === 'grid' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2.5 rounded-xl transition-all", 
                    viewMode === 'list' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-10">
            <div className="sticky top-32">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center">
                <Filter className="h-4 w-4 mr-2 text-brand-primary" /> Filter by Sector
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSearchParams({})}
                  className={cn(
                    "w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all flex justify-between items-center",
                    !categorySlug ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  All Categories
                  {!categorySlug && <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" />}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSearchParams({ category: category.slug })}
                    className={cn(
                      "w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all flex justify-between items-center group",
                      categorySlug === category.slug ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {category.name}
                    <ChevronRight className={cn("h-4 w-4 transition-transform", categorySlug === category.slug ? "translate-x-0" : "translate-x-2 opacity-0 group-hover:opacity-100")} />
                  </button>
                ))}
              </div>

              <div className="mt-10 p-8 rounded-[32px] bg-brand-primary text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                <div className="relative z-10">
                  <h4 className="text-lg font-bold mb-3">Bulk Procurement</h4>
                  <p className="text-white/70 text-sm leading-relaxed mb-6">
                    Custom logistics solutions available for large scale industrial procurement.
                  </p>
                  <Link to="/contact" className="inline-flex items-center text-sm font-bold hover:gap-3 transition-all">
                    Inquire Now <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-slate-50 rounded-2xl sm:rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={cn(
                "grid gap-3 sm:gap-4",
                viewMode === 'grid' ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
              )}>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={product.id}
                      className="h-full"
                    >
                      <Link
                        to={`/product/${product.slug}`}
                        className={cn(
                          "group bg-white rounded-lg sm:rounded-2xl border border-slate-100 p-1.5 sm:p-2 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex h-full",
                          viewMode === 'grid' ? "flex-col" : "flex-row h-64"
                        )}
                      >
                        {/* Image Container */}
                        <div className={cn(
                          "rounded-lg sm:rounded-2xl overflow-hidden relative bg-slate-50 shrink-0",
                          viewMode === 'grid' ? "aspect-square mb-2 sm:mb-4" : "w-1/3 h-full mr-8"
                        )}>
                          <img
                            src={product.main_image || '/placeholder-image.jpg'}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        {/* Content Container */}
                        <div className={cn(
                          "flex flex-col flex-grow",
                          viewMode === 'grid' ? "px-1 sm:px-2" : "w-2/3 py-4"
                        )}>
                          {/* Title and In-Stock Row */}
                          <div className="mb-2 sm:mb-2.5">
                             <h3 className="text-[10px] sm:text-[12px] font-bold text-slate-900 group-hover:text-brand-primary transition-colors mb-2 sm:mb-3 leading-[1.1] tracking-wide">
                               {product.title}
                             </h3>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 w-fit">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[6px] sm:text-[8px] font-bold uppercase tracking-wider">In Stock</span>
                              </div>
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 w-fit">
                                <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                <span className="text-[6px] sm:text-[8px] font-bold uppercase tracking-wider truncate max-w-[50px] sm:max-w-[80px]">{product.category?.name || 'Asset'}</span>
                              </div>
                            </div>
                          </div>
                          
                          {viewMode === 'list' && (
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                              {product.description?.split(' ').slice(0, 35).join(' ')}
                              {product.description?.split(' ').length > 35 ? '...' : ''}
                            </p>
                          )}
                          
                          {/* Bottom Row - Price and Arrow Button */}
                          <div className="mt-auto flex justify-between items-center pt-2 sm:pt-4 border-t border-slate-50">
                            <div className="flex flex-col">
                              <span className="text-[6px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">UNIT VALUE</span>
                              <span className={cn(
                                "font-extrabold text-slate-900",
                                product.price && product.price > 0 ? "text-[10px] sm:text-[13px]" : "text-[8px] sm:text-[9px] italic text-blue-600 uppercase tracking-tight"
                              )}>
                                {product.price && product.price > 0 ? formatPrice(product.price) : 'Price for Inquiry'}
                              </span>
                            </div>
                            
                            <div className="flex w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-50 items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-32 text-center rounded-[40px] border-2 border-dashed border-slate-100 bg-slate-50/50">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm">
                  <Box className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Products Found</h3>
                <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSearchParams({}); }}
                  className="mt-8 text-brand-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
