import React from 'react';
import { TabType, UserProfile } from '../types';

interface MobileNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  user: UserProfile;
  title?: string;
  onOpenProfileModal?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  user,
  title,
  onOpenProfileModal,
}) => {
  return (
    <>
      {/* Mobile Top Header */}
      <header className="flex justify-between items-center w-full px-4 py-3.5 bg-white border-b border-[#E2E8F0] md:hidden sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0f62fe] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              airport_shuttle
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#004ccd] tracking-tight">
            {title || 'AntarJemputKu'}
          </h1>
        </div>

        <button
          onClick={onOpenProfileModal}
          className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
          aria-label="User Profile"
        >
          <div className="w-8 h-8 rounded-full bg-[#0f62fe] text-white flex items-center justify-center font-bold text-[12px] shadow-xs overflow-hidden border border-[#E2E8F0]">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              'UP'
            )}
          </div>
        </button>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 pb-safe bg-white border-t border-[#E2E8F0] shadow-lg md:hidden h-16 pt-1">
        <button
          id="nav-mobile-calendar"
          onClick={() => onSelectTab('calendar')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all scale-95 active:scale-90 w-1/4 cursor-pointer ${
            currentTab === 'calendar'
              ? 'bg-[#0f62fe] text-white shadow-xs'
              : 'text-[#424656] hover:bg-[#f2f3ff]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px] mb-0.5"
            style={currentTab === 'calendar' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            calendar_today
          </span>
          <span className="text-[11px] font-semibold">Calendar</span>
        </button>

        <button
          id="nav-mobile-history"
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all scale-95 active:scale-90 w-1/4 cursor-pointer ${
            currentTab === 'history'
              ? 'bg-[#0f62fe] text-white shadow-xs'
              : 'text-[#424656] hover:bg-[#f2f3ff]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px] mb-0.5"
            style={currentTab === 'history' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            history
          </span>
          <span className="text-[11px] font-semibold">History</span>
        </button>

        <button
          id="nav-mobile-children"
          onClick={() => onSelectTab('children')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all scale-95 active:scale-90 w-1/4 cursor-pointer ${
            currentTab === 'children'
              ? 'bg-[#0f62fe] text-white shadow-xs'
              : 'text-[#424656] hover:bg-[#f2f3ff]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px] mb-0.5"
            style={currentTab === 'children' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            child_care
          </span>
          <span className="text-[11px] font-semibold">Children</span>
        </button>

        <button
          id="nav-mobile-pricing"
          onClick={() => onSelectTab('pricing')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all scale-95 active:scale-90 w-1/4 cursor-pointer ${
            currentTab === 'pricing'
              ? 'bg-[#0f62fe] text-white shadow-xs'
              : 'text-[#424656] hover:bg-[#f2f3ff]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px] mb-0.5"
            style={currentTab === 'pricing' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            settings
          </span>
          <span className="text-[11px] font-semibold">Settings</span>
        </button>
      </nav>
    </>
  );
};
