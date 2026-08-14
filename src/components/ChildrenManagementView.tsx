import React from 'react';
import { Child } from '../types';

interface ChildrenManagementViewProps {
  childrenList: Child[];
  onAddChild: () => void;
  onEditChild: (child: Child) => void;
  onDeleteChild?: (childId: string) => void;
}

export const ChildrenManagementView: React.FC<ChildrenManagementViewProps> = ({
  childrenList,
  onAddChild,
  onEditChild,
}) => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-28 md:pb-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[24px] md:text-[32px] font-bold text-[#191b24] tracking-tight">
            Children Management
          </h2>
          <p className="text-[14px] text-[#424656] mt-1">
            Kelola profil anak dan jadwal default antar jemput keluarga.
          </p>
        </div>

        {/* Desktop Add Button */}
        <button
          id="btn-desktop-add-child"
          onClick={onAddChild}
          className="hidden md:flex items-center gap-2 bg-[#004ccd] hover:bg-[#003da9] text-white px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-md text-[13px] font-semibold cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Tambah Anak</span>
        </button>
      </div>

      {/* Empty State when no children exist in database */}
      {childrenList.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f2f3ff] text-[#004ccd] flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">child_care</span>
          </div>
          <div className="max-w-md">
            <h3 className="text-[18px] font-bold text-[#191b24]">Belum Ada Data Anak</h3>
            <p className="text-[14px] text-[#424656] mt-1">
              Tambahkan profil anak Anda ke database untuk mulai menjadwalkan antar-jemput dan menghitung tarif secara otomatis.
            </p>
          </div>
          <button
            onClick={onAddChild}
            className="bg-[#004ccd] hover:bg-[#003da9] text-white px-6 py-3 rounded-xl font-semibold text-[14px] shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tambah Anak Pertama</span>
          </button>
        </div>
      ) : (
        /* Children Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {childrenList.map((child, index) => {
            const isSecond = index % 2 === 1;

            return (
              <div
                key={child.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_4px_12px_rgba(15,98,254,0.08)] hover:-translate-y-0.5 transition-transform duration-300 relative overflow-hidden group"
              >
                {/* Background Accent Blob */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-0 opacity-20 transition-transform group-hover:scale-110 ${
                    isSecond ? 'bg-[#97f2ef]' : 'bg-[#dbe1ff]'
                  }`}
                ></div>

                {/* Card Header */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#ecedfa] flex items-center justify-center text-[#004ccd] overflow-hidden border-2 border-white shadow-xs shrink-0">
                      <img
                        src={child.avatarUrl}
                        alt={child.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-bold text-[#191b24] tracking-tight">{child.name}</h3>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold mt-1 ${
                          child.roleTag === 'Kakak'
                            ? 'bg-[#94efec] text-[#006e6d]'
                            : 'bg-[#dbe1ff] text-[#003da9]'
                        }`}
                      >
                        {child.roleTag}
                      </span>
                      {child.school && (
                        <p className="text-[11px] text-[#737687] mt-0.5">{child.school}</p>
                      )}
                    </div>
                  </div>

                  <button
                    id={`btn-edit-child-${child.id}`}
                    onClick={() => onEditChild(child)}
                    aria-label={`Edit ${child.name} profile`}
                    className="text-[#737687] hover:text-[#004ccd] hover:bg-[#f2f3ff] transition-colors p-2 rounded-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </div>

                {/* Schedule Info Box */}
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {/* Antar */}
                  <div className="bg-[#F4F7FB] p-3.5 rounded-lg border border-[#E2E8F0]">
                    <div className="flex items-center gap-1.5 text-[#424656] mb-1">
                      <span className="material-symbols-outlined text-[16px] text-[#004ccd]">two_wheeler</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Antar</span>
                    </div>
                    <div className="text-[24px] font-bold text-[#191b24] tracking-tight">
                      {child.defaultPickupTime}
                    </div>
                  </div>

                  {/* Jemput */}
                  <div className="bg-[#F4F7FB] p-3.5 rounded-lg border border-[#E2E8F0]">
                    <div className="flex items-center gap-1.5 text-[#424656] mb-1">
                      <span className="material-symbols-outlined text-[16px] text-[#006a68]">two_wheeler</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Jemput</span>
                    </div>
                    <div className="text-[24px] font-bold text-[#191b24] tracking-tight">
                      {child.defaultDropoffTime}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <button
        id="btn-mobile-add-child"
        onClick={onAddChild}
        className="md:hidden fixed bottom-20 right-4 z-30 bg-[#004ccd] text-white w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center hover:bg-[#003da9] active:scale-95 transition-all cursor-pointer"
        aria-label="Add child"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
};
