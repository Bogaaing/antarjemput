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
  onTogglePayment,
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

  const baseCostTotal = monthRecords.reduce((acc, r) => acc + r.baseFee, 0);
  const extraCostTotal = monthRecords.reduce((acc, r) => acc + r.additionalFee, 0);
  const totalCost = baseCostTotal + extraCostTotal;

  const paidTotal = monthRecords
    .filter((r) => r.paymentStatus === 'paid')
    .reduce((acc, r) => acc + r.totalFee, 0);
  const unpaidTotal = monthRecords
    .filter((r) => r.paymentStatus === 'unpaid')
    .reduce((acc, r) => acc + r.totalFee, 0);

  const progressPercentage = totalCost > 0 ? Math.round((paidTotal / totalCost) * 100) : 0;

  const filteredList = monthRecords.filter((r) => {
    if (filterPayment === 'paid') return r.paymentStatus === 'paid';
    if (filterPayment === 'unpaid') return r.paymentStatus === 'unpaid';
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-28 md:pb-12">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[24px] md:text-[32px] font-bold text-[#191b24] tracking-tight">
            Rekap {currentMonthName}
          </h2>
          <p className="text-[14px] text-[#424656] hidden sm:block">
            Laporan bulanan logistik dan status pembayaran
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onChangeMonth(-1)}
            className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#191b24] hover:bg-[#f2f3ff] transition-colors shadow-xs cursor-pointer"
            aria-label="Previous Month"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            onClick={() => onChangeMonth(1)}
            className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#191b24] hover:bg-[#f2f3ff] transition-colors shadow-xs cursor-pointer"
            aria-label="Next Month"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Layanan */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] relative overflow-hidden transition-all duration-300 hover:shadow-md group shadow-xs">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[12px] font-semibold text-[#424656] uppercase tracking-wider">
              Total Layanan
            </span>
            <div className="bg-[#0f62fe]/10 text-[#004ccd] p-2 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">local_taxi</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-[28px] font-bold text-[#191b24] tracking-tight">{totalDays}</span>
            <span className="text-[14px] text-[#424656]">Hari</span>
          </div>
        </div>

        {/* Hari Normal */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] relative overflow-hidden transition-all duration-300 hover:shadow-md group shadow-xs">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[12px] font-semibold text-[#424656] uppercase tracking-wider">
              Hari Normal
            </span>
            <div className="bg-[#198754]/10 text-[#198754] p-2 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">event_available</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-[28px] font-bold text-[#191b24] tracking-tight">{normalDays}</span>
            <span className="text-[14px] text-[#424656]">Hari</span>
          </div>
        </div>

        {/* Hari Tambahan */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] relative overflow-hidden transition-all duration-300 hover:shadow-md group shadow-xs">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[12px] font-semibold text-[#424656] uppercase tracking-wider">
              Hari Tambahan
            </span>
            <div className="bg-[#F59E0B]/10 text-[#F59E0B] p-2 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">more_time</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-[28px] font-bold text-[#191b24] tracking-tight">{extraDays}</span>
            <span className="text-[14px] text-[#424656]">Hari</span>
          </div>
        </div>
      </section>

      {/* Financial Layout (Bento Style) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ringkasan Keuangan */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-[20px] font-semibold text-[#191b24] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ccd]" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
              Ringkasan Keuangan
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-[#E2E8F0]/70">
                <span className="text-[16px] text-[#424656]">Biaya Dasar</span>
                <span className="text-[16px] font-semibold text-[#191b24]">{formatRupiah(baseCostTotal)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#E2E8F0]/70">
                <span className="text-[16px] text-[#424656]">Biaya Tambahan</span>
                <span className="text-[16px] font-semibold text-[#191b24]">{formatRupiah(extraCostTotal)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-[#E2E8F0] flex justify-between items-end">
            <span className="text-[20px] font-bold text-[#191b24]">TOTAL</span>
            <span className="text-[28px] font-bold text-[#004ccd] tracking-tight">
              {formatRupiah(totalCost)}
            </span>
          </div>
        </div>

        {/* Status Pembayaran */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-[20px] font-semibold text-[#191b24] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ccd]" style={{ fontVariationSettings: "'FILL' 1" }}>
                pie_chart
              </span>
              Status Pembayaran
            </h3>

            <div className="space-y-4">
              <div className="bg-[#F4F7FB] p-4 rounded-lg border border-[#E2E8F0]/70">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-semibold text-[#424656] uppercase tracking-wider">
                    Sudah Dibayar
                  </span>
                  <span className="material-symbols-outlined text-[#198754] text-[18px]">check_circle</span>
                </div>
                <span className="text-[20px] font-bold text-[#198754] block">{formatRupiah(paidTotal)}</span>
              </div>

              <div className="bg-[#F4F7FB] p-4 rounded-lg border border-[#E2E8F0]/70">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-semibold text-[#424656] uppercase tracking-wider">
                    Belum Dibayar
                  </span>
                  <span className="material-symbols-outlined text-[#DC3545] text-[18px]">pending</span>
                </div>
                <span className="text-[20px] font-bold text-[#DC3545] block">{formatRupiah(unpaidTotal)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-medium text-[#424656]">Progres Pembayaran</span>
              <span className="text-[12px] font-bold text-[#004ccd]">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#e1e1ee] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#004ccd] rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contextual Action Banner */}
      <section className="bg-[#0f62fe] text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 20px)',
          }}
        ></div>
        <div className="relative z-10 text-center sm:text-left">
          <h3 className="text-[20px] font-bold mb-1">Kirim Tagihan</h3>
          <p className="text-[14px] opacity-90">
            Bagikan rekap bulan ini kepada orang tua via WhatsApp atau Email.
          </p>
        </div>
        <button
          id="btn-share-rekap"
          onClick={onOpenShareModal}
          className="relative z-10 px-6 py-3 bg-white text-[#004ccd] hover:bg-[#faf8ff] rounded-lg text-[13px] font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          <span>Bagikan Rekap</span>
        </button>
      </section>

      {/* Daily Records Detailed Breakdown */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-[18px] font-bold text-[#191b24]">Daftar Jadwal Harian</h3>
            <p className="text-[13px] text-[#424656]">Klik jadwal untuk melihat detail atau ubah status bayar</p>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-1.5 bg-[#F4F7FB] p-1 rounded-lg border border-[#E2E8F0]">
            <button
              onClick={() => setFilterPayment('all')}
              className={`px-3 py-1 text-[12px] font-semibold rounded-md transition-colors cursor-pointer ${
                filterPayment === 'all' ? 'bg-[#0f62fe] text-white shadow-xs' : 'text-[#424656] hover:text-[#191b24]'
              }`}
            >
              Semua ({monthRecords.length})
            </button>
            <button
              onClick={() => setFilterPayment('paid')}
              className={`px-3 py-1 text-[12px] font-semibold rounded-md transition-colors cursor-pointer ${
                filterPayment === 'paid' ? 'bg-[#198754] text-white shadow-xs' : 'text-[#424656] hover:text-[#191b24]'
              }`}
            >
              Lunas
            </button>
            <button
              onClick={() => setFilterPayment('unpaid')}
              className={`px-3 py-1 text-[12px] font-semibold rounded-md transition-colors cursor-pointer ${
                filterPayment === 'unpaid' ? 'bg-[#DC3545] text-white shadow-xs' : 'text-[#424656] hover:text-[#191b24]'
              }`}
            >
              Belum Lunas
            </button>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="py-12 text-center text-[#737687]">
            <span className="material-symbols-outlined text-4xl text-[#c3c6d8] mb-2">event_busy</span>
            <p className="text-[14px]">Tidak ada catatan transaksi untuk filter ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((rec) => {
              const hasExtra = rec.hasDifferentDropoff || rec.additionalFee > 0;
              const isPaid = rec.paymentStatus === 'paid';

              return (
                <div
                  key={rec.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#0f62fe] hover:bg-[#F4F7FB]/50 transition-all gap-3 cursor-pointer group"
                  onClick={() => onSelectRecord(rec.id)}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${
                        isPaid ? 'bg-[#198754]/10 text-[#198754]' : 'bg-[#DC3545]/10 text-[#DC3545]'
                      }`}
                    >
                      <span className="text-[16px] leading-none">{new Date(rec.date).getDate()}</span>
                      <span className="text-[10px] uppercase font-medium mt-0.5">
                        {monthNames[currentMonth].substring(0, 3)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#191b24] text-[15px]">
                          {formatDateIndo(rec.date)}
                        </span>
                        {hasExtra && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#F59E0B]/15 text-[#b45309]">
                            + Beda Jam
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#424656] flex items-center gap-2 mt-0.5">
                        <span>Antar: {rec.sharedPickupTime}</span>
                        <span>•</span>
                        <span>
                          Jemput: {rec.children.map((c) => c.dropoffTime).join(' & ')}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E2E8F0]/60">
                    <div className="text-left sm:text-right">
                      <span className="text-[15px] font-bold text-[#191b24] block">
                        {formatRupiah(rec.totalFee)}
                      </span>
                      <span className="text-[11px] text-[#737687]">
                        {hasExtra ? 'Rp50k + Rp15k' : 'Tarif Dasar'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePayment(rec.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isPaid
                          ? 'bg-[#198754]/15 text-[#198754] hover:bg-[#198754]/25'
                          : 'bg-[#DC3545]/15 text-[#DC3545] hover:bg-[#DC3545]/25'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isPaid ? 'check_circle' : 'pending'}
                      </span>
                      <span>{isPaid ? 'Lunas' : 'Belum Lunas'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
