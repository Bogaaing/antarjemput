import React, { useState } from 'react';
import { Child } from '../types';

interface ChildrenManagementViewProps {
  childrenList: Child[];
  onAddChild: () => void;
  onEditChild: (child: Child) => void;
  onViewChildDetail?: (child: Child) => void;
  onDeleteChild?: (childId: string) => void;
}

export const ChildrenManagementView: React.FC<ChildrenManagementViewProps> = ({
  childrenList,
  onAddChild,
  onEditChild,
  onViewChildDetail,
  onDeleteChild,
}) => {
  const [sortBy, setSortBy] = useState<'default' | 'name-asc' | 'name-desc' | 'role'>('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeMenuChildId, setActiveMenuChildId] = useState<string | null>(null);

  // Sorting logic
  const sortedChildren = [...childrenList].sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'role') {
      if (a.roleTag === 'Kakak' && b.roleTag !== 'Kakak') return -1;
      if (a.roleTag !== 'Kakak' && b.roleTag === 'Kakak') return 1;
    }
    return 0;
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5 pb-28 md:pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-[26px] md:text-[32px] font-extrabold text-[#191b24] tracking-tight leading-tight">
            Anak Saya
          </h2>
          <p className="text-[13px] md:text-[14px] text-[#64748B] font-medium mt-0.5">
            Kelola profil anak dan jadwal default antar jemput keluarga.
          </p>
        </div>

        {/* Sort Button with Dropdown */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[13px] font-bold text-[#191b24] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#64748B]">
              sort
            </span>
            <span>Urutkan</span>
            <span className="material-symbols-outlined text-[16px] text-[#94A3B8]">
              expand_more
            </span>
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg p-1.5 z-20 space-y-1 animate-fadeIn">
              <button
                onClick={() => {
                  setSortBy('default');
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-bold transition-colors ${
                  sortBy === 'default' ? 'bg-[#EFF6FF] text-[#004ccd]' : 'text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                Urutan Default
              </button>
              <button
                onClick={() => {
                  setSortBy('name-asc');
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-bold transition-colors ${
                  sortBy === 'name-asc' ? 'bg-[#EFF6FF] text-[#004ccd]' : 'text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                Nama A – Z
              </button>
              <button
                onClick={() => {
                  setSortBy('name-desc');
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-bold transition-colors ${
                  sortBy === 'name-desc' ? 'bg-[#EFF6FF] text-[#004ccd]' : 'text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                Nama Z – A
              </button>
              <button
                onClick={() => {
                  setSortBy('role');
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-bold transition-colors ${
                  sortBy === 'role' ? 'bg-[#EFF6FF] text-[#004ccd]' : 'text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                Peran (Kakak / Adik)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Empty State */}
      {childrenList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-10 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EFF6FF] text-[#004ccd] flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">family_restroom</span>
          </div>
          <div className="max-w-md">
            <h3 className="text-[18px] font-bold text-[#191b24]">Belum Ada Data Anak</h3>
            <p className="text-[13px] text-[#64748B] mt-1">
              Tambahkan profil anak untuk mulai mengatur jadwal default antar jemput keluarga.
            </p>
          </div>
          <button
            onClick={onAddChild}
            className="bg-[#004ccd] hover:bg-[#003da9] text-white px-6 py-3 rounded-2xl font-bold text-[14px] shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tambah Anak Baru</span>
          </button>
        </div>
      ) : (
        /* 3. Children Cards Vertical List */
        <div className="space-y-4">
          {sortedChildren.map((child) => {
            const isKakak = child.roleTag === 'Kakak';

            return (
              <div
                key={child.id}
                className="bg-white rounded-3xl border border-[#E2E8F0] p-5 md:p-6 shadow-xs hover:border-[#004ccd] transition-all space-y-4 relative group"
              >
                {/* Card Top Row: Photo, Name, Badge, 3-dots */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    {/* Circular Photo */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F4F7FB] border-2 border-white shadow-xs overflow-hidden shrink-0">
                      <img
                        src={child.avatarUrl}
                        alt={child.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#191b24] tracking-tight leading-tight">
                          {child.name}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isKakak
                              ? 'bg-[#D1FAE5] text-[#065F46]'
                              : 'bg-[#DBEAFE] text-[#1E40AF]'
                          }`}
                        >
                          {child.roleTag || 'Anak'}
                        </span>
                      </div>
                      <p className="text-[12px] sm:text-[13px] text-[#64748B] font-medium mt-0.5">
                        {child.school || 'SD Al-fath BSD'}
                      </p>
                    </div>
                  </div>

                  {/* 3-Dots Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuChildId(activeMenuChildId === child.id ? null : child.id)
                      }
                      className="w-8 h-8 rounded-full hover:bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8] hover:text-[#191b24] transition-colors cursor-pointer"
                      aria-label="Menu Opsi"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>

                    {activeMenuChildId === child.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg p-1.5 z-20 space-y-1 animate-fadeIn">
                        <button
                          onClick={() => {
                            setActiveMenuChildId(null);
                            onEditChild(child);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-bold text-[#191b24] hover:bg-[#F8FAFC] flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#004ccd]">edit</span>
                          <span>Edit Profil</span>
                        </button>
                        {onDeleteChild && (
                          <button
                            onClick={() => {
                              setActiveMenuChildId(null);
                              if (confirm(`Apakah Anda yakin ingin menghapus profil ${child.name}?`)) {
                                onDeleteChild(child.id);
                              }
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-bold text-[#DC2626] hover:bg-[#FFF5F5] flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Twin Boxes */}
                <div className="grid grid-cols-2 gap-3">
                  {/* ANTAR Box */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#004ccd]">
                      <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">
                        ANTAR
                      </span>
                    </div>
                    <p className="text-[24px] sm:text-[28px] font-extrabold text-[#191b24] tracking-tight leading-none pt-1">
                      {child.defaultPickupTime}
                    </p>
                    <p className="text-[11px] text-[#64748B] font-medium pt-0.5">Senin - Jumat</p>
                  </div>

                  {/* JEMPUT Box */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#0D9488]">
                      <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">
                        JEMPUT
                      </span>
                    </div>
                    <p className="text-[24px] sm:text-[28px] font-extrabold text-[#191b24] tracking-tight leading-none pt-1">
                      {child.defaultDropoffTime}
                    </p>
                    <p className="text-[11px] text-[#64748B] font-medium pt-0.5">Senin - Jumat</p>
                  </div>
                </div>

                {/* Card Footer: Lihat Detail Action */}
                <div
                  onClick={() => {
                    if (onViewChildDetail) {
                      onViewChildDetail(child);
                    } else {
                      onEditChild(child);
                    }
                  }}
                  className="flex items-center justify-between pt-1 text-[#004ccd] font-bold text-[13px] cursor-pointer hover:underline"
                >
                  <span>Lihat Detail</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Outlined Add Child Button */}
      <button
        id="btn-add-child-bottom"
        onClick={onAddChild}
        className="w-full py-3.5 px-4 rounded-2xl border-2 border-[#004ccd]/30 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#004ccd] font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
      >
        <span className="material-symbols-outlined text-[20px]">person_add</span>
        <span>Tambah Anak Baru</span>
      </button>

      {/* 5. Mobile Floating Action Button (FAB) */}
      <button
        id="btn-mobile-fab-child"
        onClick={onAddChild}
        className="md:hidden fixed bottom-20 right-4 z-30 bg-[#004ccd] text-white w-13 h-13 rounded-full shadow-lg flex items-center justify-center hover:bg-[#003da9] active:scale-95 transition-transform cursor-pointer"
        aria-label="Tambah Anak"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
};
