import { useEffect, useState } from 'react';

type ErrorModalProps = {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  title?: string;
};

export const ErrorModal = ({ isOpen, message, onClose, title = "Action Not Allowed" }: ErrorModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      // Delay unmounting for exit animation
      const timer = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div 
        className={`relative w-full max-w-sm bg-acmDark border border-acmBorder/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
      >
        {/* Top red warning border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/80 to-rose-500/80" />
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0 animate-pulse-dot">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{title}</h3>
            </div>
          </div>
          
          <p className="text-sm text-slate-400 mb-6 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-acmBorder/50">
            {message}
          </p>
          
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="acm-btn-ghost text-sm px-5 py-2 font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
