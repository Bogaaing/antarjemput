import React, { useState, useEffect } from 'react';

export const UpdatePrompt: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleUpdate = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setShowUpdate(true);
      }
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdate(true);
              }
            });
          }
        });

        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setShowUpdate(true);
        }
      }
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleReload = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-[#004ccd] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center justify-between gap-3 text-[13px] animate-fadeIn">
      <div className="flex items-center gap-2 font-medium">
        <span className="material-symbols-outlined text-[20px] text-[#ffd700]">update</span>
        <span>Versi baru aplikasi telah tersedia.</span>
      </div>

      <button
        onClick={handleReload}
        className="px-3 py-1 rounded-lg bg-white text-[#004ccd] font-bold text-[12px] hover:bg-[#F4F7FB] transition-colors cursor-pointer shrink-0 shadow-xs"
      >
        Muat Ulang
      </button>
    </div>
  );
};
