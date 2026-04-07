import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { usePage } from '@/hooks/useData';
import { motion } from 'motion/react';
import { AlertCircle, ChevronLeft } from 'lucide-react';

export function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const { page, loading } = usePage(slug || '');

  if (loading) {
    return (
      <div className="bg-white min-h-screen pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <div className="h-16 w-1/2 bg-slate-50 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-slate-50 rounded-full" />
            <div className="h-4 w-full bg-slate-50 rounded-full" />
            <div className="h-4 w-3/4 bg-slate-50 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="bg-white min-h-screen pt-32 px-8">
        <div className="max-w-7xl mx-auto text-center py-32 rounded-[40px] border-2 border-dashed border-slate-100 bg-slate-50/50 space-y-8">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-slate-200 mx-auto shadow-sm">
            <AlertCircle className="h-12 w-12" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-slate-900">Page Not Found</h1>
            <p className="text-slate-500 max-w-sm mx-auto">The page you are looking for might have been removed or is temporarily unavailable.</p>
          </div>
          <Link to="/" className="btn-primary inline-flex">
            <ChevronLeft className="h-5 w-5 mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              {page.title}
            </h1>
            <div className="h-1.5 w-24 bg-brand-primary mx-auto rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="prose prose-lg prose-slate max-w-none bg-white p-10 md:p-16 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200">
            <ReactMarkdown>{page.content}</ReactMarkdown>
          </div>

          <div className="mt-12 text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Last updated: {new Date(page.updated_at).toLocaleDateString()}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
