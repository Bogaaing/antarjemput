import React from 'react';
import { DailyTransportRecord, Child, formatRupiah, formatDateIndo } from '../types';

interface TransactionDetailModalProps {
  record: DailyTransportRecord;
  childrenList: Child[];
  onClose: () => void;
  onEdit: (record: DailyTransportRecord) => void;
  onTogglePayment: (recordId: string) => void;
  onDelete?: (recordId: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  record,
  childrenList,
  onClose,
  onEdit,
  onTogglePayment,
  onDelete,
}) => {
  const isPaid = record.paymentStatus === 'paid';
  const hasExtra = record.hasDifferentDropoff || record.additionalFee > 0;

  const handleDelete = () => {
    if (confirm(`Hapus transaksi tanggal ${formatDateIndo(record.date)}?`)) {
      if (onDelete) {
        onDelete(record.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-xs transition-all animate-fadeIn">
      {/* Modal / Bottom Sheet Container */}
      <div className="w-full md:max-w-2xl bg-white rounded-t-2xl md:rounded-2xl shadow-[0_-8px_24px_rgba(15,98,254,0.12)] md:shadow-[0_8px_32px_rgba(15,98,254,0.12)] border-t md:border border-[#E2E8F0] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Drag handle for mobile */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden bg-white">
          <div className="w-12 h-1.5 bg-[#c3c6d8] rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 md:py-5 border-b border-[#E2E8F0] flex justify-between items-start bg-white z-10 shrink-0">
          <div>
            <p className="text-[12px] font-semibold text-[#424656] uppercase tracking-wider mb-0.5">
              Jadwal Harian
            </p>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#191b24] tracking-tight">
              {formatDateIndo(record.date)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#198754]/10 text-[#198754] border border-[#198754]/20">
              <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span>
              Selesai
            </span>

            <button
              onClick={onClose}
              className="text-[#737687] hover:text-[#191b24] p-1.5 rounded-full hover:bg-[#F4F7FB] transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Total Display Box */}
          <div className="flex flex-col items-center justify-center py-5 bg-[#faf8ff] rounded-xl border border-[#E2E8F0]">
            <p className="text-[12px] font-semibold text-[#424656] uppercase tracking-wider mb-1">
              Total Biaya Hari Ini
            </p>
            <h3 className="text-[30px] font-bold text-[#004ccd] tracking-tight">
              {formatRupiah(record.totalFee)}
            </h3>

            <div className="mt-3">
              <button
                onClick={() => onTogglePayment(record.id)}
                className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                  isPaid
                    ? 'bg-[#198754]/10 text-[#198754] border border-[#198754]/30 hover:bg-[#198754]/20'
                    : 'bg-[#F59E0B]/10 text-[#b45309] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20'
                }`}
                title="Klik untuk mengubah status pembayaran"
              >
                <span className="material-symbols-outlined text-[16px] mr-1.5">
                  {isPaid ? 'check_circle' : 'schedule'}
                </span>
                <span>{isPaid ? 'Sudah Dibayar (Lunas)' : 'Belum Dibayar (Klik utk Lunas)'}</span>
              </button>
            </div>
          </div>

          {/* Child Breakdown (Bento Grid Style) */}
          <div>
            <h4 className="text-[18px] font-bold text-[#191b24] mb-3.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ccd]">group</span>
              Detail Anak
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {record.children.map((childSchedule) => {
                const childInfo = childrenList.find((c) => c.id === childSchedule.childId);
                const isAbid = childInfo?.name.toUpperCase().includes('ABID');

                return (
                  <div
                    key={childSchedule.childId}
                    className="bg-[#F4F7FB] rounded-xl p-4 border border-[#E2E8F0] flex flex-col relative overflow-hidden group hover:border-[#0f62fe] transition-colors"
                  >
                    <div
                      className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-30 ${
                        isAbid ? 'bg-[#0f62fe]' : 'bg-[#006a68]'
                      }`}
                    ></div>

                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base overflow-hidden border border-white shrink-0 ${
                          isAbid
                            ? 'bg-[#94efec] text-[#006e6d]'
                            : 'bg-[#ffdbd0] text-[#832700]'
                        }`}
                      >
                        {childInfo?.avatarUrl ? (
                          <img
                            src={childInfo.avatarUrl}
                            alt={childInfo.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          childInfo?.name.charAt(0) || 'A'
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#191b24] text-[16px]">
                          {childInfo?.name || 'Anak'}
                        </p>
                        <p className="text-[12px] font-medium text-[#424656]">
                          {childInfo?.roleTag || 'Anak'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 mt-auto relative z-10">
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-xs">
                        <div className="flex items-center gap-2 text-[#424656]">
                          <span className="material-symbols-outlined text-[18px] text-[#004ccd]">
                            two_wheeler
                          </span>
                          <span className="text-[13px] font-medium">Antar</span>
                        </div>
                        <span className="font-semibold text-[#191b24] text-[14px]">
                          {childSchedule.pickupTime || record.sharedPickupTime}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-xs">
                        <div className="flex items-center gap-2 text-[#424656]">
                          <span className="material-symbols-outlined text-[18px] text-[#006a68]">
                            two_wheeler
                          </span>
                          <span className="text-[13px] font-medium">Jemput</span>
                        </div>
                        <span className="font-semibold text-[#191b24] text-[14px]">
                          {childSchedule.dropoffTime}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h4 className="text-[18px] font-bold text-[#191b24] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ccd]">payments</span>
              Rincian Biaya
            </h4>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
              <div className="flex justify-between items-center p-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ecedfa] flex items-center justify-center text-[#424656]">
                    <span className="material-symbols-outlined text-[18px]">directions_car</span>
                  </div>
                  <span className="text-[15px] text-[#191b24]">Biaya Dasar PP</span>
                </div>
                <span className="text-[15px] font-semibold text-[#191b24]">
                  {formatRupiah(record.baseFee)}
                </span>
              </div>

              {hasExtra && (
                <div className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#93000a]">
                      <span className="material-symbols-outlined text-[18px]">more_time</span>
                    </div>
                    <div>
                      <span className="text-[15px] text-[#191b24] block">
                        Tambahan (Jemput Siang / Beda Jam)
                      </span>
                      {record.notes && (
                        <span className="text-[12px] text-[#737687]">{record.notes}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[15px] font-semibold text-[#191b24]">
                    {formatRupiah(record.additionalFee)}
                  </span>
                </div>
              )}

              <div className="bg-[#faf8ff] p-4 border-t border-[#E2E8F0] flex justify-between items-center">
                <span className="font-bold text-[#191b24] text-[15px]">Total</span>
                <span className="font-bold text-[#004ccd] text-[20px]">
                  {formatRupiah(record.totalFee)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white pb-safe md:pb-4 flex gap-3 shrink-0 items-center">
          {onDelete && (
            <button
              id="btn-delete-transaction"
              onClick={handleDelete}
              className="py-3 px-3.5 rounded-xl border border-[#ffdad6] text-[#ba1a1a] font-semibold hover:bg-[#fff5f5] transition-all flex items-center justify-center gap-1.5 text-[14px] cursor-pointer"
              title="Hapus Transaksi"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}

          <button
            id="btn-edit-transaction"
            onClick={() => onEdit(record)}
            className="flex-1 py-3 px-4 rounded-xl border border-[#737687] text-[#191b24] font-semibold hover:bg-[#F4F7FB] focus:ring-2 focus:ring-[#004ccd] transition-all flex items-center justify-center gap-2 text-[14px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Edit</span>
          </button>

          <button
            id="btn-toggle-payment-status"
            onClick={() => onTogglePayment(record.id)}
            className={`flex-[2] py-3 px-4 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2 text-[14px] cursor-pointer ${
              isPaid
                ? 'bg-[#e7e7f4] text-[#191b24] hover:bg-[#d8d9e6]'
                : 'bg-[#004ccd] hover:bg-[#003da9] text-white shadow-[0_4px_12px_rgba(15,98,254,0.3)]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPaid ? 'undo' : 'receipt_long'}
            </span>
            <span>{isPaid ? 'Batalkan Pembayaran' : 'Catat Pembayaran (Lunas)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
