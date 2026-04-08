import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Trash2, LogOut } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  icon
}: ConfirmDialogProps) {
  const Icon = icon || (variant === 'danger' ? <Trash2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with premium blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-black/20 border border-gray-100 overflow-hidden"
          >
            {/* Header / Accent Bar */}
            <div className={`h-2 w-full ${variant === 'danger' ? 'bg-red-600' : 'bg-amber-500'}`} />

            <div className="p-8 sm:p-10">
              {/* Icon & Close */}
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${
                  variant === 'danger' ? 'bg-red-50 text-red-600' : 
                  variant === 'warning' ? 'bg-amber-50 text-amber-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                  {title}
                </h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-10">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-gray-50 text-gray-900 font-bold rounded-2xl text-sm uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "flex-1 px-6 py-4 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2",
                    variant === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-200" : 
                    variant === 'warning' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" :
                    "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                  )}
                >
                  {Icon}
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
