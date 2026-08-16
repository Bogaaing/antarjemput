import React from 'react';
import { Child, getReturnPeriod } from '../types';

interface ChildDetailBottomSheetProps {
  child: Child;
  onClose: () => void;
  onEdit: (child: Child) => void;
  onDelete: (childId: string) => void;
}

export const ChildDetailBottomSheet: React.FC<ChildDetailBottomSheetProps> = ({
  child,
  onClose,
  onEdit,
  onDelete,
}) => {
  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus profil ${child.name}?`)) {
      onDelete(child.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn">
      {/* Tap backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Modal Box */}
      <div className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t md:border border-[#E2E8F0] overflow-hidden max-h-[90vh] flex flex-col z-10">
        {/* Mobile Drag Handle Bar */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden bg-white shrink-0">
          <div className="w-12 h-1 bg-[#d1d5db] rounded-full"></div>
        </div>

        {/* Sheet Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white shrink-0">
          <h3 className="text-[18px] font-bold text-[#191b24] tracking-tight">
            Detail {child.name}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f7fb] hover:bg-[#e2e8f0] text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Sheet Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Timeline Schedule Section */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E2E8F0]">
            {/* Antar Node */}
            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#004ccd] ring-4 ring-white"></span>
              <div className="flex items-center justify-between gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#004ccd] text-[20px] mt-0.5">
                    two_wheeler
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-[#64748B]">Antar ke sekolah</p>
                    <p className="text-[20px] font-extrabold text-[#191b24] leading-tight">
                      {child.defaultPickupTime}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] font-medium mt-0.5">Senin - Jumat</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onEdit(child);
                  }}
                  className="px-3 py-1 rounded-xl bg-[#EFF6FF] text-[#004ccd] hover:bg-[#DBEAFE] text-[12px] font-bold transition-colors cursor-pointer"
                >
                  Ubah
                </button>
              </div>
            </div>

            {/* Jemput / Pulang Node */}
            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#0D9488] ring-4 ring-white"></span>
              <div className="flex items-center justify-between gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#0D9488] text-[20px] mt-0.5">
                    two_wheeler
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-[#64748B]">Pulang dari sekolah</p>
                    <p className="text-[20px] font-extrabold text-[#191b24] leading-tight">
                      {getReturnPeriod(child.defaultDropoffPeriod || child.defaultDropoffTime) === 'sore'
                        ? 'Sore (15:00)'
                        : 'Siang (12:00)'}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] font-medium mt-0.5">Senin - Jumat</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onEdit(child);
                  }}
                  className="px-3 py-1 rounded-xl bg-[#EFF6FF] text-[#004ccd] hover:bg-[#DBEAFE] text-[12px] font-bold transition-colors cursor-pointer"
                >
                  Ubah
                </button>
              </div>
            </div>
          </div>

          {/* Informasi Lainnya */}
          <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
            <h4 className="text-[14px] font-bold text-[#004ccd] uppercase tracking-wide">
              Informasi Lainnya
            </h4>

            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] space-y-2.5 text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Sekolah</span>
                <span className="font-bold text-[#191b24]">{child.school || 'SD Al-fath BSD'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Panggilan</span>
                <span className="font-bold text-[#191b24]">{child.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Peran</span>
                <span className="font-bold text-[#191b24]">{child.roleTag || 'Anak'}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#E2E8F0]">
                <span className="text-[#64748B]">Catatan</span>
                <span className="font-semibold text-[#191b24]">{child.notes || 'Tidak ada catatan'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => {
                onClose();
                onEdit(child);
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#004ccd] font-bold text-[14px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Edit</span>
            </button>

            <button
              onClick={handleDelete}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#FFF5F5] border border-[#FFDAD6] hover:bg-[#FEE2E2] text-[#DC2626] font-bold text-[14px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              <span>Hapus Anak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
