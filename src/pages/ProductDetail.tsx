import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Package, 
  ShieldCheck, 
  Truck, 
  Globe, 
  ArrowUpRight,
  Maximize2,
  CheckCircle2,
  Info,
  Share2,
  Settings
} from 'lucide-react';
import { useProduct } from '@/hooks/useData';
import { formatPrice, cn } from '@/lib/utils';
import { useState } from 'react';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading } = useProduct(slug || '');
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  if (loading) {
    return (
      <div className="bg-white min-h-screen pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-6" />
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Accessing Secure Data...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white min-h-screen pt-32 px-8">
        <div className="max-w-7xl mx-auto text-center py-32 rounded-[40px] border-2 border-dashed border-slate-100 bg-slate-50/50">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Resource Not Found</h1>
          <p className="text-slate-500 mb-12">The requested product does not exist in our global inventory.</p>
          <Link to="/products" className="btn-primary inline-flex">
            <ArrowLeft className="mr-2 h-5 w-5" /> Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = activeImage || product.main_image || '/placeholder-image.jpg';
  const allImages = [product.main_image, ...(product.images?.map(img => img.image_url) || [])].filter(Boolean);

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Breadcrumbs */}
      <div className="bg-slate-50 pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/products" className="hover:text-brand-primary transition-colors">Inventory</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-primary truncate max-w-[150px] sm:max-w-none">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="relative aspect-[16/10] bg-slate-50 rounded-3xl sm:rounded-[40px] overflow-hidden group shadow-2xl shadow-slate-200 border border-slate-100">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={currentImage}
                  alt={product.title}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-700",
                    isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
                  )}
                  onClick={() => setIsZoomed(!isZoomed)}
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              
              <button 
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 sm:p-4 bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl text-slate-400 hover:text-brand-primary transition-all shadow-lg border border-white/20"
              >
                <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8">
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold text-slate-500 shadow-sm border border-white/20 uppercase tracking-widest">
                  IMAGE {allImages.length > 0 ? allImages.indexOf(activeImage || product.main_image || '') + 1 : 0} / {allImages.length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "aspect-square rounded-xl sm:rounded-2xl transition-all overflow-hidden bg-slate-50 border-2",
                    currentImage === img ? "border-brand-primary scale-95 shadow-lg shadow-brand-primary/10" : "border-transparent hover:border-slate-200"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-brand-primary/10 text-brand-primary text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {product.category?.name || 'General Inventory'}
                </span>
                <div className="flex items-center gap-2 px-3 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">In Stock</span>
                </div>
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-slate-900 mb-4 sm:mb-6 leading-tight">
                {product.title}
              </h1>
              
              <div className="flex flex-col gap-1 sm:gap-2 mb-8 sm:mb-10">
                <span className={cn(
                  "font-extrabold text-slate-900",
                  product.price ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl italic text-blue-600 uppercase tracking-tighter"
                )}>
                  {product.price && product.price > 0 ? formatPrice(product.price) : 'Inquiry for Price'}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Excl. VAT & Shipping</span>
              </div>
              
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-10 sm:mb-12">
                {product.description || 'GlobalTrade Connect provides verified industrial assets. This product is currently available for international procurement with certified logistics support.'}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-12 sm:mb-16">
              <button className="btn-primary w-full py-4 sm:py-5 text-base sm:text-lg">
                Request Quotation <ArrowUpRight className="h-5 w-5" />
              </button>
              <button className="btn-outline w-full py-4 sm:py-5 text-base sm:text-lg">
                Download Technical Datasheet
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-8 sm:pt-12 border-t border-slate-100">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Global Shipping</h4>
                  <p className="text-[8px] sm:text-[10px] text-slate-500 uppercase font-medium leading-tight">Express logistics to 180+ countries</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Quality Assured</h4>
                  <p className="text-[8px] sm:text-[10px] text-slate-500 uppercase font-medium leading-tight">ISO 9001:2015 Certified standards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Technical Specifications & Feature Groups Block */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-24 sm:mt-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6 px-4">
              <div className="max-w-2xl">
                <span className="section-label">Engineering Manifest</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 flex items-center gap-4">
                  <Settings className="h-8 w-8 text-brand-primary hidden sm:block" /> TECHNICAL ANALYSIS
                </h2>
              </div>
              <div className="px-4 py-2 sm:px-6 sm:py-3 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-brand-primary" />
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Logistical Data</span>
              </div>
            </div>
            
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden divide-y divide-slate-50">
              {product.specifications.map((spec) => {
                const lines = spec.spec_value.split('\n').filter(line => line.trim() !== '');
                const isMultiLine = lines.length > 1;

                return (
                  <div key={spec.id} className="group transition-all duration-300">
                    {/* Identity Label (16px, Bold, Uppercase) */}
                    <div className="bg-slate-50/50 px-8 sm:px-12 py-4 sm:py-5 border-b border-slate-50">
                      <span className="text-[16px] font-bold text-slate-900 uppercase tracking-wider">{spec.spec_key}</span>
                    </div>
                    {/* Content Value (14px, Light Bold, Lowercase) */}
                    <div className="px-8 sm:px-12 py-6 sm:py-8 group-hover:bg-blue-50/30 transition-colors">
                      {isMultiLine ? (
                        <div className="space-y-3">
                          {lines.map((line, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                              <span className="text-[14px] font-medium text-slate-500 group-hover:text-blue-600 transition-colors lowercase tracking-tight leading-tight block">
                                {line.replace(/^[-•*]\s*/, '')}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[14px] font-medium text-slate-500 group-hover:text-blue-600 transition-colors lowercase tracking-tight leading-tight block">
                          {spec.spec_value}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Logistics Section */}
        <div className="mt-24 sm:mt-32 p-10 sm:p-32 rounded-3xl sm:rounded-[60px] bg-slate-50 border border-slate-100 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-1000">
            <Globe className="h-64 w-64" />
          </div>
          
          <div className="relative z-10">
            <Globe className="h-12 w-12 sm:h-16 sm:h-16 text-brand-primary mx-auto mb-6 sm:mb-10" />
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 sm:mb-8 max-w-3xl mx-auto leading-tight">
              Ready for Global Deployment
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto mb-10 sm:mb-16">
              Our logistics network ensures this asset reaches your facility with maximum efficiency and certified security protocols.
            </p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-16">
              {['Port of Dubai', 'Port of Singapore', 'Port of Rotterdam', 'Port of Shanghai'].map(port => (
                <span key={port} className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400 hover:text-brand-primary cursor-default transition-colors">{port}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
