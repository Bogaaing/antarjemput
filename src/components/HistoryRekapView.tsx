import React, { useState } from 'react';
import { DailyTransportRecord, formatRupiah, formatDateIndo } from '../types';

interface HistoryRekapViewProps {
  records: DailyTransportRecord[];
  currentYear: number;
  currentMonth: number;
  onChangeMonth: (delta: number) => void;
  onSelectRecord: (recordId: string) => void;
  onOpenShareModal: () => void;
  onTogglePayment: (recordId: string) => void;
}

export const HistoryRekapView: React.FC<HistoryRekapViewProps> = ({
  records,
  currentYear,
  currentMonth,
  onChangeMonth,
  onSelectRecord,
  onOpenShareModal,
}) => {
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'unpaid'>('all');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const currentMonthName = `${monthNames[currentMonth]} ${currentYear}`;

  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthRecords = records
    .filter((r) => r.date.startsWith(monthPrefix))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalDays = monthRecords.length;
  const normalDays = monthRecords.filter((r) => !r.hasDifferentDropoff && r.additionalFee === 0).length;
  const extraDays = monthRecords.filter((r) => r.hasDifferentDropoff || r.additionalFee > 0).length;
  const totalCost = monthRecords.reduce((acc, r) => acc + r.totalFee, 0);

  const paidRecords = monthRecords.filter((r) => r.paymentStatus === 'paid');
  const unpaidRecords = monthRecords.filter((r) => r.paymentStatus === 'unpaid');

  const paidTotal = paidRecords.reduce((acc, r) => acc + r.totalFee, 0);
  const unpaidTotal = unpaidRecords.reduce((acc, r) => acc + r.totalFee, 0);

  const filteredList = monthRecords.filter((r) => {
    if (filterPayment === 'paid') return r.paymentStatus === 'paid';
    if (filterPayment === 'unpaid') return r.paymentStatus === 'unpaid';
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4 pb-28 md:pb-12">
      {/* 1. Page Header & Month Selector */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-[26px] md:text-[32px] font-extrabold text-[#191b24] tracking-tight leading-tight">
            Riwayat
          </h2>
          <div className="flex items-center gap-1 text-[13px] md:text-[14px] text-[#64748B] font-semibold mt-0.5">
            <span>{currentMonthName}</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-prev-month-history"
            onClick={() => onChangeMonth(-1)}
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#191b24] hover:bg-[#F4F7FB] active:scale-95 transition-all shadow-xs cursor-pointer"
            aria-label="Previous Month"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            id="btn-next-month-history"
            onClick={() => onChangeMonth(1)}
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#191b24] hover:bg-[#F4F7FB] active:scale-95 transition-all shadow-xs cursor-pointer"
            aria-label="Next Month"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* 2. Main Summary Card with Illustration */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[170px]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[34px] md:text-[38px] font-extrabold text-[#004ccd] leading-none">
                {totalDays}
              </span>
              <span className="text-[18px] md:text-[20px] font-bold text-[#191b24]">
                Hari
              </span>
            </div>
            <p className="text-[13px] text-[#64748B] font-medium mt-1">Layanan</p>
          </div>

          {/* Decorative Transport Illustration */}
          <div className="w-32 sm:w-40 md:w-48 aspect-square -my-4 -mr-2 flex items-center justify-center pointer-events-none">
            <img
              src="/login_illustration.jpg"
              alt="Ilustrasi Antar-Jemput"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Bottom Section of Summary Card */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-3 mt-auto">
          <div className="flex items-center gap-2.5 text-[12px] sm:text-[13px] font-semibold text-[#191b24]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004ccd]"></span>
              <span>{normalDays} Normal</span>
            </div>
            <span className="text-[#CBD5E1]">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
              <span>{extraDays} Tambahan</span>
            </div>
          </div>

          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl px-4 py-2 flex flex-col items-start sm:items-center self-start sm:self-auto">
            <p className="text-[16px] md:text-[18px] font-extrabold text-[#004ccd] leading-tight">
              {formatRupiah(totalCost)}
            </p>
            <p className="text-[11px] text-[#64748B] font-medium">Total Tagihan</p>
          </div>
        </div>
      </div>

      {/* 3. Payment Summary Mini-Cards (2 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Sudah Dibayar Card */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0]/70 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-[11px] text-[#64748B] font-medium">Sudah Dibayar</p>
              <p className="text-[17px] sm:text-[18px] font-bold text-[#15803D] leading-tight">
                {formatRupiah(paidTotal)}
              </p>
            </div>
          </div>

          <span className="material-symbols-outlined text-[#15803D] text-[22px]">
            check_circle
          </span>
        </div>

        {/* Belum Dibayar Card */}
        <div className="bg-[#FFF5F5] border border-[#FFDAD6]/70 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-[11px] text-[#64748B] font-medium">Belum Dibayar</p>
              <p className="text-[17px] sm:text-[18px] font-bold text-[#DC2626] leading-tight">
                {formatRupiah(unpaidTotal)}
              </p>
            </div>
          </div>

          <span className="material-symbols-outlined text-[#DC2626] text-[22px]">
            error
          </span>
        </div>
      </div>

      {/* 4. Filter Pills Segmented Control */}
      <div className="bg-white rounded-2xl p-1.5 border border-[#E2E8F0] flex items-center gap-1.5 shadow-2xs">
        <button
          onClick={() => setFilterPayment('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer text-center ${
            filterPayment === 'all'
              ? 'bg-[#004ccd] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#191b24] hover:bg-[#F8FAFC]'
          }`}
        >
          Semua ({monthRecords.length})
        </button>
        <button
          onClick={() => setFilterPayment('paid')}
          className={`flex-1 py-2 px-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer text-center ${
            filterPayment === 'paid'
              ? 'bg-[#004ccd] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#191b24] hover:bg-[#F8FAFC]'
          }`}
        >
          Lunas ({paidRecords.length})
        </button>
        <button
          onClick={() => setFilterPayment('unpaid')}
          className={`flex-1 py-2 px-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer text-center ${
            filterPayment === 'unpaid'
              ? 'bg-[#004ccd] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#191b24] hover:bg-[#F8FAFC]'
          }`}
        >
          Belum Lunas ({unpaidRecords.length})
        </button>
      </div>

      {/* 5. Section Header & Transaction List Container */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 pb-1">
          <span className="material-symbols-outlined text-[#004ccd] text-[20px]">
            calendar_month
          </span>
          <h3 className="text-[15px] font-bold text-[#191b24] tracking-tight">
            Daftar Antar-Jemput
          </h3>
        </div>

        {filteredList.length === 0 ? (
          <div className="py-10 text-center text-[#64748B] space-y-2">
            <span className="material-symbols-outlined text-4xl text-[#CBD5E1]">event_busy</span>
            <p className="text-[13px] font-medium">Belum ada antar-jemput pada filter ini.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredList.map((rec) => {
              const hasExtra = rec.hasDifferentDropoff || rec.additionalFee > 0;
              const isPaid = rec.paymentStatus === 'paid';
              const dayStr = rec.date.split('-')[2];
              const monthAbbrev = monthNames[currentMonth].substring(0, 3).toUpperCase();

              // Unique dropoff times
              const dropoffTimes = Array.from(
                new Set(rec.children.map((c) => c.dropoffTime).filter(Boolean))
              ).join(' / ') || '12:00';

              return (
                <div
                  key={rec.id}
                  onClick={() => onSelectRecord(rec.id)}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E2E8F0] hover:border-[#004ccd] hover:shadow-xs transition-all space-y-3 cursor-pointer"
                >
                  {/* Top Row: Date Badge, Date String, Times, and Chevron */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Red Date Badge */}
                      <div className="w-11 h-11 rounded-2xl bg-[#FFF5F5] border border-[#FFDAD6]/60 text-[#DC2626] flex flex-col items-center justify-center shrink-0 leading-none">
                        <span className="text-[15px] font-extrabold">{dayStr}</span>
                        <span className="text-[8px] font-bold mt-0.5">{monthAbbrev}</span>
                      </div>

                      {/* Date & Pickup/Dropoff Times */}
                      <div>
                        <h4 className="text-[14px] font-bold text-[#191b24] leading-tight">
                          {formatDateIndo(rec.date)}
                        </h4>
                        <div className="flex items-center gap-2 text-[12px] text-[#64748B] font-medium mt-1">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#004ccd]"></span>
                            <span>Antar {rec.sharedPickupTime}</span>
                          </span>
                          <span className="text-[#CBD5E1]">|</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                            <span>Jemput {dropoffTimes}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chevron Right */}
                    <div className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8] shrink-0">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </div>
                  </div>

                  {/* Bottom Row: Price & Payment Status Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
                    <div>
                      <p className="text-[16px] font-extrabold text-[#191b24] leading-tight">
                        {formatRupiah(rec.totalFee)}
                      </p>
                      <p className="text-[11px] text-[#64748B] font-medium">
                        {hasExtra ? 'Tarif + Tambahan' : 'Tarif Dasar'}
                      </p>
                    </div>

                    <div>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                          <span className="material-symbols-outlined text-[15px]">check_circle</span>
                          <span>Lunas</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold bg-[#FFF5F5] text-[#DC2626] border border-[#FFDAD6]">
                          <span className="material-symbols-outlined text-[15px]">sentiment_dissatisfied</span>
                          <span>Belum Lunas</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Compact Share Recap Button */}
        <button
          id="btn-share-rekap-compact"
          onClick={onOpenShareModal}
          className="w-full py-3 px-4 rounded-xl border border-[#004ccd]/30 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#004ccd] font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-[0.99] mt-2"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          <span>Bagikan Rekap</span>
        </button>
      </div>
    </div>
  );
};
