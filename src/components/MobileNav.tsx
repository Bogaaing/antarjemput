import React from 'react';
import { TabType, UserProfile, getInitials } from '../types';

interface MobileNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  user: UserProfile;
  title?: string;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  user,
  onOpenProfileModal,
  onLogout,
}) => {
  return (
    <>
      {/* Mobile Top Header (64-72px compact) */}
      <header className="flex justify-between items-center w-full px-4 py-3.5 bg-white border-b border-[#E2E8F0] md:hidden sticky top-0 z-30 shadow-xs h-[64px]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0f62fe] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              directions_car
            </span>
          </div>
          <h1 className="text-[19px] font-bold text-[#004ccd] tracking-tight truncate">
            AntarJemputKu
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Parent Profile Initials Avatar */}
          <button
            onClick={onOpenProfileModal}
            className="w-9 h-9 rounded-full bg-[#004ccd] text-white flex items-center justify-center font-bold text-[13px] tracking-wider shadow-xs border border-[#004ccd] active:scale-95 transition-transform cursor-pointer"
            aria-label="User Profile"
            title={`Profil: ${user.name}`}
          >
            {getInitials(user.name)}
          </button>

          {/* Logout Icon */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-full bg-[#fff5f5] hover:bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]/60 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
              aria-label="Logout"
              title="Keluar"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 pb-safe bg-white border-t border-[#E2E8F0] shadow-lg md:hidden h-16 pt-1">
        <button
          id="nav-mobile-calendar"
          onClick={() => onSelectTab('calendar')}
          className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all scale-95 active:scale-90 w-1/4 cursor-pointer relative ${
            currentTab === 'calendar'
              ? 'text-[#004ccd] font-bold'
              : 'text-[#424656] hover:text-[#191b24]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px] mb-0.5"
            style={currentTab === 'calendar' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            calendar_today
          </span>
          <span className="text-[11px]">Kalender</span>
          {currentTab === 'calendar' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-[#004ccd] rounded-full"></span>
          )}
        </button>

        <button
          id="nav-mobile-history"
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all scale-95 active:scale-90 w-1/4 cursor-pointer relative ${
            currentTab === 'history'
              ? 'text-[#004ccd] font-bold'
              : 'text-[#424656] hover:text-[#191b24]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px] mb-0.5"
            style={currentTab === 'history' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            history
          </span>
          <span className="text-[11px]">Riwayat</span>
          {currentTab === 'history' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-[#004ccd] rounded-full"></span>
          )}
        </button>

        <button
          id="nav-mobile-children"
          onClick={() => onSelectTab('children')}
          className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all scale-95 active:scale-90 w-1/4 cursor-pointer relative ${
            currentTab === 'children'
              ? 'text-[#004ccd] font-bold'
              : 'text-[#424656] hover:text-[#191b24]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px] mb-0.5"
            style={currentTab === 'children' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            group
          </span>
          <span className="text-[11px]">Anak</span>
          {currentTab === 'children' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-[#004ccd] rounded-full"></span>
          )}
        </button>

        <button
          id="nav-mobile-pricing"
          onClick={() => onSelectTab('pricing')}
          className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all scale-95 active:scale-90 w-1/4 cursor-pointer relative ${
            currentTab === 'pricing'
              ? 'text-[#004ccd] font-bold'
              : 'text-[#424656] hover:text-[#191b24]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px] mb-0.5"
            style={currentTab === 'pricing' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            settings
          </span>
          <span className="text-[11px]">Pengaturan</span>
          {currentTab === 'pricing' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-[#004ccd] rounded-full"></span>
          )}
        </button>
      </nav>
    </>
  );
};

