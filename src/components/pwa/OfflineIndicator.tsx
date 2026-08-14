import React, { useState, useEffect } from 'react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showRecoveredToast, setShowRecoveredToast] = useState<boolean>(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowRecoveredToast(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRecoveredToast(true);
      const timer = setTimeout(() => {
        setShowRecoveredToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showRecoveredToast) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-none transition-all duration-300 animate-fadeIn">
      {isOffline ? (
        <div className="bg-[#ba1a1a] text-white px-4 py-2.5 rounded-xl shadow-lg border border-[#ba1a1a]/30 flex items-center justify-between text-[12px] font-semibold pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>Anda sedang offline. Beberapa data mungkin belum terbaru.</span>
          </div>
        </div>
      ) : (
        <div className="bg-[#15803d] text-white px-4 py-2.5 rounded-xl shadow-lg border border-[#15803d]/30 flex items-center justify-between text-[12px] font-semibold pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">wifi</span>
            <span>Koneksi internet kembali terhubung.</span>
          </div>
        </div>
      )}
    </div>
  );
};
