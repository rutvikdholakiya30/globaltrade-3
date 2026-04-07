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
  Share2
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

  const currentImage = activeImage || product.main_image;
  const allImages = [product.main_image, ...(product.images?.map(img => img.image_url) || [])].filter(Boolean);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-slate-50 pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/products" className="hover:text-brand-primary transition-colors">Inventory</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-primary">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[16/10] bg-slate-50 rounded-[40px] overflow-hidden group shadow-2xl shadow-slate-200 border border-slate-100">
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
                className="absolute top-8 right-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl text-slate-400 hover:text-brand-primary transition-all shadow-lg border border-white/20"
              >
                <Maximize2 className="h-5 w-5" />
              </button>

              <div className="absolute bottom-8 left-8">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-slate-500 shadow-sm border border-white/20 uppercase tracking-widest">
                  IMAGE {allImages.indexOf(currentImage) + 1} / {allImages.length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "aspect-square rounded-2xl transition-all overflow-hidden bg-slate-50 border-2",
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
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {product.category?.name}
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">In Stock</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                {product.title}
              </h1>
              
              <div className="flex items-baseline gap-4 mb-10">
                <span className="text-4xl font-extrabold text-slate-900">{formatPrice(product.price)}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Excl. VAT & Shipping</span>
              </div>
              
              <p className="text-slate-500 text-lg leading-relaxed mb-12">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 mb-16">
              <button className="btn-primary w-full py-5 text-lg">
                Request Quotation <ArrowUpRight className="h-5 w-5" />
              </button>
              <button className="btn-outline w-full py-5 text-lg">
                Download Technical Datasheet
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-12 border-t border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-primary">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Global Shipping</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-medium leading-tight">Express logistics to 180+ countries</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Quality Assured</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-medium leading-tight">ISO 9001:2015 Certified standards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4 space-y-8">
                <div>
                  <span className="section-label">Engineering Data</span>
                  <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Technical Specifications</h2>
                  <p className="text-slate-500 leading-relaxed">
                    Detailed engineering parameters and material composition for industrial verification.
                  </p>
                </div>
                
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 text-brand-primary mb-4">
                    <Info className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Compliance Note</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All specifications are subject to standard industrial tolerances of ±0.5%. 
                    Verified by GlobalTrade Quality Control.
                  </p>
                </div>
              </div>
              
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-100 rounded-[40px] overflow-hidden border border-slate-100">
                  {product.specifications.map((spec) => (
                    <div 
                      key={spec.id} 
                      className="p-10 bg-white flex flex-col justify-center hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-3">{spec.spec_key}</span>
                      <span className="text-2xl font-bold text-slate-900">{spec.spec_value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Logistics Section */}
        <div className="mt-32 p-16 md:p-32 rounded-[60px] bg-slate-900 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
          </div>
          
          <div className="relative z-10">
            <Globe className="h-16 w-16 text-brand-accent mx-auto mb-10" />
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 max-w-3xl mx-auto leading-tight">
              Ready for Global Deployment
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-16">
              Our logistics network ensures this product reaches your facility with maximum efficiency and minimal downtime.
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {['Port of Dubai', 'Port of Singapore', 'Port of Rotterdam', 'Port of Shanghai'].map(port => (
                <span key={port} className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">{port}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
