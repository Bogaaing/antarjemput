import React from 'react';
import { TabType, UserProfile, getInitials } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  user: UserProfile;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
}) => {
  const navItems = [
    { id: 'calendar' as TabType, label: 'Calendar', icon: 'calendar_today' },
    { id: 'history' as TabType, label: 'History', icon: 'history' },
    { id: 'children' as TabType, label: 'Children', icon: 'child_care' },
    { id: 'reports' as TabType, label: 'Reports', icon: 'assessment' },
    { id: 'pricing' as TabType, label: 'Pricing Rules', icon: 'receipt_long' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 py-6 bg-[#ecedfa] border-r border-[#E2E8F0] w-[280px] z-40 transition-all duration-200 ease-in-out">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0f62fe] text-white flex items-center justify-center font-bold text-xl shadow-sm">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            airport_shuttle
          </span>
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-[#004ccd] tracking-tight leading-tight">AntarJemputKu</h1>
          <p className="text-[12px] font-medium text-[#424656]">Family Logistics</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-desktop-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg text-[14px] font-medium transition-all duration-200 text-left cursor-pointer ${
                isActive
                  ? 'bg-[#0f62fe] text-white shadow-sm font-semibold'
                  : 'text-[#424656] hover:bg-[#e7e7f4] hover:text-[#191b24]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Profile & Logout Bottom Section */}
      <div className="mt-auto px-5 pt-4 border-t border-[#E2E8F0]/80">
        <div className="flex items-center justify-between gap-3 bg-white/80 p-2.5 rounded-xl border border-[#E2E8F0]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#0f62fe] text-white flex items-center justify-center font-bold text-[13px] tracking-wider shrink-0 border border-[#0f62fe] shadow-xs">
              {getInitials(user.name)}
            </div>
            <div className="truncate">
              <p className="text-[13px] font-semibold text-[#191b24] truncate leading-snug">{user.name}</p>
              <p className="text-[11px] text-[#737687] truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Keluar"
            className="p-1.5 text-[#737687] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
            aria-label="Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
