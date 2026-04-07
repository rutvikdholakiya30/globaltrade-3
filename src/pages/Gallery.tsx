import { useGallery, usePage } from '@/hooks/useData';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2 } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export function Gallery() {
  const { items, loading: galleryLoading } = useGallery();
  const { page, loading: pageLoading } = usePage('gallery');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loading = galleryLoading || pageLoading;

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
        ) : items.length > 0 ? (
          <div className="columns-3 lg:columns-6 gap-2 sm:gap-8 space-y-2 sm:space-y-8">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative group rounded-xl sm:rounded-[32px] overflow-hidden cursor-pointer bg-slate-50 transition-all border border-slate-100 shadow-sm hover:shadow-xl mb-2 sm:mb-8 break-inside-avoid"
                onClick={() => setSelectedImage(item.image_url)}
              >
                <img
                  src={item.image_url}
                  alt={item.caption || 'Gallery Image'}
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                  <div className="p-2 text-center">
                    <Maximize2 className="h-4 w-4 sm:h-8 sm:w-8 text-white mx-auto" />
                  </div>
                </div>
              </motion.div>
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
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-8 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full rounded-[40px] shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
