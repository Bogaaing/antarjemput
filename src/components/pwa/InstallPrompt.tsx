import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if user dismissed prompt previously
    const isDismissed = localStorage.getItem('pwa_install_dismissed') === 'true';

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice && !isDismissed) {
      // Show iOS specific prompt after 3 seconds
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Error triggering PWA install prompt:', err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-white rounded-2xl p-4 shadow-2xl border border-[#0f62fe]/30 animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0f62fe] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[26px]">airport_shuttle</span>
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-[#191b24] leading-tight">Pasang AntarJemputKu</h4>
            <p className="text-[12px] text-[#424656] mt-0.5">
              Akses cepat langsung dari Home Screen tanpa perlu browser.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-[#737687] hover:text-[#191b24] p-1 cursor-pointer"
          aria-label="Tutup prompt"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {showIOSGuide && (
        <div className="mt-3 p-3 bg-[#F4F7FB] rounded-xl text-[12px] text-[#424656] border border-[#E2E8F0] space-y-1">
          <p className="font-semibold text-[#004ccd]">Cara pasang di iPhone / iPad:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
            <li>Ketuk tombol <strong>Bagikan (Share)</strong> <span className="material-symbols-outlined text-[14px] inline-block align-middle">share</span> di bawah Safari.</li>
            <li>Pilih <strong>Tambah ke Utama (Add to Home Screen)</strong>.</li>
          </ol>
        </div>
      )}

      <div className="mt-3.5 flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
        <button
          onClick={handleDismiss}
          className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold text-[#737687] hover:bg-[#F4F7FB] transition-colors cursor-pointer"
        >
          Nanti
        </button>
        <button
          onClick={handleInstallClick}
          className="px-4 py-1.5 rounded-lg bg-[#0f62fe] hover:bg-[#004ccd] text-white text-[13px] font-semibold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Pasang Aplikasi</span>
        </button>
      </div>
    </div>
  );
};
