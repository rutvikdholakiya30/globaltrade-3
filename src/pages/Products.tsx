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
            <div>
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
            </div>

            <div className="p-8 rounded-[32px] bg-brand-primary text-white relative overflow-hidden group">
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
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-slate-50 rounded-2xl sm:rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={cn(
                "grid gap-4 sm:gap-8",
                viewMode === 'grid' ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={product.id}
                    >
                      <Link
                        to={`/product/${product.slug}`}
                        className={cn(
                          "group bg-white rounded-2xl sm:rounded-[32px] border border-slate-100 p-2 sm:p-4 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex",
                          viewMode === 'grid' ? "flex-col" : "flex-row h-72"
                        )}
                      >
                        <div className={cn(
                          "rounded-xl sm:rounded-2xl overflow-hidden relative bg-slate-50",
                          viewMode === 'grid' ? "aspect-[16/10] mb-3 sm:mb-6" : "w-1/3 h-full mr-8"
                        )}>
                          <img
                            src={product.main_image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                            <div className="bg-white/90 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-bold text-slate-500 shadow-sm border border-white/20 uppercase tracking-wider">
                              {product.category?.name}
                            </div>
                          </div>
                        </div>
                        
                        <div className={cn(
                          "px-1 sm:px-4 pb-2 sm:pb-4 flex flex-col",
                          viewMode === 'grid' ? "" : "w-2/3 py-4"
                        )}>
                          <div className="flex justify-between items-start mb-1 sm:mb-3">
                            <h3 className="text-sm sm:text-2xl font-bold text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1">
                              {product.title}
                            </h3>
                            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-50 items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all">
                              <ArrowUpRight className="h-5 w-5" />
                            </div>
                          </div>
                          
                          <p className="hidden sm:block text-slate-500 text-sm leading-relaxed line-clamp-2 mb-8">
                            {product.description}
                          </p>
                          
                          <div className="mt-auto flex justify-between items-center pt-2 sm:pt-6 border-t border-slate-50">
                            <div className="flex flex-col">
                              <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Unit Price</span>
                              <span className="text-sm sm:text-2xl font-extrabold text-slate-900">{formatPrice(product.price)}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-600">
                              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">In Stock</span>
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

function ShoppingBag(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
