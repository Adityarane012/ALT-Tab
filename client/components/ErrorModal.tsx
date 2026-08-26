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
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="/warning_icon.png" alt="Warning" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
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
