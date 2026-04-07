import { useGallery, usePage } from '@/hooks/useData';
import type { GalleryItem } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export function Gallery() {
  const { items, loading: galleryLoading } = useGallery();
  const { page, loading: pageLoading } = usePage('gallery');
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
 
    const isVideo = (url: string) => {
      return url?.match(/\.(mp4|webm|ogg|mov)$/i);
    };

    const loading = galleryLoading || pageLoading;

    const handleNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (selectedIndex !== null) {
        setSelectedIndex((selectedIndex + 1) % items.length);
      }
    };

    const handlePrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (selectedIndex !== null) {
        setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
      }
    };

    const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
      const category = item.category || 'Featured Operations';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, GalleryItem[]>);

    return (
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="bg-slate-50 pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <span className="section-label mx-auto">Visual Portfolio</span>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                {page?.title || 'Our Operations Gallery'}
              </h1>
              <div className="text-slate-500 text-sm sm:text-lg leading-relaxed prose prose-slate max-w-none">
                {page?.content ? (
                  <ReactMarkdown>{page.content}</ReactMarkdown>
                ) : (
                  <p>A visual journey through our global logistics, premium products, and international trade operations.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          {loading ? (
            <div className="columns-3 lg:columns-6 gap-2 sm:gap-8 space-y-2 sm:space-y-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-50 rounded-xl sm:rounded-3xl animate-pulse mb-2 sm:mb-8" />
              ))}
            </div>
          ) : Object.keys(groupedItems).length > 0 ? (
            <div className="space-y-20 sm:space-y-32">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category} className="space-y-8 sm:space-y-16">
                  <div className="flex items-center gap-6 sm:gap-10">
                    <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic shrink-0">
                      {category}
                    </h2>
                    <div className="h-1 flex-grow bg-slate-100 rounded-full" />
                  </div>
                  
                  <div className="columns-3 lg:columns-6 gap-2 sm:gap-8 space-y-2 sm:space-y-8">
                    {categoryItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative group rounded-xl sm:rounded-[32px] overflow-hidden cursor-pointer bg-slate-50 transition-all border border-slate-100 shadow-sm hover:shadow-xl mb-2 sm:mb-8 break-inside-avoid"
                        onClick={() => setSelectedIndex(items.indexOf(item))}
                      >
                        {isVideo(item.image_url) ? (
                          <video
                            src={item.image_url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                        ) : (
                          <img
                            src={item.image_url}
                            alt={item.caption || 'Gallery Image'}
                            className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                          <div className="p-2 text-center">
                            <Maximize2 className="h-4 w-4 sm:h-8 sm:w-8 text-white mx-auto" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Maximize2 className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Gallery Items Found</h3>
              <p className="text-slate-500 text-sm sm:text-base px-4">We are currently updating our visual portfolio. Please check back soon to see our latest operations.</p>
            </div>
          )}
        </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Navigation Buttons */}
            <button 
              onClick={handlePrev}
              className="absolute left-4 sm:left-8 p-3 sm:p-5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10 hidden sm:block backdrop-blur-md border border-white/10"
            >
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 rotate-180" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 sm:right-8 p-3 sm:p-5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10 hidden sm:block backdrop-blur-md border border-white/10"
            >
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>

            <div className="relative max-w-full max-h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              {isVideo(selectedItem.image_url) ? (
                <motion.video
                  key={selectedItem.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  src={selectedItem.image_url}
                  autoPlay
                  controls
                  className="max-w-full max-h-[85vh] rounded-2xl sm:rounded-[40px] shadow-2xl border border-white/10"
                />
              ) : (
                <motion.img
                  key={selectedItem.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  src={selectedItem.image_url}
                  alt="Full size"
                  className="max-w-full max-h-[85vh] rounded-2xl sm:rounded-[40px] shadow-2xl border border-white/10"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Caption Overlay */}
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <p className="text-white text-sm font-bold uppercase tracking-widest px-4 truncate">
                  {selectedItem.caption || 'Operational Archive Log'}
                </p>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
                  Asset ID: {selectedItem.id.split('-')[0]} • {selectedIndex! + 1} / {items.length}
                </p>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="absolute bottom-10 flex gap-6 sm:hidden pointer-events-auto">
               <button onClick={handlePrev} className="p-4 bg-white/10 text-white rounded-full border border-white/10 backdrop-blur-xl"><ChevronRight className="h-6 w-6 rotate-180" /></button>
               <button onClick={handleNext} className="p-4 bg-white/10 text-white rounded-full border border-white/10 backdrop-blur-xl"><ChevronRight className="h-6 w-6" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
