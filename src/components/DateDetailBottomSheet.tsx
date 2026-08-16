import React from 'react';
import { DailyTransportRecord, Child, formatRupiah, formatDateIndo, getReturnPeriod } from '../types';

interface DateDetailBottomSheetProps {
  dateStr: string;
  record: DailyTransportRecord | null;
  childrenList: Child[];
  onClose: () => void;
  onAddTransaction: (dateStr: string) => void;
  onEditTransaction: (record: DailyTransportRecord) => void;
  onTogglePayment?: (recordId: string) => void;
  onDeleteTransaction?: (recordId: string) => void;
}

export const DateDetailBottomSheet: React.FC<DateDetailBottomSheetProps> = ({
  dateStr,
  record,
  childrenList,
  onClose,
  onAddTransaction,
  onEditTransaction,
  onTogglePayment,
  onDeleteTransaction,
}) => {
  const isPaid = record?.paymentStatus === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Modal Box */}
      <div className="relative w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] border-t md:border border-[#E2E8F0] overflow-hidden max-h-[85vh] flex flex-col z-10">
        {/* Mobile Drag Handle Bar */}
        <div className="w-full flex justify-center pt-2.5 pb-1 md:hidden bg-white shrink-0">
          <div className="w-12 h-1 bg-[#d1d5db] rounded-full"></div>
        </div>

        {/* Date Header */}
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex justify-between items-center bg-white shrink-0">
          <h3 className="text-[17px] font-bold text-[#191b24] tracking-tight">
            {formatDateIndo(dateStr)}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f7fb] hover:bg-[#e2e8f0] text-[#737687] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Sheet Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {record ? (
            <>
              {/* Children Transport Schedule Items */}
              <div className="space-y-3">
                {record.children.map((childSchedule) => {
                  const childInfo = childrenList.find((c) => c.id === childSchedule.childId);
                  const nameUpper = (childInfo?.name || 'ANAK').toUpperCase();

                  return (
                    <div
                      key={childSchedule.childId}
                      className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#004ccd]"></span>
                        <h4 className="font-bold text-[#191b24] text-[14px] uppercase tracking-wide">
                          {nameUpper}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[13px]">
                        <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                          <span className="text-[#64748B]">Antar</span>
                          <span className="font-bold text-[#191b24]">
                            {childSchedule.pickupTime || record.sharedPickupTime}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                          <span className="text-[#64748B]">Pulang</span>
                          <span className="font-bold text-[#191b24]">
                            {getReturnPeriod(childSchedule.dropoffPeriod || childSchedule.dropoffTime) === 'sore'
                              ? 'Sore'
                              : 'Siang'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fee & Payment Status */}
              <div className="pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
                <div>
                  <p className="text-[12px] text-[#64748B] font-medium">Biaya</p>
                  <p className="text-[22px] font-bold text-[#004ccd] tracking-tight">
                    {formatRupiah(record.totalFee)}
                  </p>
                  <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                    {record.additionalFee > 0 || record.hasDifferentDropoff
                      ? 'Tarif normal Rp50k + Tambahan sore Rp15k'
                      : 'Tarif normal (Pulang Siang)'}
                  </p>
                </div>

                <div>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-bold bg-[#198754]/10 text-[#198754] border border-[#198754]/20">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Lunas
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-bold bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/20">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      Belum dibayar
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2">
                {onTogglePayment && (
                  <button
                    onClick={() => {
                      onTogglePayment(record.id);
                      onClose();
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-[13px] transition-colors cursor-pointer border ${
                      isPaid
                        ? 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1] hover:bg-[#E2E8F0]'
                        : 'bg-[#198754] text-white border-[#198754] hover:bg-[#157347]'
                    }`}
                  >
                    {isPaid ? 'Batal Lunas' : '✓ Tandai Lunas'}
                  </button>
                )}

                <button
                  onClick={() => {
                    onClose();
                    onEditTransaction(record);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#1E293B] font-bold text-[13px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Edit</span>
                </button>

                {onDeleteTransaction && (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus transaksi tanggal ${formatDateIndo(dateStr)}?`)) {
                        onDeleteTransaction(record.id);
                        onClose();
                      }
                    }}
                    className="p-2.5 rounded-xl bg-[#FFF5F5] border border-[#FECDD3] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer flex items-center justify-center"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Empty State for Tapped Date */
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">event_busy</span>
              </div>
              <p className="text-[14px] text-[#64748B] font-medium">
                Belum ada jadwal antar-jemput.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onAddTransaction(dateStr);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#004ccd] hover:bg-[#003da9] text-white font-bold text-[14px] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Tambah Antar-Jemput</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
