import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Globe, ShieldCheck, Truck, BarChart3, Package, Star, ArrowUpRight, ChevronRight, User, Box, Zap, Anchor, Activity } from 'lucide-react';
import { useCategories, useProducts, useTestimonials, usePartners } from '@/hooks/useData';
import { formatPrice, cn } from '@/lib/utils';

export function Home() {
  const { categories } = useCategories();
  const { products, loading: productsLoading } = useProducts(undefined, 8);
  const { testimonials } = useTestimonials(3);
  const { partners } = usePartners();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section - Modern SaaS Style */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-brand-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-8">
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-2" /> Global Logistics Redefined
              </span>
              <h1 className="text-2xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-4 sm:mb-8 leading-[1.1]">
                Seamless Trade. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Infinite Reach.</span>
              </h1>
              <p className="text-sm sm:text-xl text-slate-500 mb-6 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
                Connecting continents through precision engineering and verified supply chains. 
                Your gateway to the global marketplace starts here.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/products" className="btn-primary py-3 sm:py-4 px-6 sm:px-8 text-sm sm:text-base">
                  Explore Catalog <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link to="/contact-us" className="btn-outline py-3 sm:py-4 px-6 sm:px-8 text-sm sm:text-base">
                  Become a Partner
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Hero Image / Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 sm:mt-20 relative"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000"
                alt="Logistics Dashboard"
                className="w-full aspect-[16/9] sm:aspect-[21/9] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-10 -left-10 hidden lg:block">
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">99.9%</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">On-Time Delivery</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="section-label">Our Expertise</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6">Industrial Domains</h2>
              <p className="text-slate-500 text-sm sm:text-lg">Specialized solutions across diverse manufacturing and trade sectors worldwide.</p>
            </div>
            <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-brand-primary">
              View All Sectors <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group relative h-64 sm:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={category.image_url || `https://picsum.photos/seed/${category.slug}/800/1000`}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 p-4 sm:p-10 flex flex-col justify-end">
                  <h3 className="text-lg sm:text-3xl font-bold text-white mb-2 sm:mb-4">{category.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] sm:text-sm font-bold text-brand-accent opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    Explore Sector <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-20">
            <span className="section-label">Latest Inventory</span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900">Premium Shipments</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {productsLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-64 sm:h-[450px] bg-slate-50 rounded-2xl sm:rounded-3xl animate-pulse" />
              ))
            ) : (
              products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-2 sm:p-4 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
                >
                  <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-6 bg-slate-50">
                    <img
                      src={product.main_image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="px-1 sm:px-4 pb-2 sm:pb-4">
                    <h3 className="text-sm sm:text-xl font-bold text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1 mb-1 sm:mb-2">
                      {product.title}
                    </h3>
                    <p className="hidden sm:block text-sm text-slate-500 line-clamp-2 mb-6">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center pt-2 sm:pt-4 border-t border-slate-50">
                      <div className="text-sm sm:text-xl font-extrabold text-slate-900">
                        {formatPrice(product.price)}
                      </div>
                      <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                        <ArrowUpRight className="h-3 w-3 sm:h-5 sm:w-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-4 block">Why Choose Us</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-brand-accent/50">
                Built for Global <br className="hidden md:block" />Scale & Speed.
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {[
                  { icon: Globe, title: "Global Reach", desc: "Active operations across 50+ countries." },
                  { icon: ShieldCheck, title: "Verified Quality", desc: "Multi-stage inspection protocols." },
                  { icon: Truck, title: "Rapid Transit", desc: "Optimized logistics routes." },
                  { icon: Activity, title: "Real-time Tracking", desc: "End-to-end cargo visibility." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group p-4 sm:p-8 bg-white/5 border border-white/10 rounded-2xl sm:rounded-[32px] hover:bg-white/[0.08] hover:border-brand-accent/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-accent/10 transition-all duration-500"
                  >
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-brand-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-accent mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-slate-900 transition-all duration-500 shadow-lg shadow-brand-primary/10">
                      <item.icon className="h-5 w-5 sm:h-7 sm:w-7" />
                    </div>
                    <h3 className="text-sm sm:text-xl font-bold mb-2 sm:mb-3 text-white">{item.title}</h3>
                    <p className="text-slate-400 text-[10px] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mt-12 lg:mt-0"
            >
              <div className="aspect-[4/5] sm:aspect-square rounded-[40px] overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1000"
                  alt="Global Logistics"
                  className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Floating Stats - Adjusted for responsiveness */}
              <div className="absolute -bottom-6 -right-4 sm:-bottom-10 sm:-right-10 glass-card p-6 sm:p-10 rounded-3xl border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl">
                <div className="text-4xl sm:text-5xl font-extrabold text-brand-accent mb-2">15+</div>
                <div className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-white/60">Years of Excellence</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners Ticker */}
      {partners.length > 0 && (
        <section className="py-24 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
            <span className="section-label">Trusted By Industry Leaders</span>
          </div>
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex items-center gap-20"
              animate={{ x: [0, -1000] }}
              transition={{ duration: 40, ease: "linear", repeat: Infinity }}
              style={{ width: "fit-content" }}
            >
              {[...partners, ...partners, ...partners].map((partner, idx) => (
                <div key={`${partner.id}-${idx}`} className="shrink-0">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="h-12 w-auto object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xl font-bold text-slate-300 hover:text-brand-primary transition-colors">
                      {partner.name}
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-20">
            <span className="section-label">Client Success</span>
            <h2 className="text-2xl md:text-5xl font-extrabold text-slate-900">Voices of Trust</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8">
            {testimonials.map((t) => (
              <motion.div
                key={t.id}
                layout
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                className={cn(
                  "bg-white p-4 sm:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 cursor-pointer relative overflow-hidden",
                  expandedId === t.id && "shadow-xl border-brand-primary/20"
                )}
              >
                <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("h-3 w-3 sm:h-4 sm:w-4", i < (t.rating || 5) ? "text-brand-primary fill-brand-primary" : "text-slate-200")} />
                  ))}
                </div>
                <p className={cn(
                  "text-slate-600 text-xs sm:text-lg leading-relaxed mb-4 sm:mb-8 italic transition-all duration-500",
                  expandedId === t.id ? "" : "line-clamp-4 sm:line-clamp-none"
                )}>
                  "{t.message}"
                </p>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <User className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[10px] sm:text-base text-slate-900 truncate">{t.name}</div>
                    <div className="text-[8px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest truncate">Verified Partner</div>
                  </div>
                </div>
                
                {/* Mobile Indicator */}
                {!expandedId && (
                  <div className="sm:hidden absolute bottom-2 right-4 text-[6px] font-black uppercase text-brand-primary/40 flex items-center gap-1">
                    Read more <ArrowUpRight className="h-1.5 w-1.5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-primary rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8">
                Ready to Expand Your <br />Global Footprint?
              </h2>
              <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto">
                Join thousands of businesses that trust GlobalTrade for their international logistics and commerce needs.
              </p>
              <Link to="/contact-us" className="inline-flex px-12 py-5 bg-white text-brand-primary font-bold rounded-2xl hover:bg-slate-900 hover:text-white transition-all duration-500 shadow-xl shadow-black/10">
                Start Trading Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
